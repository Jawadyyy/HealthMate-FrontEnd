"use client";

import React, { useState, useEffect } from 'react';
import {
    Pill, Download, Search, Filter, Calendar, User,
    Clock, AlertCircle, Printer, Share2, FileText,
    ChevronRight, Eye, Plus, RefreshCw, X, CheckCircle,
    ExternalLink, Hash, Info, Clock4, CalendarDays,
    Stethoscope, Building2, Phone, Mail, TrendingUp
} from 'lucide-react';
import api from '@/lib/api/api';

interface PrescriptionMedication {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
    route?: string;
}

interface Prescription {
    _id: string;
    patientId: string;
    doctorId: string;
    doctor: {
        _id: string;
        name: string;
        specialization?: string;
        hospital?: string;
        email?: string;
        phone?: string;
        profilePicture?: string;
    };
    medications: PrescriptionMedication[];
    diagnosis?: string;
    instructions?: string;
    notes?: string;
    doctorNotes?: string;
    status: 'active' | 'completed' | 'cancelled' | 'expired';
    issuedDate: string;
    prescriptionDate?: string;
    expiryDate?: string;
    refills?: number;
    refillsRemaining?: number;
    refillsUsed?: number;
    nextRefillDate?: string;
    pharmacyNotes?: string;
    tags: string[];
}

interface PrescriptionStats {
    totalPrescriptions: number;
    activePrescriptions: number;
    expiredPrescriptions: number;
    cancelledPrescriptions: number;
}

