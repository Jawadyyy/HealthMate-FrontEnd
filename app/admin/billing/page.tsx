"use client";

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, DollarSign, FileText, Download, Filter, 
  MoreVertical, Eye, CheckCircle, XCircle, AlertCircle, 
  Search, Plus, RefreshCw, Calendar, User, ChevronRight,
  Shield, LogOut, HelpCircle, BarChart3, UserPlus, Stethoscope,
  Bell, TrendingUp, ArrowUpDown, Printer, Clock, TrendingDown,
  Percent, Receipt, Wallet
} from 'lucide-react';
import api from '@/lib/api/api';
import { useRouter } from 'next/navigation';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';

// ========== TYPES ==========
interface Invoice {
  _id: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  date: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  type: 'consultation' | 'procedure' | 'medication' | 'test' | 'other';
  items: InvoiceItem[];
  createdAt: string;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface Payment {
  _id: string;
  invoiceId: string;
  invoiceNumber: string;
  patientName: string;
  date: string;
  amount: number;
  method: 'credit_card' | 'cash' | 'insurance' | 'bank_transfer' | 'online';
  status: 'completed' | 'pending' | 'failed';
  transactionId: string;
}

interface BillingStats {
  totalRevenue: number;
  pendingAmount: number;
  overdueAmount: number;
  paidAmount: number;
  invoicesCount: number;
  paymentsCount: number;
  averagePaymentTime: number;
  revenueTrend: 'up' | 'down';
}

interface FilterState {
  status: string;
  type: string;
  dateRange: string;
  amountRange: string;
}

// ========== MOCK DATA ==========
const MOCK_INVOICES: Invoice[] = [
  {
    _id: 'inv001',
    invoiceNumber: 'INV-2024-001',
    patientId: 'p001',
    patientName: 'John Smith',
    date: '2024-01-15',
    dueDate: '2024-01-30',
    amount: 450.00,
    paidAmount: 450.00,
    status: 'paid',
    type: 'consultation',
    items: [
      { description: 'Cardiology Consultation', quantity: 1, unitPrice: 200.00, amount: 200.00 },
      { description: 'ECG Test', quantity: 1, unitPrice: 150.00, amount: 150.00 },
      { description: 'Prescription Medication', quantity: 1, unitPrice: 100.00, amount: 100.00 }
    ],
    createdAt: '2024-01-15'
  },
  {
    _id: 'inv002',
    invoiceNumber: 'INV-2024-002',
    patientId: 'p002',
    patientName: 'Emily Johnson',
    date: '2024-01-18',
    dueDate: '2024-02-02',
    amount: 320.50,
    paidAmount: 0,
    status: 'pending',
    type: 'procedure',
    items: [
      { description: 'Minor Surgery Procedure', quantity: 1, unitPrice: 250.00, amount: 250.00 },
      { description: 'Anesthesia', quantity: 1, unitPrice: 70.50, amount: 70.50 }
    ],
    createdAt: '2024-01-18'
  },
  {
    _id: 'inv003',
    invoiceNumber: 'INV-2024-003',
    patientId: 'p003',
    patientName: 'Michael Brown',
    date: '2024-01-10',
    dueDate: '2024-01-25',
    amount: 180.00,
    paidAmount: 0,
    status: 'overdue',
    type: 'test',
    items: [
      { description: 'Blood Test Panel', quantity: 1, unitPrice: 120.00, amount: 120.00 },
      { description: 'Urine Analysis', quantity: 1, unitPrice: 60.00, amount: 60.00 }
    ],
    createdAt: '2024-01-10'
  },
  {
    _id: 'inv004',
    invoiceNumber: 'INV-2024-004',
    patientId: 'p004',
    patientName: 'Sophia Davis',
    date: '2024-01-20',
    dueDate: '2024-02-04',
    amount: 95.00,
    paidAmount: 95.00,
    status: 'paid',
    type: 'consultation',
    items: [
      { description: 'General Consultation', quantity: 1, unitPrice: 75.00, amount: 75.00 },
      { description: 'Follow-up Visit', quantity: 1, unitPrice: 20.00, amount: 20.00 }
    ],
    createdAt: '2024-01-20'
  },
  {
    _id: 'inv005',
    invoiceNumber: 'INV-2024-005',
    patientId: 'p005',
    patientName: 'David Wilson',
    date: '2024-01-05',
    dueDate: '2024-01-20',
    amount: 520.00,
    paidAmount: 0,
    status: 'cancelled',
    type: 'other',
    items: [
      { description: 'MRI Scan', quantity: 1, unitPrice: 450.00, amount: 450.00 },
      { description: 'Radiology Report', quantity: 1, unitPrice: 70.00, amount: 70.00 }
    ],
    createdAt: '2024-01-05'
  }
];

const MOCK_PAYMENTS: Payment[] = [
  {
    _id: 'pay001',
    invoiceId: 'inv001',
    invoiceNumber: 'INV-2024-001',
    patientName: 'John Smith',
    date: '2024-01-16',
    amount: 450.00,
    method: 'credit_card',
    status: 'completed',
    transactionId: 'TXN-2024-001'
  },
  {
    _id: 'pay002',
    invoiceId: 'inv004',
    invoiceNumber: 'INV-2024-004',
    patientName: 'Sophia Davis',
    date: '2024-01-22',
    amount: 95.00,
    method: 'cash',
    status: 'completed',
    transactionId: 'TXN-2024-002'
  },
  {
    _id: 'pay003',
    invoiceId: 'inv002',
    invoiceNumber: 'INV-2024-002',
    patientName: 'Emily Johnson',
    date: '2024-01-25',
    amount: 150.00,
    method: 'insurance',
    status: 'pending',
    transactionId: 'TXN-2024-003'
  }
];

const MOCK_STATS: BillingStats = {
  totalRevenue: 28560.50,
  pendingAmount: 470.50,
  overdueAmount: 180.00,
  paidAmount: 27910.00,
  invoicesCount: 156,
  paymentsCount: 128,
  averagePaymentTime: 4.2,
  revenueTrend: 'up'
};

// ========== MAIN COMPONENT ==========
const BillingModule = () => {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<BillingStats>(MOCK_STATS);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'invoices' | 'payments'>('invoices');
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    type: 'all',
    dateRange: 'all',
    amountRange: 'all'
  });

  // Mock admin data
  const adminData = {
    _id: '1',
    name: 'Alex Morgan',
    email: 'alex@healthmate.com',
    role: 'admin'
  };

  useEffect(() => {
    loadBillingData();
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [searchQuery, filters, invoices]);

  const loadBillingData = async () => {
    try {
      setLoading(true);
      const [invoicesRes, paymentsRes, statsRes] = await Promise.all([
        api.get('/billing/invoices'),
        api.get('/billing/payments'),
        api.get('/billing/stats')
      ]);

      setInvoices(invoicesRes.data.data || invoicesRes.data || MOCK_INVOICES);
      setFilteredInvoices(invoicesRes.data.data || invoicesRes.data || MOCK_INVOICES);
      setPayments(paymentsRes.data.data || paymentsRes.data || MOCK_PAYMENTS);
      setStats(statsRes.data.data || statsRes.data || MOCK_STATS);
    } catch (error) {
      console.error('Error loading billing data:', error);
      setInvoices(MOCK_INVOICES);
      setFilteredInvoices(MOCK_INVOICES);
      setPayments(MOCK_PAYMENTS);
      setStats(MOCK_STATS);
    } finally {
      setLoading(false);
    }
  };

  const filterInvoices = () => {
    let filtered = [...invoices];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(invoice =>
        invoice.patientName.toLowerCase().includes(query) ||
        invoice.invoiceNumber.toLowerCase().includes(query) ||
        invoice._id.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === filters.status);
    }

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(invoice => invoice.type === filters.type);
    }

    setFilteredInvoices(filtered);
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleLogout = () => {
    ['token', 'role', 'isLoggedIn'].forEach(key => localStorage.removeItem(key));
    router.push('/auth/admin/login');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: Invoice['status']) => {
    const colors = {
      paid: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      overdue: 'bg-red-100 text-red-700',
      cancelled: 'bg-gray-100 text-gray-700'
    };
    return colors[status];
  };

  const getPaymentMethodIcon = (method: Payment['method']) => {
    const icons = {
      credit_card: CreditCard,
      cash: DollarSign,
      insurance: FileText,
      bank_transfer: TrendingUp,
      online: Wallet
    };
    return icons[method];
  };

  const getPaymentStatusColor = (status: Payment['status']) => {
    const colors = {
      completed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      failed: 'bg-red-100 text-red-700'
    };
    return colors[status];
  };

  if (loading && !invoices.length) {
    return <LoadingScreen message="Loading billing data..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50/50 via-white to-purple-50/30">
      <Sidebar pendingApprovals={3} activeRoute="/admin/billing" />
      
      <div className="ml-72">
        <Header 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          adminData={adminData}
          showTimeRange={false}
          searchPlaceholder="Search invoices, patients, or invoice numbers..."
        />
        
        <main className="p-8">
          {/* Breadcrumb & Actions */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900">Billing & Payments</h1>
              <span className="text-xs font-medium bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                {formatCurrency(stats.totalRevenue)}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => router.push('/admin/billing/new')}
                className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg shadow-purple-500/30 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">Create Invoice</span>
              </button>
              <ActionButton icon={Download} label="Export" />
              <ActionButton icon={RefreshCw} label="Refresh" onClick={loadBillingData} />
              <ActionButton icon={Printer} label="Print" />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={DollarSign}
              label="Total Revenue"
              value={stats.totalRevenue}
              change="+12.5%"
              color="green"
              isCurrency={true}
            />
            <StatCard
              icon={Clock}
              label="Pending Amount"
              value={stats.pendingAmount}
              change="+5.2%"
              color="yellow"
              isCurrency={true}
            />
            <StatCard
              icon={AlertCircle}
              label="Overdue Amount"
              value={stats.overdueAmount}
              change="-8.1%"
              color="red"
              isCurrency={true}
            />
            <StatCard
              icon={FileText}
              label="Total Invoices"
              value={stats.invoicesCount}
              change="+15"
              color="purple"
            />
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mb-8 bg-white rounded-2xl shadow-lg shadow-purple-500/5 border border-gray-200/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <button 
                  onClick={() => setFilters({ 
                    status: 'all', 
                    type: 'all', 
                    dateRange: 'all', 
                    amountRange: 'all' 
                  })}
                  className="text-sm text-purple-600 hover:text-purple-700 cursor-pointer"
                >
                  Clear All
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Status</label>
                  <div className="flex flex-wrap gap-2">
                    {['all', 'paid', 'pending', 'overdue', 'cancelled'].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleFilterChange('status', status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                          filters.status === status
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Type</label>
                  <div className="flex flex-wrap gap-2">
                    {['all', 'consultation', 'procedure', 'medication', 'test', 'other'].map((type) => (
                      <button
                        key={type}
                        onClick={() => handleFilterChange('type', type)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                          filters.type === type
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Date Range</label>
                  <div className="flex flex-wrap gap-2">
                    {['all', 'today', 'week', 'month', 'quarter'].map((range) => (
                      <button
                        key={range}
                        onClick={() => handleFilterChange('dateRange', range)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                          filters.dateRange === range
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {range.charAt(0).toUpperCase() + range.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Amount Range</label>
                  <div className="flex flex-wrap gap-2">
                    {['all', '0-100', '100-500', '500-1000', '1000+'].map((range) => (
                      <button
                        key={range}
                        onClick={() => handleFilterChange('amountRange', range)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                          filters.amountRange === range
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="mb-6">
            <div className="flex space-x-8 border-b border-gray-200/50">
              {(['invoices', 'payments'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 font-medium relative transition-all duration-200 cursor-pointer ${
                    activeTab === tab
                      ? 'text-purple-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab === 'invoices' ? 'All Invoices' : 'Payment History'}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          {activeTab === 'invoices' ? (
            <InvoicesTable
              invoices={filteredInvoices}
              selectedInvoice={selectedInvoice}
              setSelectedInvoice={setSelectedInvoice}
              formatDate={formatDate}
              formatCurrency={formatCurrency}
              getStatusColor={getStatusColor}
            />
          ) : (
            <PaymentsTable
              payments={payments}
              formatDate={formatDate}
              formatCurrency={formatCurrency}
              getPaymentMethodIcon={getPaymentMethodIcon}
              getPaymentStatusColor={getPaymentStatusColor}
            />
          )}

          {selectedInvoice && (
            <InvoiceDetailModal
              invoice={selectedInvoice}
              onClose={() => setSelectedInvoice(null)}
              formatDate={formatDate}
              formatCurrency={formatCurrency}
              getStatusColor={getStatusColor}
            />
          )}
        </main>
      </div>
    </div>
  );
};

// ========== STATS CARD COMPONENT ==========
const StatCard: React.FC<{
  icon: React.ElementType;
  label: string;
  value: number;
  change: string;
  color: 'green' | 'yellow' | 'red' | 'purple';
  isCurrency?: boolean;
}> = ({ icon: Icon, label, value, change, color, isCurrency = false }) => {
  const colorConfig = {
    green: { bg: 'from-green-50 to-green-100/50 border-green-200/50', text: 'text-green-600' },
    yellow: { bg: 'from-yellow-50 to-yellow-100/50 border-yellow-200/50', text: 'text-yellow-600' },
    red: { bg: 'from-red-50 to-red-100/50 border-red-200/50', text: 'text-red-600' },
    purple: { bg: 'from-purple-50 to-purple-100/50 border-purple-200/50', text: 'text-purple-600' }
  };

  const formattedValue = isCurrency 
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
    : value;

  return (
    <div className={`bg-white rounded-2xl p-6 border border-gray-200/50 shadow-sm shadow-purple-500/5 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorConfig[color].bg} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${colorConfig[color].text}`} />
        </div>
        <span className={`text-sm font-medium px-3 py-1 rounded-full ${change.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {change.startsWith('+') ? '↑' : '↓'} {change}
        </span>
      </div>
      <h3 className="text-3xl font-bold text-gray-800 mb-1">{formattedValue}</h3>
      <p className="text-gray-500 text-sm">{label}</p>
    </div>
  );
};

// ========== ACTION BUTTON COMPONENT ==========
const ActionButton: React.FC<{ 
  icon: React.ElementType; 
  label: string;
  onClick?: () => void;
}> = ({ icon: Icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className="flex items-center space-x-2 px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-xl border border-gray-200 transition-all duration-200 cursor-pointer"
  >
    <Icon className="w-4 h-4" />
    <span className="text-sm font-medium">{label}</span>
  </button>
);

// ========== INVOICES TABLE COMPONENT ==========
const InvoicesTable: React.FC<{
  invoices: Invoice[];
  selectedInvoice: Invoice | null;
  setSelectedInvoice: (invoice: Invoice | null) => void;
  formatDate: (date: string) => string;
  formatCurrency: (amount: number) => string;
  getStatusColor: (status: Invoice['status']) => string;
}> = ({ invoices, selectedInvoice, setSelectedInvoice, formatDate, formatCurrency, getStatusColor }) => (
  <div className="bg-white rounded-2xl border border-gray-200/50 shadow-sm shadow-purple-500/5 overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-200/50 flex items-center justify-between">
      <div>
        <h2 className="text-xl font-bold text-gray-800">All Invoices</h2>
        <p className="text-gray-500 text-sm mt-1">Manage and review all invoices and billing information</p>
      </div>
      <div className="flex items-center space-x-2">
        <button className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer">
          <ArrowUpDown className="w-4 h-4 inline mr-1" />
          Sort
        </button>
      </div>
    </div>
    
    <div className="p-6">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200/50">
              <th className="text-left py-4 px-6 text-gray-500 font-medium text-sm">Invoice #</th>
              <th className="text-left py-4 px-6 text-gray-500 font-medium text-sm">Patient</th>
              <th className="text-left py-4 px-6 text-gray-500 font-medium text-sm">Date</th>
              <th className="text-left py-4 px-6 text-gray-500 font-medium text-sm">Due Date</th>
              <th className="text-left py-4 px-6 text-gray-500 font-medium text-sm">Amount</th>
              <th className="text-left py-4 px-6 text-gray-500 font-medium text-sm">Status</th>
              <th className="text-left py-4 px-6 text-gray-500 font-medium text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length > 0 ? (
              invoices.map((invoice) => {
                const paidPercentage = (invoice.paidAmount / invoice.amount) * 100;
                return (
                  <tr 
                    key={invoice._id} 
                    className={`border-b border-gray-100 hover:bg-purple-50/30 transition-colors duration-150 ${
                      selectedInvoice?._id === invoice._id ? 'bg-purple-50' : ''
                    }`}
                  >
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-gray-800">{invoice.invoiceNumber}</p>
                        <p className="text-sm text-gray-500">{invoice.type}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {invoice.patientName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{invoice.patientName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-gray-700 font-medium">{formatDate(invoice.date)}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-gray-700 font-medium">{formatDate(invoice.dueDate)}</p>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-gray-800">{formatCurrency(invoice.amount)}</p>
                        {paidPercentage > 0 && (
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full" 
                              style={{ width: `${Math.min(paidPercentage, 100)}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                        {invoice.status === 'overdue' && (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => setSelectedInvoice(invoice)}
                          className="text-purple-600 hover:text-purple-800 font-medium text-sm transition-colors duration-200 cursor-pointer"
                        >
                          View Details →
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <div className="text-gray-400">
                    <FileText className="w-12 h-12 mx-auto mb-4" />
                    <p className="text-lg font-medium">No invoices found</p>
                    <p className="text-sm mt-1">Try adjusting your search or filters</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>

    {/* Table Footer */}
    <div className="px-6 py-4 border-t border-gray-200/50 flex items-center justify-between">
      <p className="text-gray-500 text-sm">
        Showing <span className="font-medium text-gray-700">{invoices.length}</span> of{' '}
        <span className="font-medium text-gray-700">{invoices.length}</span> invoices
      </p>
      <div className="flex items-center space-x-2">
        <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors duration-200 cursor-pointer">
          ← Previous
        </button>
        <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors duration-200 cursor-pointer">
          Next →
        </button>
      </div>
    </div>
  </div>
);

// ========== PAYMENTS TABLE COMPONENT ==========
const PaymentsTable: React.FC<{
  payments: Payment[];
  formatDate: (date: string) => string;
  formatCurrency: (amount: number) => string;
  getPaymentMethodIcon: (method: Payment['method']) => React.ElementType;
  getPaymentStatusColor: (status: Payment['status']) => string;
}> = ({ payments, formatDate, formatCurrency, getPaymentMethodIcon, getPaymentStatusColor }) => (
  <div className="bg-white rounded-2xl border border-gray-200/50 shadow-sm shadow-purple-500/5 overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-200/50 flex items-center justify-between">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Payment History</h2>
        <p className="text-gray-500 text-sm mt-1">View and manage all payment transactions</p>
      </div>
      <div className="flex items-center space-x-2">
        <button className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer">
          <ArrowUpDown className="w-4 h-4 inline mr-1" />
          Sort
        </button>
      </div>
    </div>
    
    <div className="p-6">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200/50">
              <th className="text-left py-4 px-6 text-gray-500 font-medium text-sm">Transaction ID</th>
              <th className="text-left py-4 px-6 text-gray-500 font-medium text-sm">Patient</th>
              <th className="text-left py-4 px-6 text-gray-500 font-medium text-sm">Invoice #</th>
              <th className="text-left py-4 px-6 text-gray-500 font-medium text-sm">Date</th>
              <th className="text-left py-4 px-6 text-gray-500 font-medium text-sm">Amount</th>
              <th className="text-left py-4 px-6 text-gray-500 font-medium text-sm">Method</th>
              <th className="text-left py-4 px-6 text-gray-500 font-medium text-sm">Status</th>
              <th className="text-left py-4 px-6 text-gray-500 font-medium text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.length > 0 ? (
              payments.map((payment) => {
                const MethodIcon = getPaymentMethodIcon(payment.method);
                return (
                  <tr 
                    key={payment._id} 
                    className="border-b border-gray-100 hover:bg-purple-50/30 transition-colors duration-150"
                  >
                    <td className="py-4 px-6">
                      <p className="font-medium text-gray-800">{payment.transactionId}</p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {payment.patientName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{payment.patientName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-purple-600 font-medium">{payment.invoiceNumber}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-gray-700 font-medium">{formatDate(payment.date)}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-medium text-gray-800">{formatCurrency(payment.amount)}</p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <MethodIcon className="w-5 h-5 text-gray-600" />
                        </div>
                        <span className="text-sm text-gray-600 capitalize">
                          {payment.method.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${getPaymentStatusColor(payment.status)}`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button className="text-purple-600 hover:text-purple-800 font-medium text-sm transition-colors duration-200 cursor-pointer">
                          View Details →
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="py-12 text-center">
                  <div className="text-gray-400">
                    <DollarSign className="w-12 h-12 mx-auto mb-4" />
                    <p className="text-lg font-medium">No payments found</p>
                    <p className="text-sm mt-1">Payment history will appear here</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>

    {/* Table Footer */}
    <div className="px-6 py-4 border-t border-gray-200/50 flex items-center justify-between">
      <p className="text-gray-500 text-sm">
        Showing <span className="font-medium text-gray-700">{payments.length}</span> of{' '}
        <span className="font-medium text-gray-700">{payments.length}</span> payments
      </p>
      <div className="flex items-center space-x-2">
        <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors duration-200 cursor-pointer">
          ← Previous
        </button>
        <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors duration-200 cursor-pointer">
          Next →
        </button>
      </div>
    </div>
  </div>
);

// ========== INVOICE DETAIL MODAL COMPONENT ==========
const InvoiceDetailModal: React.FC<{
  invoice: Invoice;
  onClose: () => void;
  formatDate: (date: string) => string;
  formatCurrency: (amount: number) => string;
  getStatusColor: (status: Invoice['status']) => string;
}> = ({ invoice, onClose, formatDate, formatCurrency, getStatusColor }) => {
  const paidPercentage = (invoice.paidAmount / invoice.amount) * 100;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Invoice Details</h2>
              <p className="text-gray-500">{invoice.invoiceNumber}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer"
            >
              <XCircle className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          {/* Invoice Summary */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/50 rounded-xl p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Patient</p>
                <p className="font-bold text-lg text-gray-900">{invoice.patientName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                <p className="font-bold text-2xl text-gray-900">{formatCurrency(invoice.amount)}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Payment Progress</span>
                <span>{formatCurrency(invoice.paidAmount)} of {formatCurrency(invoice.amount)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-green-600 h-2.5 rounded-full" 
                  style={{ width: `${Math.min(paidPercentage, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Billing Details */}
            <div className="bg-gray-50/50 border border-gray-200/50 rounded-xl p-5">
              <h3 className="font-medium text-gray-900 mb-4">Billing Details</h3>
              <div className="space-y-3">
                <DetailRow label="Invoice Number" value={invoice.invoiceNumber} />
                <DetailRow label="Invoice Date" value={formatDate(invoice.date)} />
                <DetailRow label="Due Date" value={formatDate(invoice.dueDate)} />
                <DetailRow label="Invoice Type" value={invoice.type.charAt(0).toUpperCase() + invoice.type.slice(1)} />
              </div>
            </div>

            {/* Amount Summary */}
            <div className="bg-gray-50/50 border border-gray-200/50 rounded-xl p-5">
              <h3 className="font-medium text-gray-900 mb-4">Amount Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-200/50">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">{formatCurrency(invoice.amount)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200/50">
                  <span className="text-gray-600">Amount Paid</span>
                  <span className="font-medium text-green-600">{formatCurrency(invoice.paidAmount)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Balance Due</span>
                  <span className="font-bold text-lg text-gray-900">
                    {formatCurrency(invoice.amount - invoice.paidAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h3 className="font-medium text-gray-900">Line Items</h3>
            </div>
            <div className="p-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Description</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Quantity</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Unit Price</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100 last:border-0">
                      <td className="py-3 px-4">
                        <p className="text-gray-900">{item.description}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-gray-900">{item.quantity}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-gray-900">{formatCurrency(item.unitPrice)}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900">{formatCurrency(item.amount)}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="py-3 px-4 text-right font-medium">Total</td>
                    <td className="py-3 px-4 font-bold text-lg">{formatCurrency(invoice.amount)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between border-t border-gray-200 pt-6">
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200 transition-all duration-200 cursor-pointer">
                <Download className="w-4 h-4 inline mr-2" />
                Download PDF
              </button>
              <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200 transition-all duration-200 cursor-pointer">
                <Printer className="w-4 h-4 inline mr-2" />
                Print Invoice
              </button>
            </div>
            <div className="flex items-center space-x-3">
              {invoice.status !== 'paid' && (
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 cursor-pointer">
                  Mark as Cancelled
                </button>
              )}
              <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg shadow-purple-500/30 cursor-pointer">
                <DollarSign className="w-4 h-4 inline mr-2" />
                Record Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-200/50 last:border-0">
    <span className="text-sm text-gray-600">{label}</span>
    <span className="font-medium text-gray-900">{value}</span>
  </div>
);

// ========== LOADING SCREEN ==========
const LoadingScreen: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-50 to-gray-50">
    <div className="text-center">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-purple-100 rounded-full"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="mt-6 text-gray-600 font-medium">{message}</p>
      <p className="mt-2 text-sm text-gray-500">Please wait a moment</p>
    </div>
  </div>
);

export default BillingModule;