"use client";

import React, { useState, useEffect } from 'react';
import {
    FileText, Download, Filter, Search, Stethoscope, Pill,
    Activity, Heart, Thermometer, Eye, Calendar, User, X,
    Building2, Phone, Mail, ChevronRight, Clock, AlertCircle,
    Printer, Share2, Star, ClipboardCheck, TrendingUp, Shield,
    FileCheck, AlertTriangle, ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react';
import api from '@/lib/api/api';

interface VitalSigns {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    weight?: number;
}

interface Attachment {
    fileName: string;
    fileUrl: string;
    fileType: string;
}

interface Doctor {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
    specialization?: string;
    hospital?: string;
    profilePicture?: string;
}

interface MedicalRecord {
    _id: string;
    patientId?: string;
    doctorId?: string;
    doctor?: Doctor;
    type: 'consultation' | 'prescription' | 'lab-report' | 'diagnosis' | 'vaccination' | 'other';
    title: string;
    description?: string;
    diagnosis?: string;
    treatment?: string;
    prescription?: string;
    notes?: string;
    attachments?: Attachment[];
    status?: 'active' | 'inactive' | 'archived';
    vitalSigns?: VitalSigns;
    date: string;
    visitDate?: string;
    tags: string[];
}

const MedicalRecordsPage = () => {
    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<'all' | 'consultation' | 'lab-report' | 'diagnosis'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [expandedVitals, setExpandedVitals] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    useEffect(() => {
        fetchMedicalRecords();
    }, []);

    useEffect(() => {
        filterRecords();
    }, [activeFilter, searchTerm, records]);

    const fetchMedicalRecords = async () => {
        try {
            setLoading(true);
            const response = await api.get('/medical-records/my');
            let data = response.data.data || response.data || [];

            console.log('Medical Records Response:', data);

            const transformedRecords = data.map((record: any) => {
                let doctor = null;

                if (record.doctorId && typeof record.doctorId === 'object' && record.doctorId._id) {
                    const doctorData = record.doctorId;
                    let doctorName = doctorData.name || '';
                    if (!doctorName && (doctorData.firstName || doctorData.lastName)) {
                        doctorName = `${doctorData.firstName || ''} ${doctorData.lastName || ''}`.trim();
                    }

                    doctor = {
                        _id: doctorData._id,
                        name: doctorName || 'Doctor',
                        email: doctorData.email,
                        phone: doctorData.phone || doctorData.phoneNumber,
                        specialization: doctorData.specialization || doctorData.specialty,
                        hospital: doctorData.hospital || doctorData.hospitalName,
                        profilePicture: doctorData.profilePicture || doctorData.avatar
                    };
                }

                return {
                    ...record,
                    doctor: doctor || {
                        _id: 'unknown',
                        name: 'Doctor Information Unavailable'
                    }
                };
            });

            console.log('Transformed records with doctor info:', transformedRecords);
            setRecords(transformedRecords);
        } catch (error) {
            console.error('Error fetching medical records:', error);
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
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(record =>
                record.title.toLowerCase().includes(searchLower) ||
                (record.doctor?.name && record.doctor.name.toLowerCase().includes(searchLower)) ||
                record.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
                (record.description && record.description.toLowerCase().includes(searchLower))
            );
        }

        setFilteredRecords(filtered);
    };

    const getRecordIcon = (type: string) => {
        switch (type) {
            case 'lab-report': return <Activity className="w-5 h-5" />;
            case 'diagnosis': return <Stethoscope className="w-5 h-5" />;
            case 'consultation': return <FileCheck className="w-5 h-5" />;
            case 'vaccination': return <Shield className="w-5 h-5" />;
            default: return <FileText className="w-5 h-5" />;
        }
    };

    const getRecordColor = (type: string) => {
        switch (type) {
            case 'lab-report': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'diagnosis': return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'consultation': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'vaccination': return 'bg-green-50 text-green-700 border-green-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const getPriorityBadge = (type: string) => {
        switch (type) {
            case 'lab-report': return { label: 'Reviewed', color: 'bg-emerald-100 text-emerald-800' };
            case 'diagnosis': return { label: 'Critical', color: 'bg-red-100 text-red-800' };
            default: return { label: 'Active', color: 'bg-gray-100 text-gray-800' };
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDateShort = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    const handleView = (record: MedicalRecord) => {
        setSelectedRecord(record);
        setShowDetailModal(true);
        setExpandedVitals(false);
    };

    const handleDownloadAll = (attachments: Attachment[]) => {
        // Implement bulk download logic here
        console.log('Downloading all attachments:', attachments);
    };

    const handleShare = (record: MedicalRecord) => {
        // Implement share functionality here
        console.log('Sharing record:', record);
        if (navigator.share) {
            navigator.share({
                title: record.title,
                text: `Medical Record: ${record.title}`,
                url: window.location.href
            });
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative inline-block">
                        <div className="w-20 h-20 border-4 border-blue-100 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-20 h-20 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="mt-6 text-lg font-medium text-gray-700">Loading your medical records...</p>
                    <p className="text-sm text-gray-500 mt-2">Please wait while we fetch your health information</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Medical Records</h1>
                            <p className="text-gray-600 mt-2 flex items-center">
                                <Shield className="w-4 h-4 mr-2 text-blue-600" />
                                Secure access to your complete medical history
                            </p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                {viewMode === 'grid' ? 'List View' : 'Grid View'}
                            </button>
                        </div>
                    </div>

                    {/* Stats Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Records</p>
                                    <p className="text-2xl font-bold text-gray-900">{records.length}</p>
                                </div>
                                <FileText className="w-8 h-8 text-blue-600" />
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Lab Reports</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {records.filter(r => r.type === 'lab-report').length}
                                    </p>
                                </div>
                                <Activity className="w-8 h-8 text-emerald-600" />
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Consultations</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {records.filter(r => r.type === 'consultation').length}
                                    </p>
                                </div>
                                <Stethoscope className="w-8 h-8 text-amber-600" />
                            </div>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search records by title, doctor, diagnosis, or tags..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                />
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
                                    <Filter className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm text-gray-700">Filter:</span>
                                </div>
                                {(['all', 'consultation', 'lab-report', 'diagnosis'] as const).map((filter) => (
                                    <button
                                        key={filter}
                                        onClick={() => setActiveFilter(filter)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeFilter === filter
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        {filter === 'all' ? 'All Records' :
                                            filter.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Records Display */}
                    {filteredRecords.length > 0 ? (
                        <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}`}>
                            {filteredRecords.map((record) => (
                                <div
                                    key={record._id}
                                    className={`bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 ${viewMode === 'list' ? 'p-6' : 'p-5'}`}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getRecordColor(record.type).split(' ')[0]}`}>
                                                {getRecordIcon(record.type)}
                                            </div>
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getRecordColor(record.type)} border`}>
                                                        {record.type.replace('-', ' ')}
                                                    </span>
                                                    <span className={`text-xs px-2.5 py-1 rounded-full ${getPriorityBadge(record.type).color}`}>
                                                        {getPriorityBadge(record.type).label}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleView(record)}
                                            className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                                        >
                                            <ChevronRight className="w-5 h-5 text-gray-400" />
                                        </button>
                                    </div>

                                    <div className="mb-4">
                                        <h3 className="font-semibold text-gray-900 mb-2">{record.title}</h3>
                                        {record.description && (
                                            <p className="text-sm text-gray-600 line-clamp-2 mb-3">{record.description}</p>
                                        )}

                                        <div className="space-y-2">
                                            {record.doctor && (
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <User className="w-4 h-4 mr-2 flex-shrink-0" />
                                                    <span className="truncate">{record.doctor.name}</span>
                                                    {record.doctor.specialization && (
                                                        <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                                                            {record.doctor.specialization}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                                                <span>{formatDateShort(record.date)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {record.tags && record.tags.length > 0 && (
                                        <div className="mb-4">
                                            <div className="flex flex-wrap gap-2">
                                                {record.tags.slice(0, 3).map((tag, index) => (
                                                    <span
                                                        key={index}
                                                        className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                                {record.tags.length > 3 && (
                                                    <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                                                        +{record.tags.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <button
                                            onClick={() => handleView(record)}
                                            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                                        >
                                            <Eye className="w-4 h-4" />
                                            <span>View Details</span>
                                        </button>

                                        <div className="flex items-center space-x-2">
                                            {record.attachments && record.attachments.length > 0 && (
                                                <span className="text-xs text-gray-500 flex items-center">
                                                    <FileText className="w-3 h-3 mr-1" />
                                                    {record.attachments.length} file{record.attachments.length > 1 ? 's' : ''}
                                                </span>
                                            )}
                                            {record.vitalSigns && Object.keys(record.vitalSigns).length > 0 && (
                                                <span className="text-xs text-gray-500 flex items-center">
                                                    <TrendingUp className="w-3 h-3 mr-1" />
                                                    Vitals
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <FileText className="w-10 h-10 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">No records found</h3>
                            <p className="text-gray-600 max-w-md mx-auto mb-6">
                                {searchTerm
                                    ? 'No medical records match your search criteria. Try different keywords.'
                                    : 'Your medical records will appear here after your appointments and consultations.'}
                            </p>
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Clear Search
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Detail Modal - Enhanced */}
                {showDetailModal && selectedRecord && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-blue-50 to-blue-100/30 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getRecordColor(selectedRecord.type).split(' ')[0]}`}>
                                        {getRecordIcon(selectedRecord.type)}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">{selectedRecord.title}</h2>
                                        <div className="flex items-center space-x-2">
                                            <span className={`text-xs font-medium px-2 py-1 rounded ${getRecordColor(selectedRecord.type)}`}>
                                                {selectedRecord.type.replace('-', ' ').toUpperCase()}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {formatDate(selectedRecord.date)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={handlePrint}
                                        className="p-2 hover:bg-white rounded-lg transition-colors"
                                        title="Print"
                                    >
                                        <Printer className="w-5 h-5 text-gray-600" />
                                    </button>
                                    <button
                                        onClick={() => handleShare(selectedRecord)}
                                        className="p-2 hover:bg-white rounded-lg transition-colors"
                                        title="Share"
                                    >
                                        <Share2 className="w-5 h-5 text-gray-600" />
                                    </button>
                                    <button
                                        onClick={() => setShowDetailModal(false)}
                                        className="p-2 hover:bg-white rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5 text-gray-600" />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Left Column - Main Content */}
                                    <div className="lg:col-span-2 space-y-6">
                                        {/* Doctor Information Card */}
                                        {selectedRecord.doctor && (
                                            <div className="bg-gray-50 rounded-xl p-5">
                                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                                    <User className="w-5 h-5 mr-2 text-blue-600" />
                                                    Doctor Information
                                                </h3>
                                                <div className="space-y-4">
                                                    <div className="flex items-start">
                                                        <div className="w-32 text-sm text-gray-600">Name:</div>
                                                        <div className="flex-1">
                                                            <div className="font-medium text-gray-900">{selectedRecord.doctor.name}</div>
                                                            {selectedRecord.doctor.specialization && (
                                                                <div className="text-sm text-gray-600 mt-1">{selectedRecord.doctor.specialization}</div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {selectedRecord.doctor.hospital && (
                                                            <div className="flex items-center">
                                                                <Building2 className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                                                                <span className="text-sm text-gray-900 truncate">{selectedRecord.doctor.hospital}</span>
                                                            </div>
                                                        )}
                                                        {selectedRecord.doctor.email && (
                                                            <div className="flex items-center">
                                                                <Mail className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                                                                <span className="text-sm text-gray-900 truncate">{selectedRecord.doctor.email}</span>
                                                            </div>
                                                        )}
                                                        {selectedRecord.doctor.phone && (
                                                            <div className="flex items-center">
                                                                <Phone className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                                                                <span className="text-sm text-gray-900">{selectedRecord.doctor.phone}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Medical Details */}
                                        <div className="space-y-6">
                                            {selectedRecord.description && (
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                                                        <FileText className="w-5 h-5 mr-2 text-blue-600" />
                                                        Description
                                                    </h3>
                                                    <p className="text-gray-700 bg-blue-50/50 p-4 rounded-lg">{selectedRecord.description}</p>
                                                </div>
                                            )}

                                            {selectedRecord.diagnosis && (
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                                                        <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
                                                        Diagnosis
                                                    </h3>
                                                    <div className="bg-red-50/50 p-4 rounded-lg border border-red-100">
                                                        <p className="text-gray-800">{selectedRecord.diagnosis}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {selectedRecord.treatment && (
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                                                        <Activity className="w-5 h-5 mr-2 text-green-600" />
                                                        Treatment Plan
                                                    </h3>
                                                    <p className="text-gray-700 bg-green-50/50 p-4 rounded-lg whitespace-pre-line">{selectedRecord.treatment}</p>
                                                </div>
                                            )}

                                            {selectedRecord.prescription && (
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                                                        <Pill className="w-5 h-5 mr-2 text-purple-600" />
                                                        Prescription
                                                    </h3>
                                                    <div className="bg-purple-50/50 p-4 rounded-lg border border-purple-100">
                                                        <p className="text-gray-800 whitespace-pre-line">{selectedRecord.prescription}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {selectedRecord.notes && (
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                                                        <ClipboardCheck className="w-5 h-5 mr-2 text-amber-600" />
                                                        Clinical Notes
                                                    </h3>
                                                    <p className="text-gray-700 bg-amber-50/50 p-4 rounded-lg">{selectedRecord.notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Column - Side Info */}
                                    <div className="space-y-6">
                                        {/* Vital Signs Card */}
                                        {selectedRecord.vitalSigns && Object.keys(selectedRecord.vitalSigns).length > 0 && (
                                            <div className="bg-white border border-gray-200 rounded-xl p-5">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="font-semibold text-gray-900 flex items-center">
                                                        <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                                                        Vital Signs
                                                    </h3>
                                                    <button
                                                        onClick={() => setExpandedVitals(!expandedVitals)}
                                                        className="text-blue-600 hover:text-blue-700"
                                                    >
                                                        {expandedVitals ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                                    </button>
                                                </div>

                                                <div className={`grid ${expandedVitals ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
                                                    {selectedRecord.vitalSigns.bloodPressure && (
                                                        <div className={`bg-gray-50 p-3 rounded-lg ${expandedVitals ? '' : 'border-l-4 border-blue-500'}`}>
                                                            <div className="text-xs text-gray-500 mb-1">Blood Pressure</div>
                                                            <div className="font-semibold text-gray-900">{selectedRecord.vitalSigns.bloodPressure}</div>
                                                            <div className="text-xs text-gray-400 mt-1">mmHg</div>
                                                        </div>
                                                    )}
                                                    {selectedRecord.vitalSigns.heartRate && (
                                                        <div className={`bg-gray-50 p-3 rounded-lg ${expandedVitals ? '' : 'border-l-4 border-red-500'}`}>
                                                            <div className="text-xs text-gray-500 mb-1">Heart Rate</div>
                                                            <div className="font-semibold text-gray-900">{selectedRecord.vitalSigns.heartRate} BPM</div>
                                                            <div className="text-xs text-gray-400 mt-1">Resting</div>
                                                        </div>
                                                    )}
                                                    {expandedVitals && selectedRecord.vitalSigns.temperature && (
                                                        <div className="bg-gray-50 p-3 rounded-lg">
                                                            <div className="text-xs text-gray-500 mb-1">Temperature</div>
                                                            <div className="font-semibold text-gray-900">{selectedRecord.vitalSigns.temperature}°F</div>
                                                            <div className="text-xs text-gray-400 mt-1">Oral</div>
                                                        </div>
                                                    )}
                                                    {expandedVitals && selectedRecord.vitalSigns.weight && (
                                                        <div className="bg-gray-50 p-3 rounded-lg">
                                                            <div className="text-xs text-gray-500 mb-1">Weight</div>
                                                            <div className="font-semibold text-gray-900">{selectedRecord.vitalSigns.weight} kg</div>
                                                            <div className="text-xs text-gray-400 mt-1">Body weight</div>
                                                        </div>
                                                    )}
                                                </div>

                                                {!expandedVitals && (selectedRecord.vitalSigns.temperature || selectedRecord.vitalSigns.weight) && (
                                                    <button
                                                        onClick={() => setExpandedVitals(true)}
                                                        className="text-sm text-blue-600 hover:text-blue-700 mt-3 flex items-center"
                                                    >
                                                        Show all vital signs
                                                        <ChevronRight className="w-4 h-4 ml-1" />
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {/* Attachments Card */}
                                        {selectedRecord.attachments && selectedRecord.attachments.length > 0 && (
                                            <div className="bg-white border border-gray-200 rounded-xl p-5">
                                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                                    <FileText className="w-5 h-5 mr-2 text-gray-600" />
                                                    Attachments ({selectedRecord.attachments.length})
                                                </h3>
                                                <div className="space-y-3">
                                                    {selectedRecord.attachments.map((attachment, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                                                        >
                                                            <div className="flex items-center space-x-3 min-w-0">
                                                                <div className={`w-8 h-8 rounded flex items-center justify-center ${attachment.fileType.includes('pdf') ? 'bg-red-100 text-red-600' :
                                                                    attachment.fileType.includes('image') ? 'bg-green-100 text-green-600' :
                                                                        'bg-blue-100 text-blue-600'
                                                                    }`}>
                                                                    <FileText className="w-4 h-4" />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <div className="text-sm font-medium text-gray-900 truncate">{attachment.fileName}</div>
                                                                    <div className="text-xs text-gray-500">{attachment.fileType.split('/')[1]?.toUpperCase() || 'FILE'}</div>
                                                                </div>
                                                            </div>
                                                            <a
                                                                href={attachment.fileUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-1 hover:bg-white rounded transition-colors"
                                                                title="Download"
                                                            >
                                                                <Download className="w-4 h-4 text-gray-500 group-hover:text-blue-600" />
                                                            </a>
                                                        </div>
                                                    ))}

                                                    {selectedRecord.attachments.length > 1 && (
                                                        <button
                                                            onClick={() => handleDownloadAll(selectedRecord.attachments!)}
                                                            className="w-full py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center"
                                                        >
                                                            <Download className="w-4 h-4 mr-2" />
                                                            Download All Files
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Tags Card */}
                                        {selectedRecord.tags && selectedRecord.tags.length > 0 && (
                                            <div className="bg-white border border-gray-200 rounded-xl p-5">
                                                <h3 className="font-semibold text-gray-900 mb-3">Tags & Categories</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedRecord.tags.map((tag, index) => (
                                                        <span
                                                            key={index}
                                                            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-colors cursor-default"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Record Metadata */}
                                        <div className="bg-gray-50 rounded-xl p-5">
                                            <h3 className="font-semibold text-gray-900 mb-3">Record Information</h3>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Record ID:</span>
                                                    <span className="font-mono text-gray-900">{selectedRecord._id.slice(0, 8)}...</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Date Created:</span>
                                                    <span className="text-gray-900">{formatDateShort(selectedRecord.date)}</span>
                                                </div>
                                                {selectedRecord.visitDate && (
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Visit Date:</span>
                                                        <span className="text-gray-900">{formatDateShort(selectedRecord.visitDate)}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Status:</span>
                                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${selectedRecord.status === 'active' ? 'bg-green-100 text-green-800' :
                                                        selectedRecord.status === 'archived' ? 'bg-gray-100 text-gray-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {selectedRecord.status?.toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={() => setShowDetailModal(false)}
                                        className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                                    >
                                        Close
                                    </button>
                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={handlePrint}
                                            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <Printer className="w-4 h-4" />
                                            <span>Print</span>
                                        </button>
                                        <button
                                            onClick={() => handleShare(selectedRecord)}
                                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <Share2 className="w-4 h-4" />
                                            <span>Share Record</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MedicalRecordsPage;