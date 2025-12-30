"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, User, Phone, Mail, MapPin, Video, PhoneCall, Edit, CheckCircle, XCircle, Printer, Download, Loader2, FileText, Pill } from 'lucide-react';
import api from '@/lib/api/api';

interface Appointment {
    _id: string;
    patientId: {
        _id: string;
        userId: {
            name: string;
            email: string;
        };
        phone?: string;
        address?: string;
        age?: number;
        gender?: string;
    };
    doctorId: {
        _id: string;
        userId: {
            name: string;
        };
        specialization?: string;
        consultationFee?: number;
        fee?: number;
    };
    appointmentDate: string;
    status: 'pending' | 'scheduled' | 'completed' | 'cancelled' | 'confirmed';
    type?: 'in-person' | 'video' | 'phone';
    notes?: string;
    duration?: number;
    reason?: string;
    symptoms?: string[];
    createdAt: string;
    updatedAt: string;
}

const AppointmentDetailsPage = () => {
    const params = useParams();
    const router = useRouter();
    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const appointmentId = params.id as string;

    useEffect(() => {
        fetchAppointments();
    }, [params.id]);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            
            // Try multiple endpoints
            const endpoints = [
                '/appointments/my',
                '/appointments/my-doctor-appointments'
            ];
            
            let allAppointments: Appointment[] = [];
            
            for (const endpoint of endpoints) {
                try {
                    console.log(`Trying endpoint: ${endpoint}`);
                    const response = await api.get(endpoint);
                    
                    if (Array.isArray(response.data)) {
                        allAppointments = response.data;
                        console.log(`✅ Found ${allAppointments.length} appointments from ${endpoint}`);
                        break;
                    } else if (response.data?.appointments) {
                        allAppointments = response.data.appointments;
                        console.log(`✅ Found ${allAppointments.length} appointments from ${endpoint}`);
                        break;
                    }
                } catch (err) {
                    console.log(`❌ Failed ${endpoint}:`, (err as any).response?.status);
                    continue;
                }
            }
            
            setAppointments(allAppointments);
            
            // Find the specific appointment
            const foundAppointment = allAppointments.find(apt => apt._id === appointmentId);
            
            if (foundAppointment) {
                console.log("✅ Found appointment:", foundAppointment);
                setAppointment(foundAppointment);
            } else {
                console.error("❌ Appointment not found in list");
                alert('Appointment not found');
                router.push('/doctor/appointments');
            }
            
        } catch (error) {
            console.error('Error fetching appointments:', error);
            alert('Failed to load appointment details');
            router.push('/doctor/appointments');
        } finally {
            setLoading(false);
        }
    };

    // Alternative: If you have a direct endpoint for single appointment
    const fetchAppointmentDirect = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/appointments/my/${appointmentId}`);
            console.log("Appointment details:", response.data);
            setAppointment(response.data);
        } catch (error: any) {
            console.error('Error fetching appointment:', error);
            
            // If direct endpoint fails, try to get from list
            if (error.response?.status === 404) {
                console.log('Direct endpoint not found, trying list method...');
                fetchAppointments();
            } else {
                alert('Failed to load appointment details');
                router.push('/doctor/appointments');
            }
        } finally {
            setLoading(false);
        }
    };

    const updateAppointmentStatus = async (newStatus: 'completed' | 'cancelled') => {
        if (!appointment) return;

        if (newStatus === 'cancelled' && !confirm('Are you sure you want to cancel this appointment?')) {
            return;
        }

        try {
            setUpdating(true);
            
            // Try multiple update endpoints
            const endpoints = [
                `/appointments/update/${appointmentId}`,
                `/appointments/${appointmentId}`
            ];
            
            let success = false;
            
            for (const endpoint of endpoints) {
                try {
                    console.log(`Trying update endpoint: ${endpoint}`);
                    const response = await api.patch(endpoint, { status: newStatus });
                    console.log(`✅ Update successful from ${endpoint}:`, response.data);
                    success = true;
                    break;
                } catch (err) {
                    console.log(`❌ Failed ${endpoint}:`, (err as any).response?.status);
                    continue;
                }
            }
            
            if (success) {
                alert(`Appointment marked as ${newStatus}`);
                fetchAppointments(); // Refresh data
            } else {
                alert('Failed to update appointment. No working endpoint found.');
            }
            
        } catch (error) {
            console.error('Error updating appointment:', error);
            alert('Failed to update appointment');
        } finally {
            setUpdating(false);
        }
    };

    const cancelAppointment = async () => {
        if (!appointment) return;

        if (!confirm('Are you sure you want to cancel this appointment?')) {
            return;
        }

        try {
            setUpdating(true);
            
            // Try cancel endpoint
            try {
                await api.patch(`/appointments/cancel/${appointmentId}`);
                alert('Appointment cancelled successfully');
                fetchAppointments(); // Refresh data
            } catch (err) {
                // If cancel endpoint doesn't work, try update endpoint
                await updateAppointmentStatus('cancelled');
            }
            
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            alert('Failed to cancel appointment');
        } finally {
            setUpdating(false);
        }
    };

    const formatDateTime = (dateString: string) => {
        try {
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
        } catch {
            return {
                date: 'Invalid date',
                time: 'Invalid time'
            };
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled':
            case 'confirmed': 
                return 'bg-emerald-100 text-emerald-700';
            case 'pending': return 'bg-amber-100 text-amber-700';
            case 'completed': return 'bg-blue-100 text-blue-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getAppointmentTypeIcon = (type?: string) => {
        switch (type) {
            case 'video': return <Video className="w-5 h-5" />;
            case 'phone': return <PhoneCall className="w-5 h-5" />;
            default: return <MapPin className="w-5 h-5" />;
        }
    };

    const handleCreatePrescription = () => {
        if (!appointment) return;
        router.push(`/doctor/prescriptions/create?patientId=${appointment.patientId._id}`);
    };

    const handleCreateMedicalRecord = () => {
        if (!appointment) return;
        router.push(`/doctor/records/create?patientId=${appointment.patientId._id}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-emerald-100 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-emerald-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="mt-6 text-gray-600 font-medium">Loading appointment details...</p>
                </div>
            </div>
        );
    }

    if (!appointment) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
                <div className="text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Calendar className="w-10 h-10 text-red-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Appointment Not Found</h3>
                    <p className="text-gray-600 mb-8">The appointment you're looking for doesn't exist.</p>
                    <button
                        onClick={() => router.push('/doctor/appointments')}
                        className="inline-flex items-center space-x-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Appointments</span>
                    </button>
                </div>
            </div>
        );
    }

    const dateTime = formatDateTime(appointment.appointmentDate);
    const patientName = appointment.patientId.userId?.name || 'Patient';
    const doctorFee = appointment.doctorId.consultationFee || appointment.doctorId.fee || 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => router.back()}
                                className="group flex items-center space-x-2 px-4 py-2.5 bg-white rounded-xl border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer"
                            >
                                <ArrowLeft className="w-4 h-4 text-gray-600 group-hover:text-emerald-600" />
                                <span className="font-medium text-gray-700 group-hover:text-emerald-700">Back</span>
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Appointment Details</h1>
                                <p className="text-sm text-gray-500 mt-1">ID: {appointment._id.slice(-8).toUpperCase()}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <span className={`px-4 py-2.5 rounded-xl font-medium ${getStatusColor(appointment.status)}`}>
                                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Appointment Details */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Appointment Information */}
                        <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Appointment Information</h2>
                                    <p className="text-sm text-gray-500">Details about this appointment</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <div className="flex items-center space-x-3 mb-4">
                                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                                <Calendar className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Date & Time</p>
                                                <p className="text-lg font-bold text-gray-900">{dateTime.date}</p>
                                                <p className="text-sm text-gray-600">{dateTime.time}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center space-x-3 mb-4">
                                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                                {getAppointmentTypeIcon(appointment.type)}
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Type</p>
                                                <p className="text-lg font-bold text-gray-900 capitalize">
                                                    {appointment.type ? appointment.type.replace('-', ' ') + ' Consultation' : 'In-person Consultation'}
                                                </p>
                                                <p className="text-sm text-gray-600">{appointment.duration || 30} minutes</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {appointment.reason && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-700 mb-2">Reason for Visit</h3>
                                        <div className="p-4 bg-gray-50 rounded-xl">
                                            <p className="text-gray-900">{appointment.reason}</p>
                                        </div>
                                    </div>
                                )}

                                {appointment.notes && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-700 mb-2">Notes</h3>
                                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                            <p className="text-gray-700">{appointment.notes}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <p className="text-sm text-gray-500">Consultation Fee</p>
                                        <p className="text-xl font-bold text-gray-900">
                                            ${doctorFee}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <p className="text-sm text-gray-500">Created</p>
                                        <p className="text-sm text-gray-900">
                                            {new Date(appointment.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Patient Information */}
                        <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <User className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Patient Information</h2>
                                    <p className="text-sm text-gray-500">Details about the patient</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-start space-x-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                                        <User className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                                            {patientName}
                                        </h3>
                                        <div className="text-sm text-gray-600 flex gap-4">
                                            {appointment.patientId.age && (
                                                <span>Age: {appointment.patientId.age}</span>
                                            )}
                                            {appointment.patientId.gender && (
                                                <span>Gender: {appointment.patientId.gender}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {appointment.patientId.phone && (
                                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                                            <Phone className="w-4 h-4 text-gray-600" />
                                            <div>
                                                <p className="text-sm text-gray-500">Phone</p>
                                                <p className="font-medium text-gray-900">{appointment.patientId.phone}</p>
                                            </div>
                                        </div>
                                    )}

                                    {appointment.patientId.userId?.email && (
                                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                                            <Mail className="w-4 h-4 text-gray-600" />
                                            <div>
                                                <p className="text-sm text-gray-500">Email</p>
                                                <p className="font-medium text-gray-900 truncate">
                                                    {appointment.patientId.userId.email}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {appointment.patientId.address && (
                                        <div className="md:col-span-2 flex items-start space-x-3 p-3 bg-gray-50 rounded-xl">
                                            <MapPin className="w-4 h-4 text-gray-600 mt-0.5" />
                                            <div>
                                                <p className="text-sm text-gray-500">Address</p>
                                                <p className="font-medium text-gray-900">{appointment.patientId.address}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => router.push(`/doctor/patients/${appointment.patientId._id}`)}
                                    className="w-full mt-4 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer"
                                >
                                    View Full Patient Profile
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Actions & Timeline */}
                    <div className="space-y-8">
                        {/* Actions */}
                        <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Actions</h2>
                            
                            <div className="space-y-3">
                                {(appointment.status === 'scheduled' || appointment.status === 'confirmed' || appointment.status === 'pending') && (
                                    <>
                                        <button
                                            onClick={() => updateAppointmentStatus('completed')}
                                            disabled={updating}
                                            className="w-full flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {updating ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <CheckCircle className="w-5 h-5" />
                                            )}
                                            <span className="font-medium">{updating ? 'Processing...' : 'Mark as Completed'}</span>
                                        </button>
                                        
                                        <button
                                            onClick={cancelAppointment}
                                            disabled={updating}
                                            className="w-full flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <XCircle className="w-5 h-5" />
                                            <span className="font-medium">Cancel Appointment</span>
                                        </button>
                                    </>
                                )}

                                <button
                                    onClick={handleCreatePrescription}
                                    className="w-full flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all cursor-pointer"
                                >
                                    <Pill className="w-5 h-5" />
                                    <span className="font-medium">Write Prescription</span>
                                </button>

                                <button
                                    onClick={handleCreateMedicalRecord}
                                    className="w-full flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl hover:from-purple-700 hover:to-violet-700 transition-all cursor-pointer"
                                >
                                    <FileText className="w-5 h-5" />
                                    <span className="font-medium">Add Medical Record</span>
                                </button>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Timeline</h2>
                            
                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Calendar className="w-4 h-4 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Appointment Created</p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {new Date(appointment.createdAt).toLocaleString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                
                                {appointment.updatedAt !== appointment.createdAt && (
                                    <div className="flex items-start space-x-3">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Edit className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">Last Updated</p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {new Date(appointment.updatedAt).toLocaleString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start space-x-3">
                                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Clock className="w-4 h-4 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Scheduled Time</p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {dateTime.date} at {dateTime.time}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Info */}
                        <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Quick Info</h2>
                            
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Appointment ID</span>
                                    <span className="text-sm font-medium text-gray-900">{appointment._id.slice(-8)}</span>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Duration</span>
                                    <span className="text-sm font-medium text-gray-900">{appointment.duration || 30} minutes</span>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Type</span>
                                    <span className="text-sm font-medium text-gray-900 capitalize">{appointment.type || 'in-person'}</span>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Fee</span>
                                    <span className="text-sm font-medium text-gray-900">${doctorFee}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppointmentDetailsPage;