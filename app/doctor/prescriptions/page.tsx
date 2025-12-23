"use client";

import React, { useState, useEffect } from 'react';
import { Pill, Search, Filter, Plus, User, Calendar, Clock, Download, Eye, Edit, Trash2, FileText, Printer, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';
import api from '@/lib/api/api';

interface Medication {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
}

interface Prescription {
    _id: string;
    patientId: string;
    patientName: string;
    date: string;
    medications: Medication[];
    diagnosis: string;
    notes?: string;
    status: 'active' | 'completed' | 'cancelled';
    refills: number;
    nextRefillDate?: string;
    doctorNotes?: string;
}

const DoctorPrescriptionsPage = () => {
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [filteredPrescriptions, setFilteredPrescriptions] = useState<Prescription[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed'>('active');
    const [searchTerm, setSearchTerm] = useState('');
    const [showNewPrescription, setShowNewPrescription] = useState(false);

    useEffect(() => {
        fetchPrescriptions();
    }, []);

    useEffect(() => {
        filterPrescriptions();
    }, [activeFilter, searchTerm, prescriptions]);

    const fetchPrescriptions = async () => {
        try {
            setLoading(true);
            const response = await api.get('/doctors/prescriptions');
            const data = response.data.data || response.data || [];
            setPrescriptions(data);
        } catch (error) {
            console.error('Error fetching prescriptions:', error);
            // Mock data
            setPrescriptions([
                {
                    _id: '1',
                    patientId: 'P001',
                    patientName: 'John Smith',
                    date: '2024-01-15',
                    medications: [
                        { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', duration: '30 days', instructions: 'Take in the morning' },
                        { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', duration: '30 days', instructions: 'With meals' }
                    ],
                    diagnosis: 'Type 2 Diabetes with Hypertension',
                    notes: 'Monitor blood pressure and blood sugar regularly',
                    status: 'active',
                    refills: 2,
                    nextRefillDate: '2024-02-15',
                    doctorNotes: 'Patient responding well to treatment'
                },
                {
                    _id: '2',
                    patientId: 'P002',
                    patientName: 'Sarah Johnson',
                    date: '2024-01-10',
                    medications: [
                        { name: 'Albuterol Inhaler', dosage: '90mcg', frequency: 'As needed', duration: '60 days', instructions: 'Use before exercise' }
                    ],
                    diagnosis: 'Asthma',
                    status: 'active',
                    refills: 1,
                    nextRefillDate: '2024-02-10'
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const filterPrescriptions = () => {
        let filtered = [...prescriptions];

        if (activeFilter !== 'all') {
            filtered = filtered.filter(prescription => prescription.status === activeFilter);
        }

        if (searchTerm) {
            filtered = filtered.filter(prescription =>
                prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                prescription.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
                prescription.medications.some(med => med.name.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        setFilteredPrescriptions(filtered);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-700';
            case 'completed': return 'bg-blue-100 text-blue-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <CheckCircle className="w-4 h-4" />;
            case 'completed': return <CheckCircle className="w-4 h-4" />;
            case 'cancelled': return <AlertCircle className="w-4 h-4" />;
            default: return <Pill className="w-4 h-4" />;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const handlePrintPrescription = (prescription: Prescription) => {
        // Implement print functionality
        console.log('Printing prescription:', prescription);
    };

    const handleDownloadPDF = (prescription: Prescription) => {
        // Implement PDF download
        console.log('Downloading prescription PDF:', prescription);
    };

    const handleEditPrescription = (prescription: Prescription) => {
        // Implement edit functionality
        console.log('Editing prescription:', prescription);
    };

    const handleDeletePrescription = (prescriptionId: string) => {
        if (window.confirm('Are you sure you want to delete this prescription?')) {
            // Implement delete functionality
            console.log('Deleting prescription:', prescriptionId);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-gray-50">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-green-100 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-green-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="mt-6 text-gray-600 font-medium">Loading prescriptions...</p>
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
                            <h1 className="text-3xl font-bold text-gray-900">Prescriptions</h1>
                            <p className="text-gray-500 mt-2">Manage patient prescriptions and medications</p>
                        </div>
                        <button
                            onClick={() => setShowNewPrescription(true)}
                            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg shadow-green-500/30 cursor-pointer"
                        >
                            <Plus className="w-5 h-5" />
                            <span className="font-medium">New Prescription</span>
                        </button>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex flex-col md:flex-row gap-4 mb-8">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by patient name, medication, or diagnosis..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all duration-200"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Filter className="w-5 h-5 text-gray-500" />
                            <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-xl p-1">
                                {(['all', 'active', 'completed'] as const).map((filter) => (
                                    <button
                                        key={filter}
                                        onClick={() => setActiveFilter(filter)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeFilter === filter
                                            ? 'bg-green-600 text-white'
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

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl p-6 border border-gray-200/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Active Prescriptions</p>
                                <p className="text-2xl font-bold text-gray-900 mt-2">
                                    {prescriptions.filter(p => p.status === 'active').length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <Pill className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-gray-200/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Medications</p>
                                <p className="text-2xl font-bold text-gray-900 mt-2">
                                    {prescriptions.reduce((total, p) => total + p.medications.length, 0)}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-gray-200/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Pending Refills</p>
                                <p className="text-2xl font-bold text-gray-900 mt-2">
                                    {prescriptions.filter(p => p.refills > 0 && p.status === 'active').length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-gray-200/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">This Month</p>
                                <p className="text-2xl font-bold text-gray-900 mt-2">
                                    {prescriptions.filter(p => {
                                        const prescriptionDate = new Date(p.date);
                                        const now = new Date();
                                        return prescriptionDate.getMonth() === now.getMonth() &&
                                               prescriptionDate.getFullYear() === now.getFullYear();
                                    }).length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Prescriptions List */}
                <div className="bg-white rounded-2xl shadow-lg shadow-green-500/5 border border-gray-200/50 overflow-hidden mb-8">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/80 border-b border-gray-200/50">
                                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Patient</th>
                                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Diagnosis</th>
                                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Medications</th>
                                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Date</th>
                                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Status</th>
                                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Refills</th>
                                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPrescriptions.length > 0 ? (
                                    filteredPrescriptions.map((prescription) => (
                                        <tr key={prescription._id} className="border-b border-gray-200/50 hover:bg-gray-50/50 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                                                        <User className="w-5 h-5 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{prescription.patientName}</div>
                                                        <div className="text-sm text-gray-500">ID: {prescription.patientId}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="text-gray-900 max-w-xs truncate">{prescription.diagnosis}</div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="space-y-1">
                                                    {prescription.medications.slice(0, 2).map((med, index) => (
                                                        <div key={index} className="text-sm text-gray-700">
                                                            {med.name} ({med.dosage})
                                                        </div>
                                                    ))}
                                                    {prescription.medications.length > 2 && (
                                                        <div className="text-sm text-gray-500">
                                                            +{prescription.medications.length - 2} more
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center space-x-2">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    <span className="text-gray-700">{formatDate(prescription.date)}</span>
                                                </div>
                                                {prescription.nextRefillDate && (
                                                    <div className="text-sm text-green-600 mt-1">
                                                        Refill: {formatDate(prescription.nextRefillDate)}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center">
                                                    <span className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(prescription.status)}`}>
                                                        {getStatusIcon(prescription.status)}
                                                        <span>{prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}</span>
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className={`font-bold ${prescription.refills > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                                                    {prescription.refills}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => handlePrintPrescription(prescription)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                                                        title="Print"
                                                    >
                                                        <Printer className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownloadPDF(prescription)}
                                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                                                        title="Download"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditPrescription(prescription)}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg cursor-pointer"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeletePrescription(prescription._id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="py-16 text-center">
                                            <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                                <Pill className="w-12 h-12 text-green-600" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">No prescriptions found</h3>
                                            <p className="text-gray-500 max-w-md mx-auto mb-8">
                                                {searchTerm
                                                    ? 'No prescriptions match your search criteria'
                                                    : 'No prescriptions available'}
                                            </p>
                                            <button
                                                onClick={() => setShowNewPrescription(true)}
                                                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-medium hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg shadow-green-500/30 cursor-pointer"
                                            >
                                                <Plus className="w-5 h-5" />
                                                <span>Create New Prescription</span>
                                            </button>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Common Medications */}
                <div className="bg-white rounded-2xl shadow-lg shadow-green-500/5 border border-gray-200/50 p-6 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Commonly Prescribed Medications</h2>
                            <p className="text-gray-500">Quick access to frequently used medications</p>
                        </div>
                        <button className="text-green-600 hover:text-green-700 font-medium cursor-pointer">
                            View All
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { name: 'Metformin', category: 'Diabetes', dosage: '500mg', usage: 'High' },
                            { name: 'Lisinopril', category: 'Hypertension', dosage: '10mg', usage: 'Medium' },
                            { name: 'Atorvastatin', category: 'Cholesterol', dosage: '20mg', usage: 'High' },
                            { name: 'Levothyroxine', category: 'Thyroid', dosage: '50mcg', usage: 'Medium' },
                            { name: 'Amoxicillin', category: 'Antibiotic', dosage: '500mg', usage: 'Low' },
                            { name: 'Albuterol', category: 'Asthma', dosage: '90mcg', usage: 'Medium' }
                        ].map((med, index) => (
                            <div key={index} className="border border-gray-200 rounded-xl p-4 hover:border-green-300 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="font-bold text-gray-900">{med.name}</h4>
                                        <p className="text-sm text-gray-500 mt-1">{med.category}</p>
                                    </div>
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${med.usage === 'High' ? 'bg-red-100 text-red-700' : med.usage === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                        {med.usage} usage
                                    </span>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <span className="text-sm text-gray-700">Dosage: {med.dosage}</span>
                                    <button className="text-green-600 hover:text-green-700 text-sm font-medium cursor-pointer">
                                        Add to Rx
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* New Prescription Modal */}
            {showNewPrescription && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">New Prescription</h2>
                                <button
                                    onClick={() => setShowNewPrescription(false)}
                                    className="text-gray-400 hover:text-gray-600 cursor-pointer"
                                >
                                    ✕
                                </button>
                            </div>

                            <form className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Patient Name
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all duration-200"
                                            placeholder="Search patient..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Diagnosis
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all duration-200"
                                            placeholder="Enter diagnosis..."
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Medications
                                    </label>
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-3">
                                            <input
                                                type="text"
                                                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all duration-200"
                                                placeholder="Medication name"
                                            />
                                            <input
                                                type="text"
                                                className="w-32 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all duration-200"
                                                placeholder="Dosage"
                                            />
                                            <button className="px-4 py-3 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors cursor-pointer">
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Instructions
                                    </label>
                                    <textarea
                                        rows={3}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all duration-200"
                                        placeholder="Enter instructions for the patient..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Duration
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all duration-200"
                                            placeholder="e.g., 30 days"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Refills
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all duration-200"
                                            placeholder="Number of refills"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4 pt-6 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPrescription(false)}
                                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200 cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-medium hover:from-green-700 hover:to-green-800 transition-all duration-200 cursor-pointer"
                                    >
                                        Save Prescription
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorPrescriptionsPage;