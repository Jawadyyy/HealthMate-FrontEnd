"use client";

import React, { useState, useEffect } from 'react';
import { CreditCard, Download, Filter, Search, Plus, Receipt, Wallet, TrendingUp, CheckCircle, Clock, XCircle, ChevronRight, Eye, FileText, DollarSign, Calendar, User } from 'lucide-react';
import api from '@/lib/api/api';

interface Payment {
    _id: string;
    invoiceNumber: string;
    amount: number;
    status: 'paid' | 'pending' | 'cancelled' | 'refunded';
    date: string;
    dueDate?: string;
    description: string;
    paymentMethod?: string;
    doctorName?: string;
}

const PaymentsPage = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<'all' | 'paid' | 'pending' | 'cancelled'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [totalPaid, setTotalPaid] = useState(0);
    const [totalPending, setTotalPending] = useState(0);

    useEffect(() => {
        fetchPayments();
    }, []);

    useEffect(() => {
        filterPayments();
        calculateTotals();
    }, [activeFilter, searchTerm, payments]);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            // This endpoint would need to be implemented in your backend
            const response = await api.get('/payments/my');
            const data = response.data.data || response.data || [];
            setPayments(data);
        } catch (error) {
            console.error('Error fetching payments:', error);
            // Mock data for demonstration
            setPayments([
                {
                    _id: '1',
                    invoiceNumber: 'INV-2024-001',
                    amount: 150.00,
                    status: 'paid',
                    date: '2024-01-15',
                    description: 'Consultation Fee',
                    paymentMethod: 'Credit Card',
                    doctorName: 'Dr. Smith Johnson'
                },
                {
                    _id: '2',
                    invoiceNumber: 'INV-2024-002',
                    amount: 250.00,
                    status: 'pending',
                    date: '2024-01-20',
                    dueDate: '2024-02-20',
                    description: 'Lab Test Charges',
                    doctorName: 'Dr. Emma Wilson'
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const filterPayments = () => {
        let filtered = [...payments];

        if (activeFilter !== 'all') {
            filtered = filtered.filter(payment => payment.status === activeFilter);
        }

        if (searchTerm) {
            filtered = filtered.filter(payment =>
                payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (payment.doctorName && payment.doctorName.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        setFilteredPayments(filtered);
    };

    const calculateTotals = () => {
        const paid = payments
            .filter(p => p.status === 'paid')
            .reduce((sum, p) => sum + p.amount, 0);

        const pending = payments
            .filter(p => p.status === 'pending')
            .reduce((sum, p) => sum + p.amount, 0);

        setTotalPaid(paid);
        setTotalPending(pending);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-700';
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            case 'refunded': return 'bg-blue-100 text-blue-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'paid': return <CheckCircle className="w-4 h-4" />;
            case 'pending': return <Clock className="w-4 h-4" />;
            case 'cancelled': return <XCircle className="w-4 h-4" />;
            default: return <CreditCard className="w-4 h-4" />;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const handlePayNow = (payment: Payment) => {
        // Implement payment processing
        console.log('Processing payment:', payment);
    };

    const handleViewInvoice = (payment: Payment) => {
        // Navigate to invoice detail page
        console.log('View invoice:', payment);
    };

    const handleDownloadInvoice = (payment: Payment) => {
        // Implement invoice download
        console.log('Download invoice:', payment);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-gray-50">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="mt-6 text-gray-600 font-medium">Loading payments...</p>
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
                            <h1 className="text-3xl font-bold text-gray-900">Billing & Payments</h1>
                            <p className="text-gray-500 mt-2">Manage your bills and payment history</p>
                        </div>
                        <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-500/30 cursor-pointer">
                            <Plus className="w-5 h-5" />
                            <span className="font-medium">Make Payment</span>
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200/50 rounded-2xl p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-green-800">Total Paid</p>
                                    <p className="text-3xl font-bold text-green-900 mt-2">{formatCurrency(totalPaid)}</p>
                                </div>
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 border border-yellow-200/50 rounded-2xl p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-yellow-800">Pending Payments</p>
                                    <p className="text-3xl font-bold text-yellow-900 mt-2">{formatCurrency(totalPending)}</p>
                                </div>
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                                    <Clock className="w-6 h-6 text-yellow-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50 rounded-2xl p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-800">Total Invoices</p>
                                    <p className="text-3xl font-bold text-blue-900 mt-2">{payments.length}</p>
                                </div>
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                                    <Receipt className="w-6 h-6 text-blue-600" />
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
                                placeholder="Search by invoice number, description, or doctor..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Filter className="w-5 h-5 text-gray-500" />
                            <div className="flex flex-wrap gap-2">
                                {(['all', 'paid', 'pending', 'cancelled'] as const).map((filter) => (
                                    <button
                                        key={filter}
                                        onClick={() => setActiveFilter(filter)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeFilter === filter
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payments Table */}
                <div className="bg-white rounded-2xl shadow-lg shadow-blue-500/5 border border-gray-200/50 overflow-hidden mb-8">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/80 border-b border-gray-200/50">
                                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Invoice #</th>
                                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Description</th>
                                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Doctor</th>
                                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Date</th>
                                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Amount</th>
                                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Status</th>
                                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPayments.length > 0 ? (
                                    filteredPayments.map((payment) => (
                                        <tr key={payment._id} className="border-b border-gray-200/50 hover:bg-gray-50/50 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="font-medium text-gray-900">{payment.invoiceNumber}</div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="text-gray-900">{payment.description}</div>
                                                {payment.paymentMethod && (
                                                    <div className="text-sm text-gray-500 mt-1">{payment.paymentMethod}</div>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                {payment.doctorName ? (
                                                    <div className="flex items-center">
                                                        <User className="w-4 h-4 mr-2 text-gray-400" />
                                                        <span className="text-gray-700">{payment.doctorName}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center">
                                                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                                    <span className="text-gray-700">{formatDate(payment.date)}</span>
                                                </div>
                                                {payment.dueDate && payment.status === 'pending' && (
                                                    <div className="text-sm text-yellow-600 mt-1">Due: {formatDate(payment.dueDate)}</div>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="font-bold text-gray-900">{formatCurrency(payment.amount)}</div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center">
                                                    <span className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(payment.status)}`}>
                                                        {getStatusIcon(payment.status)}
                                                        <span>{payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}</span>
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => handleViewInvoice(payment)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownloadInvoice(payment)}
                                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                                                        title="Download Invoice"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                    {payment.status === 'pending' && (
                                                        <button
                                                            onClick={() => handlePayNow(payment)}
                                                            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors cursor-pointer"
                                                        >
                                                            Pay Now
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="py-16 text-center">
                                            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                                <CreditCard className="w-12 h-12 text-blue-600" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">No payments found</h3>
                                            <p className="text-gray-500 max-w-md mx-auto mb-8">
                                                {searchTerm
                                                    ? 'No payments match your search criteria'
                                                    : 'You have no payment records yet'}
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="bg-white rounded-2xl shadow-lg shadow-blue-500/5 border border-gray-200/50 p-6 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Payment Methods</h2>
                            <p className="text-gray-500">Manage your saved payment methods</p>
                        </div>
                        <button className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-xl border border-blue-200 transition-all duration-200 cursor-pointer">
                            <Plus className="w-4 h-4" />
                            <span className="font-medium">Add New</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-5 border border-gray-200">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <CreditCard className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">Credit Card</h4>
                                    <p className="text-sm text-gray-500 mt-1">**** **** **** 4242</p>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <span className="text-sm text-green-600 font-medium">Primary</span>
                                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium cursor-pointer">
                                    Edit
                                </button>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-5 border border-gray-200">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Wallet className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">PayPal</h4>
                                    <p className="text-sm text-gray-500 mt-1">user@example.com</p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium cursor-pointer">
                                    Set as Primary
                                </button>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-5 border border-gray-200">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <DollarSign className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">Bank Transfer</h4>
                                    <p className="text-sm text-gray-500 mt-1">Account ending in 9876</p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium cursor-pointer">
                                    Verify Account
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-white rounded-2xl shadow-lg shadow-blue-500/5 border border-gray-200/50 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
                            <p className="text-gray-500">Your latest payment activities</p>
                        </div>
                        <button className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
                            View All
                        </button>
                    </div>

                    <div className="space-y-4">
                        {payments.slice(0, 3).map((payment) => (
                            <div key={payment._id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors">
                                <div className="flex items-center space-x-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getStatusColor(payment.status).split(' ')[0]}`}>
                                        {getStatusIcon(payment.status)}
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900">{payment.description}</h4>
                                        <p className="text-sm text-gray-500">{payment.invoiceNumber} • {formatDate(payment.date)}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-900">{formatCurrency(payment.amount)}</p>
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(payment.status)}`}>
                                        {payment.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentsPage;