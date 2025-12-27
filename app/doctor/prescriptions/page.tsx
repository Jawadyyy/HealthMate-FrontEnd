"use client";

import React, { useState, useEffect } from 'react';
import { Pill, Plus, Search, Filter, User, Calendar, AlertCircle, CheckCircle, XCircle, Eye, Download, Printer } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api/api';

interface Prescription {
    _id: string;
    patientId: any;
    doctorId: any;
    date: string;
    diagnosis: string;
    medications: {
        name: string;
        dosage: string;
        frequency: string;
        duration: string;
        instructions?: string;
    }[];
    notes?: string;
    status: 'active' | 'completed' | 'cancelled' | 'expired';
    refills: number;
    refillsRemaining: number;
}

const DoctorPrescriptionsPage = () => {
    const router = useRouter();
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [filteredPrescriptions, setFilteredPrescriptions] = useState<Prescription[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPrescriptions();
    }, []);

    useEffect(() => {
        filterPrescriptions();
    }, [activeFilter, searchTerm, prescriptions]);

    const fetchPrescriptions = async () => {
        try {
            setLoading(true);
            const response = await api.get('/prescriptions/doctor/my');
            const data = response.data.data || response.data || [];
            setPrescriptions(data);
        } catch (error) {
            console.error('Error fetching prescriptions:', error);
            // Mock data for demonstration
            const mockPrescriptions: Prescription[] = [
                {
                    _id: '1',
                    patientId: { name: 'John Doe' },
                    doctorId: { name: 'Dr. Smith' },
                    date: '2024-01-15',
                    diagnosis: 'Upper Respiratory Infection',
                    medications: [
                        { name: 'Amoxicillin', dosage: '500mg', frequency: '3 times daily', duration: '7 days', instructions: 'Take with food' },
                        { name: 'Acetaminophen', dosage: '500mg', frequency: 'As needed', duration: '5 days', instructions: 'For fever and pain' }
                    ],
                    status: 'active',
                    refills: 2,
                    refillsRemaining: 2
                },
                {
                    _id: '2',
                    patientId: { name: 'Jane Smith' },
                    doctorId: { name: 'Dr. Smith' },
                    date: '2024-01-14',
                    diagnosis: 'Hypertension',
                    medications: [
                        { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', duration: '30 days', instructions: 'Take in the morning' }
                    ],
                    status: 'active',
                    refills: 3,
                    refillsRemaining: 1
                },
                {
                    _id: '3',
                    patientId: { name: 'Robert Johnson' },
                    doctorId: { name: 'Dr. Smith' },
                    date: '2024-01-10',
                    diagnosis: 'Type 2 Diabetes',
                    medications: [
                        { name: 'Metformin', dosage: '850mg', frequency: 'Twice daily', duration: '30 days', instructions: 'Take with meals' }
                    ],
                    status: 'completed',
                    refills: 1,
                    refillsRemaining: 0
                },
            ];
            setPrescriptions(mockPrescriptions);
        } finally {
            setLoading(false);
        }
    };

    const filterPrescriptions = () => {
        let filtered = [...prescriptions];

        if (activeFilter !== 'all') {
            filtered = filtered.filter(p => p.status === activeFilter);
        }

        if (searchTerm) {
            filtered = filtered.filter(p =>
                p.patientId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.medications.some(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        setFilteredPrescriptions(filtered);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-emerald-100 text-emerald-700';
            case 'completed': return 'bg-blue-100 text-blue-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            case 'expired': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <CheckCircle className="w-4 h-4" />;
            case 'completed': return <CheckCircle className="w-4 h-4" />;
            case 'cancelled': return <XCircle className="w-4 h-4" />;
            default: return <AlertCircle className="w-4 h-4" />;
        }
    };

    const handlePrintPrescription = (prescription: Prescription) => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Prescription - ${prescription._id}</title>
                        <style>
                            body { font-family: Arial, sans-serif; padding: 20px; }
                            .header { text-align: center; margin-bottom: 30px; }
                            .section { margin-bottom: 20px; }
                            .section-title { font-weight: bold; border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 10px; }
                            .medication { margin-bottom: 15px; }
                            .signature { margin-top: 50px; border-top: 1px solid #000; padding-top: 20px; }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <h1>PRESCRIPTION</h1>
                            <p>ID: ${prescription._id}</p>
                            <p>Date: ${formatDate(prescription.date)}</p>
                        </div>
                        
                        <div class="section">
                            <div class="section-title">Patient Information</div>
                            <p><strong>Name:</strong> ${prescription.patientId?.name || 'N/A'}</p>
                        </div>
                        
                        <div class="section">
                            <div class="section-title">Diagnosis</div>
                            <p>${prescription.diagnosis}</p>
                        </div>
                        
                        <div class="section">
                            <div class="section-title">Medications</div>
                            ${prescription.medications.map(med => `
                                <div class="medication">
                                    <p><strong>${med.name}</strong> - ${med.dosage}</p>
                                    <p>Frequency: ${med.frequency}</p>
                                    <p>Duration: ${med.duration}</p>
                                    ${med.instructions ? `<p>Instructions: ${med.instructions}</p>` : ''}
                                </div>
                            `).join('')}
                        </div>
                        
                        ${prescription.notes ? `
                        <div class="section">
                            <div class="section-title">Additional Notes</div>
                            <p>${prescription.notes}</p>
                        </div>
                        ` : ''}
                        
                        <div class="signature">
                            <p><strong>Prescribing Physician:</strong> ${prescription.doctorId?.name || 'Doctor'}</p>
                            <p><strong>License Number:</strong> [LICENSE NUMBER]</p>
                            <br><br>
                            <p>Signature: _________________________</p>
                        </div>
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    };

    const handleCancelPrescription = async (id: string) => {
        if (!confirm('Are you sure you want to cancel this prescription?')) {
            return;
        }

        try {
            await api.patch(`/prescriptions/cancel/${id}`);
            alert('Prescription cancelled successfully');
            fetchPrescriptions();
        } catch (error) {
            console.error('Error cancelling prescription:', error);
            alert('Failed to cancel prescription');
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
                    <p className="mt-6 text-gray-600 font-medium">Loading prescriptions...</p>
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
                            <h1 className="text-3xl font-bold text-gray-900">Prescriptions</h1>
                            <p className="text-gray-500 mt-2">Manage and issue patient prescriptions</p>
                        </div>
                        <button
                            onClick={() => router.push('/doctor/prescriptions/create')}
                            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all duration-200 shadow-lg shadow-emerald-500/30 cursor-pointer"
                        >
                            <Plus className="w-5 h-5" />
                            <span className="font-medium">New Prescription</span>
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-2xl p-6 border border-gray-200/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Total Prescriptions</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-2">{prescriptions.length}</p>
                                </div>
                                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                    <Pill className="w-6 h-6 text-emerald-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-gray-200/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Active</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-2">
                                        {prescriptions.filter(p => p.status === 'active').length}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-gray-200/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Completed</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-2">
                                        {prescriptions.filter(p => p.status === 'completed').length}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <CheckCircle className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-gray-200/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Cancelled</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-2">
                                        {prescriptions.filter(p => p.status === 'cancelled').length}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                                    <XCircle className="w-6 h-6 text-red-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex flex-col md:flex-row gap-4 mb-8">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by patient name, diagnosis, or medication..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Filter className="w-5 h-5 text-gray-500" />
                            <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-xl p-1">
                                {(['all', 'active', 'completed', 'cancelled'] as const).map((filter) => (
                                    <button
                                        key={filter}
                                        onClick={() => setActiveFilter(filter)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeFilter === filter
                                            ? 'bg-emerald-600 text-white'
                                            : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Prescriptions Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {filteredPrescriptions.length > 0 ? (
                        filteredPrescriptions.map((prescription) => (
                            <div
                                key={prescription._id}
                                className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 overflow-hidden hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300"
                            >
                                <div className="p-6">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                                                <Pill className="w-5 h-5 text-red-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">Prescription #{prescription._id.slice(-6)}</h3>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(prescription.status)}`}>
                                                        {getStatusIcon(prescription.status)}
                                                        <span>{prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}</span>
                                                    </span>
                                                    {prescription.refillsRemaining > 0 && (
                                                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                                                            {prescription.refillsRemaining} refill(s) left
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Patient Info */}
                                    <div className="mb-4">
                                        <div className="flex items-center space-x-2 text-gray-600 mb-2">
                                            <User className="w-4 h-4" />
                                            <span className="font-medium">{prescription.patientId?.name || 'Patient'}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-gray-600 mb-3">
                                            <Calendar className="w-4 h-4" />
                                            <span>{formatDate(prescription.date)}</span>
                                        </div>
                                    </div>

                                    {/* Diagnosis */}
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-500 mb-1">Diagnosis</p>
                                        <p className="font-medium text-gray-900">{prescription.diagnosis}</p>
                                    </div>

                                    {/* Medications */}
                                    <div className="mb-6">
                                        <p className="text-sm text-gray-500 mb-2">Medications ({prescription.medications.length})</p>
                                        <div className="space-y-2">
                                            {prescription.medications.slice(0, 2).map((med, index) => (
                                                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="font-medium text-gray-900">{med.name}</span>
                                                        <span className="text-sm text-gray-600">{med.dosage}</span>
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {med.frequency} for {med.duration}
                                                    </div>
                                                </div>
                                            ))}
                                            {prescription.medications.length > 2 && (
                                                <div className="text-center">
                                                    <span className="text-sm text-gray-500">
                                                        +{prescription.medications.length - 2} more medications
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    {prescription.notes && (
                                        <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                            <p className="text-xs text-amber-800 font-medium mb-1">Notes</p>
                                            <p className="text-sm text-amber-800">{prescription.notes}</p>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={() => handlePrintPrescription(prescription)}
                                            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                        >
                                            <Printer className="w-4 h-4" />
                                            <span className="text-sm font-medium">Print</span>
                                        </button>
                                        <button
                                            onClick={() => router.push(`/doctor/prescriptions/${prescription._id}`)}
                                            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
                                        >
                                            <Eye className="w-4 h-4" />
                                            <span className="text-sm font-medium">View Details</span>
                                        </button>
                                        {prescription.status === 'active' && (
                                            <button
                                                onClick={() => handleCancelPrescription(prescription._id)}
                                                className="px-4 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors cursor-pointer"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-2 text-center py-16">
                            <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Pill className="w-12 h-12 text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No prescriptions found</h3>
                            <p className="text-gray-500 max-w-md mx-auto mb-8">
                                {searchTerm
                                    ? 'No prescriptions match your search criteria'
                                    : 'You have not written any prescriptions yet'}
                            </p>
                            <button
                                onClick={() => router.push('/doctor/prescriptions/create')}
                                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-medium hover:from-emerald-700 hover:to-green-700 transition-all duration-200 shadow-lg shadow-emerald-500/30 cursor-pointer"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Create Your First Prescription</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DoctorPrescriptionsPage;