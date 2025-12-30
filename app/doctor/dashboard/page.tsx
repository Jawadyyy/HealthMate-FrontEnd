"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, Users, DollarSign, Stethoscope, TrendingUp, Clock, User, Activity, Pill, AlertCircle, ChevronRight, Settings, LogOut, Edit, Phone, MapPin, FileText, Award, BriefcaseMedical, Star, CheckCircle } from 'lucide-react';
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

interface DoctorProfileData {
    _id: string;
    fullName?: string;
    name?: string;
    email?: string;
    specialization?: string;
    bio?: string;
    experience?: number;
    fee?: number;
    licenseNumber?: string;
    age?: number;
    gender?: string;
    bloodGroup?: string;
    phone?: string;
    address?: string;
    qualifications?: string[];
    hospital?: string;
    availableDays?: string[];
    userId?: {
        _id: string;
        name: string;
        email: string;
    };
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
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showProfileView, setShowProfileView] = useState(false);
    const [doctorProfile, setDoctorProfile] = useState<DoctorProfileData | null>(null);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editedProfile, setEditedProfile] = useState<DoctorProfileData | null>(null);

    useEffect(() => {
        checkAuthentication();
    }, []);

    const checkAuthentication = () => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            const role = localStorage.getItem('role');

            if (token && role === 'doctor') {
                setIsAuthenticated(true);
                fetchDoctorProfile();
            } else {
                setIsAuthenticated(false);
                setLoading(false);
            }
        } else {
            setIsAuthenticated(false);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (doctorId && isAuthenticated) {
            fetchDashboardData();
        }
    }, [doctorId, isAuthenticated]);

    const addApiError = (error: string) => {
        setApiErrors(prev => [...prev, `${new Date().toLocaleTimeString()}: ${error}`]);
    };

    const fetchDoctorProfile = async () => {
        try {
            console.log('Fetching doctor profile...');
            const response = await api.get('/doctors/me');
            console.log('Doctor profile response:', response.data);

            const doctorData = response.data;

            const name = doctorData.userId?.name || doctorData.fullName || doctorData.name || 'Doctor';
            const id = doctorData._id || doctorData.userId?._id || '';

            setDoctorName(name);
            setDoctorId(id);
            setDoctorProfile(doctorData);
            setEditedProfile(doctorData);

            if (doctorData._id) {
                localStorage.setItem('doctorId', doctorData._id);
            }

            console.log('✅ Doctor profile loaded successfully');

        } catch (error: any) {
            console.error('❌ Error fetching doctor profile:', error);
            addApiError(`Doctor profile: ${error.message}`);
            // Create mock profile for development
            const mockProfile: DoctorProfileData = {
                _id: 'mock-id',
                fullName: 'Dr. John Smith',
                name: 'Dr. John Smith',
                email: 'john.smith@example.com',
                specialization: 'Cardiologist',
                bio: 'Experienced cardiologist with over 10 years of practice in heart-related diseases and treatments.',
                experience: 12,
                fee: 200,
                licenseNumber: 'MED-123456',
                age: 45,
                gender: 'Male',
                bloodGroup: 'O+',
                phone: '+1 (555) 123-4567',
                address: '123 Medical Center, Healthcare Ave, New York, NY 10001',
                qualifications: ['MD - Medical Doctor', 'Board Certified in Cardiology', 'Fellowship in Interventional Cardiology'],
                hospital: 'New York General Hospital',
                availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
            };
            setDoctorProfile(mockProfile);
            setEditedProfile(mockProfile);
            setLoading(false);
        }
    };

    const fetchDashboardData = async () => {
    try {
        setLoading(true);
        setApiErrors([]);

        // Fetch actual appointments
        try {
            const appointmentsResponse = await api.get('/appointments/my');
            const allAppointments = Array.isArray(appointmentsResponse.data) 
                ? appointmentsResponse.data 
                : appointmentsResponse.data.data || [];
            
            // Filter today's appointments
            const today = new Date().toISOString().split('T')[0];
            const todayAppointments = allAppointments.filter((apt: Appointment) => {
                const aptDate = new Date(apt.appointmentDate).toISOString().split('T')[0];
                return aptDate === today;
            });
            
            // Filter upcoming appointments
            const upcomingAppts = allAppointments.filter((apt: Appointment) => {
                const aptDate = new Date(apt.appointmentDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return aptDate > today;
            }).slice(0, 5); // Get next 5 appointments
            
            setTodaysAppointments(todayAppointments);
            setUpcomingAppointments(upcomingAppts);
            
            // Calculate stats from appointments
            const totalAppointments = allAppointments.length;
            const pendingAppointments = allAppointments.filter((apt: Appointment) => 
                apt.status === 'pending' || apt.status === 'scheduled'
            ).length;
            
            // Calculate earnings
            let earnings = 0;
            allAppointments.forEach((apt: Appointment) => {
                if (apt.status === 'completed') {
                    earnings += apt.doctorId?.fee || 0;
                }
            });
            
            // Get patients count
            const uniquePatients = new Set();
            allAppointments.forEach((apt: Appointment) => {
                if (apt.patientId) {
                    const patientId = typeof apt.patientId === 'string' 
                        ? apt.patientId 
                        : apt.patientId._id;
                    uniquePatients.add(patientId);
                }
            });
            
            setStats({
                totalPatients: uniquePatients.size,
                totalAppointments: totalAppointments,
                earnings: earnings,
                pendingAppointments: pendingAppointments
            });
            
        } catch (error: any) {
            console.error('Error fetching appointments:', error);
            addApiError(`Appointments: ${error.message}`);
        }

        // Fetch actual prescriptions
        try {
            const prescriptionsResponse = await api.get('/prescriptions/my');
            const allPrescriptions = Array.isArray(prescriptionsResponse.data) 
                ? prescriptionsResponse.data 
                : prescriptionsResponse.data.data || [];
            
            // Get recent prescriptions (last 5)
            const recentPres = allPrescriptions.slice(0, 5);
            setRecentPrescriptions(recentPres);
            
        } catch (error: any) {
            console.error('Error fetching prescriptions:', error);
            addApiError(`Prescriptions: ${error.message}`);
        }

        setLoading(false);

    } catch (error: any) {
        console.error('Error in fetchDashboardData:', error);
        addApiError(`Dashboard data: ${error.message}`);
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

    const handleLogin = () => {
        router.push('/auth/doctor/login');
    };

    const handleSaveProfile = async () => {
        try {
            console.log('Saving profile:', editedProfile);
            // Update API call here
            await api.put('/doctors/me', editedProfile);
            setIsEditingProfile(false);
            fetchDoctorProfile(); // Refresh profile data
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Failed to save profile. Please try again.');
        }
    };

    const handleCancelEdit = () => {
        setIsEditingProfile(false);
        setEditedProfile(doctorProfile);
    };

    const handleProfileFieldChange = (field: keyof DoctorProfileData, value: any) => {
        if (editedProfile) {
            setEditedProfile({
                ...editedProfile,
                [field]: value
            });
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 p-8">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <User className="w-10 h-10 text-emerald-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Access Required</h3>
                    <p className="text-gray-600 mb-8">
                        You need to log in as a doctor to access the dashboard. Please sign in to continue.
                    </p>
                    <div className="space-y-4">
                        <button
                            onClick={handleLogin}
                            className="w-full inline-flex items-center justify-center space-x-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer"
                        >
                            <User className="w-5 h-5" />
                            <span>Go to Doctor Login</span>
                        </button>
                        <button
                            onClick={checkAuthentication}
                            className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            Retry Authentication
                        </button>
                    </div>
                </div>
            </div>
        );
    }

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
                                {showProfileView && (
                                    <button
                                        onClick={() => setShowProfileView(false)}
                                        className="text-sm text-emerald-600 hover:text-emerald-700 font-medium cursor-pointer"
                                    >
                                        ← Back to Dashboard
                                    </button>
                                )}
                            </div>
                            <p className="text-gray-500 mt-2">Welcome back, {doctorName}! Here's your overview</p>
                        </div>

                        <div className="flex items-center space-x-4">
                            {!showProfileView && (
                                <>
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
                                                        setShowProfileView(true);
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
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                {showProfileView ? (
                    // Profile View (Similar to Patient Portal)
                    <div className="space-y-8">
                        {/* Profile Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
                                <p className="text-gray-500 mt-1">Manage your professional information</p>
                            </div>
                            <div className="flex items-center space-x-3">
                                {!isEditingProfile ? (
                                    <button
                                        onClick={() => setIsEditingProfile(true)}
                                        className="flex items-center space-x-2 px-4 py-2.5 text-emerald-600 hover:bg-emerald-50 rounded-xl border border-emerald-200 transition-all duration-200 cursor-pointer"
                                    >
                                        <Edit className="w-4 h-4" />
                                        <span className="text-sm font-medium">Edit Profile</span>
                                    </button>
                                ) : (
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={handleSaveProfile}
                                            className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer text-sm font-medium"
                                        >
                                            Save Changes
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer text-sm font-medium"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Profile Card */}
                        <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 overflow-hidden">
                            <div className="p-8">
                                <div className="flex flex-col lg:flex-row gap-8">
                                    {/* Profile Avatar & Basic Info */}
                                    <div className="lg:w-1/3 flex flex-col items-center lg:items-start">
                                        <div className="relative">
                                            <div className="w-40 h-40 rounded-full bg-gradient-to-br from-emerald-100 to-green-200 flex items-center justify-center text-5xl font-bold text-emerald-700 shadow-xl">
                                                {doctorProfile?.fullName?.charAt(0) || doctorProfile?.name?.charAt(0) || 'D'}
                                            </div>
                                            <div className="absolute bottom-4 right-4 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-white">
                                                <CheckCircle className="w-4 h-4 text-white" />
                                            </div>
                                        </div>

                                        <div className="text-center lg:text-left mt-6">
                                            <h2 className="text-2xl font-bold text-gray-900">
                                                {isEditingProfile ? (
                                                    <input
                                                        type="text"
                                                        value={editedProfile?.fullName || editedProfile?.name || ''}
                                                        onChange={(e) => handleProfileFieldChange('fullName', e.target.value)}
                                                        className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                                                    />
                                                ) : (
                                                    doctorProfile?.fullName || doctorProfile?.name || 'Doctor'
                                                )}
                                            </h2>
                                            <p className="text-gray-500 mt-1">
                                                {isEditingProfile ? (
                                                    <input
                                                        type="email"
                                                        value={editedProfile?.email || ''}
                                                        onChange={(e) => handleProfileFieldChange('email', e.target.value)}
                                                        className="border border-gray-300 rounded-lg px-3 py-2 w-full mt-1"
                                                    />
                                                ) : (
                                                    doctorProfile?.email || ''
                                                )}
                                            </p>
                                            <div className="flex items-center justify-center lg:justify-start space-x-3 mt-4">
                                                <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full">
                                                    Doctor ID: {doctorProfile?._id?.slice(-8) || 'N/A'}
                                                </span>
                                                <span className="text-xs font-medium bg-green-100 text-green-700 px-3 py-1.5 rounded-full">
                                                    Active
                                                </span>
                                            </div>
                                        </div>

                                        {/* Quick Stats */}
                                        <div className="w-full mt-8 grid grid-cols-2 gap-4">
                                            <div className="bg-emerald-50 rounded-xl p-4">
                                                <div className="flex items-center space-x-2">
                                                    <BriefcaseMedical className="w-5 h-5 text-emerald-600" />
                                                    <span className="text-sm font-medium text-gray-900">Experience</span>
                                                </div>
                                                <p className="text-2xl font-bold text-emerald-700 mt-2">
                                                    {isEditingProfile ? (
                                                        <input
                                                            type="number"
                                                            value={editedProfile?.experience || 0}
                                                            onChange={(e) => handleProfileFieldChange('experience', parseInt(e.target.value))}
                                                            className="border border-gray-300 rounded-lg px-3 py-1 w-20"
                                                        />
                                                    ) : (
                                                        `${doctorProfile?.experience || 0} Years`
                                                    )}
                                                </p>
                                            </div>
                                            <div className="bg-blue-50 rounded-xl p-4">
                                                <div className="flex items-center space-x-2">
                                                    <DollarSign className="w-5 h-5 text-blue-600" />
                                                    <span className="text-sm font-medium text-gray-900">Fee</span>
                                                </div>
                                                <p className="text-2xl font-bold text-blue-700 mt-2">
                                                    {isEditingProfile ? (
                                                        <input
                                                            type="number"
                                                            value={editedProfile?.fee || 0}
                                                            onChange={(e) => handleProfileFieldChange('fee', parseInt(e.target.value))}
                                                            className="border border-gray-300 rounded-lg px-3 py-1 w-20"
                                                        />
                                                    ) : (
                                                        `$${doctorProfile?.fee || 0}`
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Bio Section */}
                                        <div className="w-full mt-6">
                                            <h3 className="font-medium text-gray-900 mb-3">Bio</h3>
                                            {isEditingProfile ? (
                                                <textarea
                                                    value={editedProfile?.bio || ''}
                                                    onChange={(e) => handleProfileFieldChange('bio', e.target.value)}
                                                    className="border border-gray-300 rounded-lg px-3 py-2 w-full h-32"
                                                    rows={4}
                                                />
                                            ) : (
                                                <p className="text-gray-600 bg-gray-50 rounded-xl p-4">
                                                    {doctorProfile?.bio || 'No bio provided'}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Detailed Information */}
                                    <div className="lg:w-2/3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Personal Details */}
                                            <InfoCard
                                                icon={User}
                                                label="Personal Details"
                                                items={[
                                                    { label: 'Age', value: isEditingProfile ? (
                                                        <input
                                                            type="number"
                                                            value={editedProfile?.age || 0}
                                                            onChange={(e) => handleProfileFieldChange('age', parseInt(e.target.value))}
                                                            className="border border-gray-300 rounded-lg px-2 py-1 w-20"
                                                        />
                                                    ) : `${doctorProfile?.age || 0} Years` },
                                                    { label: 'Gender', value: isEditingProfile ? (
                                                        <select
                                                            value={editedProfile?.gender || ''}
                                                            onChange={(e) => handleProfileFieldChange('gender', e.target.value)}
                                                            className="border border-gray-300 rounded-lg px-2 py-1"
                                                        >
                                                            <option value="Male">Male</option>
                                                            <option value="Female">Female</option>
                                                            <option value="Other">Other</option>
                                                        </select>
                                                    ) : doctorProfile?.gender?.toUpperCase() || 'N/A' },
                                                    { label: 'Blood Group', value: isEditingProfile ? (
                                                        <input
                                                            type="text"
                                                            value={editedProfile?.bloodGroup || ''}
                                                            onChange={(e) => handleProfileFieldChange('bloodGroup', e.target.value)}
                                                            className="border border-gray-300 rounded-lg px-2 py-1"
                                                        />
                                                    ) : doctorProfile?.bloodGroup || 'N/A' }
                                                ]}
                                                isEditing={isEditingProfile}
                                            />

                                            {/* Contact Information */}
                                            <InfoCard
                                                icon={Phone}
                                                label="Contact Information"
                                                items={[
                                                    { label: 'Phone', value: isEditingProfile ? (
                                                        <input
                                                            type="tel"
                                                            value={editedProfile?.phone || ''}
                                                            onChange={(e) => handleProfileFieldChange('phone', e.target.value)}
                                                            className="border border-gray-300 rounded-lg px-2 py-1 w-full"
                                                        />
                                                    ) : doctorProfile?.phone || 'N/A' },
                                                    { label: 'Email', value: isEditingProfile ? (
                                                        <input
                                                            type="email"
                                                            value={editedProfile?.email || ''}
                                                            onChange={(e) => handleProfileFieldChange('email', e.target.value)}
                                                            className="border border-gray-300 rounded-lg px-2 py-1 w-full"
                                                        />
                                                    ) : doctorProfile?.email || 'N/A' }
                                                ]}
                                                isEditing={isEditingProfile}
                                            />

                                            {/* Address */}
                                            <InfoCard
                                                icon={MapPin}
                                                label="Address"
                                                items={[
                                                    { label: 'Clinic/Hospital Address', value: isEditingProfile ? (
                                                        <textarea
                                                            value={editedProfile?.address || ''}
                                                            onChange={(e) => handleProfileFieldChange('address', e.target.value)}
                                                            className="border border-gray-300 rounded-lg px-2 py-1 w-full"
                                                            rows={3}
                                                        />
                                                    ) : doctorProfile?.address || 'N/A' }
                                                ]}
                                                fullWidth
                                                isEditing={isEditingProfile}
                                            />

                                            {/* Professional Information */}
                                            <div className="md:col-span-2">
                                                <div className="bg-gradient-to-r from-emerald-50 to-green-100/50 border border-emerald-200/50 rounded-xl p-5">
                                                    <div className="flex items-center space-x-2 mb-4">
                                                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-emerald-200">
                                                            <Award className="w-4 h-4 text-emerald-600" />
                                                        </div>
                                                        <h3 className="font-medium text-emerald-800">Professional Information</h3>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                                                            {isEditingProfile ? (
                                                                <input
                                                                    type="text"
                                                                    value={editedProfile?.specialization || ''}
                                                                    onChange={(e) => handleProfileFieldChange('specialization', e.target.value)}
                                                                    className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                                                                />
                                                            ) : (
                                                                <p className="font-medium">{doctorProfile?.specialization || 'N/A'}</p>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Hospital</label>
                                                            {isEditingProfile ? (
                                                                <input
                                                                    type="text"
                                                                    value={editedProfile?.hospital || ''}
                                                                    onChange={(e) => handleProfileFieldChange('hospital', e.target.value)}
                                                                    className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                                                                />
                                                            ) : (
                                                                <p className="font-medium">{doctorProfile?.hospital || 'N/A'}</p>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee</label>
                                                            {isEditingProfile ? (
                                                                <input
                                                                    type="number"
                                                                    value={editedProfile?.fee || 0}
                                                                    onChange={(e) => handleProfileFieldChange('fee', parseInt(e.target.value))}
                                                                    className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                                                                />
                                                            ) : (
                                                                <p className="font-medium">${doctorProfile?.fee || 0}</p>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                                                            {isEditingProfile ? (
                                                                <input
                                                                    type="text"
                                                                    value={editedProfile?.licenseNumber || ''}
                                                                    onChange={(e) => handleProfileFieldChange('licenseNumber', e.target.value)}
                                                                    className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                                                                />
                                                            ) : (
                                                                <p className="font-medium">{doctorProfile?.licenseNumber || 'N/A'}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="mt-4">
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Qualifications</label>
                                                        {isEditingProfile ? (
                                                            <textarea
                                                                value={editedProfile?.qualifications?.join('\n') || ''}
                                                                onChange={(e) => handleProfileFieldChange('qualifications', e.target.value.split('\n'))}
                                                                className="border border-gray-300 rounded-lg px-3 py-2 w-full h-24"
                                                                placeholder="Enter each qualification on a new line"
                                                            />
                                                        ) : (
                                                            <div className="space-y-2">
                                                                {doctorProfile?.qualifications?.map((qual, index) => (
                                                                    <div key={index} className="flex items-start space-x-2">
                                                                        <Star className="w-4 h-4 text-emerald-500 mt-1 flex-shrink-0" />
                                                                        <span className="text-gray-700">{qual}</span>
                                                                    </div>
                                                                )) || <p className="text-gray-500">No qualifications listed</p>}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Availability */}
                                            <div className="md:col-span-2">
                                                <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-5">
                                                    <div className="flex items-center space-x-2 mb-4">
                                                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-blue-200">
                                                            <Calendar className="w-4 h-4 text-blue-600" />
                                                        </div>
                                                        <h3 className="font-medium text-blue-800">Availability</h3>
                                                    </div>
                                                    <div className="flex flex-wrap gap-3">
                                                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                                                            <div
                                                                key={day}
                                                                className={`px-4 py-2.5 rounded-lg border transition-all duration-200 ${doctorProfile?.availableDays?.includes(day)
                                                                        ? 'bg-emerald-500 text-white border-emerald-500'
                                                                        : 'bg-white text-gray-600 border-gray-300'
                                                                    }`}
                                                            >
                                                                <span className="font-medium">{day.substring(0, 3)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Original Dashboard Content
                    <>
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
                                                    <span className={`px-2 py-1 text-xs rounded-full ${appointment.status === 'completed' ? 'bg-green-100 text-green-700' :
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
                                                    <span className={`text-xs px-2 py-1 rounded-full ${prescription.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
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
                    </>
                )}
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

// InfoCard Component
interface InfoCardProps {
    icon: React.ElementType;
    label: string;
    items: { label: string; value: any }[];
    fullWidth?: boolean;
    isEditing?: boolean;
}

const InfoCard: React.FC<InfoCardProps> = ({ icon: Icon, label, items, fullWidth = false, isEditing = false }) => (
    <div className={`${fullWidth ? 'col-span-2' : ''} bg-gray-50/50 border border-gray-200/50 rounded-xl p-5`}>
        <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                <Icon className="w-5 h-5 text-gray-700" />
            </div>
            <h3 className="font-medium text-gray-900">{label}</h3>
        </div>
        <div className="space-y-3">
            {items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200/50 last:border-0">
                    <span className="text-sm text-gray-600">{item.label}</span>
                    <span className="font-medium text-gray-900">{item.value}</span>
                </div>
            ))}
        </div>
    </div>
);

export default DoctorDashboardPage;