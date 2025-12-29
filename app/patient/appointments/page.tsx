"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, FileText, Download, Filter, Search, Plus, MapPin, ChevronRight, MoreVertical, Video, Phone, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import api from '@/lib/api/api';
import { useRouter } from 'next/navigation';

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

const AppointmentsPage = () => {
    const router = useRouter();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'past' | 'cancelled' | 'missed'>('upcoming');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchAppointments();
    }, []);

    useEffect(() => {
        filterAppointments();
    }, [activeFilter, searchTerm, appointments]);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const response = await api.get('/appointments/my');

            const data = response.data.data || response.data || [];
            console.log('Raw appointments:', data);

            // Fetch detailed doctor info including fee and availability
            const appointmentsWithDoctors = await Promise.all(
                data.map(async (appointment: any) => {
                    try {
                        console.log('Processing appointment:', appointment._id);
                        console.log('DoctorId:', appointment.doctorId);

                        // Extract doctor ID - handle both populated and non-populated
                        let doctorId: string;

                        if (typeof appointment.doctorId === 'string') {
                            doctorId = appointment.doctorId;
                        } else if (appointment.doctorId && typeof appointment.doctorId === 'object') {
                            doctorId = appointment.doctorId._id || appointment.doctorId.toString();
                        } else {
                            console.error('Invalid doctorId format');
                            return appointment;
                        }

                        console.log('Fetching doctor details for:', doctorId);

                        const doctorResponse = await api.get(`/doctors/${doctorId}`);
                        const doctorData = doctorResponse.data.data || doctorResponse.data;

                        console.log('Doctor data:', doctorData);

                        return {
                            ...appointment,
                            doctorId: doctorId,
                            doctor: {
                                _id: doctorId,
                                fullName: doctorData.fullName || doctorData.name,
                                name: doctorData.name || doctorData.fullName,
                                specialization: doctorData.specialization,
                                fee: doctorData.fee,
                                availability: doctorData.availability
                            }
                        };
                    } catch (error) {
                        console.error('Error fetching doctor details:', error);
                        // Fallback to basic info if fetch fails
                        const doctorId = typeof appointment.doctorId === 'string'
                            ? appointment.doctorId
                            : appointment.doctorId?._id || appointment.doctorId?.toString();

                        return {
                            ...appointment,
                            doctorId: doctorId,
                            doctor: {
                                _id: doctorId,
                                fullName: 'Doctor',
                                name: 'Doctor',
                                specialization: 'Specialist'
                            }
                        };
                    }
                })
            );

            console.log('Appointments with doctors:', appointmentsWithDoctors);
            setAppointments(appointmentsWithDoctors);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    };

    const filterAppointments = () => {
        let filtered = [...appointments];
        const now = new Date();

        // Apply status filter
        switch (activeFilter) {
            case 'upcoming':
                filtered = filtered.filter(apt => {
                    const appointmentDate = new Date(apt.appointmentDate);
                    return (apt.status === 'scheduled' || apt.status === 'pending') && appointmentDate >= now;
                });
                break;
            case 'past':
                filtered = filtered.filter(apt => {
                    const appointmentDate = new Date(apt.appointmentDate);
                    return apt.status === 'completed' || appointmentDate < now;
                });
                break;
            case 'cancelled':
                filtered = filtered.filter(apt => apt.status === 'cancelled');
                break;
            case 'missed':
                filtered = filtered.filter(apt => {
                    const appointmentDate = new Date(apt.appointmentDate);
                    return apt.status === 'pending' && appointmentDate < now;
                });
                break;
            default:
                break;
        }

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(apt => {
                const doctorName = apt.doctor?.fullName || apt.doctor?.name || '';
                const doctorSpec = apt.doctor?.specialization || '';
                return doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    doctorSpec.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    apt.notes?.toLowerCase().includes(searchTerm.toLowerCase());
            });
        }

        console.log("HealthMate Debug: Filtered appointments:", filtered);
        setFilteredAppointments(filtered);
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }),
            time: date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            })
        };
    };

    const getStatusColor = (status: string, appointmentDate: string) => {
        const now = new Date();
        const aptDate = new Date(appointmentDate);

        if (status === 'pending' && aptDate < now) {
            return 'bg-orange-100 text-orange-700';
        }

        switch (status) {
            case 'scheduled':
            case 'pending':
                return 'bg-blue-100 text-blue-700';
            case 'completed':
                return 'bg-green-100 text-green-700';
            case 'cancelled':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getDisplayStatus = (status: string, appointmentDate: string) => {
        const now = new Date();
        const aptDate = new Date(appointmentDate);

        if (status === 'pending' && aptDate < now) {
            return 'missed';
        }

        return status;
    };

    const getMissedAppointments = () => {
        const now = new Date();
        return appointments.filter(apt => {
            const appointmentDate = new Date(apt.appointmentDate);
            return apt.status === 'pending' && appointmentDate < now;
        });
    };

    const handleBookAppointment = () => {
        router.push('/patient/appointments/book');
    };

    const handleViewDetails = (id: string) => {
        router.push(`/patient/appointments/${id}`);
    };

    const handleCancelAppointment = async (id: string) => {
        if (!confirm('Are you sure you want to cancel this appointment?')) {
            return;
        }

        try {
            await api.patch(`/appointments/cancel/${id}`);
            alert('Appointment cancelled successfully');
            fetchAppointments(); // Refresh the list
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
                    <p className="mt-6 text-gray-600 font-medium">Loading appointments...</p>
                </div>
            </div>
        );
    }

    const missedAppointments = getMissedAppointments();

    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
                            <p className="text-gray-500 mt-2">Manage and track your medical appointments</p>
                        </div>
                        <button
                            onClick={handleBookAppointment}
                            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-500/30 cursor-pointer"
                        >
                            <Plus className="w-5 h-5" />
                            <span className="font-medium">Book New Appointment</span>
                        </button>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex flex-col md:flex-row gap-4 mb-8">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by doctor name, specialization, or notes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Filter className="w-5 h-5 text-gray-500" />
                            <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-xl p-1">
                                {(['all', 'upcoming', 'past', 'missed', 'cancelled'] as const).map((filter) => (
                                    <button
                                        key={filter}
                                        onClick={() => setActiveFilter(filter)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeFilter === filter
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Appointments Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                    {filteredAppointments.length > 0 ? (
                        filteredAppointments.map((appointment) => {
                            const dateTime = formatDateTime(appointment.appointmentDate);
                            const displayStatus = getDisplayStatus(appointment.status, appointment.appointmentDate);

                            return (
                                <div
                                    key={appointment._id}
                                    className="bg-white rounded-2xl shadow-lg shadow-blue-500/5 border border-gray-200/50 overflow-hidden hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300"
                                >
                                    <div className="p-6">
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getStatusColor(appointment.status, appointment.appointmentDate).split(' ')[0]}`}>
                                                    <Calendar className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900">Appointment</h3>
                                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(appointment.status, appointment.appointmentDate)}`}>
                                                        {displayStatus}
                                                    </span>
                                                </div>
                                            </div>
                                            <button className="text-gray-400 hover:text-gray-600 cursor-pointer">
                                                <MoreVertical className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {/* Doctor Info */}
                                        <div className="mb-6">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                                                    <User className="w-6 h-6 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900">
                                                        {appointment.doctor?.fullName || appointment.doctor?.name || 'Doctor'}
                                                    </h4>
                                                    <p className="text-sm text-gray-500">
                                                        {appointment.doctor?.specialization || 'Specialist'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Details */}
                                        <div className="space-y-3 mb-6">
                                            <div className="flex items-center text-gray-600">
                                                <Calendar className="w-4 h-4 mr-3" />
                                                <span className="text-sm">{dateTime.date}</span>
                                            </div>
                                            <div className="flex items-center text-gray-600">
                                                <Clock className="w-4 h-4 mr-3" />
                                                <span className="text-sm">{dateTime.time}</span>
                                            </div>
                                            {appointment.doctor?.fee && (
                                                <div className="flex items-center text-gray-600">
                                                    <span className="text-sm font-medium">Fee: ${appointment.doctor.fee}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Notes */}
                                        {appointment.notes && (
                                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                                <p className="text-xs text-gray-500 mb-1">Notes:</p>
                                                <p className="text-sm text-gray-600">{appointment.notes}</p>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex items-center justify-between">
                                            <button
                                                onClick={() => handleViewDetails(appointment._id)}
                                                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium text-sm cursor-pointer"
                                            >
                                                <span>View Details</span>
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                            {(appointment.status === 'scheduled' || appointment.status === 'pending') && (
                                                <button
                                                    onClick={() => handleCancelAppointment(appointment._id)}
                                                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors cursor-pointer"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-3 text-center py-16">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Calendar className="w-12 h-12 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No appointments found</h3>
                            <p className="text-gray-500 max-w-md mx-auto mb-8">
                                {searchTerm
                                    ? 'No appointments match your search criteria'
                                    : activeFilter === 'upcoming'
                                        ? 'You have no upcoming appointments'
                                        : 'No appointments in this category'}
                            </p>
                            <button
                                onClick={handleBookAppointment}
                                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-500/30 cursor-pointer"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Book Your First Appointment</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <div className="bg-white rounded-2xl p-6 border border-gray-200/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Appointments</p>
                                <p className="text-2xl font-bold text-gray-900 mt-2">{appointments.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-gray-200/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Upcoming</p>
                                <p className="text-2xl font-bold text-gray-900 mt-2">
                                    {appointments.filter(a => {
                                        const appointmentDate = new Date(a.appointmentDate);
                                        const now = new Date();
                                        return (a.status === 'scheduled' || a.status === 'pending') && appointmentDate >= now;
                                    }).length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-gray-200/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Completed</p>
                                <p className="text-2xl font-bold text-gray-900 mt-2">
                                    {appointments.filter(a => a.status === 'completed').length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <FileText className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-gray-200/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Cancelled</p>
                                <p className="text-2xl font-bold text-gray-900 mt-2">
                                    {appointments.filter(a => a.status === 'cancelled').length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                                <XCircle className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-orange-200/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-orange-500">Missed</p>
                                <p className="text-2xl font-bold text-orange-900 mt-2">
                                    {missedAppointments.length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppointmentsPage;