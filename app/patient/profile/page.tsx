"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, User, Phone, MapPin, Droplet, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api/api';

interface PatientProfile {
    _id: string;
    userId: string;
    age?: number;
    gender?: string;
    bloodGroup?: string;
    phone?: string;
    address?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    medicalConditions?: string[];
    createdAt?: string;
    updatedAt?: string;
}

const EditProfilePage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [profile, setProfile] = useState<PatientProfile>({
        _id: '',
        userId: '',
        age: undefined,
        gender: '',
        bloodGroup: '',
        phone: '',
        address: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        medicalConditions: []
    });

    const [newCondition, setNewCondition] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await api.get('/patients/me');
            setProfile(response.data);
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (profile.age && (profile.age < 0 || profile.age > 150)) {
            newErrors.age = 'Age must be between 0 and 150';
        }

        if (profile.bloodGroup && !/^(A|B|AB|O)[+-]$/i.test(profile.bloodGroup)) {
            newErrors.bloodGroup = 'Invalid blood group format (e.g., A+, O-)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setSaving(true);
            setSaveSuccess(false);

            // Clean up the data before sending
            const dataToSend = {
                ...profile,
                age: profile.age || undefined,
                phone: profile.phone?.trim() || '',
                address: profile.address?.trim() || '',
                emergencyContactName: profile.emergencyContactName?.trim() || '',
                emergencyContactPhone: profile.emergencyContactPhone?.trim() || '',
                medicalConditions: profile.medicalConditions?.filter(c => c.trim()) || []
            };

            await api.patch('/patients/update', dataToSend);

            setSaveSuccess(true);

            // Navigate immediately to dashboard
            setTimeout(() => {
                router.push('/patient/dashboard');
            }, 1000);
        } catch (error: any) {
            console.error('Error updating profile:', error);
            setErrors({
                submit: error.response?.data?.message || 'Failed to update profile. Please try again.'
            });
        } finally {
            setSaving(false);
        }
    };

    const addMedicalCondition = () => {
        if (newCondition.trim()) {
            setProfile(prev => ({
                ...prev,
                medicalConditions: [...(prev.medicalConditions || []), newCondition.trim()]
            }));
            setNewCondition('');
        }
    };

    const removeMedicalCondition = (index: number) => {
        setProfile(prev => ({
            ...prev,
            medicalConditions: prev.medicalConditions?.filter((_, i) => i !== index) || []
        }));
    };

    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const genders = ['Male', 'Female', 'Other', 'Prefer not to say'];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-transparent">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="mt-6 text-gray-600 font-medium">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">


            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {saveSuccess && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                        <div className="flex items-center space-x-3">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                            <div>
                                <p className="font-medium text-green-800">Profile updated successfully!</p>
                                <p className="text-sm text-green-600">Redirecting to dashboard...</p>
                            </div>
                        </div>
                    </div>
                )}

                {errors.submit && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                        <div className="flex items-center space-x-3">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            <p className="font-medium text-red-800">{errors.submit}</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Personal Information Card */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <User className="w-5 h-5 text-blue-600" />
                                </div>
                                <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Age
                                    </label>
                                    <input
                                        type="number"
                                        value={profile.age || ''}
                                        onChange={(e) => setProfile({ ...profile, age: e.target.value ? parseInt(e.target.value) : undefined })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                        placeholder="Enter your age"
                                        min="0"
                                        max="150"
                                    />
                                    {errors.age && (
                                        <p className="mt-2 text-sm text-red-600">{errors.age}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Gender
                                    </label>
                                    <select
                                        value={profile.gender || ''}
                                        onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    >
                                        <option value="">Select gender</option>
                                        {genders.map((gender) => (
                                            <option key={gender} value={gender}>{gender}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Blood Group
                                    </label>
                                    <select
                                        value={profile.bloodGroup || ''}
                                        onChange={(e) => setProfile({ ...profile, bloodGroup: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    >
                                        <option value="">Select blood group</option>
                                        {bloodGroups.map((group) => (
                                            <option key={group} value={group}>{group}</option>
                                        ))}
                                    </select>
                                    {errors.bloodGroup && (
                                        <p className="mt-2 text-sm text-red-600">{errors.bloodGroup}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information Card */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                                    <Phone className="w-5 h-5 text-green-600" />
                                </div>
                                <h2 className="text-lg font-bold text-gray-900">Contact Information</h2>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={profile.phone || ''}
                                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                        placeholder="Enter phone number"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Emergency Contact Name
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.emergencyContactName || ''}
                                        onChange={(e) => setProfile({ ...profile, emergencyContactName: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                        placeholder="Enter emergency contact name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Emergency Contact Phone
                                    </label>
                                    <input
                                        type="tel"
                                        value={profile.emergencyContactPhone || ''}
                                        onChange={(e) => setProfile({ ...profile, emergencyContactPhone: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                        placeholder="Enter emergency contact phone"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Address Card */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                                    <MapPin className="w-5 h-5 text-purple-600" />
                                </div>
                                <h2 className="text-lg font-bold text-gray-900">Address</h2>
                            </div>
                        </div>
                        <div className="p-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Residential Address
                                </label>
                                <textarea
                                    value={profile.address || ''}
                                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 min-h-[120px]"
                                    placeholder="Enter your complete address"
                                    rows={4}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Medical Conditions Card */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                                    <Droplet className="w-5 h-5 text-red-600" />
                                </div>
                                <h2 className="text-lg font-bold text-gray-900">Medical Conditions</h2>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                <div className="flex space-x-3">
                                    <input
                                        type="text"
                                        value={newCondition}
                                        onChange={(e) => setNewCondition(e.target.value)}
                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                        placeholder="Add a medical condition (e.g., Diabetes, Hypertension)"
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMedicalCondition())}
                                    />
                                    <button
                                        type="button"
                                        onClick={addMedicalCondition}
                                        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all duration-200 cursor-pointer"
                                    >
                                        Add
                                    </button>
                                </div>

                                {profile.medicalConditions && profile.medicalConditions.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {profile.medicalConditions.map((condition, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center space-x-2 bg-red-50 text-red-700 px-4 py-2 rounded-xl border border-red-200"
                                            >
                                                <span className="text-sm font-medium">{condition}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeMedicalCondition(index)}
                                                    className="text-red-500 hover:text-red-700 cursor-pointer"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 cursor-pointer"
                            >
                                <Save className="w-5 h-5" />
                                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfilePage;