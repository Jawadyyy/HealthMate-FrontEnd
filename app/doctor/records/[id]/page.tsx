"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, FileText, User, Calendar, Stethoscope, Activity, Heart, Thermometer, Download, Edit, Printer, AlertCircle, Pill } from 'lucide-react';
import api from '@/lib/api/api';

interface VitalSigns {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    weight?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
}

interface Medication {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
}

interface MedicalRecord {
    _id: string;
    patientId: any;
    doctorId: any;
    type: 'consultation' | 'diagnosis' | 'lab-report' | 'other';
    title: string;
    description?: string;
    diagnosis?: string;
    treatment?: string;
    vitalSigns?: VitalSigns;
    medications?: Medication[];
    notes?: string;
    date: string;
    tags: string[];
    attachments?: {
        fileName: string;
        fileUrl: string;
        fileType: string;
    }[];
    createdAt: string;
    updatedAt: string;
}

const MedicalRecordDetailsPage = () => {
    const params = useParams();
    const router = useRouter();
    const [record, setRecord] = useState<MedicalRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [patientDetails, setPatientDetails] = useState<any>(null);

    useEffect(() => {
        fetchRecordDetails();
    }, [params.id]);

    const fetchRecordDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/medical-records/${params.id}`);
            const data = response.data;
            setRecord(data);

            // Fetch patient details
            if (data.patientId) {
                try {
                    const patientResponse = await api.get(`/patients/${data.patientId._id || data.patientId}`);
                    setPatientDetails(patientResponse.data);
                } catch (error) {
                    console.error('Error fetching patient details:', error);
                }
            }
        } catch (error) {
            console.error('Error fetching medical record:', error);
            alert('Failed to load medical record details');
            router.push('/doctor/records');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getRecordTypeLabel = (type: string) => {
        const labels = {
            'consultation': 'Consultation',
            'diagnosis': 'Diagnosis',
            'lab-report': 'Lab Report',
            'other': 'Other'
        };
        return labels[type as keyof typeof labels] || type;
    };

    const getRecordTypeColor = (type: string) => {
        switch (type) {
            case 'consultation': return 'bg-emerald-100 text-emerald-700';
            case 'diagnosis': return 'bg-blue-100 text-blue-700';
            case 'lab-report': return 'bg-purple-100 text-purple-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleEdit = () => {
        if (record) {
            router.push(`/doctor/records/edit/${record._id}`);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-emerald-100 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-emerald-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="mt-6 text-gray-600 font-medium">Loading medical record...</p>
                </div>
            </div>
        );
    }

    if (!record) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
                <div className="text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <FileText className="w-10 h-10 text-red-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Record Not Found</h3>
                    <p className="text-gray-600 mb-8">The medical record you're looking for doesn't exist.</p>
                    <button
                        onClick={() => router.push('/doctor/records')}
                        className="inline-flex items-center space-x-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Records</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
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
                                <h1 className="text-2xl font-bold text-gray-900">Medical Record</h1>
                                <p className="text-sm text-gray-500 mt-1">ID: REC-{record._id.slice(-8).toUpperCase()}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <span className={`inline-flex items-center px-4 py-2.5 rounded-xl font-medium ${getRecordTypeColor(record.type)}`}>
                                {getRecordTypeLabel(record.type)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Record Details */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Patient Information */}
                        <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                                    <User className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Patient Information</h2>
                                    <p className="text-sm text-gray-500">Medical record for patient</p>
                                </div>
                            </div>

                            {patientDetails ? (
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                                            <User className="w-8 h-8 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                                                {patientDetails.userId?.name || 'Patient'}
                                            </h3>
                                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                {patientDetails.age && (
                                                    <span>{patientDetails.age} years</span>
                                                )}
                                                {patientDetails.gender && (
                                                    <span>• {patientDetails.gender}</span>
                                                )}
                                                {patientDetails.bloodGroup && (
                                                    <span>• Blood Group: {patientDetails.bloodGroup}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">Patient information not available</p>
                                </div>
                            )}
                        </div>

                        {/* Record Details */}
                        <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Record Details</h2>
                                    <p className="text-sm text-gray-500">Complete medical record information</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                {/* Title & Date */}
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{record.title}</h3>
                                    <div className="flex items-center space-x-2 text-gray-600">
                                        <Calendar className="w-4 h-4" />
                                        <span>{formatDate(record.date)}</span>
                                    </div>
                                </div>

                                {/* Description */}
                                {record.description && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                                        <div className="p-4 bg-gray-50 rounded-xl">
                                            <p className="text-gray-700">{record.description}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Diagnosis */}
                                {record.diagnosis && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Diagnosis</h4>
                                        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                                            <p className="text-gray-700">{record.diagnosis}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Treatment */}
                                {record.treatment && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Treatment Plan</h4>
                                        <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl">
                                            <p className="text-gray-700">{record.treatment}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Vital Signs */}
                                {record.vitalSigns && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-4">Vital Signs</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {record.vitalSigns.bloodPressure && (
                                                <div className="p-4 bg-gray-50 rounded-xl">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <Heart className="w-4 h-4 text-gray-600" />
                                                        <span className="text-sm text-gray-500">Blood Pressure</span>
                                                    </div>
                                                    <p className="text-lg font-bold text-gray-900">{record.vitalSigns.bloodPressure}</p>
                                                </div>
                                            )}

                                            {record.vitalSigns.heartRate && (
                                                <div className="p-4 bg-gray-50 rounded-xl">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <Activity className="w-4 h-4 text-gray-600" />
                                                        <span className="text-sm text-gray-500">Heart Rate</span>
                                                    </div>
                                                    <p className="text-lg font-bold text-gray-900">{record.vitalSigns.heartRate} BPM</p>
                                                </div>
                                            )}

                                            {record.vitalSigns.temperature && (
                                                <div className="p-4 bg-gray-50 rounded-xl">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <Thermometer className="w-4 h-4 text-gray-600" />
                                                        <span className="text-sm text-gray-500">Temperature</span>
                                                    </div>
                                                    <p className="text-lg font-bold text-gray-900">{record.vitalSigns.temperature}°F</p>
                                                </div>
                                            )}

                                            {record.vitalSigns.weight && (
                                                <div className="p-4 bg-gray-50 rounded-xl">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <Stethoscope className="w-4 h-4 text-gray-600" />
                                                        <span className="text-sm text-gray-500">Weight</span>
                                                    </div>
                                                    <p className="text-lg font-bold text-gray-900">{record.vitalSigns.weight} kg</p>
                                                </div>
                                            )}

                                            {record.vitalSigns.respiratoryRate && (
                                                <div className="p-4 bg-gray-50 rounded-xl">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <Activity className="w-4 h-4 text-gray-600" />
                                                        <span className="text-sm text-gray-500">Respiratory Rate</span>
                                                    </div>
                                                    <p className="text-lg font-bold text-gray-900">{record.vitalSigns.respiratoryRate}</p>
                                                </div>
                                            )}

                                            {record.vitalSigns.oxygenSaturation && (
                                                <div className="p-4 bg-gray-50 rounded-xl">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <AlertCircle className="w-4 h-4 text-gray-600" />
                                                        <span className="text-sm text-gray-500">O₂ Saturation</span>
                                                    </div>
                                                    <p className="text-lg font-bold text-gray-900">{record.vitalSigns.oxygenSaturation}%</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Medications */}
                                {record.medications && record.medications.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-4">Prescribed Medications</h4>
                                        <div className="space-y-4">
                                            {record.medications.map((medication, index) => (
                                                <div key={index} className="p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-100">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                                                <Pill className="w-4 h-4 text-red-600" />
                                                            </div>
                                                            <h5 className="font-bold text-gray-900">{medication.name}</h5>
                                                        </div>
                                                        <span className="text-sm font-medium text-red-700">{medication.dosage}</span>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
                                                        <div>
                                                            <span className="text-gray-500">Frequency:</span>
                                                            <span className="font-medium ml-2">{medication.frequency}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">Duration:</span>
                                                            <span className="font-medium ml-2">{medication.duration}</span>
                                                        </div>
                                                        {medication.instructions && (
                                                            <div className="md:col-span-2">
                                                                <span className="text-gray-500">Instructions:</span>
                                                                <span className="font-medium ml-2">{medication.instructions}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Notes */}
                                {record.notes && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Additional Notes</h4>
                                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                            <p className="text-gray-700">{record.notes}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Tags */}
                                {record.tags.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {record.tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Actions & Info */}
                    <div className="space-y-8">
                        {/* Actions */}
                        <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Actions</h2>
                            
                            <div className="space-y-3">
                                <button
                                    onClick={handlePrint}
                                    className="w-full flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all cursor-pointer"
                                >
                                    <Printer className="w-5 h-5" />
                                    <span className="font-medium">Print Record</span>
                                </button>
                                
                                <button
                                    onClick={handleEdit}
                                    className="w-full flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all cursor-pointer"
                                >
                                    <Edit className="w-5 h-5" />
                                    <span className="font-medium">Edit Record</span>
                                </button>
                                
                                {record.attachments && record.attachments.length > 0 && (
                                    <a
                                        href={record.attachments[0].fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl hover:from-purple-700 hover:to-violet-700 transition-all cursor-pointer"
                                    >
                                        <Download className="w-5 h-5" />
                                        <span className="font-medium">Download Attachment</span>
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Record Information */}
                        <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Record Information</h2>
                            
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Record ID</span>
                                    <span className="text-sm font-medium text-gray-900">REC-{record._id.slice(-8)}</span>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Type</span>
                                    <span className="text-sm font-medium text-gray-900">{getRecordTypeLabel(record.type)}</span>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Date</span>
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm font-medium text-gray-900">{formatDate(record.date)}</span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Created</span>
                                    <span className="text-sm text-gray-900">
                                        {new Date(record.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                
                                {record.updatedAt !== record.createdAt && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Last Updated</span>
                                        <span className="text-sm text-gray-900">
                                            {new Date(record.updatedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Attachments */}
                        {record.attachments && record.attachments.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-6">Attachments</h2>
                                
                                <div className="space-y-3">
                                    {record.attachments.map((attachment, index) => (
                                        <a
                                            key={index}
                                            href={attachment.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <FileText className="w-4 h-4 text-gray-600" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                                        {attachment.fileName}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{attachment.fileType}</p>
                                                </div>
                                            </div>
                                            <Download className="w-4 h-4 text-gray-400 group-hover:text-emerald-600" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Timeline */}
                        <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Timeline</h2>
                            
                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <FileText className="w-4 h-4 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Record Created</p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {new Date(record.createdAt).toLocaleString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                
                                {record.updatedAt !== record.createdAt && (
                                    <div className="flex items-start space-x-3">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Edit className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">Last Updated</p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {new Date(record.updatedAt).toLocaleString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MedicalRecordDetailsPage;