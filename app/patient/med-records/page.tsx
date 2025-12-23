"use client";

import React, { useState, useEffect } from 'react';
import { FileText, Download, Filter, Search, Plus, Stethoscope, Pill, Activity, Heart, Thermometer, ChevronRight, Eye, Share2, Printer, Calendar, User } from 'lucide-react';
import api from '@/lib/api/api';

interface MedicalRecord {
    _id: string;
    type: 'prescription' | 'lab-report' | 'diagnosis' | 'vaccination' | 'other';
    title: string;
    doctorName: string;
    date: string;
    description?: string;
    fileUrl?: string;
    tags: string[];
}

const MedicalRecordsPage = () => {
    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<'all' | 'prescription' | 'lab-report' | 'diagnosis'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchMedicalRecords();
    }, []);

    useEffect(() => {
        filterRecords();
    }, [activeFilter, searchTerm, records]);

    const fetchMedicalRecords = async () => {
        try {
            setLoading(true);
            // This endpoint would need to be implemented in your backend
            const response = await api.get('/medical-records/my');
            const data = response.data.data || response.data || [];
            setRecords(data);
        } catch (error) {
            console.error('Error fetching medical records:', error);
            // Mock data for demonstration
            setRecords([
                {
                    _id: '1',
                    type: 'prescription',
                    title: 'Antibiotics Prescription',
                    doctorName: 'Dr. Smith Johnson',
                    date: '2024-01-15',
                    description: 'For bacterial infection treatment',
                    tags: ['Antibiotics', 'Infection', '30 days']
                },
                {
                    _id: '2',
                    type: 'lab-report',
                    title: 'Blood Test Results',
                    doctorName: 'Dr. Emma Wilson',
                    date: '2024-01-10',
                    description: 'Complete blood count and lipid profile',
                    tags: ['Blood Test', 'CBC', 'Lipid Profile']
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
                record.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
            case 'vaccination': return <Heart className="w-5 h-5" />;
            default: return <FileText className="w-5 h-5" />;
        }
    };

    const getRecordColor = (type: string) => {
        switch (type) {
            case 'prescription': return 'bg-blue-100 text-blue-600';
            case 'lab-report': return 'bg-green-100 text-green-600';
            case 'diagnosis': return 'bg-purple-100 text-purple-600';
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

    const handleDownload = (record: MedicalRecord) => {
        if (record.fileUrl) {
            window.open(record.fileUrl, '_blank');
        } else {
            alert('No file available for download');
        }
    };

    const handleView = (record: MedicalRecord) => {
        // Navigate to record detail page
        console.log('View record:', record);
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
        <div className="p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Medical Records</h1>
                            <p className="text-gray-500 mt-2">Access and manage your health documents</p>
                        </div>
                        <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-500/30 cursor-pointer">
                            <Plus className="w-5 h-5" />
                            <span className="font-medium">Upload Record</span>
                        </button>
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
                                {(['all', 'prescription', 'lab-report', 'diagnosis'] as const).map((filter) => (
                                    <button
                                        key={filter}
                                        onClick={() => setActiveFilter(filter)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeFilter === filter
                                            ? 'bg-blue-600 text-white'
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
                                                <h3 className="font-bold text-gray-900 capitalize">{record.type.replace('-', ' ')}</h3>
                                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getRecordColor(record.type)}`}>
                                                    {record.type}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="mb-6">
                                        <h4 className="text-lg font-semibold text-gray-900 mb-2">{record.title}</h4>
                                        <p className="text-sm text-gray-600 mb-4">{record.description}</p>

                                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                                            <div className="flex items-center">
                                                <User className="w-4 h-4 mr-2" />
                                                <span>{record.doctorName}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Calendar className="w-4 h-4 mr-2" />
                                                <span>{formatDate(record.date)}</span>
                                            </div>
                                        </div>

                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-2">
                                            {record.tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => handleView(record)}
                                                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium cursor-pointer"
                                            >
                                                <Eye className="w-4 h-4" />
                                                <span>View</span>
                                            </button>
                                            <button
                                                onClick={() => handleDownload(record)}
                                                className="flex items-center space-x-1 text-gray-600 hover:text-gray-700 text-sm font-medium cursor-pointer"
                                            >
                                                <Download className="w-4 h-4" />
                                                <span>Download</span>
                                            </button>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
                                                <Share2 className="w-4 h-4 text-gray-600" />
                                            </button>
                                            <button className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
                                                <Printer className="w-4 h-4 text-gray-600" />
                                            </button>
                                        </div>
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
                            <p className="text-gray-500 max-w-md mx-auto mb-8">
                                {searchTerm
                                    ? 'No records match your search criteria'
                                    : 'You have no medical records yet'}
                            </p>
                            <button className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-500/30 cursor-pointer">
                                <Plus className="w-5 h-5" />
                                <span>Upload Your First Record</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Health Summary */}
                <div className="bg-white rounded-2xl shadow-lg shadow-blue-500/5 border border-gray-200/50 p-6 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Health Summary</h2>
                            <p className="text-gray-500">Overview of your health metrics</p>
                        </div>
                        <button className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
                            View Full Report
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                                    <Heart className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-blue-800">Heart Rate</p>
                                    <p className="text-xl font-bold text-blue-900">72 BPM</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                                    <Thermometer className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-green-800">Blood Pressure</p>
                                    <p className="text-xl font-bold text-green-900">120/80</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                                    <Activity className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-purple-800">Blood Sugar</p>
                                    <p className="text-xl font-bold text-purple-900">96 mg/dL</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-xl p-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                                    <Stethoscope className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-red-800">Weight</p>
                                    <p className="text-xl font-bold text-red-900">68 kg</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MedicalRecordsPage;