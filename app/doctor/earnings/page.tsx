"use client";

import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar, Download, Filter, BarChart3, CreditCard, Wallet, PieChart } from 'lucide-react';
import api from '@/lib/api/api';

interface Earning {
    _id: string;
    date: string;
    amount: number;
    patientName: string;
    service: string;
    status: 'paid' | 'pending' | 'refunded';
}

interface Appointment {
    _id: string;
    patientId: {
        name: string;
    };
    doctorId: {
        fee: number;
    };
    appointmentDate: string;
    status: string;
    service?: string;
}

const DoctorEarningsPage = () => {
    const [earnings, setEarnings] = useState<Earning[]>([]);
    const [filteredEarnings, setFilteredEarnings] = useState<Earning[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'year' | 'all'>('month');
    const [stats, setStats] = useState({
        totalEarnings: 0,
        monthlyEarnings: 0,
        pendingAmount: 0,
        averagePerPatient: 0,
        totalPatients: 0
    });

    useEffect(() => {
        fetchEarningsFromAppointments();
    }, []);

    useEffect(() => {
        filterEarnings();
        calculateStats();
    }, [timeFilter, earnings]);

    const fetchEarningsFromAppointments = async () => {
        try {
            setLoading(true);
            
            // Get doctor's appointments instead of billing endpoint
            const response = await api.get('/appointments/my');
            const appointments: Appointment[] = Array.isArray(response.data) ? response.data : [];
            
            console.log(`Found ${appointments.length} appointments for earnings calculation`);
            
            // Transform appointments to earnings format
            const earningsData: Earning[] = appointments
                .filter(appointment => 
                    appointment.status === 'completed' || 
                    appointment.status === 'confirmed' || 
                    appointment.status === 'paid'
                )
                .map((appointment, index) => {
                    // Determine status based on appointment status
                    let status: 'paid' | 'pending' | 'refunded' = 'pending';
                    if (appointment.status === 'paid' || appointment.status === 'completed') {
                        status = 'paid';
                    } else if (appointment.status === 'cancelled') {
                        status = 'refunded';
                    }
                    
                    return {
                        _id: appointment._id || `appt-${index}`,
                        date: appointment.appointmentDate || new Date().toISOString(),
                        amount: appointment.doctorId?.fee || 100, // Default fee if not specified
                        patientName: appointment.patientId?.name || 'Patient',
                        service: appointment.service || 'Consultation',
                        status: status
                    };
                });
            
            setEarnings(earningsData);
            
        } catch (error) {
            console.error('Error fetching appointments for earnings:', error);
            // Fallback mock data
            const mockEarnings: Earning[] = [
                { _id: '1', date: '2024-01-15', amount: 150, patientName: 'John Doe', service: 'Consultation', status: 'paid' },
                { _id: '2', date: '2024-01-14', amount: 200, patientName: 'Jane Smith', service: 'Follow-up', status: 'paid' },
                { _id: '3', date: '2024-01-13', amount: 180, patientName: 'Robert Johnson', service: 'Consultation', status: 'pending' },
                { _id: '4', date: '2024-01-12', amount: 120, patientName: 'Sarah Williams', service: 'Check-up', status: 'paid' },
                { _id: '5', date: '2024-01-11', amount: 250, patientName: 'Michael Brown', service: 'Specialist Visit', status: 'paid' },
                { _id: '6', date: '2024-01-10', amount: 100, patientName: 'Emily Davis', service: 'Consultation', status: 'refunded' },
            ];
            setEarnings(mockEarnings);
        } finally {
            setLoading(false);
        }
    };

    const filterEarnings = () => {
        let filtered = [...earnings];
        const now = new Date();

        switch (timeFilter) {
            case 'week':
                const weekAgo = new Date(now);
                weekAgo.setDate(now.getDate() - 7);
                filtered = filtered.filter(e => new Date(e.date) >= weekAgo);
                break;
            case 'month':
                const monthAgo = new Date(now);
                monthAgo.setMonth(now.getMonth() - 1);
                filtered = filtered.filter(e => new Date(e.date) >= monthAgo);
                break;
            case 'year':
                const yearAgo = new Date(now);
                yearAgo.setFullYear(now.getFullYear() - 1);
                filtered = filtered.filter(e => new Date(e.date) >= yearAgo);
                break;
            default:
                break;
        }

        setFilteredEarnings(filtered);
    };

    const calculateStats = () => {
        const paidEarnings = earnings.filter(e => e.status === 'paid');
        const pendingEarnings = earnings.filter(e => e.status === 'pending');
        
        // Calculate total earnings from paid appointments
        const total = paidEarnings.reduce((sum, e) => sum + e.amount, 0);
        
        // Calculate monthly earnings (last 30 days)
        const now = new Date();
        const monthAgo = new Date(now);
        monthAgo.setMonth(now.getMonth() - 1);
        
        const monthly = paidEarnings
            .filter(e => new Date(e.date) >= monthAgo)
            .reduce((sum, e) => sum + e.amount, 0);
        
        // Calculate pending amount
        const pending = pendingEarnings.reduce((sum, e) => sum + e.amount, 0);
        
        // Calculate unique patients
        const uniquePatients = [...new Set(earnings.map(e => e.patientName))].length;
        const average = uniquePatients > 0 ? total / uniquePatients : 0;

        setStats({
            totalEarnings: total,
            monthlyEarnings: monthly,
            pendingAmount: pending,
            averagePerPatient: average,
            totalPatients: uniquePatients
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch (error) {
            return 'Invalid date';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'bg-emerald-100 text-emerald-700';
            case 'pending': return 'bg-amber-100 text-amber-700';
            case 'refunded': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const downloadReport = () => {
        const reportData = filteredEarnings.map(e => ({
            Date: formatDate(e.date),
            Patient: e.patientName,
            Service: e.service,
            Amount: `$${e.amount}`,
            Status: e.status
        }));

        const csvContent = [
            ['Date', 'Patient', 'Service', 'Amount', 'Status'],
            ...reportData.map(e => [e.Date, e.Patient, e.Service, e.Amount, e.Status])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `earnings-report-${timeFilter}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const refreshEarnings = () => {
        fetchEarningsFromAppointments();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-emerald-100 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-emerald-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="mt-6 text-gray-600 font-medium">Loading earnings data...</p>
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
                            <h1 className="text-3xl font-bold text-gray-900">Earnings & Revenue</h1>
                            <p className="text-gray-500 mt-2">Track your earnings from appointments</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={refreshEarnings}
                                className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                Refresh Data
                            </button>
                            <button
                                onClick={downloadReport}
                                className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                <Download className="w-4 h-4" />
                                <span className="font-medium">Download Report</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/50 rounded-2xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-emerald-800">Total Earnings</p>
                                <p className="text-3xl font-bold text-emerald-900 mt-2">{formatCurrency(stats.totalEarnings)}</p>
                                <p className="text-xs text-emerald-600 mt-1">
                                    From {earnings.filter(e => e.status === 'paid').length} completed appointments
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                                <DollarSign className="w-6 h-6 text-emerald-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50 rounded-2xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-800">This Month</p>
                                <p className="text-3xl font-bold text-blue-900 mt-2">{formatCurrency(stats.monthlyEarnings)}</p>
                                <p className="text-xs text-blue-600 mt-1">
                                    Last 30 days
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                                <Calendar className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200/50 rounded-2xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-amber-800">Pending Payments</p>
                                <p className="text-3xl font-bold text-amber-900 mt-2">{formatCurrency(stats.pendingAmount)}</p>
                                <p className="text-xs text-amber-600 mt-1">
                                    From {earnings.filter(e => e.status === 'pending').length} appointments
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                                <Wallet className="w-6 h-6 text-amber-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/50 rounded-2xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-purple-800">Avg. per Patient</p>
                                <p className="text-3xl font-bold text-purple-900 mt-2">{formatCurrency(stats.averagePerPatient)}</p>
                                <p className="text-xs text-purple-600 mt-1">
                                    Across {stats.totalPatients} patients
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                                <PieChart className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Time Filter */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Earnings Breakdown</h2>
                        <div className="flex items-center space-x-2">
                            <Filter className="w-5 h-5 text-gray-500" />
                            <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-xl p-1">
                                {(['week', 'month', 'year', 'all'] as const).map((filter) => (
                                    <button
                                        key={filter}
                                        onClick={() => setTimeFilter(filter)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${timeFilter === filter
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

                {/* Earnings Table */}
                <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 overflow-hidden mb-8">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/80 border-b border-gray-200/50">
                                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Date</th>
                                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Patient</th>
                                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Service</th>
                                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Amount</th>
                                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEarnings.length > 0 ? (
                                    filteredEarnings.map((earning) => (
                                        <tr key={earning._id} className="border-b border-gray-200/50 hover:bg-gray-50/50 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center text-gray-700">
                                                    <Calendar className="w-4 h-4 mr-2" />
                                                    <span>{formatDate(earning.date)}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="font-medium text-gray-900">{earning.patientName}</div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="text-gray-700">{earning.service}</div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="font-bold text-gray-900">{formatCurrency(earning.amount)}</div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(earning.status)}`}>
                                                    {earning.status.charAt(0).toUpperCase() + earning.status.slice(1)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-16 text-center">
                                            <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                                <BarChart3 className="w-12 h-12 text-emerald-600" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                                {earnings.length === 0 ? 'No earnings data yet' : 'No earnings found'}
                                            </h3>
                                            <p className="text-gray-500 max-w-md mx-auto">
                                                {earnings.length === 0 
                                                    ? 'Earnings will appear here after you complete appointments'
                                                    : 'No earnings recorded for the selected time period'}
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Chart Placeholder */}
                <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Earnings Overview</h2>
                            <p className="text-sm text-gray-500">Calculated from completed appointments</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
                                <span className="text-sm text-gray-600">Paid</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
                                <span className="text-sm text-gray-600">Pending</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                        <div className="text-center">
                            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500">Earnings chart would appear here</p>
                            <p className="text-sm text-gray-400">Based on appointment fees</p>
                        </div>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">How Earnings Are Calculated</h2>
                                <p className="text-sm text-gray-500">Understanding your revenue</p>
                            </div>
                            <CreditCard className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="space-y-4">
                            <div className="text-sm text-gray-600">
                                <p className="font-medium mb-1">• Based on completed appointments</p>
                                <p className="text-gray-500">Only appointments marked as "completed" or "paid" count toward earnings</p>
                            </div>
                            <div className="text-sm text-gray-600">
                                <p className="font-medium mb-1">• Using doctor's consultation fee</p>
                                <p className="text-gray-500">Each appointment uses the fee set in your doctor profile</p>
                            </div>
                            <div className="text-sm text-gray-600">
                                <p className="font-medium mb-1">• Pending payments shown separately</p>
                                <p className="text-gray-500">Appointments that are confirmed but not yet paid appear as pending</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Service Distribution</h2>
                            <p className="text-sm text-gray-500">Revenue by service type</p>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Consultation</span>
                                <span className="font-bold text-gray-900">
                                    {formatCurrency(
                                        earnings
                                            .filter(e => e.service === 'Consultation' && e.status === 'paid')
                                            .reduce((sum, e) => sum + e.amount, 0)
                                    )}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Follow-up</span>
                                <span className="font-bold text-gray-900">
                                    {formatCurrency(
                                        earnings
                                            .filter(e => e.service === 'Follow-up' && e.status === 'paid')
                                            .reduce((sum, e) => sum + e.amount, 0)
                                    )}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Specialist Visit</span>
                                <span className="font-bold text-gray-900">
                                    {formatCurrency(
                                        earnings
                                            .filter(e => e.service === 'Specialist Visit' && e.status === 'paid')
                                            .reduce((sum, e) => sum + e.amount, 0)
                                    )}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Other Services</span>
                                <span className="font-bold text-gray-900">
                                    {formatCurrency(
                                        earnings
                                            .filter(e => 
                                                !['Consultation', 'Follow-up', 'Specialist Visit'].includes(e.service) && 
                                                e.status === 'paid'
                                            )
                                            .reduce((sum, e) => sum + e.amount, 0)
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorEarningsPage;