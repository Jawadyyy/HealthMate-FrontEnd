"use client";

import React, { useState, useEffect } from 'react';
import { CreditCard, Download, Filter, Search, Receipt, CheckCircle, Clock, XCircle, Eye, DollarSign, Calendar, User } from 'lucide-react';

interface Invoice {
    _id: string;
    patientId: any;
    doctorId: any;
    serviceName: string;
    amount: number;
    status: 'paid' | 'pending' | 'failed' | 'refunded';
    paymentMethod?: string;
    transactionId?: string;
    createdAt: string;
    updatedAt: string;
}

interface PaymentModalProps {
    invoice: Invoice | null;
    isOpen: boolean;
    onClose: () => void;
    onPaymentSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ invoice, isOpen, onClose, onPaymentSuccess }) => {
    const [selectedMethod, setSelectedMethod] = useState('Credit Card');
    const [processing, setProcessing] = useState(false);
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [cardName, setCardName] = useState('');

    const handlePayment = async () => {
        if (!invoice) return;

        setProcessing(true);
        try {
            const token = localStorage.getItem('token');

            const response = await fetch(`http://localhost:3000/billing/invoice/payment/${invoice._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    status: 'paid',
                    paymentMethod: selectedMethod,
                    transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                })
            });

            if (response.ok) {
                alert('Payment successful!');
                onPaymentSuccess();
                onClose();
            } else {
                const error = await response.json();
                alert(`Payment failed: ${error.message || 'Please try again'}`);
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert('Payment failed. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    if (!isOpen || !invoice) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                    <h2 className="text-2xl font-bold">Complete Payment</h2>
                    <p className="text-blue-100 mt-2">Invoice #{invoice._id.slice(-8)}</p>
                </div>

                <div className="p-6">
                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600">Service</span>
                            <span className="font-medium text-gray-900">{invoice.serviceName}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                            <span className="text-gray-900 font-bold">Total Amount</span>
                            <span className="text-2xl font-bold text-blue-600">${invoice.amount.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
                        <div className="space-y-3">
                            <label className="flex items-center p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors" style={{ borderColor: selectedMethod === 'Credit Card' ? '#2563eb' : '#e5e7eb' }}>
                                <input
                                    type="radio"
                                    name="payment-method"
                                    value="Credit Card"
                                    checked={selectedMethod === 'Credit Card'}
                                    onChange={(e) => setSelectedMethod(e.target.value)}
                                    className="w-4 h-4 text-blue-600"
                                />
                                <CreditCard className="w-5 h-5 ml-3 text-gray-600" />
                                <span className="ml-3 font-medium text-gray-900">Credit / Debit Card</span>
                            </label>
                            <label className="flex items-center p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors" style={{ borderColor: selectedMethod === 'Cash' ? '#2563eb' : '#e5e7eb' }}>
                                <input
                                    type="radio"
                                    name="payment-method"
                                    value="Cash"
                                    checked={selectedMethod === 'Cash'}
                                    onChange={(e) => setSelectedMethod(e.target.value)}
                                    className="w-4 h-4 text-blue-600"
                                />
                                <DollarSign className="w-5 h-5 ml-3 text-gray-600" />
                                <span className="ml-3 font-medium text-gray-900">Cash</span>
                            </label>
                        </div>
                    </div>

                    {selectedMethod === 'Credit Card' && (
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                                <input
                                    type="text"
                                    placeholder="1234 5678 9012 3456"
                                    value={cardNumber}
                                    onChange={(e) => setCardNumber(e.target.value)}
                                    maxLength={19}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    value={cardName}
                                    onChange={(e) => setCardName(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                                    <input
                                        type="text"
                                        placeholder="MM/YY"
                                        value={expiryDate}
                                        onChange={(e) => setExpiryDate(e.target.value)}
                                        maxLength={5}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                                    <input
                                        type="text"
                                        placeholder="123"
                                        value={cvv}
                                        onChange={(e) => setCvv(e.target.value)}
                                        maxLength={4}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={processing}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handlePayment}
                            disabled={processing || (selectedMethod === 'Credit Card' && (!cardNumber || !cardName || !expiryDate || !cvv))}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? 'Processing...' : `Pay $${invoice.amount.toFixed(2)}`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PaymentsPage = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<'all' | 'paid' | 'pending' | 'failed'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [totalPaid, setTotalPaid] = useState(0);
    const [totalPending, setTotalPending] = useState(0);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [userId, setUserId] = useState('');
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedRole = localStorage.getItem('role');

        if (storedToken) {
            try {
                // Decode JWT to get user ID
                const tokenParts = storedToken.split('.');
                if (tokenParts.length === 3) {
                    const payload = JSON.parse(atob(tokenParts[1]));
                    setUserId(payload.id || payload.userId || payload.sub);
                    setUserRole(storedRole || payload.role || 'patient');
                    console.log('User loaded:', { userId: payload.id, role: storedRole || payload.role });
                } else {
                    console.error('Invalid token format');
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error decoding token:', error);
                setLoading(false);
            }
        } else {
            console.error('No token found in localStorage');
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (userId && userRole) {
            fetchInvoices();
        }
    }, [userId, userRole]);

    useEffect(() => {
        filterInvoices();
        calculateTotals();
    }, [activeFilter, searchTerm, invoices]);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
                console.error('No token found');
                setLoading(false);
                return;
            }

            // Choose endpoint based on user role
            const endpoint = userRole === 'doctor'
                ? `http://localhost:3000/billing/invoice/doctor/${userId}`
                : `http://localhost:3000/billing/invoice/patient/${userId}`;

            console.log('Fetching from:', endpoint);
            console.log('User ID:', userId);
            console.log('User Role:', userRole);

            const response = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            console.log('Response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('Raw response data:', data);
                console.log('Data type:', typeof data);
                console.log('Is array?', Array.isArray(data));

                // Handle different response formats
                let invoicesArray = [];
                if (Array.isArray(data)) {
                    invoicesArray = data;
                } else if (data.data && Array.isArray(data.data)) {
                    invoicesArray = data.data;
                } else if (data.invoices && Array.isArray(data.invoices)) {
                    invoicesArray = data.invoices;
                }

                console.log('Setting invoices:', invoicesArray);
                setInvoices(invoicesArray);
            } else {
                const error = await response.json();
                console.error('Failed to fetch invoices:', response.status, error);
                alert(`Failed to fetch invoices: ${error.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error fetching invoices:', error);
            alert(`Error: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    const filterInvoices = () => {
        let filtered = [...invoices];

        if (activeFilter !== 'all') {
            filtered = filtered.filter(invoice => invoice.status === activeFilter);
        }

        if (searchTerm) {
            filtered = filtered.filter(invoice =>
                invoice._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                invoice.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredInvoices(filtered);
    };

    const calculateTotals = () => {
        const paid = invoices
            .filter(p => p.status === 'paid')
            .reduce((sum, p) => sum + p.amount, 0);

        const pending = invoices
            .filter(p => p.status === 'pending')
            .reduce((sum, p) => sum + p.amount, 0);

        setTotalPaid(paid);
        setTotalPending(pending);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-700';
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'failed': return 'bg-red-100 text-red-700';
            case 'refunded': return 'bg-blue-100 text-blue-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'paid': return <CheckCircle className="w-4 h-4" />;
            case 'pending': return <Clock className="w-4 h-4" />;
            case 'failed': return <XCircle className="w-4 h-4" />;
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

    const handlePayNow = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setShowPaymentModal(true);
    };

    const handleViewInvoice = async (invoice: Invoice) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/billing/invoice/${invoice._id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Invoice details:', data);
                alert(`Invoice Details:\n\nService: ${data.serviceName}\nAmount: $${data.amount}\nStatus: ${data.status}`);
            }
        } catch (error) {
            console.error('Error fetching invoice details:', error);
        }
    };

    const handleDownloadInvoice = (invoice: Invoice) => {
        const invoiceData = `
INVOICE
Invoice #: ${invoice._id.slice(-8)}
Service: ${invoice.serviceName}
Amount: ${formatCurrency(invoice.amount)}
Status: ${invoice.status}
Date: ${formatDate(invoice.createdAt)}
${invoice.paymentMethod ? `Payment Method: ${invoice.paymentMethod}` : ''}
${invoice.transactionId ? `Transaction ID: ${invoice.transactionId}` : ''}
        `;

        const blob = new Blob([invoiceData], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${invoice._id.slice(-8)}.txt`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handlePaymentSuccess = () => {
        fetchInvoices();
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
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Billing & Payments</h1>
                            <p className="text-gray-500 mt-2">Manage your bills and payment history</p>
                        </div>
                    </div>

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
                                    <p className="text-3xl font-bold text-blue-900 mt-2">{invoices.length}</p>
                                </div>
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                                    <Receipt className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 mb-8">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by invoice ID or service..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Filter className="w-5 h-5 text-gray-500" />
                            <div className="flex flex-wrap gap-2">
                                {(['all', 'paid', 'pending', 'failed'] as const).map((filter) => (
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

                <div className="bg-white rounded-2xl shadow-lg shadow-blue-500/5 border border-gray-200/50 overflow-hidden mb-8">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/80 border-b border-gray-200/50">
                                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Invoice #</th>
                                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Service</th>
                                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Date</th>
                                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Amount</th>
                                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Status</th>
                                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInvoices.length > 0 ? (
                                    filteredInvoices.map((invoice) => (
                                        <tr key={invoice._id} className="border-b border-gray-200/50 hover:bg-gray-50/50 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="font-medium text-gray-900">#{invoice._id.slice(-8)}</div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="text-gray-900">{invoice.serviceName}</div>
                                                {invoice.paymentMethod && (
                                                    <div className="text-sm text-gray-500 mt-1">{invoice.paymentMethod}</div>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center">
                                                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                                    <span className="text-gray-700">{formatDate(invoice.createdAt)}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="font-bold text-gray-900">{formatCurrency(invoice.amount)}</div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center">
                                                    <span className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
                                                        {getStatusIcon(invoice.status)}
                                                        <span>{invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}</span>
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => handleViewInvoice(invoice)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownloadInvoice(invoice)}
                                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                                                        title="Download Invoice"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                    {invoice.status === 'pending' && (
                                                        <button
                                                            onClick={() => handlePayNow(invoice)}
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
                                        <td colSpan={6} className="py-16 text-center">
                                            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                                <Receipt className="w-12 h-12 text-blue-600" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">No invoices found</h3>
                                            <p className="text-gray-500 max-w-md mx-auto mb-8">
                                                {searchTerm
                                                    ? 'No invoices match your search criteria'
                                                    : 'You have no invoices yet'}
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <PaymentModal
                invoice={selectedInvoice}
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onPaymentSuccess={handlePaymentSuccess}
            />
        </div>
    );
};

export default PaymentsPage;