"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, FileText, Download, Filter, Search, Plus, MapPin, ChevronRight, MoreVertical, Video, Phone, CheckCircle, XCircle } from 'lucide-react';
import api from '@/lib/api/api';
import { useRouter } from 'next/navigation';

interface Appointment {
    _id: string;
    date: string;
    time: string;
    type: 'consultation' | 'follow-up' | 'checkup' | 'emergency';
    status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
    doctor: {
        name: string;
        specialization: string;
    };
    location?: string;
    notes?: string;
    createdAt: string;
}

const AppointmentsPage = () => {
    const router = useRouter();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'past' | 'cancelled'>('upcoming');
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
            setAppointments(data);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    };

    const filterAppointments = () => {
        let filtered = [...appointments];

        // Apply status filter
        switch (activeFilter) {
            case 'upcoming':
                filtered = filtered.filter(apt => apt.status === 'scheduled');
                break;
            case 'past':
                filtered = filtered.filter(apt => apt.status === 'completed');
                break;
            case 'cancelled':
                filtered = filtered.filter(apt => apt.status === 'cancelled');
                break;
            default:
                break;
        }

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(apt =>
                apt.doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                apt.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                apt.doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredAppointments(filtered);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled': return 'bg-blue-100 text-blue-700';
            case 'completed': return 'bg-green-100 text-green-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            case 'rescheduled': return 'bg-yellow-100 text-yellow-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'consultation': return <User className="w-4 h-4" />;
            case 'follow-up': return <Clock className="w-4 h-4" />;
            case 'emergency': return <Video className="w-4 h-4" />;
            default: return <Calendar className="w-4 h-4" />;
        }
    };

    const handleBookAppointment = () => {
        router.push('/patient/appointments/book');
    };

    const handleViewDetails = (id: string) => {
        router.push(`/patient/appointments/${id}`);
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 p-6">
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
                                placeholder="Search by doctor name, specialization, or type..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Filter className="w-5 h-5 text-gray-500" />
                            <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-xl p-1">
                                {(['all', 'upcoming', 'past', 'cancelled'] as const).map((filter) => (
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
                        filteredAppointments.map((appointment) => (
                            <div
                                key={appointment._id}
                                className="bg-white rounded-2xl shadow-lg shadow-blue-500/5 border border-gray-200/50 overflow-hidden hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300"
                            >
                                <div className="p-6">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getStatusColor(appointment.status).split(' ')[0]}`}>
                                                {getTypeIcon(appointment.type)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">{appointment.type.replace('-', ' ')}</h3>
                                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(appointment.status)}`}>
                                                    {appointment.status}
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
                                                <h4 className="font-bold text-gray-900">{appointment.doctor.name}</h4>
                                                <p className="text-sm text-gray-500">{appointment.doctor.specialization}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center text-gray-600">
                                            <Calendar className="w-4 h-4 mr-3" />
                                            <span className="text-sm">{formatDate(appointment.date)}</span>
                                        </div>
                                        <div className="flex items-center text-gray-600">
                                            <Clock className="w-4 h-4 mr-3" />
                                            <span className="text-sm">{appointment.time}</span>
                                        </div>
                                        {appointment.location && (
                                            <div className="flex items-center text-gray-600">
                                                <MapPin className="w-4 h-4 mr-3" />
                                                <span className="text-sm">{appointment.location}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Notes */}
                                    {appointment.notes && (
                                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
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
                                        {appointment.status === 'scheduled' && (
                                            <div className="flex items-center space-x-2">
                                                <button className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors cursor-pointer">
                                                    Join Now
                                                </button>
                                                <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors cursor-pointer">
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                                    {appointments.filter(a => a.status === 'scheduled').length}
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
                </div>
            </div>
        </div>
    );
};

export default AppointmentsPage;