"use client";

import React, { useState, useEffect } from 'react';
import { FileText, Download, Filter, Search, Stethoscope, Pill, Activity, Heart, Thermometer, Eye, Calendar, User, X, Building2, Phone, Mail } from 'lucide-react';
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
    const [activeFilter, setActiveFilter] = useState<'all' | 'consultation' | 'prescription' | 'lab-report' | 'diagnosis'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

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

            console.log('========== DEBUGGING DOCTOR INFO ==========');
            console.log('Raw API Response:', response.data);
            console.log('Records data:', data);
            console.log('Number of records:', data.length);

            if (data.length > 0) {
                console.log('First record:', data[0]);
                console.log('First record doctorId:', data[0].doctorId);
                console.log('Type of doctorId:', typeof data[0].doctorId);
                console.log('Is doctorId an object?', data[0].doctorId && typeof data[0].doctorId === 'object');

                if (data[0].doctorId && typeof data[0].doctorId === 'object') {
                    console.log('Doctor object keys:', Object.keys(data[0].doctorId));
                    console.log('Doctor firstName:', data[0].doctorId.firstName);
                    console.log('Doctor lastName:', data[0].doctorId.lastName);
                    console.log('Doctor specialization:', data[0].doctorId.specialization);
                    console.log('Doctor _id:', data[0].doctorId._id);
                }
            }

            // Transform the records to match our interface
            const transformedRecords = data.map((record: any) => {
                console.log('Processing record ID:', record._id);
                console.log('Record doctorId value:', record.doctorId);
                console.log('Record doctorId type:', typeof record.doctorId);

                let doctor = null;

                // Check if doctorId is populated (it's an object, not just a string ID)
                if (record.doctorId && typeof record.doctorId === 'object') {
                    const doctorData = record.doctorId;
                    console.log('Doctor data found:', doctorData);

                    const firstName = doctorData.firstName || '';
                    const lastName = doctorData.lastName || '';
                    const fullName = `${firstName} ${lastName}`.trim();

                    console.log('Constructed doctor name:', fullName);

                    doctor = {
                        _id: doctorData._id || doctorData.id || 'unknown',
                        name: fullName || 'Doctor',
                        email: doctorData.email,
                        phone: doctorData.phone || doctorData.phoneNumber,
                        specialization: doctorData.specialization || doctorData.specialty,
                        hospital: doctorData.hospital || doctorData.hospitalName,
                        profilePicture: doctorData.profilePicture || doctorData.avatar
                    };

                    console.log('Created doctor object:', doctor);
                } else if (record.doctorId && typeof record.doctorId === 'string') {
                    console.log('DoctorId is a string (not populated):', record.doctorId);
                } else {
                    console.log('DoctorId is null or undefined');
                }

                const finalDoctor = doctor || {
                    _id: 'unknown',
                    name: 'Doctor Information Unavailable',
                    email: undefined,
                    phone: undefined,
                    specialization: undefined,
                    hospital: undefined
                };

                console.log('Final doctor for record:', finalDoctor);

                return {
                    ...record,
                    doctor: finalDoctor
                };
            });

            console.log('========== FINAL TRANSFORMED RECORDS ==========');
            console.log('Transformed records:', transformedRecords);
            console.log('==============================================');

            setRecords(transformedRecords);
        } catch (error) {
            console.error('Error fetching medical records:', error);
            // Mock data for demonstration
            setRecords([
                {
                    _id: '1',
                    type: 'prescription',
                    title: 'Antibiotics Prescription',
                    date: '2024-01-15',
                    description: 'For bacterial infection treatment',
                    prescription: 'Amoxicillin 500mg - Take 3 times daily for 7 days',
                    tags: ['Antibiotics', 'Infection', '7 days'],
                    status: 'active',
                    vitalSigns: {
                        temperature: 98.6,
                        bloodPressure: '120/80'
                    },
                    doctor: {
                        _id: 'doc1',
                        name: 'Dr. Smith Johnson',
                        email: 'smith.johnson@hospital.com',
                        phone: '+1 234-567-8900',
                        specialization: 'General Medicine',
                        hospital: 'City General Hospital'
                    }
                },
                {
                    _id: '2',
                    type: 'lab-report',
                    title: 'Blood Test Results',
                    date: '2024-01-10',
                    description: 'Complete blood count and lipid profile',
                    tags: ['Blood Test', 'CBC', 'Lipid Profile'],
                    status: 'active',
                    attachments: [
                        {
                            fileName: 'blood-test-results.pdf',
                            fileUrl: '#',
                            fileType: 'application/pdf'
                        }
                    ],
                    doctor: {
                        _id: 'doc2',
                        name: 'Dr. Emma Wilson',
                        email: 'emma.wilson@hospital.com',
                        specialization: 'Pathology',
                        hospital: 'City General Hospital'
                    }
                },
                {
                    _id: '3',
                    type: 'consultation',
                    title: 'Annual Checkup',
                    date: '2024-01-05',
                    description: 'Routine annual physical examination',
                    diagnosis: 'Overall good health',
                    treatment: 'Continue current lifestyle',
                    notes: 'Patient advised to maintain regular exercise and balanced diet',
                    tags: ['Checkup', 'Physical', 'Routine'],
                    status: 'active',
                    vitalSigns: {
                        bloodPressure: '118/76',
                        heartRate: 72,
                        temperature: 98.2,
                        weight: 68
                    },
                    doctor: {
                        _id: 'doc3',
                        name: 'Dr. Michael Chen',
                        email: 'michael.chen@hospital.com',
                        phone: '+1 234-567-8901',
                        specialization: 'Family Medicine',
                        hospital: 'City General Hospital'
                    }
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
                record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (record.doctor?.name && record.doctor.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                record.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        setFilteredRecords(filtered);
    };

    const getRecordIcon = (type: string) => {
        switch (type) {
            case 'prescription': return <Pill className="w-5 h-5" />;
            case 'lab-report': return <Activity className="w-5 h-5" />;
            case 'diagnosis': return <Stethoscope className="w-5 h-5" />;
            case 'consultation': return <Heart className="w-5 h-5" />;
            case 'vaccination': return <Heart className="w-5 h-5" />;
            default: return <FileText className="w-5 h-5" />;
        }
    };

    const getRecordColor = (type: string) => {
        switch (type) {
            case 'prescription': return 'bg-blue-100 text-blue-600';
            case 'lab-report': return 'bg-green-100 text-green-600';
            case 'diagnosis': return 'bg-purple-100 text-purple-600';
            case 'consultation': return 'bg-orange-100 text-orange-600';
            case 'vaccination': return 'bg-red-100 text-red-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleView = (record: MedicalRecord) => {
        setSelectedRecord(record);
        setShowDetailModal(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-gray-50">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="mt-6 text-gray-600 font-medium">Loading medical records...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 min-h-screen bg-gradient-to-br from-blue-50 to-gray-50">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Medical Records</h1>
                            <p className="text-gray-500 mt-2">View your medical history and health documents</p>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex flex-col md:flex-row gap-4 mb-8">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search records by title, doctor, or tags..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Filter className="w-5 h-5 text-gray-500" />
                            <div className="flex flex-wrap gap-2">
                                {(['all', 'consultation', 'prescription', 'lab-report', 'diagnosis'] as const).map((filter) => (
                                    <button
                                        key={filter}
                                        onClick={() => setActiveFilter(filter)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeFilter === filter
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        {filter === 'all' ? 'All Records' : filter.charAt(0).toUpperCase() + filter.slice(1).replace('-', ' ')}
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
                                className="bg-white rounded-2xl shadow-lg shadow-blue-500/5 border border-gray-200/50 overflow-hidden hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300"
                            >
                                <div className="p-6">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getRecordColor(record.type).split(' ')[0]}`}>
                                                {getRecordIcon(record.type)}
                                            </div>
                                            <div>
                                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getRecordColor(record.type)}`}>
                                                    {record.type}
                                                </span>
                                            </div>
                                        </div>
                                        {record.attachments && record.attachments.length > 0 && (
                                            <button
                                                onClick={() => window.open(record.attachments![0].fileUrl, '_blank')}
                                                className="p-1 hover:bg-gray-50 rounded-lg transition-colors"
                                            >
                                                <Download className="w-4 h-4 text-gray-600" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="mb-6">
                                        <h4 className="text-lg font-semibold text-gray-900 mb-2">{record.title}</h4>
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{record.description}</p>

                                        <div className="space-y-2 text-sm text-gray-500 mb-4">
                                            {record.doctor && (
                                                <div className="flex items-center">
                                                    <User className="w-4 h-4 mr-2 flex-shrink-0" />
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-gray-700">{record.doctor.name}</span>
                                                        {record.doctor.specialization && (
                                                            <span className="text-xs text-gray-500">{record.doctor.specialization}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex items-center">
                                                <Calendar className="w-4 h-4 mr-2" />
                                                <span>{formatDate(record.date)}</span>
                                            </div>
                                        </div>

                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-2">
                                            {record.tags.slice(0, 2).map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                            {record.tags.length > 2 && (
                                                <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                                                    +{record.tags.length - 2} more
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <button
                                            onClick={() => handleView(record)}
                                            className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                                        >
                                            <Eye className="w-4 h-4" />
                                            <span>View Details</span>
                                        </button>
                                        {record.attachments && record.attachments.length > 0 && (
                                            <span className="text-xs text-gray-500">
                                                {record.attachments.length} file{record.attachments.length > 1 ? 's' : ''}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-3 text-center py-16">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <FileText className="w-12 h-12 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No records found</h3>
                            <p className="text-gray-500 max-w-md mx-auto">
                                {searchTerm
                                    ? 'No records match your search criteria'
                                    : 'You don\'t have any medical records yet. Your doctor will add records after appointments.'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Health Summary */}
                {records.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-lg shadow-blue-500/5 border border-gray-200/50 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Health Summary</h2>
                                <p className="text-gray-500">Latest vital signs from your records</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {records.some(r => r.vitalSigns?.heartRate) && (
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                                            <Heart className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-blue-800">Heart Rate</p>
                                            <p className="text-xl font-bold text-blue-900">
                                                {records.find(r => r.vitalSigns?.heartRate)?.vitalSigns?.heartRate} BPM
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {records.some(r => r.vitalSigns?.bloodPressure) && (
                                <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                                            <Thermometer className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-green-800">Blood Pressure</p>
                                            <p className="text-xl font-bold text-green-900">
                                                {records.find(r => r.vitalSigns?.bloodPressure)?.vitalSigns?.bloodPressure}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {records.some(r => r.vitalSigns?.temperature) && (
                                <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                                            <Activity className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-purple-800">Temperature</p>
                                            <p className="text-xl font-bold text-purple-900">
                                                {records.find(r => r.vitalSigns?.temperature)?.vitalSigns?.temperature}°F
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {records.some(r => r.vitalSigns?.weight) && (
                                <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-xl p-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                                            <Stethoscope className="w-5 h-5 text-red-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-red-800">Weight</p>
                                            <p className="text-xl font-bold text-red-900">
                                                {records.find(r => r.vitalSigns?.weight)?.vitalSigns?.weight} kg
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedRecord && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
                            <h2 className="text-2xl font-bold text-gray-900">{selectedRecord.title}</h2>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <span className={`text-xs font-medium px-3 py-1 rounded-full ${getRecordColor(selectedRecord.type)}`}>
                                    {selectedRecord.type}
                                </span>
                            </div>

                            {/* Doctor Information */}
                            {selectedRecord.doctor && (
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100/30 rounded-xl p-4">
                                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                                        <User className="w-5 h-5 mr-2" />
                                        Doctor Information
                                    </h3>
                                    <div className="space-y-2">
                                        <div className="flex items-start">
                                            <span className="text-sm text-gray-600 w-32">Name:</span>
                                            <span className="text-sm font-medium text-gray-900">{selectedRecord.doctor.name}</span>
                                        </div>
                                        {selectedRecord.doctor.specialization && (
                                            <div className="flex items-start">
                                                <span className="text-sm text-gray-600 w-32">Specialization:</span>
                                                <span className="text-sm text-gray-900">{selectedRecord.doctor.specialization}</span>
                                            </div>
                                        )}
                                        {selectedRecord.doctor.hospital && (
                                            <div className="flex items-start">
                                                <Building2 className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                                                <span className="text-sm text-gray-900">{selectedRecord.doctor.hospital}</span>
                                            </div>
                                        )}
                                        {selectedRecord.doctor.email && (
                                            <div className="flex items-start">
                                                <Mail className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                                                <span className="text-sm text-gray-900">{selectedRecord.doctor.email}</span>
                                            </div>
                                        )}
                                        {selectedRecord.doctor.phone && (
                                            <div className="flex items-start">
                                                <Phone className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                                                <span className="text-sm text-gray-900">{selectedRecord.doctor.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {selectedRecord.description && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                                    <p className="text-gray-600">{selectedRecord.description}</p>
                                </div>
                            )}

                            {selectedRecord.diagnosis && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Diagnosis</h3>
                                    <p className="text-gray-600">{selectedRecord.diagnosis}</p>
                                </div>
                            )}

                            {selectedRecord.treatment && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Treatment</h3>
                                    <p className="text-gray-600">{selectedRecord.treatment}</p>
                                </div>
                            )}

                            {selectedRecord.prescription && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Prescription</h3>
                                    <p className="text-gray-600 whitespace-pre-line">{selectedRecord.prescription}</p>
                                </div>
                            )}

                            {selectedRecord.notes && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
                                    <p className="text-gray-600">{selectedRecord.notes}</p>
                                </div>
                            )}

                            {selectedRecord.vitalSigns && Object.keys(selectedRecord.vitalSigns).some(key => selectedRecord.vitalSigns![key as keyof VitalSigns]) && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-3">Vital Signs</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {selectedRecord.vitalSigns.bloodPressure && (
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <p className="text-sm text-gray-500">Blood Pressure</p>
                                                <p className="font-semibold">{selectedRecord.vitalSigns.bloodPressure}</p>
                                            </div>
                                        )}
                                        {selectedRecord.vitalSigns.heartRate && (
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <p className="text-sm text-gray-500">Heart Rate</p>
                                                <p className="font-semibold">{selectedRecord.vitalSigns.heartRate} BPM</p>
                                            </div>
                                        )}
                                        {selectedRecord.vitalSigns.temperature && (
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <p className="text-sm text-gray-500">Temperature</p>
                                                <p className="font-semibold">{selectedRecord.vitalSigns.temperature}°F</p>
                                            </div>
                                        )}
                                        {selectedRecord.vitalSigns.weight && (
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <p className="text-sm text-gray-500">Weight</p>
                                                <p className="font-semibold">{selectedRecord.vitalSigns.weight} kg</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {selectedRecord.attachments && selectedRecord.attachments.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-3">Attachments</h3>
                                    <div className="space-y-2">
                                        {selectedRecord.attachments.map((attachment, index) => (
                                            <a
                                                key={index}
                                                href={attachment.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <FileText className="w-5 h-5 text-gray-600" />
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-900 block">{attachment.fileName}</span>
                                                        <span className="text-xs text-gray-500">{attachment.fileType}</span>
                                                    </div>
                                                </div>
                                                <Download className="w-4 h-4 text-gray-600" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedRecord.tags && selectedRecord.tags.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-3">Tags</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedRecord.tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 border-t border-gray-200">
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <div className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        <span>Record Date: {formatDate(selectedRecord.date)}</span>
                                    </div>
                                    {selectedRecord.visitDate && (
                                        <div className="flex items-center">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            <span>Visit Date: {formatDate(selectedRecord.visitDate)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MedicalRecordsPage;