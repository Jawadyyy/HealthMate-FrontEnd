"use client";

import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Filter, User, Calendar, Stethoscope, Activity, Heart, Thermometer, Eye, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api/api';

interface MedicalRecord {
    _id: string;
    patientId: any;
    doctorId: any;
    type: 'consultation' | 'prescription' | 'lab-report' | 'diagnosis' | 'vaccination' | 'other';
    title: string;
    description?: string;
    diagnosis?: string;
    treatment?: string;
    vitalSigns?: {
        bloodPressure?: string;
        heartRate?: number;
        temperature?: number;
        weight?: number;
    };
    date: string;
    tags: string[];
    attachments?: {
        fileName: string;
        fileUrl: string;
        fileType: string;
    }[];
}

const DoctorRecordsPage = () => {
    const router = useRouter();
    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<'all' | 'consultation' | 'lab-report' | 'diagnosis'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [patients, setPatients] = useState<any[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<string>('all');

    useEffect(() => {
        fetchRecords();
        fetchPatients();
    }, []);

    useEffect(() => {
        filterRecords();
    }, [activeFilter, searchTerm, selectedPatient, records]);

    const fetchRecords = async () => {
        try {
            setLoading(true);
            const response = await api.get('/medical-records/all');
            const data = response.data.data || response.data || [];
            setRecords(data);
        } catch (error) {
            console.error('Error fetching records:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPatients = async () => {
        try {
            const response = await api.get('/patients/all');
            const data = response.data.data || response.data || [];
            setPatients(data);
        } catch (error) {
            console.error('Error fetching patients:', error);
        }
    };

    const filterRecords = () => {
        let filtered = [...records];

        if (activeFilter !== 'all') {
            filtered = filtered.filter(record => record.type === activeFilter);
        }

        if (selectedPatient !== 'all') {
            filtered = filtered.filter(record => record.patientId?._id === selectedPatient);
        }

        if (searchTerm) {
            filtered = filtered.filter(record =>
                record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.patientId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredRecords(filtered);
    };

    const getRecordIcon = (type: string) => {
        switch (type) {
            case 'consultation': return <Stethoscope className="w-5 h-5" />;
            case 'lab-report': return <Activity className="w-5 h-5" />;
            case 'diagnosis': return <Heart className="w-5 h-5" />;
            case 'prescription': return <FileText className="w-5 h-5" />;
            case 'vaccination': return <Activity className="w-5 h-5" />;
            default: return <FileText className="w-5 h-5" />;
        }
    };

    const getRecordColor = (type: string) => {
        switch (type) {
            case 'consultation': return 'bg-emerald-100 text-emerald-600';
            case 'lab-report': return 'bg-blue-100 text-blue-600';
            case 'diagnosis': return 'bg-purple-100 text-purple-600';
            case 'prescription': return 'bg-red-100 text-red-600';
            case 'vaccination': return 'bg-amber-100 text-amber-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-emerald-100 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-emerald-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="mt-6 text-gray-600 font-medium">Loading medical records...</p>
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
                            <h1 className="text-3xl font-bold text-gray-900">Medical Records</h1>
                            <p className="text-gray-500 mt-2">Manage patient medical records and history</p>
                        </div>
                        <button
                            onClick={() => router.push('/doctor/records/create')}
                            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all duration-200 shadow-lg shadow-emerald-500/30 cursor-pointer"
                        >
                            <Plus className="w-5 h-5" />
                            <span className="font-medium">Add Record</span>
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-2xl p-6 border border-gray-200/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Total Records</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-2">{records.length}</p>
                                </div>
                                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-emerald-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-gray-200/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Consultations</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-2">
                                        {records.filter(r => r.type === 'consultation').length}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <Stethoscope className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-gray-200/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Lab Reports</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-2">
                                        {records.filter(r => r.type === 'lab-report').length}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                    <Activity className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-gray-200/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Diagnoses</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-2">
                                        {records.filter(r => r.type === 'diagnosis').length}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                                    <Heart className="w-6 h-6 text-red-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4 mb-8">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search records by title, diagnosis, or patient..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200"
                            />
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <Filter className="w-5 h-5 text-gray-500" />
                                <div className="flex flex-wrap gap-2">
                                    {(['all', 'consultation', 'lab-report', 'diagnosis'] as const).map((filter) => (
                                        <button
                                            key={filter}
                                            onClick={() => setActiveFilter(filter)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeFilter === filter
                                                ? 'bg-emerald-600 text-white'
                                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            {filter === 'all' ? 'All Records' : filter.replace('-', ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <select
                                value={selectedPatient}
                                onChange={(e) => setSelectedPatient(e.target.value)}
                                className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                            >
                                <option value="all">All Patients</option>
                                {patients.map((patient) => (
                                    <option key={patient._id} value={patient._id}>
                                        {patient.userId?.name || `Patient ${patient._id.slice(-6)}`}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Records Table */}
                <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/80 border-b border-gray-200/50">
                                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Patient</th>
                                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Record Type</th>
                                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Title</th>
                                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Date</th>
                                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Vital Signs</th>
                                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRecords.length > 0 ? (
                                    filteredRecords.map((record) => (
                                        <tr key={record._id} className="border-b border-gray-200/50 hover:bg-gray-50/50 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                                        <User className="w-5 h-5 text-emerald-600" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">
                                                            {record.patientId?.name || 'Patient'}
                                                        </div>
                                                        {record.patientId?.age && (
                                                            <div className="text-sm text-gray-500">
                                                                {record.patientId.age} years
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center space-x-2">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getRecordColor(record.type).split(' ')[0]}`}>
                                                        {getRecordIcon(record.type)}
                                                    </div>
                                                    <span className="capitalize">{record.type.replace('-', ' ')}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div>
                                                    <div className="font-medium text-gray-900">{record.title}</div>
                                                    {record.description && (
                                                        <div className="text-sm text-gray-500 truncate max-w-xs">
                                                            {record.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center text-gray-700">
                                                    <Calendar className="w-4 h-4 mr-2" />
                                                    <span>{formatDate(record.date)}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                {record.vitalSigns ? (
                                                    <div className="flex items-center space-x-4">
                                                        {record.vitalSigns.bloodPressure && (
                                                            <div className="text-center">
                                                                <Thermometer className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                                                                <span className="text-xs font-medium text-gray-700">{record.vitalSigns.bloodPressure}</span>
                                                            </div>
                                                        )}
                                                        {record.vitalSigns.heartRate && (
                                                            <div className="text-center">
                                                                <Heart className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                                                                <span className="text-xs font-medium text-gray-700">{record.vitalSigns.heartRate} BPM</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400">No vital signs</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => router.push(`/doctor/records/${record._id}`)}
                                                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    {record.attachments && record.attachments.length > 0 && (
                                                        <a
                                                            href={record.attachments[0].fileUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                            title="Download Attachment"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-16 text-center">
                                            <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                                <FileText className="w-12 h-12 text-emerald-600" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">No records found</h3>
                                            <p className="text-gray-500 max-w-md mx-auto mb-8">
                                                {searchTerm || selectedPatient !== 'all'
                                                    ? 'No records match your search criteria'
                                                    : 'No medical records have been created yet'}
                                            </p>
                                            <button
                                                onClick={() => router.push('/doctor/records/create')}
                                                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-medium hover:from-emerald-700 hover:to-green-700 transition-all duration-200 shadow-lg shadow-emerald-500/30 cursor-pointer"
                                            >
                                                <Plus className="w-5 h-5" />
                                                <span>Create First Record</span>
                                            </button>
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

export default DoctorRecordsPage;