const PrescriptionsPage = () => {
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [filteredPrescriptions, setFilteredPrescriptions] = useState<Prescription[]>([]);
    const [stats, setStats] = useState<PrescriptionStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'expired' | 'cancelled'>('all');
    const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [refillLoading, setRefillLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchPrescriptions();
        fetchStats();
    }, []);

    useEffect(() => {
        if (searchTerm) {
            handleSearch();
        } else {
            filterPrescriptions();
        }
    }, [searchTerm, statusFilter, prescriptions]);

    const fetchPrescriptions = async () => {
        try {
            setLoading(true);
            const response = await api.get('/prescriptions/my');
            let data = response.data.data || response.data || [];

            const transformedPrescriptions = data.map((prescription: any) => {
                let doctor = null;

                if (prescription.doctorId && typeof prescription.doctorId === 'object' && prescription.doctorId._id) {
                    const doctorData = prescription.doctorId;
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
                    ...prescription,
                    doctor: doctor || {
                        _id: 'unknown',
                        name: 'Doctor Information Unavailable'
                    },
                    issuedDate: prescription.prescriptionDate || prescription.issuedDate || prescription.createdAt,
                    status: prescription.status || 'active',
                    tags: prescription.tags || [],
                    refillsRemaining: prescription.refills ? (prescription.refills - (prescription.refillsUsed || 0)) : 0
                };
            });

            setPrescriptions(transformedPrescriptions);
            setFilteredPrescriptions(transformedPrescriptions);
        } catch (error) {
            console.error('Error fetching prescriptions:', error);
            setPrescriptions([]);
            setFilteredPrescriptions([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/prescriptions/stats/count');
            setStats(response.data.data || response.data || null);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            filterPrescriptions();
            return;
        }

        try {
            const response = await api.get('/prescriptions/search', {
                params: { q: searchTerm }
            });
            let data = response.data.data || response.data || [];

            const transformedPrescriptions = data.map((prescription: any) => ({
                ...prescription,
                doctor: prescription.doctorId || { _id: 'unknown', name: 'Doctor Information Unavailable' },
                issuedDate: prescription.prescriptionDate || prescription.issuedDate || prescription.createdAt,
                tags: prescription.tags || [],
                refillsRemaining: prescription.refills ? (prescription.refills - (prescription.refillsUsed || 0)) : 0
            }));

            let filtered = transformedPrescriptions;
            if (statusFilter !== 'all') {
                filtered = filtered.filter((p: Prescription) => p.status === statusFilter);
            }

            setFilteredPrescriptions(filtered);
        } catch (error) {
            console.error('Error searching prescriptions:', error);
            filterPrescriptions();
        }
    };

    const filterPrescriptions = () => {
        let filtered = [...prescriptions];

        if (statusFilter !== 'all') {
            filtered = filtered.filter(prescription => prescription.status === statusFilter);
        }

        setFilteredPrescriptions(filtered);
    };

    const handleRefillRequest = async (prescription: Prescription) => {
        if (!prescription.refillsRemaining || prescription.refillsRemaining <= 0) {
            alert('No refills remaining for this prescription.');
            return;
        }

        try {
            setRefillLoading(prescription._id);
            const response = await api.post(`/prescriptions/refill/${prescription._id}`, {});
            alert('Refill request submitted successfully!');
            await fetchPrescriptions();
            await fetchStats();
        } catch (error: any) {
            console.error('Error requesting refill:', error);
            alert(error.response?.data?.message || 'Failed to request refill. Please try again.');
        } finally {
            setRefillLoading(null);
        }
    };

    const handleCancelPrescription = async (prescriptionId: string) => {
        if (!confirm('Are you sure you want to cancel this prescription?')) {
            return;
        }

        try {
            await api.patch(`/prescriptions/cancel/${prescriptionId}`);
            alert('Prescription cancelled successfully!');
            await fetchPrescriptions();
            await fetchStats();
            setShowDetailModal(false);
        } catch (error: any) {
            console.error('Error cancelling prescription:', error);
            alert(error.response?.data?.message || 'Failed to cancel prescription. Please try again.');
        }
    };

    const handleViewDetails = async (prescription: Prescription) => {
        try {
            const response = await api.get(`/prescriptions/${prescription._id}`);
            const detailData = response.data.data || response.data;

            const transformedPrescription = {
                ...detailData,
                doctor: detailData.doctorId || prescription.doctor,
                issuedDate: detailData.prescriptionDate || detailData.issuedDate || detailData.createdAt,
                tags: detailData.tags || [],
                refillsRemaining: detailData.refills ? (detailData.refills - (detailData.refillsUsed || 0)) : 0
            };

            setSelectedPrescription(transformedPrescription);
            setShowDetailModal(true);
        } catch (error) {
            console.error('Error fetching prescription details:', error);
            setSelectedPrescription(prescription);
            setShowDetailModal(true);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'completed': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            case 'expired': return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <CheckCircle className="w-4 h-4" />;
            case 'completed': return <CheckCircle className="w-4 h-4" />;
            case 'expired': return <Clock4 className="w-4 h-4" />;
            case 'cancelled': return <X className="w-4 h-4" />;
            default: return <Info className="w-4 h-4" />;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatDateWithTime = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handlePrintPrescription = (prescription: Prescription) => {
        window.print();
    };

    const handleDownloadPrescription = (prescription: Prescription) => {
        console.log('Downloading prescription:', prescription);
        alert('Download functionality will be implemented with PDF generation.');
    };

    const calculateExpiringSoon = () => {
        return prescriptions.filter(p => {
            if (!p.expiryDate) return false;
            const expiry = new Date(p.expiryDate);
            const today = new Date();
            const diffTime = expiry.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 7 && diffDays >= 0 && p.status === 'active';
        }).length;
    };

    const calculateTotalRefills = () => {
        return prescriptions.reduce((acc, p) => acc + (p.refillsRemaining || 0), 0);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative inline-block">
                        <div className="w-20 h-20 border-4 border-blue-100 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-20 h-20 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="mt-6 text-lg font-medium text-gray-700">Loading your prescriptions...</p>
                    <p className="text-sm text-gray-500 mt-2">Please wait while we fetch your medication information</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Prescriptions</h1>
                            <p className="text-gray-600 mt-2 flex items-center">
                                <Pill className="w-4 h-4 mr-2 text-blue-600" />
                                Manage your medications and prescription history
                            </p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                {viewMode === 'grid' ? 'List View' : 'Grid View'}
                            </button>
                            <button
                                onClick={() => {
                                    fetchPrescriptions();
                                    fetchStats();
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-800 transition-colors flex items-center"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Refresh
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Prescriptions</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats?.totalPrescriptions || prescriptions.length}
                                    </p>
                                </div>
                                <Pill className="w-8 h-8 text-blue-600" />
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Active</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats?.activePrescriptions || prescriptions.filter(p => p.status === 'active').length}
                                    </p>
                                </div>
                                <CheckCircle className="w-8 h-8 text-blue-600" />
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Expiring Soon</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {calculateExpiringSoon()}
                                    </p>
                                </div>
                                <AlertCircle className="w-8 h-8 text-amber-600" />
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Refills Available</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {calculateTotalRefills()}
                                    </p>
                                </div>
                                <RefreshCw className="w-8 h-8 text-indigo-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search medications, doctor, or diagnosis..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                />
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
                                    <Filter className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm text-gray-700">Status:</span>
                                </div>
                                {(['all', 'active', 'completed', 'expired', 'cancelled'] as const).map((filter) => (
                                    <button
                                        key={filter}
                                        onClick={() => setStatusFilter(filter)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === filter
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {filteredPrescriptions.length > 0 ? (
                        <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}`}>
                            {filteredPrescriptions.map((prescription) => (
                                <div
                                    key={prescription._id}
                                    className={`bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 ${viewMode === 'list' ? 'p-6' : 'p-5'}`}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                                                <Pill className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getStatusColor(prescription.status)} flex items-center`}>
                                                        {getStatusIcon(prescription.status)}
                                                        <span className="ml-1">{prescription.status.toUpperCase()}</span>
                                                    </span>
                                                    {prescription.refillsRemaining && prescription.refillsRemaining > 0 && (
                                                        <span className="text-xs bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">
                                                            {prescription.refillsRemaining} refill{prescription.refillsRemaining > 1 ? 's' : ''} left
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Issued: {formatDate(prescription.issuedDate)}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleViewDetails(prescription)}
                                            className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                                        >
                                            <ChevronRight className="w-5 h-5 text-gray-400" />
                                        </button>
                                    </div>

                                    <div className="mb-4">
                                        <h3 className="font-semibold text-gray-900 mb-3">Medications</h3>
                                        <div className="space-y-2">
                                            {prescription.medications.slice(0, 2).map((med, index) => (
                                                <div key={index} className="flex items-start space-x-2">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-baseline justify-between">
                                                            <span className="font-medium text-gray-900">{med.name}</span>
                                                            <span className="text-sm text-gray-600">{med.dosage}</span>
                                                        </div>
                                                        <div className="text-sm text-gray-500">{med.frequency} • {med.duration}</div>
                                                    </div>
                                                </div>
                                            ))}
                                            {prescription.medications.length > 2 && (
                                                <div className="text-sm text-blue-600">
                                                    +{prescription.medications.length - 2} more medications
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {prescription.diagnosis && (
                                        <div className="mb-4">
                                            <div className="flex items-center text-sm text-gray-600 mb-1">
                                                <Stethoscope className="w-4 h-4 mr-2" />
                                                <span className="font-medium">Diagnosis:</span>
                                            </div>
                                            <p className="text-sm text-gray-700 line-clamp-2">{prescription.diagnosis}</p>
                                        </div>
                                    )}

                                    <div className="space-y-3 text-sm text-gray-600 mb-4">
                                        {prescription.doctor && (
                                            <div className="flex items-center">
                                                <User className="w-4 h-4 mr-2 flex-shrink-0" />
                                                <span className="truncate">{prescription.doctor.name}</span>
                                                {prescription.doctor.specialization && (
                                                    <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                                                        {prescription.doctor.specialization}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        {prescription.expiryDate && (
                                            <div className="flex items-center">
                                                <CalendarDays className="w-4 h-4 mr-2" />
                                                <span>Expires: {formatDate(prescription.expiryDate)}</span>
                                            </div>
                                        )}
                                    </div>

                                    {prescription.tags && prescription.tags.length > 0 && (
                                        <div className="mb-4">
                                            <div className="flex flex-wrap gap-2">
                                                {prescription.tags.slice(0, 3).map((tag, index) => (
                                                    <span
                                                        key={index}
                                                        className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                                {prescription.tags.length > 3 && (
                                                    <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                                                        +{prescription.tags.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <button
                                            onClick={() => handleViewDetails(prescription)}
                                            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                                        >
                                            <Eye className="w-4 h-4" />
                                            <span>View Details</span>
                                        </button>

                                        <div className="flex items-center space-x-2">
                                            {prescription.status === 'active' && prescription.refillsRemaining && prescription.refillsRemaining > 0 && (
                                                <button
                                                    onClick={() => handleRefillRequest(prescription)}
                                                    disabled={refillLoading === prescription._id}
                                                    className="text-xs text-blue-600 hover:text-blue-700 disabled:opacity-50"
                                                >
                                                    {refillLoading === prescription._id ? 'Processing...' : 'Request Refill'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Pill className="w-10 h-10 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">No prescriptions found</h3>
                            <p className="text-gray-600 max-w-md mx-auto mb-6">
                                {searchTerm
                                    ? 'No prescriptions match your search criteria. Try different keywords.'
                                    : 'You don\'t have any prescriptions yet. Your doctor will add prescriptions after consultations.'}
                            </p>
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-800 transition-colors"
                                >
                                    Clear Search
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {showDetailModal && selectedPrescription && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                            <div className="bg-gradient-to-r from-blue-50 to-blue-100/30 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                        <Pill className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Prescription Details</h2>
                                        <div className="flex items-center space-x-2">
                                            <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(selectedPrescription.status)} flex items-center`}>
                                                {getStatusIcon(selectedPrescription.status)}
                                                <span className="ml-1">{selectedPrescription.status.toUpperCase()}</span>
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                ID: {selectedPrescription._id.slice(0, 8)}...
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => handlePrintPrescription(selectedPrescription)}
                                        className="p-2 hover:bg-white rounded-lg transition-colors"
                                        title="Print"
                                    >
                                        <Printer className="w-5 h-5 text-gray-600" />
                                    </button>
                                    <button
                                        onClick={() => handleDownloadPrescription(selectedPrescription)}
                                        className="p-2 hover:bg-white rounded-lg transition-colors"
                                        title="Download"
                                    >
                                        <Download className="w-5 h-5 text-gray-600" />
                                    </button>
                                    <button
                                        onClick={() => setShowDetailModal(false)}
                                        className="p-2 hover:bg-white rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5 text-gray-600" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2 space-y-6">
                                        {selectedPrescription.doctor && (
                                            <div className="bg-gray-50 rounded-xl p-5">
                                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                                    <User className="w-5 h-5 mr-2 text-blue-600" />
                                                    Prescribing Physician
                                                </h3>
                                                <div className="space-y-4">
                                                    <div className="flex items-start">
                                                        <div className="w-32 text-sm text-gray-600">Name:</div>
                                                        <div className="flex-1">
                                                            <div className="font-medium text-gray-900">{selectedPrescription.doctor.name}</div>
                                                            {selectedPrescription.doctor.specialization && (
                                                                <div className="text-sm text-gray-600 mt-1">{selectedPrescription.doctor.specialization}</div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {selectedPrescription.doctor.hospital && (
                                                            <div className="flex items-center">
                                                                <Building2 className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                                                                <span className="text-sm text-gray-900 truncate">{selectedPrescription.doctor.hospital}</span>
                                                            </div>
                                                        )}
                                                        {selectedPrescription.doctor.email && (
                                                            <div className="flex items-center">
                                                                <Mail className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                                                                <span className="text-sm text-gray-900 truncate">{selectedPrescription.doctor.email}</span>
                                                            </div>
                                                        )}
                                                        {selectedPrescription.doctor.phone && (
                                                            <div className="flex items-center">
                                                                <Phone className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                                                                <span className="text-sm text-gray-900">{selectedPrescription.doctor.phone}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {selectedPrescription.diagnosis && (
                                            <div className="bg-red-50/50 rounded-xl p-5 border border-red-100">
                                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                                                    <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
                                                    Diagnosis
                                                </h3>
                                                <p className="text-gray-800">{selectedPrescription.diagnosis}</p>
                                            </div>
                                        )}

                                        <div className="bg-white border border-gray-200 rounded-xl p-5">
                                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                                <Pill className="w-5 h-5 mr-2 text-blue-600" />
                                                Medications ({selectedPrescription.medications.length})
                                            </h3>
                                            <div className="space-y-4">
                                                {selectedPrescription.medications.map((med, index) => (
                                                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div>
                                                                <h4 className="font-semibold text-gray-900 text-lg">{med.name}</h4>
                                                                <div className="text-sm text-gray-600">{med.route || 'Oral'}</div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-lg font-bold text-gray-900">{med.dosage}</div>
                                                                <div className="text-sm text-gray-600">Dosage</div>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-4 mb-3">
                                                            <div>
                                                                <div className="text-xs text-gray-500 mb-1">Frequency</div>
                                                                <div className="font-medium text-gray-900">{med.frequency}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-xs text-gray-500 mb-1">Duration</div>
                                                                <div className="font-medium text-gray-900">{med.duration}</div>
                                                            </div>
                                                        </div>

                                                        {med.instructions && (
                                                            <div className="bg-white rounded p-3">
                                                                <div className="text-xs text-gray-500 mb-1">Special Instructions</div>
                                                                <div className="text-sm text-gray-800">{med.instructions}</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {selectedPrescription.instructions && (
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                                                        <Info className="w-5 h-5 mr-2 text-blue-600" />
                                                        Instructions
                                                    </h3>
                                                    <p className="text-gray-700 bg-blue-50/50 p-4 rounded-lg">{selectedPrescription.instructions}</p>
                                                </div>
                                            )}

                                            {selectedPrescription.notes && (
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                                                        <FileText className="w-5 h-5 mr-2 text-gray-600" />
                                                        Additional Notes
                                                    </h3>
                                                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedPrescription.notes}</p>
                                                </div>
                                            )}

                                            {selectedPrescription.doctorNotes && (
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                                                        <FileText className="w-5 h-5 mr-2 text-gray-600" />
                                                        Doctor's Notes
                                                    </h3>
                                                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedPrescription.doctorNotes}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="bg-white border border-gray-200 rounded-xl p-5">
                                            <h3 className="font-semibold text-gray-900 mb-4">Prescription Information</h3>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">Issued Date</span>
                                                    <span className="font-medium text-gray-900">{formatDate(selectedPrescription.issuedDate)}</span>
                                                </div>
                                                {selectedPrescription.expiryDate && (
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-600">Expiry Date</span>
                                                        <span className="font-medium text-gray-900">{formatDate(selectedPrescription.expiryDate)}</span>
                                                    </div>
                                                )}
                                                {selectedPrescription.refills !== undefined && (
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-600">Total Refills</span>
                                                        <span className="font-medium text-gray-900">{selectedPrescription.refills}</span>
                                                    </div>
                                                )}
                                                {selectedPrescription.refillsUsed !== undefined && (
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-600">Refills Used</span>
                                                        <span className="font-medium text-gray-900">{selectedPrescription.refillsUsed}</span>
                                                    </div>
                                                )}
                                                {selectedPrescription.refillsRemaining !== undefined && (
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-600">Refills Remaining</span>
                                                        <span className={`font-medium ${selectedPrescription.refillsRemaining > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                            {selectedPrescription.refillsRemaining}
                                                        </span>
                                                    </div>
                                                )}
                                                {selectedPrescription.nextRefillDate && (
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-600">Next Refill Date</span>
                                                        <span className="font-medium text-gray-900">{formatDate(selectedPrescription.nextRefillDate)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {selectedPrescription.pharmacyNotes && (
                                            <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-5">
                                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                                                    <AlertCircle className="w-5 h-5 mr-2 text-amber-600" />
                                                    Pharmacy Notes
                                                </h3>
                                                <p className="text-sm text-gray-700">{selectedPrescription.pharmacyNotes}</p>
                                            </div>
                                        )}

                                        {selectedPrescription.tags && selectedPrescription.tags.length > 0 && (
                                            <div className="bg-white border border-gray-200 rounded-xl p-5">
                                                <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedPrescription.tags.map((tag, index) => (
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

                                        <div className="bg-gray-50 rounded-xl p-5">
                                            <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
                                            <div className="space-y-3">
                                                <button
                                                    onClick={() => handlePrintPrescription(selectedPrescription)}
                                                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                                >
                                                    <Printer className="w-5 h-5" />
                                                    <span>Print Prescription</span>
                                                </button>
                                                {selectedPrescription.status === 'active' && selectedPrescription.refillsRemaining && selectedPrescription.refillsRemaining > 0 && (
                                                    <button
                                                        onClick={() => handleRefillRequest(selectedPrescription)}
                                                        disabled={refillLoading === selectedPrescription._id}
                                                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50"
                                                    >
                                                        <RefreshCw className="w-5 h-5" />
                                                        <span>{refillLoading === selectedPrescription._id ? 'Processing...' : 'Request Refill'}</span>
                                                    </button>
                                                )}
                                                {selectedPrescription.status === 'active' && (
                                                    <button
                                                        onClick={() => handleCancelPrescription(selectedPrescription._id)}
                                                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                                                    >
                                                        <X className="w-5 h-5" />
                                                        <span>Cancel Prescription</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={() => setShowDetailModal(false)}
                                        className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                                    >
                                        Close
                                    </button>
                                    <div className="flex items-center space-x-3">
                                        <span className="text-sm text-gray-500">
                                            Last updated: {formatDateWithTime(selectedPrescription.issuedDate)}
                                        </span>
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

export default PrescriptionsPage;