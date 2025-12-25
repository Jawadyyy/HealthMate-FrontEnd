"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, MapPin, ChevronLeft, ChevronRight, Search, Filter, Video, Phone, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api/api';

interface Doctor {
    _id: string;
    userId?: string;
    name?: string;
    fullName?: string;
    email?: string;
    specialization: string;
    degrees?: string;
    phone?: string;
    hospitalName?: string;
    experienceYears?: number;
    experience?: number;
    rating?: number;
    availableSlots: string[];
    availableDays?: string[];
    consultationFee?: number;
    isOnline?: boolean;
    image?: string;
    createdAt?: string;
    updatedAt?: string;
}

const BookAppointmentPage = () => {
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [selectedDoctor, setSelectedDoctor] = useState<string>('');
    const [appointmentType, setAppointmentType] = useState<'in-person' | 'video' | 'phone'>('in-person');
    const [notes, setNotes] = useState('');
    const [step, setStep] = useState<'doctor' | 'datetime' | 'details'>('doctor');
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [bookingLoading, setBookingLoading] = useState(false);

    // Fetch doctors from API
    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await api.get('/doctors/all');

                // Handle different response structures
                const doctorsData = response.data.data || response.data || [];

                // Normalize the data to ensure consistent structure
                const normalizedDoctors = doctorsData.map((doc: any) => ({
                    _id: doc._id,
                    name: doc.fullName || doc.name || 'Unknown Doctor',
                    fullName: doc.fullName || doc.name,
                    specialization: doc.specialization || 'General Physician',
                    experience: doc.experienceYears || doc.experience || 0,
                    experienceYears: doc.experienceYears || doc.experience || 0,
                    rating: doc.rating || 4.5,
                    availableSlots: doc.availableSlots || [],
                    consultationFee: doc.fee || doc.consultationFee || 0,
                    availableDays: doc.availableDays || [],
                    isOnline: doc.isOnline ?? true,
                    image: doc.image,
                    phone: doc.phone,
                    hospitalName: doc.hospitalName,
                    degrees: doc.degrees
                }));

                setDoctors(normalizedDoctors);
            } catch (err: any) {
                console.error('Error fetching doctors:', err);
                setError(err.response?.data?.message || 'Failed to load doctors. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchDoctors();
    }, []);

    // Filter doctors based on search term
    const filteredDoctors = doctors.filter(doctor => {
        const doctorName = doctor.fullName || doctor.name || '';
        const doctorSpec = doctor.specialization || '';
        return (
            doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctorSpec.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    // Get available dates from selected doctor's schedule
    const getAvailableDates = () => {
        const doctor = doctors.find(d => d._id === selectedDoctor);

        if (!doctor || !doctor.availableDays || doctor.availableDays.length === 0) {
            return [];
        }

        // Get next 60 days to ensure we find enough matching days
        const next60Days = Array.from({ length: 60 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() + i);
            return date;
        });

        // Filter dates that match doctor's available days
        const availableDates = next60Days.filter(date => {
            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
            const isAvailable = doctor.availableDays?.includes(dayName);
            return isAvailable;
        });

        // Return first 7-10 available dates for better UI
        return availableDates.slice(0, 10);
    };

    const dates = selectedDoctor ? getAvailableDates() : [];

    // Get time slots from selected doctor's available slots
    const getTimeSlots = () => {
        const doctor = doctors.find(d => d._id === selectedDoctor);
        if (doctor && doctor.availableSlots && doctor.availableSlots.length > 0) {
            return doctor.availableSlots;
        }
        // Fallback to default slots if doctor has no slots defined
        return [
            '08:00', '09:00', '10:00', '11:00',
            '13:00', '14:00', '15:00', '16:00', '17:00'
        ];
    };

    const timeSlots = getTimeSlots();

    const handleSelectDoctor = (doctorId: string) => {
        setSelectedDoctor(doctorId);
        setStep('datetime');
    };

    const handleSelectDateTime = (date: string, time: string) => {
        setSelectedDate(date);
        setSelectedTime(time);
        setStep('details');
    };

    const handleBookAppointment = async () => {
        try {
            setBookingLoading(true);

            // Parse time format (handle both "09:00" and "09:00 AM" formats)
            let hours = 0;
            let minutes = 0;

            if (selectedTime.includes('AM') || selectedTime.includes('PM')) {
                // Parse 12-hour format like "09:00 AM"
                const timeMatch = selectedTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
                if (timeMatch) {
                    hours = parseInt(timeMatch[1]);
                    minutes = parseInt(timeMatch[2]);
                    const period = timeMatch[3].toUpperCase();

                    if (period === 'PM' && hours !== 12) hours += 12;
                    if (period === 'AM' && hours === 12) hours = 0;
                }
            } else {
                // Parse 24-hour format like "09:00" or "14:00"
                const timeMatch = selectedTime.match(/(\d+):(\d+)/);
                if (timeMatch) {
                    hours = parseInt(timeMatch[1]);
                    minutes = parseInt(timeMatch[2]);
                }
            }

            // Create date object with selected date and parsed time
            const appointmentDateTime = new Date(selectedDate);
            appointmentDateTime.setHours(hours, minutes, 0, 0);

            const appointmentData = {
                doctorId: selectedDoctor,
                appointmentDate: appointmentDateTime.toISOString(),
                notes: notes || undefined
            };

            const response = await api.post('/appointments/book', appointmentData);

            // Show success message
            alert('Appointment booked successfully!');

            // Redirect to appointments page
            router.push('/patient/appointments');
        } catch (error: any) {
            console.error('Error booking appointment:', error);
            const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to book appointment. Please try again.';
            alert(errorMessage);
        } finally {
            setBookingLoading(false);
        }
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 cursor-pointer"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        <span>Back to Appointments</span>
                    </button>

                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Book New Appointment</h1>
                        <p className="text-gray-500 mt-2">Select a doctor and schedule your appointment</p>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-center my-8">
                        <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 'doctor' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                1
                            </div>
                            <div className={`w-24 h-1 mx-2 ${step === 'doctor' ? 'bg-gray-300' : 'bg-blue-600'}`}></div>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 'datetime' ? 'bg-blue-600 text-white' : step === 'details' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                2
                            </div>
                            <div className={`w-24 h-1 mx-2 ${step === 'details' ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 'details' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                3
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Appointment Details Preview */}
                    <div className="lg:col-span-2">
                        {step === 'doctor' && (
                            <div>
                                <div className="bg-white rounded-2xl shadow-lg shadow-blue-500/5 border border-gray-200/50 p-6 mb-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-gray-900">Select Doctor</h2>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="text"
                                                placeholder="Search doctors..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Loading State */}
                                    {loading && (
                                        <div className="flex items-center justify-center py-12">
                                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                            <span className="ml-3 text-gray-600">Loading doctors...</span>
                                        </div>
                                    )}

                                    {/* Error State */}
                                    {error && (
                                        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                                            <p className="text-red-600 mb-4">{error}</p>
                                            <button
                                                onClick={() => window.location.reload()}
                                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer"
                                            >
                                                Retry
                                            </button>
                                        </div>
                                    )}

                                    {/* Doctors List */}
                                    {!loading && !error && (
                                        <div className="space-y-6">
                                            {filteredDoctors.length === 0 ? (
                                                <div className="text-center py-12">
                                                    <p className="text-gray-500">No doctors found matching your search.</p>
                                                </div>
                                            ) : (
                                                filteredDoctors.map((doctor) => (
                                                    <div
                                                        key={doctor._id}
                                                        className={`border rounded-xl p-6 cursor-pointer transition-all duration-200 ${selectedDoctor === doctor._id ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30'}`}
                                                        onClick={() => handleSelectDoctor(doctor._id)}
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex items-start space-x-4">
                                                                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center overflow-hidden">
                                                                    {doctor.image ? (
                                                                        <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <User className="w-8 h-8 text-blue-600" />
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <h3 className="font-bold text-gray-900 text-lg">{doctor.fullName || doctor.name || 'Doctor'}</h3>
                                                                    <p className="text-gray-600 mt-1">{doctor.specialization || 'General Physician'}</p>
                                                                    <div className="flex items-center space-x-4 mt-3">
                                                                        <span className="text-sm text-gray-500">{doctor.experienceYears || doctor.experience || 0} years experience</span>
                                                                        <span className="text-sm text-yellow-600">⭐ {doctor.rating || 4.5}</span>
                                                                        {doctor.isOnline && (
                                                                            <span className="text-sm text-green-600 font-medium">● Online Now</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-bold text-gray-900">
                                                                    ${doctor.consultationFee || 0}
                                                                </p>
                                                                <p className="text-sm text-gray-500">Consultation Fee</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="bg-white rounded-2xl shadow-lg shadow-blue-500/5 border border-gray-200/50 p-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">Consultation Type</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <button
                                            onClick={() => setAppointmentType('in-person')}
                                            className={`p-6 rounded-xl border transition-all duration-200 ${appointmentType === 'in-person' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                                        >
                                            <div className="flex flex-col items-center text-center">
                                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                                    <User className="w-6 h-6 text-blue-600" />
                                                </div>
                                                <h3 className="font-bold text-gray-900">In-Person</h3>
                                                <p className="text-sm text-gray-500 mt-2">Visit the hospital/clinic</p>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => setAppointmentType('video')}
                                            className={`p-6 rounded-xl border transition-all duration-200 ${appointmentType === 'video' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                                        >
                                            <div className="flex flex-col items-center text-center">
                                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                                    <Video className="w-6 h-6 text-green-600" />
                                                </div>
                                                <h3 className="font-bold text-gray-900">Video Call</h3>
                                                <p className="text-sm text-gray-500 mt-2">Virtual consultation</p>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => setAppointmentType('phone')}
                                            className={`p-6 rounded-xl border transition-all duration-200 ${appointmentType === 'phone' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                                        >
                                            <div className="flex flex-col items-center text-center">
                                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                                                    <Phone className="w-6 h-6 text-purple-600" />
                                                </div>
                                                <h3 className="font-bold text-gray-900">Phone Call</h3>
                                                <p className="text-sm text-gray-500 mt-2">Telephone consultation</p>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 'datetime' && (
                            <div className="bg-white rounded-2xl shadow-lg shadow-blue-500/5 border border-gray-200/50 p-6">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-xl font-bold text-gray-900">Select Date & Time</h2>
                                    <button
                                        onClick={() => setStep('doctor')}
                                        className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                                    >
                                        ← Change Doctor
                                    </button>
                                </div>

                                <div className="mb-8">
                                    <h3 className="font-medium text-gray-900 mb-4">Select Date</h3>
                                    {dates.length === 0 ? (
                                        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                                            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                            <p className="text-gray-500 font-medium">No available dates</p>
                                            <p className="text-sm text-gray-400 mt-1">This doctor has no available slots at the moment</p>
                                        </div>
                                    ) : (
                                        <div className={`grid gap-2 ${dates.length <= 3 ? 'grid-cols-3' : dates.length <= 5 ? 'grid-cols-5' : 'grid-cols-7'}`}>
                                            {dates.map((date, index) => {
                                                const dateString = date.toISOString().split('T')[0];
                                                const isSelected = selectedDate === dateString;
                                                return (
                                                    <button
                                                        key={index}
                                                        onClick={() => setSelectedDate(dateString)}
                                                        className={`p-4 rounded-xl text-center transition-all duration-200 ${isSelected
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                                                            }`}
                                                    >
                                                        <div className="text-sm font-medium">{formatDate(date)}</div>
                                                        <div className="text-xs mt-1">{date.getDate()}</div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <h3 className="font-medium text-gray-900 mb-4">
                                        Available Time Slots
                                        <span className="text-sm text-gray-500 ml-2">({timeSlots.length} slots available)</span>
                                    </h3>
                                    {timeSlots.length === 0 ? (
                                        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                                            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                            <p className="text-gray-500 font-medium">No available time slots</p>
                                            <p className="text-sm text-gray-400 mt-1">Please select a different date or doctor</p>
                                        </div>
                                    ) : (
                                        <div className={`grid gap-3 ${timeSlots.length <= 4 ? 'grid-cols-2' : 'grid-cols-4'}`}>
                                            {timeSlots.map((time) => {
                                                const isSelected = selectedTime === time;
                                                return (
                                                    <button
                                                        key={time}
                                                        onClick={() => setSelectedTime(time)}
                                                        className={`p-4 rounded-xl text-center font-medium transition-all duration-200 ${isSelected
                                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                                                            : 'bg-gray-50 hover:bg-blue-50 hover:border-blue-200 text-gray-900 border border-gray-200'
                                                            }`}
                                                    >
                                                        {time}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8 pt-8 border-t border-gray-200">
                                    <button
                                        onClick={() => setStep('details')}
                                        disabled={!selectedDate || !selectedTime}
                                        className={`w-full py-4 rounded-xl font-bold transition-all duration-200 ${selectedDate && selectedTime
                                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 cursor-pointer'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        Continue to Details
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 'details' && (
                            <div className="bg-white rounded-2xl shadow-lg shadow-blue-500/5 border border-gray-200/50 p-6">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-xl font-bold text-gray-900">Appointment Details</h2>
                                    <button
                                        onClick={() => setStep('datetime')}
                                        className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                                    >
                                        ← Change Date/Time
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Additional Notes (Optional)
                                        </label>
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Describe your symptoms or any special requirements..."
                                            className="w-full h-32 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200"
                                        />
                                    </div>

                                    <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-6">
                                        <h3 className="font-bold text-gray-900 mb-4">Important Information</h3>
                                        <ul className="space-y-2 text-sm text-gray-600">
                                            <li className="flex items-start">
                                                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                </div>
                                                <span>Please arrive 15 minutes before your scheduled appointment time</span>
                                            </li>
                                            <li className="flex items-start">
                                                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                </div>
                                                <span>Bring your ID and insurance card (if applicable)</span>
                                            </li>
                                            <li className="flex items-start">
                                                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                </div>
                                                <span>For video consultations, ensure you have stable internet connection</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="mt-8 pt-8 border-t border-gray-200">
                                    <button
                                        onClick={handleBookAppointment}
                                        disabled={bookingLoading}
                                        className={`w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center ${bookingLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                    >
                                        {bookingLoading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                Booking...
                                            </>
                                        ) : (
                                            'Confirm & Book Appointment'
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Appointment Summary */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-6">
                            <div className="bg-white rounded-2xl shadow-lg shadow-blue-500/5 border border-gray-200/50 p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Appointment Summary</h2>

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-2">Doctor</h3>
                                        {selectedDoctor ? (
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                    <User className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {doctors.find(d => d._id === selectedDoctor)?.fullName || doctors.find(d => d._id === selectedDoctor)?.name || 'Doctor'}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {doctors.find(d => d._id === selectedDoctor)?.specialization || 'General Physician'}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-gray-400">Not selected</p>
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-2">Date & Time</h3>
                                        {selectedDate && selectedTime ? (
                                            <div className="flex items-center space-x-2">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                <span className="font-medium text-gray-900">
                                                    {new Date(selectedDate).toLocaleDateString('en-US', {
                                                        weekday: 'short',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                                <span className="text-gray-500">•</span>
                                                <Clock className="w-4 h-4 text-gray-400" />
                                                <span className="font-medium text-gray-900">{selectedTime}</span>
                                            </div>
                                        ) : (
                                            <p className="text-gray-400">Not selected</p>
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-2">Consultation Type</h3>
                                        <div className="flex items-center space-x-2">
                                            {appointmentType === 'in-person' && <User className="w-4 h-4 text-blue-600" />}
                                            {appointmentType === 'video' && <Video className="w-4 h-4 text-green-600" />}
                                            {appointmentType === 'phone' && <Phone className="w-4 h-4 text-purple-600" />}
                                            <span className="font-medium text-gray-900 capitalize">
                                                {appointmentType.replace('-', ' ')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-gray-200">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-gray-600">Consultation Fee</span>
                                            <span className="font-bold text-gray-900">
                                                ${selectedDoctor ? (doctors.find(d => d._id === selectedDoctor)?.consultationFee || 0) : '0'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-200">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-bold text-gray-900">Total</span>
                                            <span className="text-2xl font-bold text-gray-900">
                                                ${selectedDoctor ? (doctors.find(d => d._id === selectedDoctor)?.consultationFee || 0) : '0'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-6 p-4 bg-blue-50/50 border border-blue-200 rounded-xl">
                                        <p className="text-sm text-blue-800">
                                            You can cancel or reschedule your appointment up to 24 hours before the scheduled time.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookAppointmentPage;