"use client";

import React, { useState, useEffect } from 'react';
import { FileText, Download, Filter, Search, Plus, Stethoscope, Pill, Activity, Heart, Thermometer, ChevronRight, Eye, Share2, Printer, Calendar, User, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import api from '@/lib/api/api';

interface MedicalRecord {
    _id: string;
    patientId: string;
    patientName: string;
    type: 'consultation' | 'lab-report' | 'diagnosis' | 'vaccination' | 'prescription' | 'surgery';
    title: string;
    date: string;
    diagnosis?: string;
    treatment?: string;
    notes?: string;
    attachments: string[];
    status: 'active' | 'archived' | 'pending';
    vitalSigns?: {
        bloodPressure: string;
        heartRate: number;
        temperature: number;
        weight: number;
    };
}

const DoctorMedicalRecordsPage = () => {
    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<'all' | 'consultation' | 'lab-report' | 'prescription'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

    useEffect(() => {
        fetchMedicalRecords();
    }, []);

    useEffect(() => {
        filterRecords();
    }, [activeFilter, searchTerm, records]);

    const fetchMedicalRecords = async () => {
        try {
            setLoading(true);
            const response = await api.get('/doctors/medical-records');
            const data = response.data.data || response.data || [];
            setRecords(data);
        } catch (error) {
            console.error('Error fetching medical records:', error);
            // Mock data
            setRecords([
                {
                    _id: '1',
                    patientId: 'P001',
                    patientName: 'John Smith',
                    type: 'consultation',
                    title: 'Hypertension Follow-up',
                    date: '2024-01-15',
                    diagnosis: 'Stage 1 Hypertension',
                    treatment: 'Lifestyle changes and medication',
                    notes: 'Patient responded well to treatment. Blood pressure under control.',
                    attachments: ['bp_chart.pdf', 'ecg_report.pdf'],
                    status: 'active',
                    vitalSigns: {
                        bloodPressure: '130/85',
                        heartRate: 72,
                        temperature: 98.6,
                        weight: 85
                    }
                },
                {
                    _id: '2',
                    patientId: 'P002',
                    patientName: 'Sarah Johnson',
                    type: 'lab-report',
                    title: 'Blood Test Results',
                    date: '2024-01-10',
                    diagnosis: 'Iron Deficiency Anemia',
                    treatment: 'Iron supplements and diet modification',
                    attachments: ['blood_test.pdf'],
                    status: 'active'
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const filterRecords = () => {
        let filtered = [...records];

        if (activeFilter !== 'all') {
            filtered = filtered.filter(record => record.type === activeFilter);
        }

        if (searchTerm) {
            filtered = filtered.filter(record =>
                record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (record.diagnosis && record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        setFilteredRecords(filtered);
    };

    const getRecordIcon = (type: string) => {
        switch (type) {
            case 'consultation': return <Stethoscope className="w-5 h-5" />;
            case 'lab-report': return <Activity className="w-5 h-5" />;
            case 'diagnosis': return <AlertCircle className="w-5 h-5" />;
            case 'prescription': return <Pill className="w-5 h-5" />;
            case 'vaccination': return <Heart className="w-5 h-5" />;
            case 'surgery': return <Thermometer className="w-5 h-5" />;
            default: return <FileText className="w-5 h-5" />;
        }
    };

    const getRecordColor = (type: string) => {
        switch (type) {
            case 'consultation': return 'bg-green-100 text-green-600';
            case 'lab-report': return 'bg-blue-100 text-blue-600';
            case 'diagnosis': return 'bg-purple-100 text-purple-600';
            case 'prescription': return 'bg-yellow-100 text-yellow-600';
            case 'vaccination': return 'bg-red-100 text-red-600';
            case 'surgery': return 'bg-indigo-100 text-indigo-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-700';
            case 'archived': return 'bg-gray-100 text-gray-700';
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleViewRecord = (record: MedicalRecord) => {
        setSelectedRecord(record);
    };

    const handleCloseViewer = () => {
        setSelectedRecord(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-gray-50">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-green-100 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-green-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="mt-6 text-gray-600 font-medium">Loading medical records...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Medical Records</h1>
                            <p className="text-gray-500 mt-2">Manage and access patient medical records</p>
                        </div>
                        <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg shadow-green-500/30 cursor-pointer">
                            <Plus className="w-5 h-5" />
                            <span className="font-medium">Add New Record</span>
                        </button>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex flex-col md:flex-row gap-4 mb-8">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by patient name, diagnosis, or record type..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all duration-200"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Filter className="w-5 h-5 text-gray-500" />
                            <div className="flex flex-wrap gap-2">
                                {(['all', 'consultation', 'lab-report', 'prescription'] as const).map((filter) => (
                                    <button
                                        key={filter}
                                        onClick={() => setActiveFilter(filter)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeFilter === filter
                                            ? 'bg-green-600 text-white'
                                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        {filter === 'all' ? 'All Records' : filter.replace('-', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Records Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {filteredRecords.length > 0 ? (
                        filteredRecords.map((record) => (
                            <div
                                key={record._id}
                                className="bg-white rounded-2xl shadow-lg shadow-green-500/5 border border-gray-200/50 overflow-hidden hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300"
                            >
                                <div className="p-6">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getRecordColor(record.type).split(' ')[0]}`}>
                                                {getRecordIcon(record.type)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 capitalize">{record.type.replace('-', ' ')}</h3>
                                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(record.status)}`}>
                                                    {record.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Patient Info */}
                                    <div className="mb-4">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <User className="w-4 h-4 text-gray-400" />
                                            <h4 className="font-semibold text-gray-900">{record.patientName}</h4>
                                            <span className="text-sm text-gray-500">• {record.patientId}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-gray-500">
                                            <Calendar className="w-4 h-4" />
                                            <span className="text-sm">{formatDate(record.date)}</span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="mb-6">
                                        <h4 className="text-lg font-semibold text-gray-900 mb-2">{record.title}</h4>
                                        {record.diagnosis && (
                                            <div className="mb-3">
                                                <p className="text-sm font-medium text-gray-700">Diagnosis:</p>
                                                <p className="text-sm text-gray-600">{record.diagnosis}</p>
                                            </div>
                                        )}
                                        {record.treatment && (
                                            <div className="mb-3">
                                                <p className="text-sm font-medium text-gray-700">Treatment:</p>
                                                <p className="text-sm text-gray-600">{record.treatment}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Vital Signs */}
                                    {record.vitalSigns && (
                                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                            <h5 className="text-sm font-medium text-gray-700 mb-3">Vital Signs</h5>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <p className="text-xs text-gray-500">Blood Pressure</p>
                                                    <p className="font-medium">{record.vitalSigns.bloodPressure}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Heart Rate</p>
                                                    <p className="font-medium">{record.vitalSigns.heartRate} BPM</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Temperature</p>
                                                    <p className="font-medium">{record.vitalSigns.temperature}°F</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Weight</p>
                                                    <p className="font-medium">{record.vitalSigns.weight} kg</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Attachments */}
                                    {record.attachments.length > 0 && (
                                        <div className="mb-6">
                                            <p className="text-sm font-medium text-gray-700 mb-2">Attachments:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {record.attachments.map((file, index) => (
                                                    <span
                                                        key={index}
                                                        className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-lg border border-blue-200"
                                                    >
                                                        {file}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex items-center justify-between">
                                        <button
                                            onClick={() => handleViewRecord(record)}
                                            className="flex items-center space-x-2 text-green-600 hover:text-green-700 font-medium text-sm cursor-pointer"
                                        >
                                            <Eye className="w-4 h-4" />
                                            <span>View Details</span>
                                        </button>
                                        <div className="flex items-center space-x-2">
                                            <button className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer" title="Download">
                                                <Download className="w-4 h-4 text-gray-600" />
                                            </button>
                                            <button className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer" title="Print">
                                                <Printer className="w-4 h-4 text-gray-600" />
                                            </button>
                                            <button className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer" title="Share">
                                                <Share2 className="w-4 h-4 text-gray-600" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-3 text-center py-16">
                            <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <FileText className="w-12 h-12 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No medical records found</h3>
                            <p className="text-gray-500 max-w-md mx-auto mb-8">
                                {searchTerm
                                    ? 'No records match your search criteria'
                                    : 'No medical records available for your patients'}
                            </p>
                            <button className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-medium hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg shadow-green-500/30 cursor-pointer">
                                <Plus className="w-5 h-5" />
                                <span>Add New Medical Record</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Record Statistics */}
                <div className="bg-white rounded-2xl shadow-lg shadow-green-500/5 border border-gray-200/50 p-6 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Records Overview</h2>
                            <p className="text-gray-500">Summary of your patient records</p>
                        </div>
                        <button className="text-green-600 hover:text-green-700 font-medium cursor-pointer">
                            View Analytics
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-green-800">Total Records</p>
                                    <p className="text-xl font-bold text-green-900">{records.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                                    <Stethoscope className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-blue-800">Consultations</p>
                                    <p className="text-xl font-bold text-blue-900">
                                        {records.filter(r => r.type === 'consultation').length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                                    <Activity className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-purple-800">Lab Reports</p>
                                    <p className="text-xl font-bold text-purple-900">
                                        {records.filter(r => r.type === 'lab-report').length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-xl p-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                                    <CheckCircle className="w-5 h-5 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-yellow-800">Active Records</p>
                                    <p className="text-xl font-bold text-yellow-900">
                                        {records.filter(r => r.status === 'active').length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Record Viewer Modal */}
            {selectedRecord && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">{selectedRecord.title}</h2>
                                    <div className="flex items-center space-x-4 mt-2">
                                        <div className="flex items-center space-x-2">
                                            <User className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-600">{selectedRecord.patientName}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-600">{formatDate(selectedRecord.date)}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={handleCloseViewer}
                                    className="text-gray-400 hover:text-gray-600 cursor-pointer"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 space-y-6">
                                    {selectedRecord.diagnosis && (
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Diagnosis</h3>
                                            <p className="text-gray-700">{selectedRecord.diagnosis}</p>
                                        </div>
                                    )}

                                    {selectedRecord.treatment && (
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Treatment</h3>
                                            <p className="text-gray-700">{selectedRecord.treatment}</p>
                                        </div>
                                    )}

                                    {selectedRecord.notes && (
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
                                            <p className="text-gray-700">{selectedRecord.notes}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-gray-50 rounded-xl p-5">
                                        <h3 className="font-semibold text-gray-900 mb-4">Record Details</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-sm text-gray-500">Type</p>
                                                <p className="font-medium">{selectedRecord.type}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Status</p>
                                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(selectedRecord.status)}`}>
                                                    {selectedRecord.status}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Patient ID</p>
                                                <p className="font-medium">{selectedRecord.patientId}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {selectedRecord.vitalSigns && (
                                        <div className="bg-green-50 rounded-xl p-5">
                                            <h3 className="font-semibold text-green-900 mb-4">Vital Signs</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="text-center">
                                                    <p className="text-sm text-green-700">Blood Pressure</p>
                                                    <p className="text-xl font-bold text-green-900">{selectedRecord.vitalSigns.bloodPressure}</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm text-green-700">Heart Rate</p>
                                                    <p className="text-xl font-bold text-green-900">{selectedRecord.vitalSigns.heartRate} BPM</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm text-green-700">Temperature</p>
                                                    <p className="text-xl font-bold text-green-900">{selectedRecord.vitalSigns.temperature}°F</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm text-green-700">Weight</p>
                                                    <p className="text-xl font-bold text-green-900">{selectedRecord.vitalSigns.weight} kg</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-gray-200 flex items-center justify-between">
                                <button
                                    onClick={handleCloseViewer}
                                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200 cursor-pointer"
                                >
                                    Close
                                </button>
                                <div className="flex items-center space-x-3">
                                    <button className="flex items-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-all duration-200 cursor-pointer">
                                        <Download className="w-4 h-4" />
                                        <span>Download PDF</span>
                                    </button>
                                    <button className="flex items-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all duration-200 cursor-pointer">
                                        <Printer className="w-4 h-4" />
                                        <span>Print</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorMedicalRecordsPage;