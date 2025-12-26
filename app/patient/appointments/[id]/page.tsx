// app/patient/appointments/[id]/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Calendar, Clock, User, ArrowLeft, MapPin, DollarSign, Edit, XCircle } from 'lucide-react';
import api from '@/lib/api/api';

interface Appointment {
    _id: string;
    doctorId: string;
    patientId: string;
    appointmentDate: string;
    status: 'pending' | 'scheduled' | 'completed' | 'cancelled' | 'missing';
    notes?: string;
    createdAt: string;
    updatedAt: string;
    doctor?: {
        _id: string;
        fullName?: string;
        name?: string;
        specialization?: string;
        fee?: number;
        availability?: {
            day: string;
            startTime: string;
            endTime: string;
        }[];
    };
}

const AppointmentDetailsPage = () => {
    const params = useParams();
    const router = useRouter();
    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Try to get from sessionStorage first
        const stored = sessionStorage.getItem('selectedAppointment');
        if (stored) {
            const apt = JSON.parse(stored);
            if (apt._id === params.id) {
                setAppointment(apt);
                setLoading(false);
                return;
            }
        }

        // If not in sessionStorage, fetch all appointments and find the one we need
        fetchAppointmentDetails();
    }, [params.id]);

    const fetchAppointmentDetails = async () => {
        try {
            const response = await api.get('/appointments/my');
            const appointments = response.data.data || response.data || [];

            // Find the specific appointment
            const foundAppointment = appointments.find((apt: any) => apt._id === params.id);

            if (foundAppointment) {
                // Fetch doctor details if needed
                try {
                    const doctorResponse = await api.get(`/doctors/${foundAppointment.doctorId._id || foundAppointment.doctorId}`);
                    const doctorData = doctorResponse.data.data || doctorResponse.data;

                    const fullAppointment = {
                        ...foundAppointment,
                        doctor: {
                            ...foundAppointment.doctorId,
                            fee: doctorData.fee,
                            availability: doctorData.availability
                        },
                        doctorId: foundAppointment.doctorId._id || foundAppointment.doctorId
                    };

                    setAppointment(fullAppointment);
                } catch (error) {
                    setAppointment({
                        ...foundAppointment,
                        doctor: foundAppointment.doctorId,
                        doctorId: foundAppointment.doctorId._id || foundAppointment.doctorId
                    });
                }
            } else {
                alert('Appointment not found');
                router.push('/patient/appointments');
            }
        } catch (error) {
            console.error('Error fetching appointment:', error);
            alert('Failed to load appointment details');
            router.push('/patient/appointments');
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            time: date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            })
        };
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled':
            case 'pending':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'completed':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'cancelled':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const handleCancelAppointment = async () => {
        if (!confirm('Are you sure you want to cancel this appointment?')) {
            return;
        }

        try {
            await api.patch(`/appointments/cancel/${params.id}`);
            alert('Appointment cancelled successfully');
            router.push('/patient/appointments');
        } catch (error: any) {
            console.error('Error cancelling appointment:', error);
            alert(error.response?.data?.message || 'Failed to cancel appointment');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-gray-50">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="mt-6 text-gray-600 font-medium">Loading appointment...</p>
                </div>
            </div>
        );
    }

    if (!appointment) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-gray-600">Appointment not found</p>
                    <button
                        onClick={() => router.push('/patient/appointments')}
                        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg"
                    >
                        Back to Appointments
                    </button>
                </div>
            </div>
        );
    }

    const dateTime = formatDateTime(appointment.appointmentDate);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-medium">Back to Appointments</span>
                </button>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header with Status */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">Appointment Details</h1>
                                <p className="text-blue-100">ID: {appointment._id.slice(-8)}</p>
                            </div>
                            <div className={`px-4 py-2 rounded-xl border-2 ${getStatusColor(appointment.status)} font-bold text-lg capitalize`}>
                                {appointment.status}
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 space-y-8">
                        {/* Doctor Information */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Doctor Information</h2>
                            <div className="flex items-center space-x-4 p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                                    <User className="w-10 h-10 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-gray-900">
                                        {appointment.doctor?.fullName || appointment.doctor?.name || 'Doctor'}
                                    </h3>
                                    <p className="text-blue-600 font-medium mt-1">
                                        {appointment.doctor?.specialization || 'Specialist'}
                                    </p>
                                    {appointment.doctor?.fee && (
                                        <div className="flex items-center mt-2 text-gray-700">
                                            <DollarSign className="w-4 h-4 mr-1" />
                                            <span className="font-semibold">{appointment.doctor.fee} consultation fee</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Date & Time */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Appointment Schedule</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center space-x-4 p-6 bg-gray-50 rounded-xl">
                                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                        <Calendar className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">Date</p>
                                        <p className="text-lg font-bold text-gray-900">{dateTime.date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4 p-6 bg-gray-50 rounded-xl">
                                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                        <Clock className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">Time</p>
                                        <p className="text-lg font-bold text-gray-900">{dateTime.time}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Doctor Availability */}
                        {appointment.doctor?.availability && appointment.doctor.availability.length > 0 && (
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Doctor's Availability</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {appointment.doctor.availability.map((slot, index) => (
                                        <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                            <p className="font-bold text-gray-900 mb-1">{slot.day}</p>
                                            <p className="text-sm text-gray-600">
                                                {slot.startTime} - {slot.endTime}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Notes */}
                        {appointment.notes && (
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Appointment Notes</h2>
                                <div className="p-6 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                                    <p className="text-gray-700">{appointment.notes}</p>
                                </div>
                            </div>
                        )}

                        {/* Timeline */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Timeline</h2>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">Appointment Created</p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(appointment.createdAt).toLocaleString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                {appointment.updatedAt !== appointment.createdAt && (
                                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">Last Updated</p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(appointment.updatedAt).toLocaleString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        {(appointment.status === 'scheduled' || appointment.status === 'pending') && (
                            <div className="flex items-center space-x-4 pt-6 border-t">
                                <button
                                    onClick={handleCancelAppointment}
                                    className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
                                >
                                    <XCircle className="w-5 h-5" />
                                    <span>Cancel Appointment</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppointmentDetailsPage;