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
    const [doctorId, setDoctorId] = useState<string>('');
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [apiErrors, setApiErrors] = useState<string[]>([]);

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        
        if (!token || role !== 'doctor') {
            router.push('/auth/doctor/login');
            return;
        }
        
        fetchDoctorProfile();
    }, []);

    useEffect(() => {
        if (doctorId) {
            fetchDashboardData();
        }
    }, [doctorId]);

    const addApiError = (error: string) => {
        setApiErrors(prev => [...prev, `${new Date().toLocaleTimeString()}: ${error}`]);
    };

    const fetchDoctorProfile = async () => {
        try {
            console.log('Fetching doctor profile...');
            const response = await api.get('/doctors/me');
            console.log('Doctor profile response:', response.data);
            
            const doctorData = response.data;
            // Get name from user object or doctor data
            const name = doctorData.userId?.name || doctorData.fullName || 'Doctor';
            setDoctorName(name);
            setDoctorId(doctorData._id || doctorData.userId?._id || '');
            
            // Store doctor ID in localStorage for later use
            if (doctorData._id) {
                localStorage.setItem('doctorId', doctorData._id);
            }
            
        } catch (error: any) {
            console.error('Error fetching doctor profile:', error);
            addApiError(`Doctor profile: ${error.message}`);
        }
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setApiErrors([]);
            
            console.log('Starting dashboard data fetch...');
            console.log('Doctor ID:', doctorId);
            
            // 1. Fetch doctor's appointments - CORRECT ENDPOINT: /appointments/my
            let appointments: Appointment[] = [];
            try {
                const appointmentsResponse = await api.get('/appointments/my');
                appointments = Array.isArray(appointmentsResponse.data) ? appointmentsResponse.data : [];
                console.log(`Found ${appointments.length} appointments`);
            } catch (error: any) {
                console.error('Error fetching appointments:', error);
                addApiError(`Appointments: ${error.message}`);
            }
            
            // Filter today's appointments
            const today = new Date().toISOString().split('T')[0];
            const todays = appointments.filter((apt: Appointment) => {
                if (!apt.appointmentDate) return false;
                const aptDate = new Date(apt.appointmentDate).toISOString().split('T')[0];
                return aptDate === today && (apt.status === 'scheduled' || apt.status === 'pending' || apt.status === 'confirmed');
            });
            
            // Filter upcoming appointments
            const upcoming = appointments.filter((apt: Appointment) => {
                if (!apt.appointmentDate) return false;
                const aptDate = new Date(apt.appointmentDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return aptDate > today && (apt.status === 'scheduled' || apt.status === 'pending' || apt.status === 'confirmed');
            }).slice(0, 5);
            
            setTodaysAppointments(todays.slice(0, 5));
            setUpcomingAppointments(upcoming);
            
            // 2. Fetch doctor's prescriptions - CORRECT ENDPOINT: /prescriptions/doctor/my
            let prescriptions: Prescription[] = [];
            try {
                const prescriptionsResponse = await api.get('/prescriptions/doctor/my');
                prescriptions = Array.isArray(prescriptionsResponse.data) ? prescriptionsResponse.data : [];
                console.log(`Found ${prescriptions.length} prescriptions`);
            } catch (error: any) {
                console.error('Error fetching prescriptions:', error);
                // Try alternative endpoint
                try {
                    const altResponse = await api.get('/prescriptions/my');
                    prescriptions = Array.isArray(altResponse.data) ? altResponse.data : [];
                    console.log(`Found ${prescriptions.length} prescriptions using alternative endpoint`);
                } catch (altError) {
                    addApiError(`Prescriptions: ${error.message}`);
                }
            }
            
            setRecentPrescriptions(prescriptions.slice(0, 5));
            
            // 3. GET PATIENTS FROM APPOINTMENTS (not /patients/all)
            // Doctors should only see their own patients from appointments
            const uniquePatients = new Set<string>();
            appointments.forEach((apt: Appointment) => {
                if (apt.patientId?._id) {
                    uniquePatients.add(apt.patientId._id);
                }
            });
            const totalPatients = uniquePatients.size;
            
            // 4. Calculate earnings from appointments (not from /billing endpoint)
            let totalEarnings = 0;
            const completedAppointments = appointments.filter(apt => 
                apt.status === 'completed' || apt.status === 'confirmed' || apt.status === 'paid'
            );
            
            totalEarnings = completedAppointments.reduce((sum, apt) => {
                return sum + (apt.doctorId?.fee || 0);
            }, 0);
            
            // 5. Set statistics
            setStats({
                totalPatients: totalPatients,
                totalAppointments: appointments.length || 0,
                earnings: totalEarnings || 0,
                pendingAppointments: appointments.filter((apt: Appointment) => 
                    apt.status === 'pending' || apt.status === 'scheduled'
                ).length || 0
            });
            
            console.log('Dashboard data loaded successfully:', {
                patients: totalPatients,
                appointments: appointments.length,
                earnings: totalEarnings,
                todayAppointments: todays.length,
                upcomingAppointments: upcoming.length,
                prescriptions: prescriptions.length
            });
            
        } catch (error: any) {
            console.error('Error in fetchDashboardData:', error);
            
            if (error.response) {
                console.error('API Error Details:', {
                    url: error.config?.url,
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    data: error.response?.data
                });
                
                if (error.response.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('role');
                    router.push('/auth/doctor/login');
                    return;
                }
            }
            
            addApiError(`Dashboard data: ${error.message}`);
            
            // Fallback mock data for development
            setStats({
                totalPatients: 156,
                totalAppointments: 42,
                earnings: 12500,
                pendingAppointments: 8
            });
            
            // Mock today's appointments
            setTodaysAppointments([
                {
                    _id: '1',
                    patientId: { name: 'John Doe', _id: '1' },
                    doctorId: { fee: 150, _id: '1' },
                    appointmentDate: new Date().toISOString(),
                    status: 'scheduled'
                }
            ]);
            
            // Mock upcoming appointments
            setUpcomingAppointments([
                {
                    _id: '2',
                    patientId: { name: 'Jane Smith', _id: '2' },
                    doctorId: { fee: 200, _id: '1' },
                    appointmentDate: new Date(Date.now() + 86400000).toISOString(),
                    status: 'confirmed'
                }
            ]);
            
            // Mock prescriptions
            setRecentPrescriptions([
                {
                    _id: '1',
                    patientId: { name: 'John Doe', _id: '1' },
                    status: 'active',
                    date: new Date().toISOString(),
                    medications: [{ name: 'Amoxicillin' }]
                }
            ]);
            
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Invalid time';
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return 'Invalid date';
        }
    };

    const handleLogout = async () => {
        try {
            await api.post('/auth/log-out');
        } catch (error) {
            console.error('Error during logout API call:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('userId');
            localStorage.removeItem('doctorId');
            localStorage.removeItem('isLoggedIn');
            router.push('/auth/doctor/login');
        }
    };

    const handleViewAppointmentDetails = (appointmentId: string) => {
        router.push(`/doctor/appointments/${appointmentId}`);
    };

    const handleViewPrescriptionDetails = (prescriptionId: string) => {
        router.push(`/doctor/prescriptions/${prescriptionId}`);
    };

    const refreshData = () => {
        fetchDashboardData();
        fetchDoctorProfile();
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
                            <div className="flex items-center gap-4">
                                <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
                                <button
                                    onClick={refreshData}
                                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium cursor-pointer"
                                >
                                    Refresh
                                </button>
                            </div>
                            <p className="text-gray-500 mt-2">Welcome back, {doctorName}! Here's your overview</p>
                            
                            {/* API Errors Display */}
                            {apiErrors.length > 0 && (
                                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                    <p className="text-sm text-amber-700">
                                        <AlertCircle className="inline w-4 h-4 mr-2" />
                                        Some data may not be loading correctly. Check console for details.
                                    </p>
                                </div>
                            )}
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
                                <p className="text-sm font-medium text-gray-500">My Patients</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalPatients}</p>
                                <p className="text-xs text-emerald-600 mt-1 flex items-center">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    {stats.totalPatients > 0 ? 'From appointments' : 'No patients yet'}
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
                                    {stats.earnings > 0 ? 'From completed appointments' : 'No earnings yet'}
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
                                    {stats.pendingAppointments > 0 ? 'Need confirmation' : 'All confirmed'}
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
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                appointment.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                                                appointment.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                                {appointment.status || 'scheduled'}
                                            </span>
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
                                        View Calendar
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
                                                {prescription.date ? new Date(prescription.date).toLocaleDateString() : 'No date'}
                                            </span>
                                            <button className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center cursor-pointer">
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
                    className="fixed inset-0 z-40 cursor-pointer" 
                    onClick={() => setShowProfileMenu(false)}
                />
            )}
        </div>
    );
};

export default DoctorDashboardPage;