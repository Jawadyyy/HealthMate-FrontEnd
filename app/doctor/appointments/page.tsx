"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Filter, Search, CheckCircle, XCircle, Eye, MoreVertical, Phone, Video, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api/api';

interface Appointment {
    _id: string;
    doctorId: string;
    patientId: any;
    appointmentDate: string;
    status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
    type: 'in-person' | 'video' | 'phone';
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

const DoctorAppointmentsPage = () => {
    const router = useRouter();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'upcoming' | 'pending' | 'completed'>('today');
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
        } finally {
            setLoading(false);
        }
    };

    const filterAppointments = () => {
        let filtered = [...appointments];
        const now = new Date();
        const today = new Date().toISOString().split('T')[0];

        switch (activeFilter) {
            case 'today':
                filtered = filtered.filter(apt => {
                    const aptDate = new Date(apt.appointmentDate).toISOString().split('T')[0];
                    return aptDate === today && apt.status === 'scheduled';
                });
                break;
            case 'upcoming':
                filtered = filtered.filter(apt => {
                    const aptDate = new Date(apt.appointmentDate);
                    return aptDate > now && apt.status === 'scheduled';
                });
                break;
            case 'pending':
                filtered = filtered.filter(apt => apt.status === 'pending');
                break;
            case 'completed':
                filtered = filtered.filter(apt => apt.status === 'completed');
                break;
            default:
                break;
        }

        if (searchTerm) {
            filtered = filtered.filter(apt => {
                const patientName = apt.patientId?.name || '';
                return patientName.toLowerCase().includes(searchTerm.toLowerCase());
            });
        }

        setFilteredAppointments(filtered);
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
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
            case 'scheduled': return 'bg-emerald-100 text-emerald-700';
            case 'pending': return 'bg-amber-100 text-amber-700';
            case 'completed': return 'bg-blue-100 text-blue-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getAppointmentTypeIcon = (type: string) => {
        switch (type) {
            case 'video': return <Video className="w-4 h-4" />;
            case 'phone': return <Phone className="w-4 h-4" />;
            default: return <MapPin className="w-4 h-4" />;
        }
    };

    const handleUpdateStatus = async (id: string, status: 'completed' | 'cancelled') => {
        try {
            await api.patch(`/appointments/update/${id}`, { status });
            alert(`Appointment marked as ${status}`);
            fetchAppointments();
        } catch (error) {
            console.error('Error updating appointment:', error);
            alert('Failed to update appointment');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-emerald-100 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-emerald-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="mt-6 text-gray-600 font-medium">Loading appointments...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
                            <p className="text-gray-500 mt-2">Manage your appointments and schedule</p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-2xl p-6 border border-gray-200/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Total Appointments</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-2">{appointments.length}</p>
                                </div>
                                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                    <Calendar className="w-6 h-6 text-emerald-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-gray-200/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Today's Appointments</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-2">
                                        {appointments.filter(a => {
                                            const aptDate = new Date(a.appointmentDate).toISOString().split('T')[0];
                                            const today = new Date().toISOString().split('T')[0];
                                            return aptDate === today && a.status === 'scheduled';
                                        }).length}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <Clock className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-gray-200/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Pending</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-2">
                                        {appointments.filter(a => a.status === 'pending').length}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                    <Clock className="w-6 h-6 text-amber-600" />
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
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex flex-col md:flex-row gap-4 mb-8">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by patient name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Filter className="w-5 h-5 text-gray-500" />
                            <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-xl p-1">
                                {(['today', 'upcoming', 'pending', 'completed', 'all'] as const).map((filter) => (
                                    <button
                                        key={filter}
                                        onClick={() => setActiveFilter(filter)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeFilter === filter
                                            ? 'bg-emerald-600 text-white'
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

                {/* Appointments Table */}
                <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/80 border-b border-gray-200/50">
                                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Patient</th>
                                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Date & Time</th>
                                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Type</th>
                                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Status</th>
                                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAppointments.length > 0 ? (
                                    filteredAppointments.map((appointment) => {
                                        const dateTime = formatDateTime(appointment.appointmentDate);
                                        return (
                                            <tr key={appointment._id} className="border-b border-gray-200/50 hover:bg-gray-50/50 transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                                            <User className="w-5 h-5 text-emerald-600" />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-gray-900">
                                                                {appointment.patientId?.name || 'Patient'}
                                                            </div>
                                                            {appointment.notes && (
                                                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                                                    {appointment.notes}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center text-gray-700">
                                                            <Calendar className="w-4 h-4 mr-2" />
                                                            <span>{dateTime.date}</span>
                                                        </div>
                                                        <div className="flex items-center text-gray-500 text-sm">
                                                            <Clock className="w-4 h-4 mr-2" />
                                                            <span>{dateTime.time}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center space-x-2">
                                                        {getAppointmentTypeIcon(appointment.type)}
                                                        <span className="capitalize">{appointment.type.replace('-', ' ')}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                                                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => router.push(`/doctor/appointments/${appointment._id}`)}
                                                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer"
                                                            title="View Details"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        {appointment.status === 'scheduled' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleUpdateStatus(appointment._id, 'completed')}
                                                                    className="px-3 py-1.5 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 cursor-pointer"
                                                                >
                                                                    Complete
                                                                </button>
                                                                <button
                                                                    onClick={() => handleUpdateStatus(appointment._id, 'cancelled')}
                                                                    className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 cursor-pointer"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-16 text-center">
                                            <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                                <Calendar className="w-12 h-12 text-emerald-600" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">No appointments found</h3>
                                            <p className="text-gray-500 max-w-md mx-auto">
                                                {searchTerm
                                                    ? 'No appointments match your search criteria'
                                                    : 'No appointments scheduled for this filter'}
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorAppointmentsPage;