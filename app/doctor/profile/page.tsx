"use client";

import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, GraduationCap, Building, Award, Save, Camera, Globe, Calendar, Clock, DollarSign, AlertCircle } from 'lucide-react';
import api from '@/lib/api/api';

interface UserData {
    name: string;
    email: string;
}

interface DoctorProfile {
    _id: string;
    userId: UserData | null;
    specialization: string;
    degrees: string[];
    experienceYears: number;
    phone: string;
    hospital: string;
    address: string;
    consultationFee: number;
    availableDays: string[];
    availableSlots: string[];
    bio: string;
    createdAt: string;
    updatedAt: string;
}

const DoctorProfilePage = () => {
    const [profile, setProfile] = useState<DoctorProfile>({
        _id: '',
        userId: null,
        specialization: '',
        degrees: [],
        experienceYears: 0,
        phone: '',
        hospital: '',
        address: '',
        consultationFee: 0,
        availableDays: [],
        availableSlots: [],
        bio: '',
        createdAt: '',
        updatedAt: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [newDegree, setNewDegree] = useState('');
    const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

    const availableDaysOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const timeSlots = [
        '08:00', '09:00', '10:00', '11:00', '12:00',
        '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
    ];

    // Transform data from backend to frontend format
    const transformProfileFromBackend = (responseData: any): DoctorProfile => {
        console.log('📥 Raw backend data:', responseData);
        
        let degreesArray: string[] = [];
        if (responseData.degrees) {
            if (typeof responseData.degrees === 'string') {
                // Split string by commas and trim each degree
                degreesArray = responseData.degrees.split(',').map((d: string) => d.trim()).filter((d: string) => d !== '');
            } else if (Array.isArray(responseData.degrees)) {
                degreesArray = responseData.degrees;
            }
        }
        
        return {
            _id: responseData._id || '',
            userId: responseData.userId || { name: responseData.fullName || '', email: '' },
            specialization: responseData.specialization || '',
            degrees: degreesArray,
            experienceYears: responseData.experienceYears || 0,
            phone: responseData.phone || '',
            hospital: responseData.hospitalName || responseData.hospital || '',
            address: responseData.address || '',
            consultationFee: responseData.fee || responseData.consultationFee || 0,
            availableDays: responseData.availableDays || [],
            availableSlots: responseData.availableSlots || [],
            bio: responseData.bio || '',
            createdAt: responseData.createdAt || '',
            updatedAt: responseData.updatedAt || ''
        };
    };

    // Transform data from frontend to backend format (UpdateDoctorDto schema)
    const transformProfileForBackend = (profile: DoctorProfile) => {
        // Convert degrees array to comma-separated string
        const degreesString = profile.degrees.join(', ');
        
        const transformed = {
            specialization: profile.specialization || '',
            degrees: degreesString, // MUST BE STRING for UpdateDoctorDto
            experienceYears: profile.experienceYears || 0,
            phone: profile.phone || '',
            hospitalName: profile.hospital || '', // MUST BE hospitalName
            address: profile.address || '',
            fee: profile.consultationFee || 0, // MUST BE fee
            availableDays: profile.availableDays || [],
            availableSlots: profile.availableSlots || []
        };
        
        // Include fullName if available (UpdateDoctorDto has this field)
        if (profile.userId?.name) {
            (transformed as any).fullName = profile.userId.name;
        }
        
        // Include bio if it exists
        if (profile.bio && profile.bio.trim() !== '') {
            (transformed as any).bio = profile.bio;
        }
        
        console.log('📤 Transformed for backend:', transformed);
        return transformed;
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setMessage(null);
            
            const response = await api.get('/doctors/me');
            console.log('✅ Profile data from backend:', response.data);
            
            const transformedProfile = transformProfileFromBackend(response.data);
            setProfile(transformedProfile);
            
        } catch (error: any) {
            console.error('❌ Error fetching doctor profile:', error);
            setMessage({
                text: 'Failed to load profile. Please try again.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setMessage(null);
            
            const dataToSend = transformProfileForBackend(profile);
            console.log('📤 Sending to /doctors/update:', dataToSend);
            
            const response = await api.patch('/doctors/update', dataToSend);
            console.log('✅ Update response:', response.data);
            
            setMessage({
                text: 'Profile updated successfully!',
                type: 'success'
            });
            
            // Refresh profile data
            fetchProfile();
            
        } catch (error: any) {
            console.error('❌ Error updating profile:', error);
            
            let errorMessage = 'Failed to update profile';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.errors) {
                const errors = Object.values(error.response.data.errors).join(', ');
                errorMessage = `Validation errors: ${errors}`;
            }
            
            setMessage({
                text: errorMessage,
                type: 'error'
            });
        } finally {
            setSaving(false);
        }
    };

    const addDegree = () => {
        if (newDegree.trim()) {
            setProfile({
                ...profile,
                degrees: [...profile.degrees, newDegree.trim()]
            });
            setNewDegree('');
        }
    };

    const removeDegree = (index: number) => {
        setProfile({
            ...profile,
            degrees: profile.degrees.filter((_, i) => i !== index)
        });
    };

    const toggleAvailableDay = (day: string) => {
        setProfile(prev => ({
            ...prev,
            availableDays: prev.availableDays.includes(day)
                ? prev.availableDays.filter(d => d !== day)
                : [...prev.availableDays, day]
        }));
    };

    const toggleTimeSlot = (slot: string) => {
        setProfile(prev => ({
            ...prev,
            availableSlots: prev.availableSlots.includes(slot)
                ? prev.availableSlots.filter(s => s !== slot)
                : [...prev.availableSlots, slot]
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-emerald-100 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-emerald-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="mt-6 text-gray-600 font-medium">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                            <p className="text-gray-500 mt-2">Manage your professional information</p>
                        </div>
                        <div className="flex items-center gap-4">
                            {message && (
                                <div className={`flex items-center px-4 py-2 rounded-lg ${message.type === 'success' 
                                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                                    : 'bg-red-100 text-red-700 border border-red-200'}`}>
                                    {message.type === 'error' && <AlertCircle className="w-4 h-4 mr-2" />}
                                    <span>{message.text}</span>
                                </div>
                            )}
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-800 transition-all duration-200 shadow-lg shadow-emerald-500/30 cursor-pointer disabled:opacity-50"
                            >
                                <Save className="w-5 h-5" />
                                <span className="font-medium">{saving ? 'Saving...' : 'Save Changes'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Profile Overview */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Personal Information */}
                        <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                                    <User className="w-5 h-5 text-emerald-600" />
                                </div>
                                <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.userId?.name || ''}
                                        readOnly
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <div className="flex items-center">
                                        <Mail className="w-4 h-4 text-gray-400 mr-3" />
                                        <input
                                            type="email"
                                            value={profile.userId?.email || ''}
                                            readOnly
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number
                                    </label>
                                    <div className="flex items-center">
                                        <Phone className="w-4 h-4 text-gray-400 mr-3" />
                                        <input
                                            type="tel"
                                            value={profile.phone}
                                            onChange={(e) => setProfile({...profile, phone: e.target.value})}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                                            placeholder="Enter phone number"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Experience (Years)
                                    </label>
                                    <input
                                        type="number"
                                        value={profile.experienceYears}
                                        onChange={(e) => setProfile({...profile, experienceYears: parseInt(e.target.value) || 0})}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                                        min="0"
                                        max="50"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Professional Information */}
                        <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <GraduationCap className="w-5 h-5 text-blue-600" />
                                </div>
                                <h2 className="text-lg font-bold text-gray-900">Professional Information</h2>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Specialization
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.specialization}
                                        onChange={(e) => setProfile({...profile, specialization: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                                        placeholder="e.g., Cardiologist, Pediatrician, etc."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Degrees & Qualifications
                                    </label>
                                    <div className="flex space-x-3 mb-3">
                                        <input
                                            type="text"
                                            value={newDegree}
                                            onChange={(e) => setNewDegree(e.target.value)}
                                            placeholder="Add a degree (e.g., MD, MBBS, PhD)"
                                            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDegree())}
                                        />
                                        <button
                                            type="button"
                                            onClick={addDegree}
                                            className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer"
                                        >
                                            Add
                                        </button>
                                    </div>

                                    {profile.degrees.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {profile.degrees.map((degree, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-200"
                                                >
                                                    <Award className="w-4 h-4" />
                                                    <span className="text-sm font-medium">{degree}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeDegree(index)}
                                                        className="text-emerald-500 hover:text-emerald-700 cursor-pointer"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Consultation Fee ($)
                                    </label>
                                    <div className="flex items-center">
                                        <DollarSign className="w-4 h-4 text-gray-400 mr-3" />
                                        <input
                                            type="number"
                                            value={profile.consultationFee}
                                            onChange={(e) => setProfile({...profile, consultationFee: parseInt(e.target.value) || 0})}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                                            min="0"
                                            step="10"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Biography
                                    </label>
                                    <textarea
                                        value={profile.bio}
                                        onChange={(e) => setProfile({...profile, bio: e.target.value})}
                                        className="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                                        placeholder="Tell patients about your expertise and approach..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Hospital & Address */}
                        <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                                    <Building className="w-5 h-5 text-purple-600" />
                                </div>
                                <h2 className="text-lg font-bold text-gray-900">Hospital & Address</h2>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Hospital/Clinic Name
                                    </label>
                                    <div className="flex items-center">
                                        <Building className="w-4 h-4 text-gray-400 mr-3" />
                                        <input
                                            type="text"
                                            value={profile.hospital}
                                            onChange={(e) => setProfile({...profile, hospital: e.target.value})}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                                            placeholder="Enter hospital or clinic name"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Address
                                    </label>
                                    <div className="flex items-center">
                                        <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                                        <textarea
                                            value={profile.address}
                                            onChange={(e) => setProfile({...profile, address: e.target.value})}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                                            placeholder="Enter full address"
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Schedule & Availability */}
                    <div className="space-y-8">
                        {/* Availability */}
                        <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-amber-600" />
                                </div>
                                <h2 className="text-lg font-bold text-gray-900">Availability Schedule</h2>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Available Days
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {availableDaysOptions.map((day) => (
                                            <label
                                                key={day}
                                                className={`flex items-center space-x-2 p-3 border rounded-xl cursor-pointer transition-all duration-200 ${profile.availableDays.includes(day)
                                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                                    : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30'
                                                    }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={profile.availableDays.includes(day)}
                                                    onChange={() => toggleAvailableDay(day)}
                                                    className="w-4 h-4 text-emerald-600"
                                                />
                                                <span className="text-sm font-medium">{day}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Available Time Slots
                                    </label>
                                    <div className="flex items-center space-x-2 mb-3">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-600">Select your available hours:</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {timeSlots.map((slot) => (
                                            <label
                                                key={slot}
                                                className={`flex items-center justify-center p-2 border rounded-lg cursor-pointer transition-all duration-200 ${profile.availableSlots.includes(slot)
                                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                                    : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30'
                                                    }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={profile.availableSlots.includes(slot)}
                                                    onChange={() => toggleTimeSlot(slot)}
                                                    className="sr-only"
                                                />
                                                <span className="text-sm font-medium">{slot}</span>
                                            </label>
                                        ))}
                                    </div>
                                    {profile.availableDays.length > 0 && profile.availableSlots.length > 0 && (
                                        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                                            <p className="text-sm text-emerald-700">
                                                Your availability: {profile.availableDays.join(', ')} from {profile.availableSlots.length > 0 ? `${profile.availableSlots[0]} to ${profile.availableSlots[profile.availableSlots.length-1]}` : 'Not set'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Profile Stats */}
                        <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Profile Stats</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Profile Completion</span>
                                    <span className="font-bold text-emerald-600">85%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-emerald-600 h-2 rounded-full" style={{width: '85%'}}></div>
                                </div>

                                <div className="space-y-3 pt-4 border-t border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Total Patients</span>
                                        <span className="font-bold text-gray-900">156</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Appointments</span>
                                        <span className="font-bold text-gray-900">42</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Prescriptions</span>
                                        <span className="font-bold text-gray-900">28</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Rating</span>
                                        <span className="font-bold text-gray-900">4.8 ★</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Profile Photo */}
                        <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Profile Photo</h2>
                            <div className="flex flex-col items-center">
                                <div className="w-32 h-32 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mb-4">
                                    <User className="w-16 h-16 text-white" />
                                </div>
                                <button className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer">
                                    <Camera className="w-4 h-4" />
                                    <span className="text-sm font-medium">Upload Photo</span>
                                </button>
                                <p className="text-xs text-gray-500 mt-3 text-center">
                                    Recommended: 500x500px, JPG or PNG format
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorProfilePage;