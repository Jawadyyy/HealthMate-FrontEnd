"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, User, Phone, Mail, Calendar, Activity, Heart, Thermometer, FileText, Pill, Plus, ChevronRight, MapPin, Clock, Loader2, AlertCircle } from 'lucide-react';
import api from '@/lib/api/api';

interface Patient {
    _id: string;
    userId: {
        _id: string;
        name: string;
        email: string;
    };
    age?: number;
    gender?: string;
    bloodGroup?: string;
    phone?: string;
    address?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    medicalConditions?: string[];
    allergies?: string[];
    createdAt: string;
    updatedAt: string;
}

interface Appointment {
    _id: string;
    appointmentDate: string;
    status: string;
    type: string;
    notes?: string;
    patientId?: any; // Can be string or object
    doctorId?: any; // Can be string or object
}

interface MedicalRecord {
    _id: string;
    type: string;
    title: string;
    date: string;
    patientId?: string;
}

interface Prescription {
    _id: string;
    date: string;
    status: string;
    medications: any[];
    patientId?: string;
    doctorId?: string;
}

const PatientDetailsPage = () => {
    const params = useParams();
    const router = useRouter();
    const [patient, setPatient] = useState<Patient | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'records' | 'prescriptions'>('overview');

    useEffect(() => {
        fetchPatientDetails();
    }, [params.id]);

    const fetchPatientDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // First, get all appointments to check if patient has appointments with this doctor
            try {
                const appointmentsResponse = await api.get('/appointments/my');
                const allAppointments = appointmentsResponse.data.data || appointmentsResponse.data || [];
                
                // Check if this patient has appointments with current doctor
                const hasAccess = allAppointments.some((apt: Appointment) => {
                    // Handle both string and object patientId
                    const aptPatientId = typeof apt.patientId === 'string' 
                        ? apt.patientId 
                        : apt.patientId?._id;
                    return aptPatientId === params.id;
                });
                
                if (!hasAccess) {
                    throw new Error('You do not have access to this patient');
                }
                
                // Filter appointments for this specific patient
                const patientAppointments = allAppointments.filter((apt: Appointment) => {
                    const aptPatientId = typeof apt.patientId === 'string' 
                        ? apt.patientId 
                        : apt.patientId?._id;
                    return aptPatientId === params.id;
                });
                
                setAppointments(patientAppointments);
            } catch (err) {
                console.error('Error fetching appointments:', err);
                setAppointments([]);
            }
            
            // Try to fetch patient details from various endpoints
            try {
                // Try different patient endpoints
                let patientData = null;
                
                try {
                    // Try the main patients endpoint
                    const response = await api.get(`/patients/${params.id}`);
                    patientData = response.data;
                } catch (err) {
                    console.log('Could not fetch from /patients/{id}, trying /patients/me');
                    // Try to get from user's own patient profile
                    try {
                        const response = await api.get('/patients/me');
                        if (response.data && response.data._id === params.id) {
                            patientData = response.data;
                        } else {
                            // Create basic patient info from appointments
                            if (appointments.length > 0) {
                                const firstApt = appointments[0];
                                const patientInfo = typeof firstApt.patientId === 'string' 
                                    ? { _id: firstApt.patientId, name: 'Patient' }
                                    : firstApt.patientId || { _id: params.id, name: 'Patient' };
                                
                                patientData = {
                                    _id: params.id,
                                    userId: {
                                        _id: patientInfo._id,
                                        name: patientInfo.name || 'Patient',
                                        email: ''
                                    },
                                    createdAt: new Date().toISOString(),
                                    updatedAt: new Date().toISOString()
                                };
                            } else {
                                throw new Error('Patient not found in appointments');
                            }
                        }
                    } catch (innerErr) {
                        console.log('Could not fetch patient details, using fallback data');
                        throw new Error('Cannot fetch patient details');
                    }
                }
                
                if (patientData) {
                    // Transform patient data to match our interface
                    setPatient({
                        _id: patientData._id,
                        userId: {
                            _id: patientData._id,
                            name: patientData.name || patientData.fullName || patientData.userId?.name || 'Patient',
                            email: patientData.email || patientData.userId?.email || ''
                        },
                        age: patientData.age,
                        gender: patientData.gender,
                        bloodGroup: patientData.bloodGroup,
                        phone: patientData.phone,
                        address: patientData.address,
                        emergencyContactName: patientData.emergencyContactName,
                        emergencyContactPhone: patientData.emergencyContactPhone,
                        medicalConditions: Array.isArray(patientData.medicalConditions) 
                            ? patientData.medicalConditions 
                            : patientData.medicalConditions ? [patientData.medicalConditions] : [],
                        allergies: Array.isArray(patientData.allergies) 
                            ? patientData.allergies 
                            : patientData.allergies ? [patientData.allergies] : [],
                        createdAt: patientData.createdAt || new Date().toISOString(),
                        updatedAt: patientData.updatedAt || new Date().toISOString()
                    });
                } else {
                    throw new Error('Patient data not available');
                }
            } catch (error: any) {
                console.error('Error fetching patient details:', error);
                setError(error.message || 'Failed to load patient details');
                setLoading(false);
                return;
            }
            
            // Fetch medical records for this patient
            try {
                // Try to get medical records where doctor has access
                const recordsResponse = await api.get('/medical-records/my');
                const allRecords = recordsResponse.data.data || recordsResponse.data || [];
                
                // Filter records for this specific patient
                const patientRecords = allRecords.filter((record: MedicalRecord) => {
                    // Check if record belongs to this patient
                    return record.patientId === params.id || 
                           (record as any).patientId?._id === params.id;
                });
                
                setMedicalRecords(patientRecords);
            } catch (error) {
                console.error('Error fetching medical records:', error);
                // Don't set error state here, just show empty records
            }
            
            // Fetch prescriptions for this patient
            try {
                // Try to get doctor's prescriptions
                const prescriptionsResponse = await api.get('/prescriptions/doctor/my');
                const allPrescriptions = prescriptionsResponse.data.data || prescriptionsResponse.data || [];
                
                // Filter prescriptions for this specific patient
                const patientPrescriptions = allPrescriptions.filter((pres: Prescription) => {
                    return pres.patientId === params.id || 
                           (pres as any).patientId?._id === params.id;
                });
                
                setPrescriptions(patientPrescriptions);
            } catch (error) {
                console.error('Error fetching prescriptions:', error);
                // Don't set error state here, just show empty prescriptions
            }
            
        } catch (error: any) {
            console.error('Error fetching patient details:', error);
            setError(error.message || 'Failed to load patient details');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch {
            return 'Invalid date';
        }
    };

    const formatDateTime = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return 'Invalid date';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'scheduled':
            case 'pending':
                return 'bg-emerald-100 text-emerald-700';
            case 'completed':
            case 'confirmed':
                return 'bg-blue-100 text-blue-700';
            case 'cancelled':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const handleNewAppointment = () => {
        router.push(`/doctor/appointments/create?patientId=${params.id}`);
    };

    const handleNewPrescription = () => {
        router.push(`/doctor/prescriptions/create?patientId=${params.id}`);
    };

    const handleNewMedicalRecord = () => {
        router.push(`/doctor/medical-records/create?patientId=${params.id}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-emerald-100 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-emerald-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="mt-6 text-gray-600 font-medium">Loading patient details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
                <div className="text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-10 h-10 text-red-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h3>
                    <p className="text-gray-600 mb-8">{error}</p>
                    <button
                        onClick={() => router.push('/doctor/patients')}
                        className="inline-flex items-center space-x-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Patients</span>
                    </button>
                </div>
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
                <div className="text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <User className="w-10 h-10 text-red-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Patient Not Found</h3>
                    <p className="text-gray-600 mb-8">The patient you're looking for doesn't exist or you don't have access.</p>
                    <button
                        onClick={() => router.push('/doctor/patients')}
                        className="inline-flex items-center space-x-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Patients</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
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
                                <h1 className="text-2xl font-bold text-gray-900">Patient Details</h1>
                                <p className="text-sm text-gray-500 mt-1">ID: PAT-{patient._id.slice(-8).toUpperCase()}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={handleNewAppointment}
                                className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer"
                            >
                                <Calendar className="w-4 h-4" />
                                <span className="font-medium">New Appointment</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Patient Info */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Patient Profile Card */}
                        <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                            <div className="flex items-start space-x-4 mb-6">
                                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                                    <User className="w-10 h-10 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                        {patient.userId?.name || 'Patient'}
                                    </h2>
                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                        {patient.age && (
                                            <span>{patient.age} years</span>
                                        )}
                                        {patient.gender && (
                                            <span>• {patient.gender}</span>
                                        )}
                                        {patient.bloodGroup && (
                                            <span>• Blood Group: {patient.bloodGroup}</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">
                                        {patient.createdAt && `Patient since ${formatDate(patient.createdAt)}`}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 mb-3">Contact Information</h3>
                                    <div className="space-y-3">
                                        {patient.phone && (
                                            <div className="flex items-center space-x-3">
                                                <Phone className="w-4 h-4 text-gray-600" />
                                                <span className="text-sm text-gray-900">{patient.phone}</span>
                                            </div>
                                        )}
                                        {patient.userId?.email && (
                                            <div className="flex items-center space-x-3">
                                                <Mail className="w-4 h-4 text-gray-600" />
                                                <span className="text-sm text-gray-900 truncate">{patient.userId.email}</span>
                                            </div>
                                        )}
                                        {patient.address && (
                                            <div className="flex items-start space-x-3">
                                                <MapPin className="w-4 h-4 text-gray-600 mt-0.5" />
                                                <span className="text-sm text-gray-900">{patient.address}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 mb-3">Emergency Contact</h3>
                                    <div className="space-y-3">
                                        {patient.emergencyContactName && (
                                            <div className="flex items-center space-x-3">
                                                <User className="w-4 h-4 text-gray-600" />
                                                <span className="text-sm text-gray-900">{patient.emergencyContactName}</span>
                                            </div>
                                        )}
                                        {patient.emergencyContactPhone && (
                                            <div className="flex items-center space-x-3">
                                                <Phone className="w-4 h-4 text-gray-600" />
                                                <span className="text-sm text-gray-900">{patient.emergencyContactPhone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Medical Conditions */}
                            {patient.medicalConditions && patient.medicalConditions.length > 0 && (
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <h3 className="text-sm font-medium text-gray-700 mb-3">Medical Conditions</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {patient.medicalConditions.map((condition, index) => (
                                            <span
                                                key={index}
                                                className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-full"
                                            >
                                                {condition}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Allergies */}
                            {patient.allergies && patient.allergies.length > 0 && (
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <h3 className="text-sm font-medium text-gray-700 mb-3">Allergies</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {patient.allergies.map((allergy, index) => (
                                            <span
                                                key={index}
                                                className="text-xs bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full"
                                            >
                                                {allergy}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Tabs Navigation */}
                        <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50">
                            <div className="border-b border-gray-200">
                                <nav className="flex space-x-1 px-6">
                                    <button
                                        onClick={() => setActiveTab('overview')}
                                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'overview'
                                            ? 'border-emerald-600 text-emerald-700'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        Overview
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('appointments')}
                                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'appointments'
                                            ? 'border-emerald-600 text-emerald-700'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        Appointments ({appointments.length})
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('records')}
                                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'records'
                                            ? 'border-emerald-600 text-emerald-700'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        Medical Records ({medicalRecords.length})
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('prescriptions')}
                                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'prescriptions'
                                            ? 'border-emerald-600 text-emerald-700'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        Prescriptions ({prescriptions.length})
                                    </button>
                                </nav>
                            </div>

                            <div className="p-6">
                                {activeTab === 'overview' && (
                                    <div className="space-y-6">
                                        {/* Stats */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/50 rounded-xl p-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm text-emerald-800">Total Appointments</p>
                                                        <p className="text-2xl font-bold text-emerald-900 mt-2">{appointments.length}</p>
                                                    </div>
                                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                                                        <Calendar className="w-5 h-5 text-emerald-600" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50 rounded-xl p-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm text-blue-800">Medical Records</p>
                                                        <p className="text-2xl font-bold text-blue-900 mt-2">{medicalRecords.length}</p>
                                                    </div>
                                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                                                        <FileText className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200/50 rounded-xl p-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm text-red-800">Active Prescriptions</p>
                                                        <p className="text-2xl font-bold text-red-900 mt-2">
                                                            {prescriptions.filter(p => p.status?.toLowerCase() === 'active').length}
                                                        </p>
                                                    </div>
                                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                                                        <Pill className="w-5 h-5 text-red-600" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quick Actions */}
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-700 mb-4">Quick Actions</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <button
                                                    onClick={handleNewAppointment}
                                                    className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer text-left"
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                                                            <Calendar className="w-4 h-4 text-emerald-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">Schedule Appointment</p>
                                                            <p className="text-xs text-gray-500 mt-1">Book a new appointment</p>
                                                        </div>
                                                    </div>
                                                </button>

                                                <button
                                                    onClick={handleNewPrescription}
                                                    className="p-4 bg-blue-50 border border-blue-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all cursor-pointer text-left"
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                            <Pill className="w-4 h-4 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">Write Prescription</p>
                                                            <p className="text-xs text-gray-500 mt-1">Prescribe medications</p>
                                                        </div>
                                                    </div>
                                                </button>

                                                <button
                                                    onClick={handleNewMedicalRecord}
                                                    className="p-4 bg-purple-50 border border-purple-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all cursor-pointer text-left"
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                                            <FileText className="w-4 h-4 text-purple-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">Add Medical Record</p>
                                                            <p className="text-xs text-gray-500 mt-1">Document consultation</p>
                                                        </div>
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'appointments' && (
                                    <div className="space-y-4">
                                        {appointments.length > 0 ? (
                                            appointments.map((appointment) => (
                                                <div
                                                    key={appointment._id}
                                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                                                    onClick={() => router.push(`/doctor/appointments/${appointment._id}`)}
                                                >
                                                    <div className="flex items-center space-x-4">
                                                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                                            <Calendar className="w-5 h-5 text-emerald-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">
                                                                {formatDateTime(appointment.appointmentDate)}
                                                            </p>
                                                            <p className="text-sm text-gray-500 capitalize">
                                                                {appointment.type?.replace('-', ' ') || 'Appointment'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-4">
                                                        <span className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusColor(appointment.status)}`}>
                                                            {appointment.status || 'scheduled'}
                                                        </span>
                                                        <ChevronRight className="w-4 h-4 text-gray-400" />
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8">
                                                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                                <p className="text-gray-500">No appointments found</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'records' && (
                                    <div className="space-y-4">
                                        {medicalRecords.length > 0 ? (
                                            medicalRecords.map((record) => (
                                                <div
                                                    key={record._id}
                                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                                                    onClick={() => router.push(`/doctor/medical-records/${record._id}`)}
                                                >
                                                    <div className="flex items-center space-x-4">
                                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                            <FileText className="w-5 h-5 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{record.title}</p>
                                                            <p className="text-sm text-gray-500">
                                                                {formatDate(record.date)} • {record.type}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8">
                                                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                                <p className="text-gray-500">No medical records found</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'prescriptions' && (
                                    <div className="space-y-4">
                                        {prescriptions.length > 0 ? (
                                            prescriptions.map((prescription) => (
                                                <div
                                                    key={prescription._id}
                                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                                                    onClick={() => router.push(`/doctor/prescriptions/${prescription._id}`)}
                                                >
                                                    <div className="flex items-center space-x-4">
                                                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                                            <Pill className="w-5 h-5 text-red-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">
                                                                Prescription #{prescription._id.slice(-6).toUpperCase()}
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                {formatDate(prescription.date)} • {prescription.medications.length} med(s)
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-4">
                                                        <span className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusColor(prescription.status)}`}>
                                                            {prescription.status || 'active'}
                                                        </span>
                                                        <ChevronRight className="w-4 h-4 text-gray-400" />
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8">
                                                <Pill className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                                <p className="text-gray-500">No prescriptions found</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Recent Activity */}
                    <div className="space-y-8">
                        {/* Recent Activity */}
                        <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h2>
                            
                            <div className="space-y-4">
                                {appointments.slice(0, 3).map((appointment) => (
                                    <div key={appointment._id} className="flex items-start space-x-3">
                                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Calendar className="w-4 h-4 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Appointment</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {formatDateTime(appointment.appointmentDate)} - {appointment.status}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                
                                {medicalRecords.slice(0, 2).map((record) => (
                                    <div key={record._id} className="flex items-start space-x-3">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <FileText className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Medical Record: {record.title}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {formatDate(record.date)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                
                                {appointments.length === 0 && medicalRecords.length === 0 && (
                                    <div className="text-center py-4">
                                        <p className="text-sm text-gray-500">No recent activity</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Patient Stats */}
                        <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Patient Statistics</h2>
                            
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Appointment Frequency</span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {appointments.length > 1 ? 'Regular' : 'First-time'}
                                    </span>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Last Appointment</span>
                                    <span className="text-sm text-gray-900">
                                        {appointments.length > 0 
                                            ? formatDate(appointments[0].appointmentDate)
                                            : 'Never'
                                        }
                                    </span>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Active Prescriptions</span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {prescriptions.filter(p => p.status?.toLowerCase() === 'active').length}
                                    </span>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Completed Visits</span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {appointments.filter(a => a.status?.toLowerCase() === 'completed').length}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h2>
                            
                            <div className="space-y-3">
                                <button
                                    onClick={handleNewPrescription}
                                    className="w-full flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors cursor-pointer group"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                                            <Pill className="w-4 h-4 text-emerald-600" />
                                        </div>
                                        <span className="font-medium text-gray-900">Write Prescription</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600" />
                                </button>
                                
                                <button
                                    onClick={handleNewMedicalRecord}
                                    className="w-full flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors cursor-pointer group"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <FileText className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <span className="font-medium text-gray-900">Add Medical Record</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                                </button>
                                
                                <button
                                    onClick={handleNewAppointment}
                                    className="w-full flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition-colors cursor-pointer group"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <Calendar className="w-4 h-4 text-purple-600" />
                                        </div>
                                        <span className="font-medium text-gray-900">Schedule Appointment</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientDetailsPage;