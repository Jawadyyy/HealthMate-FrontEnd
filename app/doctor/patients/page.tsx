"use client";

import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, Phone, Mail, Calendar, Activity, ChevronRight, User, Heart, Thermometer } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api/api';

interface Patient {
    _id: string;
    userId: any;
    age?: number;
    gender?: string;
    bloodGroup?: string;
    phone?: string;
    email?: string;
    medicalConditions?: string[];
    lastAppointment?: string;
    totalAppointments?: number;
}

const DoctorPatientsPage = () => {
    const router = useRouter();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        new: 0
    });

    useEffect(() => {
        fetchPatients();
    }, []);

    useEffect(() => {
        filterPatients();
    }, [searchTerm, patients]);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const response = await api.get('/patients/all');
            const data = response.data.data || response.data || [];
            
            // Enrich patient data with additional info
            const enrichedPatients = await Promise.all(
                data.map(async (patient: Patient) => {
                    try {
                        // Fetch patient's appointments
                        const appointmentsResponse = await api.get(`/appointments/doctor/patient?patientId=${patient._id}`);
                        const appointments = appointmentsResponse.data.data || appointmentsResponse.data || [];
                        
                        return {
                            ...patient,
                            totalAppointments: appointments.length,
                            lastAppointment: appointments.length > 0 
                                ? appointments[appointments.length - 1].appointmentDate 
                                : null
                        };
                    } catch (error) {
                        return patient;
                    }
                })
            );
            
            setPatients(enrichedPatients);
            setStats({
                total: enrichedPatients.length,
                active: enrichedPatients.filter(p => p.totalAppointments && p.totalAppointments > 0).length,
                new: enrichedPatients.filter(p => !p.totalAppointments || p.totalAppointments === 0).length
            });
        } catch (error) {
            console.error('Error fetching patients:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterPatients = () => {
        let filtered = [...patients];

        if (searchTerm) {
            filtered = filtered.filter(patient => {
                const userName = patient.userId?.name || '';
                const userEmail = patient.userId?.email || '';
                return (
                    userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    patient.phone?.toLowerCase().includes(searchTerm.toLowerCase())
                );
            });
        }

        setFilteredPatients(filtered);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getMedicalConditionsCount = (patient: Patient) => {
        return patient.medicalConditions?.length || 0;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-emerald-100 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-emerald-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="mt-6 text-gray-600 font-medium">Loading patients...</p>
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
                            <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
                            <p className="text-gray-500 mt-2">Manage and view your patients' information</p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-2xl p-6 border border-gray-200/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Total Patients</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-2">{stats.total}</p>
                                </div>
                                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                    <Users className="w-6 h-6 text-emerald-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-gray-200/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Active Patients</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-2">{stats.active}</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <Activity className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-gray-200/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">New Patients</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-2">{stats.new}</p>
                                </div>
                                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                    <User className="w-6 h-6 text-amber-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="mb-8">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search patients by name, email, or phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200"
                            />
                        </div>
                    </div>
                </div>

                {/* Patients Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {filteredPatients.length > 0 ? (
                        filteredPatients.map((patient) => (
                            <div
                                key={patient._id}
                                className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 overflow-hidden hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300"
                            >
                                <div className="p-6">
                                    {/* Patient Header */}
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                                                <User className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">
                                                    {patient.userId?.name || 'Patient'}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    {patient.age ? `${patient.age} years` : 'Age not specified'}
                                                    {patient.gender && ` • ${patient.gender}`}
                                                </p>
                                            </div>
                                        </div>
                                        <button className="text-gray-400 hover:text-gray-600 cursor-pointer">
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Patient Info */}
                                    <div className="space-y-4 mb-6">
                                        {patient.email && (
                                            <div className="flex items-center text-gray-600">
                                                <Mail className="w-4 h-4 mr-3 flex-shrink-0" />
                                                <span className="text-sm truncate">{patient.email}</span>
                                            </div>
                                        )}

                                        {patient.phone && (
                                            <div className="flex items-center text-gray-600">
                                                <Phone className="w-4 h-4 mr-3 flex-shrink-0" />
                                                <span className="text-sm">{patient.phone}</span>
                                            </div>
                                        )}

                                        {patient.bloodGroup && (
                                            <div className="flex items-center text-gray-600">
                                                <Heart className="w-4 h-4 mr-3 flex-shrink-0" />
                                                <span className="text-sm">Blood Group: {patient.bloodGroup}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Medical Info */}
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-emerald-50 p-3 rounded-lg">
                                            <p className="text-xs text-emerald-700 mb-1">Appointments</p>
                                            <p className="text-lg font-bold text-emerald-900">
                                                {patient.totalAppointments || 0}
                                            </p>
                                        </div>

                                        <div className="bg-blue-50 p-3 rounded-lg">
                                            <p className="text-xs text-blue-700 mb-1">Conditions</p>
                                            <p className="text-lg font-bold text-blue-900">
                                                {getMedicalConditionsCount(patient)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Last Visit */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <div className="flex items-center text-gray-500">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            <span className="text-sm">Last visit:</span>
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">
                                            {formatDate(patient.lastAppointment || '')}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex space-x-3 mt-6">
                                        <button
                                            onClick={() => router.push(`/doctor/records?patientId=${patient._id}`)}
                                            className="flex-1 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
                                        >
                                            View Records
                                        </button>
                                        <button
                                            onClick={() => router.push(`/doctor/prescriptions/create?patientId=${patient._id}`)}
                                            className="flex-1 px-4 py-2 border border-emerald-600 text-emerald-600 text-sm font-medium rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
                                        >
                                            Prescribe
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-3 text-center py-16">
                            <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Users className="w-12 h-12 text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No patients found</h3>
                            <p className="text-gray-500 max-w-md mx-auto">
                                {searchTerm
                                    ? 'No patients match your search criteria'
                                    : 'You have no patients yet. Patients will appear here after booking appointments.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DoctorPatientsPage;