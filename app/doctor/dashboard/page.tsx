"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, Users, DollarSign, Stethoscope, TrendingUp, Clock, User, Activity, Pill, AlertCircle, ChevronRight, Settings, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api/api';

interface Appointment {
    _id: string;
    patientId: {
        name: string;
        _id: string;
    };
    doctorId: {
        fee: number;
        _id: string;
    };
    appointmentDate: string;
    status: string;
}

interface Prescription {
    _id: string;
    patientId: {
        name: string;
        _id: string;
    };
    status: string;
    date: string;
    medications: Array<{ name: string }>;
}

interface DoctorStats {
    totalPatients: number;
    totalAppointments: number;
    earnings: number;
    pendingAppointments: number;
}

const DoctorDashboardPage = () => {
    const router = useRouter();
    const [stats, setStats] = useState<DoctorStats>({
        totalPatients: 0,
        totalAppointments: 0,
        earnings: 0,
        pendingAppointments: 0
    });
    const [loading, setLoading] = useState(true);
    const [todaysAppointments, setTodaysAppointments] = useState<Appointment[]>([]);
    const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
    const [recentPrescriptions, setRecentPrescriptions] = useState<Prescription[]>([]);
    const [doctorName, setDoctorName] = useState('Doctor');
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    useEffect(() => {
        fetchDashboardData();
        fetchDoctorProfile();
    }, []);

    const fetchDoctorProfile = async () => {
        try {
            const response = await api.get('/doctors/me');
            const doctorData = response.data;
            setDoctorName(doctorData.name || doctorData.userId?.name || 'Doctor');
        } catch (error) {
            console.error('Error fetching doctor profile:', error);
        }
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            
            // Fetch doctor's appointments
            const appointmentsResponse = await api.get('/appointments/my');
            const appointments: Appointment[] = appointmentsResponse.data.data || appointmentsResponse.data || [];
            
            // Filter today's appointments
            const today = new Date().toISOString().split('T')[0];
            const todays = appointments.filter((apt: Appointment) => {
                const aptDate = new Date(apt.appointmentDate).toISOString().split('T')[0];
                return aptDate === today && (apt.status === 'scheduled' || apt.status === 'pending');
            });
            
            // Filter upcoming appointments
            const upcoming = appointments.filter((apt: Appointment) => {
                const aptDate = new Date(apt.appointmentDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return aptDate > today && (apt.status === 'scheduled' || apt.status === 'pending');
            }).slice(0, 5);
            
            // Fetch recent prescriptions
            const prescriptionsResponse = await api.get('/prescriptions/doctor/my');
            const prescriptions: Prescription[] = prescriptionsResponse.data.data || prescriptionsResponse.data || [];
            
            // Fetch statistics - FIXED: Removed duplicate 'data' property
            const [patientsResponse, analyticsResponse, invoicesResponse] = await Promise.all([
                api.get('/patients/all').catch(() => ({ data: [] })),
                api.get('/analytics/appointments').catch(() => ({ data: { total: 0, pending: 0, revenue: 0 } })),
                api.get('/billing/invoice/doctor/me').catch(() => ({ data: [] }))
            ]);
            
            const patients = patientsResponse.data.data || patientsResponse.data || [];
            const analytics = analyticsResponse.data;
            const invoices = invoicesResponse.data.data || invoicesResponse.data || [];
            
            // Calculate total earnings from paid invoices
            const totalEarnings = invoices
                .filter((inv: any) => inv.status === 'paid')
                .reduce((sum: number, inv: any) => sum + (inv.amount || 0), 0);
            
            setTodaysAppointments(todays.slice(0, 5));
            setUpcomingAppointments(upcoming);
            setRecentPrescriptions(prescriptions.slice(0, 5));
            
            setStats({
                totalPatients: patients.length,
                totalAppointments: appointments.length,
                earnings: totalEarnings,
                pendingAppointments: appointments.filter((apt: Appointment) => apt.status === 'pending').length
            });
            
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // Fallback mock data
            setStats({
                totalPatients: 156,
                totalAppointments: 42,
                earnings: 12500,
                pendingAppointments: 8
            });
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleLogout = async () => {
        try {
            await api.post('/auth/log-out');
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            router.push('/auth/login/doctor');
        } catch (error) {
            console.error('Error logging out:', error);
            // Force logout anyway
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            router.push('/auth/login/doctor');
        }
    };

    const handleViewAppointmentDetails = (appointmentId: string) => {
        router.push(`/doctor/appointments/${appointmentId}`);
    };

    const handleViewPatientDetails = (patientId: string) => {
        router.push(`/doctor/patients/${patientId}`);
    };

    const handleViewPrescriptionDetails = (prescriptionId: string) => {
        router.push(`/doctor/prescriptions/${prescriptionId}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-emerald-100 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-emerald-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="mt-6 text-gray-600 font-medium">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
            <div className="max-w-7xl mx-auto">
                {/* Header with Profile */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
                            <p className="text-gray-500 mt-2">Welcome back, {doctorName}! Here's your overview</p>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <div className="text-sm text-gray-500">
                                {new Date().toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </div>
                            
                            {/* Profile Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                    className="flex items-center space-x-3 p-2 bg-white rounded-xl border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer"
                                >
                                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                                        <User className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-medium text-gray-900">{doctorName}</p>
                                        <p className="text-xs text-gray-500">Doctor</p>
                                    </div>
                                </button>
                                
                                {showProfileMenu && (
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                                        <button
                                            onClick={() => {
                                                router.push('/doctor/profile');
                                                setShowProfileMenu(false);
                                            }}
                                            className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer text-left"
                                        >
                                            <User className="w-4 h-4 text-gray-600" />
                                            <span className="text-sm text-gray-700">My Profile</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                router.push('/doctor/settings');
                                                setShowProfileMenu(false);
                                            }}
                                            className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer text-left"
                                        >
                                            <Settings className="w-4 h-4 text-gray-600" />
                                            <span className="text-sm text-gray-700">Settings</span>
                                        </button>
                                        <div className="border-t border-gray-200 my-2"></div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span className="text-sm font-medium">Logout</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Patients</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalPatients}</p>
                                <p className="text-xs text-emerald-600 mt-1 flex items-center">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    +12 this month
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                <Users className="w-6 h-6 text-emerald-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Today's Appointments</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{todaysAppointments.length}</p>
                                <p className="text-xs text-emerald-600 mt-1 flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {todaysAppointments.length > 0 ? `${todaysAppointments.length} scheduled` : 'No appointments'}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Earnings</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">${stats.earnings.toLocaleString()}</p>
                                <p className="text-xs text-emerald-600 mt-1 flex items-center">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    +8.5% from last month
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Pending Appointments</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pendingAppointments}</p>
                                <p className="text-xs text-amber-600 mt-1 flex items-center">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    Need confirmation
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                <Clock className="w-6 h-6 text-amber-600" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Today's Appointments */}
                    <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Today's Appointments</h2>
                                    <p className="text-sm text-gray-500">Your schedule for today</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => router.push('/doctor/appointments')}
                                className="text-emerald-600 hover:text-emerald-700 font-medium text-sm cursor-pointer"
                            >
                                View All
                            </button>
                        </div>

                        <div className="space-y-4">
                            {todaysAppointments.length > 0 ? (
                                todaysAppointments.map((appointment, index) => (
                                    <div 
                                        key={index} 
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                                        onClick={() => handleViewAppointmentDetails(appointment._id)}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                                <User className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900">
                                                    {appointment.patientId?.name || 'Patient'}
                                                </h4>
                                                <p className="text-sm text-gray-500">{formatTime(appointment.appointmentDate)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm font-medium text-gray-700">
                                                ${appointment.doctorId?.fee || 100}
                                            </span>
                                            <ChevronRight className="w-4 h-4 text-gray-400" />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">No appointments scheduled for today</p>
                                    <button
                                        onClick={() => router.push('/doctor/appointments')}
                                        className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium text-sm cursor-pointer"
                                    >
                                        Schedule Appointment
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Upcoming Appointments */}
                    <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Upcoming Appointments</h2>
                                    <p className="text-sm text-gray-500">Next 5 appointments</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => router.push('/doctor/appointments')}
                                className="text-emerald-600 hover:text-emerald-700 font-medium text-sm cursor-pointer"
                            >
                                View All
                            </button>
                        </div>

                        <div className="space-y-4">
                            {upcomingAppointments.length > 0 ? (
                                upcomingAppointments.map((appointment, index) => (
                                    <div 
                                        key={index} 
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                                        onClick={() => handleViewAppointmentDetails(appointment._id)}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                                <User className="w-5 h-5 text-purple-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900">
                                                    {appointment.patientId?.name || 'Patient'}
                                                </h4>
                                                <p className="text-sm text-gray-500">{formatDate(appointment.appointmentDate)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm font-medium text-gray-700">
                                                {formatTime(appointment.appointmentDate)}
                                            </span>
                                            <ChevronRight className="w-4 h-4 text-gray-400" />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">No upcoming appointments</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Prescriptions */}
                    <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                                    <Pill className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Recent Prescriptions</h2>
                                    <p className="text-sm text-gray-500">Latest prescribed medications</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => router.push('/doctor/prescriptions')}
                                className="text-emerald-600 hover:text-emerald-700 font-medium text-sm cursor-pointer"
                            >
                                View All
                            </button>
                        </div>

                        <div className="space-y-4">
                            {recentPrescriptions.length > 0 ? (
                                recentPrescriptions.map((prescription, index) => (
                                    <div 
                                        key={index} 
                                        className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-100 cursor-pointer hover:border-emerald-200 transition-colors"
                                        onClick={() => handleViewPrescriptionDetails(prescription._id)}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-medium text-gray-900">
                                                {prescription.patientId?.name || 'Patient'}
                                            </h4>
                                            <span className={`text-xs px-2 py-1 rounded-full ${
                                                prescription.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                                prescription.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                                prescription.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                                {prescription.status || 'Active'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 truncate">
                                            {prescription.medications?.map((med: any) => med.name).join(', ') || 'No medications listed'}
                                        </p>
                                        <div className="flex items-center justify-between mt-3">
                                            <span className="text-xs text-gray-500">
                                                {new Date(prescription.date).toLocaleDateString()}
                                            </span>
                                            <button className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center">
                                                View Details
                                                <ChevronRight className="w-3 h-3 ml-1" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <Pill className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">No recent prescriptions</p>
                                    <button
                                        onClick={() => router.push('/doctor/prescriptions/create')}
                                        className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium text-sm cursor-pointer"
                                    >
                                        Write First Prescription
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                        <div className="mb-6">
                            <div className="flex items-center space-x-3 mb-2">
                                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                                    <Activity className="w-5 h-5 text-amber-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
                            </div>
                            <p className="text-sm text-gray-500">Manage your practice quickly</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => router.push('/doctor/appointments')}
                                className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                            >
                                <div className="text-center">
                                    <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                                    <span className="font-medium text-gray-900">Manage Appointments</span>
                                </div>
                            </button>

                            <button 
                                onClick={() => router.push('/doctor/prescriptions/create')}
                                className="p-6 bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200 rounded-xl hover:border-red-300 hover:shadow-md transition-all cursor-pointer"
                            >
                                <div className="text-center">
                                    <Pill className="w-8 h-8 text-red-600 mx-auto mb-3" />
                                    <span className="font-medium text-gray-900">Write Prescription</span>
                                </div>
                            </button>

                            <button 
                                onClick={() => router.push('/doctor/patients')}
                                className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-xl hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer"
                            >
                                <div className="text-center">
                                    <Users className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
                                    <span className="font-medium text-gray-900">View Patients</span>
                                </div>
                            </button>

                            <button 
                                onClick={() => router.push('/doctor/records/create')}
                                className="p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all cursor-pointer"
                            >
                                <div className="text-center">
                                    <Stethoscope className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                                    <span className="font-medium text-gray-900">Add Medical Record</span>
                                </div>
                            </button>
                        </div>

                        {/* Additional Stats */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-4 bg-gray-50 rounded-xl">
                                    <p className="text-sm text-gray-500">Completed Appointments</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                        {stats.totalAppointments - stats.pendingAppointments}
                                    </p>
                                </div>
                                <div className="text-center p-4 bg-gray-50 rounded-xl">
                                    <p className="text-sm text-gray-500">Avg. per Patient</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                        ${stats.totalPatients > 0 ? Math.round(stats.earnings / stats.totalPatients) : 0}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Close profile menu when clicking outside */}
            {showProfileMenu && (
                <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowProfileMenu(false)}
                />
            )}
        </div>
    );
};

export default DoctorDashboardPage;