"use client";

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, DollarSign, FileText, Download, Filter, 
  MoreVertical, Eye, CheckCircle, XCircle, AlertCircle, 
  Search, Plus, RefreshCw, Calendar, ChevronRight,
  ArrowUpDown, Printer, Clock, TrendingDown,
  Receipt, Wallet, File
} from 'lucide-react';
import api from '@/lib/api/api';
import { useRouter } from 'next/navigation';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';

interface Invoice {
  _id: string; invoiceNumber: string; patientId: string; patientName: string; doctorId?: string;
  doctorName?: string; date: string; dueDate: string; amount: number; paidAmount: number;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled'; type: 'consultation' | 'procedure' | 'medication' | 'test' | 'other';
  items: InvoiceItem[]; createdAt: string; paymentMethod?: string; notes?: string;
}

interface InvoiceItem { description: string; quantity: number; unitPrice: number; amount: number; }

interface Payment {
  _id: string; invoiceId: string; invoiceNumber: string; patientName: string; date: string;
  amount: number; method: 'credit_card' | 'cash' | 'insurance' | 'bank_transfer' | 'online';
  status: 'completed' | 'pending' | 'failed'; transactionId: string;
}

interface BillingStats {
  totalRevenue: number; pendingAmount: number; overdueAmount: number; paidAmount: number;
  invoicesCount: number; paymentsCount: number; averagePaymentTime: number; revenueTrend: 'up' | 'down';
}

interface FilterState { status: string; type: string; dateRange: string; amountRange: string; }

const BillingModule = () => {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<BillingStats>({
    totalRevenue: 0, pendingAmount: 0, overdueAmount: 0, paidAmount: 0,
    invoicesCount: 0, paymentsCount: 0, averagePaymentTime: 0, revenueTrend: 'up'
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'invoices' | 'payments'>('invoices');
  const [filters, setFilters] = useState<FilterState>({ status: 'all', type: 'all', dateRange: 'all', amountRange: 'all' });
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');

  const adminData = { _id: '1', name: 'Alex Morgan', email: 'alex@healthmate.com', role: 'admin' };

  useEffect(() => { loadBillingData(); }, []);
  useEffect(() => { filterInvoices(); }, [searchQuery, filters, invoices]);

  const loadBillingData = async () => {
    try {
      setLoading(true);
      
      // Load analytics data from API
      try {
        const revenueResponse = await api.get('/analytics/revenue');
        if (revenueResponse.data && revenueResponse.data.data) {
          const revenueData = revenueResponse.data.data;
          setStats({
            totalRevenue: revenueData.totalRevenue || 0,
            pendingAmount: revenueData.pendingAmount || 0,
            overdueAmount: revenueData.overdueAmount || 0,
            paidAmount: revenueData.paidAmount || 0,
            invoicesCount: revenueData.invoicesCount || 0,
            paymentsCount: revenueData.paymentsCount || 0,
            averagePaymentTime: revenueData.averagePaymentTime || 0,
            revenueTrend: revenueData.revenueTrend || 'up'
          });
        }
      } catch (error) {
        console.error('Error loading revenue analytics:', error);
      }

      // Load invoices data
      try {
        const invoicesResponse = await api.get('/billing/invoice/all');
        if (invoicesResponse.data && invoicesResponse.data.data) {
          setInvoices(invoicesResponse.data.data);
          setFilteredInvoices(invoicesResponse.data.data);
        }
      } catch (error) {
        console.error('Error loading invoices:', error);
        // If endpoint doesn't exist, fetch all patient invoices as fallback
        await handleViewAllInvoices();
      }

    } catch (error) {
      console.error('Error loading billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterInvoices = () => {
    let filtered = [...invoices];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(invoice =>
        invoice.patientName.toLowerCase().includes(query) ||
        invoice.invoiceNumber.toLowerCase().includes(query) ||
        invoice._id.toLowerCase().includes(query) ||
        (invoice.doctorName && invoice.doctorName.toLowerCase().includes(query))
      );
    }
    if (filters.status !== 'all') filtered = filtered.filter(invoice => invoice.status === filters.status);
    if (filters.type !== 'all') filtered = filtered.filter(invoice => invoice.type === filters.type);
    if (filters.amountRange !== 'all') {
      switch (filters.amountRange) {
        case '0-100': filtered = filtered.filter(invoice => invoice.amount <= 100); break;
        case '100-500': filtered = filtered.filter(invoice => invoice.amount > 100 && invoice.amount <= 500); break;
        case '500-1000': filtered = filtered.filter(invoice => invoice.amount > 500 && invoice.amount <= 1000); break;
        case '1000+': filtered = filtered.filter(invoice => invoice.amount > 1000); break;
      }
    }
    setFilteredInvoices(filtered);
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleViewPatientInvoices = async (patientId: string) => {
    try {
      setLoading(true);
      const response = await api.get(`/billing/invoice/patient/${patientId}`);
      if (response.data && response.data.data) {
        setInvoices(response.data.data);
        setFilteredInvoices(response.data.data);
        setSelectedPatientId(patientId);
        setSelectedDoctorId('');
      }
    } catch (error) {
      console.error('Error loading patient invoices:', error);
      alert('Failed to load patient invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDoctorInvoices = async (doctorId: string) => {
    try {
      setLoading(true);
      const response = await api.get(`/billing/invoice/doctor/${doctorId}`);
      if (response.data && response.data.data) {
        setInvoices(response.data.data);
        setFilteredInvoices(response.data.data);
        setSelectedDoctorId(doctorId);
        setSelectedPatientId('');
      }
    } catch (error) {
      console.error('Error loading doctor invoices:', error);
      alert('Failed to load doctor invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleViewAllInvoices = async () => {
    try {
      setLoading(true);
      // Try to get all invoices by fetching from multiple endpoints or using analytics
      const patientsResponse = await api.get('/patients/all');
      if (patientsResponse.data && patientsResponse.data.data) {
        const allInvoices: Invoice[] = [];
        // Fetch invoices for each patient (this is a fallback approach)
        for (const patient of patientsResponse.data.data.slice(0, 10)) { // Limit to first 10 patients
          try {
            const invoicesResponse = await api.get(`/billing/invoice/patient/${patient._id}`);
            if (invoicesResponse.data && invoicesResponse.data.data) {
              allInvoices.push(...invoicesResponse.data.data);
            }
          } catch (error) {
            console.error(`Error loading invoices for patient ${patient._id}:`, error);
          }
        }
        setInvoices(allInvoices);
        setFilteredInvoices(allInvoices);
        setSelectedPatientId('');
        setSelectedDoctorId('');
      }
    } catch (error) {
      console.error('Error loading all invoices:', error);
      alert('Failed to load all invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoiceDetails = async (invoiceId: string) => {
    try {
      const response = await api.get(`/billing/invoice/${invoiceId}`);
      if (response.data && response.data.data) {
        setSelectedInvoice(response.data.data);
      }
    } catch (error) {
      console.error('Error loading invoice details:', error);
      alert('Failed to load invoice details');
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      try {
        await api.delete(`/billing/invoice/${invoiceId}`);
        setInvoices(prev => prev.filter(inv => inv._id !== invoiceId));
        setFilteredInvoices(prev => prev.filter(inv => inv._id !== invoiceId));
        alert('Invoice deleted successfully');
      } catch (error) {
        console.error('Error deleting invoice:', error);
        alert('Failed to delete invoice');
      }
    }
  };

  const handleCreateInvoice = async (invoiceData: Partial<Invoice>) => {
    try {
      const response = await api.post('/billing/invoice/create', invoiceData);
      if (response.data && response.data.data) {
        const newInvoice = response.data.data;
        setInvoices(prev => [...prev, newInvoice]);
        setFilteredInvoices(prev => [...prev, newInvoice]);
        alert('Invoice created successfully');
        return newInvoice;
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Failed to create invoice');
    }
    return null;
  };

  const handleRecordPayment = async (invoiceId: string, amount: number, method: string) => {
    try {
      const response = await api.patch(`/billing/invoice/payment/${invoiceId}`, {
        paidAmount: amount,
        paymentMethod: method,
        status: amount > 0 ? 'paid' : 'pending'
      });
      if (response.data && response.data.data) {
        const updatedInvoice = response.data.data;
        setInvoices(prev => prev.map(inv => 
          inv._id === invoiceId ? { ...inv, ...updatedInvoice } : inv
        ));
        setFilteredInvoices(prev => prev.map(inv => 
          inv._id === invoiceId ? { ...inv, ...updatedInvoice } : inv
        ));
        if (selectedInvoice && selectedInvoice._id === invoiceId) {
          setSelectedInvoice(prev => prev ? { ...prev, ...updatedInvoice } : null);
        }
        alert('Payment recorded successfully');
        
        // Refresh stats after payment
        loadBillingData();
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      alert('Failed to record payment');
    }
  };

  const handleCreateNewInvoice = () => {
    router.push('/admin/billing/new');
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD' 
  }).format(amount);

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
      bank_transfer: ArrowUpDown, 
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

  if (loading && !invoices.length) return <LoadingScreen message="Loading billing data..." />;

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
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900">Billing & Payments</h1>
              <span className="text-xs font-medium bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                {formatCurrency(stats.totalRevenue)}
              </span>
              {(selectedPatientId || selectedDoctorId) && (
                <button 
                  onClick={handleViewAllInvoices} 
                  className="text-sm text-purple-600 hover:text-purple-800 cursor-pointer"
                >
                  View All Invoices
                </button>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleCreateNewInvoice} 
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              icon={DollarSign} 
              label="Total Revenue" 
              value={stats.totalRevenue} 
              change={stats.revenueTrend === 'up' ? '+12.5%' : '-12.5%'} 
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

          <div className="mb-6 flex items-center space-x-4">
            <button 
              onClick={() => setShowFilters(!showFilters)} 
              className="flex items-center space-x-2 px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-xl border border-gray-200 transition-all duration-200 cursor-pointer"
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filters</span>
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Quick View:</span>
              <button 
                onClick={() => handleViewPatientInvoices('p001')} 
                className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 cursor-pointer"
              >
                Patient Invoices
              </button>
              <button 
                onClick={() => handleViewDoctorInvoices('d001')} 
                className="px-3 py-1 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 cursor-pointer"
              >
                Doctor Invoices
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mb-8 bg-white rounded-2xl shadow-lg shadow-purple-500/5 border border-gray-200/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <button 
                  onClick={() => setFilters({ status: 'all', type: 'all', dateRange: 'all', amountRange: 'all' })} 
                  className="text-sm text-purple-600 hover:text-purple-700 cursor-pointer"
                >
                  Clear All
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Status</label>
                  <div className="flex flex-wrap gap-2">
                    {['all', 'paid', 'pending', 'overdue', 'cancelled'].map((status) => (
                      <button 
                        key={status}
                        onClick={() => handleFilterChange('status', status)} 
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${filters.status === status ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Type</label>
                  <div className="flex flex-wrap gap-2">
                    {['all', 'consultation', 'procedure', 'medication', 'test', 'other'].map((type) => (
                      <button 
                        key={type}
                        onClick={() => handleFilterChange('type', type)} 
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${filters.type === type ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Date Range</label>
                  <div className="flex flex-wrap gap-2">
                    {['all', 'today', 'week', 'month', 'quarter'].map((range) => (
                      <button 
                        key={range}
                        onClick={() => handleFilterChange('dateRange', range)} 
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${filters.dateRange === range ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      >
                        {range.charAt(0).toUpperCase() + range.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Amount Range</label>
                  <div className="flex flex-wrap gap-2">
                    {['all', '0-100', '100-500', '500-1000', '1000+'].map((range) => (
                      <button 
                        key={range}
                        onClick={() => handleFilterChange('amountRange', range)} 
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${filters.amountRange === range ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mb-6">
            <div className="flex space-x-8 border-b border-gray-200/50">
              {(['invoices', 'payments'] as const).map((tab) => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)} 
                  className={`pb-4 font-medium relative transition-all duration-200 cursor-pointer ${activeTab === tab ? 'text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {tab === 'invoices' ? 'All Invoices' : 'Payment History'}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'invoices' ? (
            <InvoicesTable 
              invoices={filteredInvoices} 
              selectedInvoice={selectedInvoice} 
              onViewDetails={handleViewInvoiceDetails} 
              onDelete={handleDeleteInvoice} 
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
              onRecordPayment={handleRecordPayment} 
              onDelete={handleDeleteInvoice} 
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

const StatCard: React.FC<{
  icon: React.ElementType; label: string; value: number; change: string; color: 'green' | 'yellow' | 'red' | 'purple'; isCurrency?: boolean;
}> = ({ icon: Icon, label, value, change, color, isCurrency = false }) => {
  const colorConfig = {
    green: { bg: 'from-green-50 to-green-100/50 border-green-200/50', text: 'text-green-600' },
    yellow: { bg: 'from-yellow-50 to-yellow-100/50 border-yellow-200/50', text: 'text-yellow-600' },
    red: { bg: 'from-red-50 to-red-100/50 border-red-200/50', text: 'text-red-600' },
    purple: { bg: 'from-purple-50 to-purple-100/50 border-purple-200/50', text: 'text-purple-600' }
  };
  const formattedValue = isCurrency ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value) : value;
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200/50 shadow-sm shadow-purple-500/5 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
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

const ActionButton: React.FC<{ icon: React.ElementType; label: string; onClick?: () => void; }> = ({ icon: Icon, label, onClick }) => (
  <button 
    onClick={onClick} 
    className="flex items-center space-x-2 px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-xl border border-gray-200 transition-all duration-200 cursor-pointer"
  >
    <Icon className="w-4 h-4" />
    <span className="text-sm font-medium">{label}</span>
  </button>
);

const InvoicesTable: React.FC<{
  invoices: Invoice[]; selectedInvoice: Invoice | null; onViewDetails: (invoiceId: string) => void; onDelete: (invoiceId: string) => void;
  formatDate: (date: string) => string; formatCurrency: (amount: number) => string; getStatusColor: (status: Invoice['status']) => string;
}> = ({ invoices, selectedInvoice, onViewDetails, onDelete, formatDate, formatCurrency, getStatusColor }) => (
  <div className="bg-white rounded-2xl border border-gray-200/50 shadow-sm shadow-purple-500/5 overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-200/50 flex items-center justify-between">
      <div>
        <h2 className="text-xl font-bold text-gray-800">All Invoices</h2>
        <p className="text-gray-500 text-sm mt-1">Manage and review all invoices and billing information</p>
      </div>
      <div className="flex items-center space-x-2">
        <button className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer">
          <ArrowUpDown className="w-4 h-4 inline mr-1" />Sort
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
              <th className="text-left py-4 px-6 text-gray-500 font-medium text-sm">Doctor</th>
              <th className="text-left py-4 px-6 text-gray-500 font-medium text-sm">Date</th>
              <th className="text-left py-4 px-6 text-gray-500 font-medium text-sm">Due Date</th>
              <th className="text-left py-4 px-6 text-gray-500 font-medium text-sm">Amount</th>
              <th className="text-left py-4 px-6 text-gray-500 font-medium text-sm">Status</th>
              <th className="text-left py-4 px-6 text-gray-500 font-medium text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length > 0 ? invoices.map((invoice) => {
              const paidPercentage = (invoice.paidAmount / invoice.amount) * 100;
              return (
                <tr 
                  key={invoice._id} 
                  className={`border-b border-gray-100 hover:bg-purple-50/30 transition-colors duration-150 ${selectedInvoice?._id === invoice._id ? 'bg-purple-50' : ''}`}
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
                    <p className="text-sm text-gray-600">{invoice.doctorName || 'N/A'}</p>
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
                      {invoice.status === 'overdue' && <AlertCircle className="w-4 h-4 text-red-500" />}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => onViewDetails(invoice._id)} 
                        className="text-purple-600 hover:text-purple-800 font-medium text-sm transition-colors duration-200 cursor-pointer"
                      >
                        View Details →
                      </button>
                      <button 
                        onClick={() => onDelete(invoice._id)} 
                        className="text-red-600 hover:text-red-800 text-sm transition-colors duration-200 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={8} className="py-12 text-center">
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
    <div className="px-6 py-4 border-t border-gray-200/50 flex items-center justify-between">
      <p className="text-gray-500 text-sm">
        Showing <span className="font-medium text-gray-700">{invoices.length}</span> of <span className="font-medium text-gray-700">{invoices.length}</span> invoices
      </p>
      <div className="flex items-center space-x-2">
        <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors duration-200 cursor-pointer">← Previous</button>
        <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors duration-200 cursor-pointer">Next →</button>
      </div>
    </div>
  </div>
);

const PaymentsTable: React.FC<{
  payments: Payment[]; formatDate: (date: string) => string; formatCurrency: (amount: number) => string;
  getPaymentMethodIcon: (method: Payment['method']) => React.ElementType; getPaymentStatusColor: (status: Payment['status']) => string;
}> = ({ payments, formatDate, formatCurrency, getPaymentMethodIcon, getPaymentStatusColor }) => (
  <div className="bg-white rounded-2xl border border-gray-200/50 shadow-sm shadow-purple-500/5 overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-200/50 flex items-center justify-between">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Payment History</h2>
        <p className="text-gray-500 text-sm mt-1">View and manage all payment transactions</p>
      </div>
      <div className="flex items-center space-x-2">
        <button className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer">
          <ArrowUpDown className="w-4 h-4 inline mr-1" />Sort
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
            {payments.length > 0 ? payments.map((payment) => {
              const MethodIcon = getPaymentMethodIcon(payment.method);
              return (
                <tr key={payment._id} className="border-b border-gray-100 hover:bg-purple-50/30 transition-colors duration-150">
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
                      <span className="text-sm text-gray-600 capitalize">{payment.method.replace('_', ' ')}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${getPaymentStatusColor(payment.status)}`}>
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button className="text-purple-600 hover:text-purple-800 font-medium text-sm transition-colors duration-200 cursor-pointer">View Details →</button>
                    </div>
                  </td>
                </tr>
              );
            }) : (
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
    <div className="px-6 py-4 border-t border-gray-200/50 flex items-center justify-between">
      <p className="text-gray-500 text-sm">
        Showing <span className="font-medium text-gray-700">{payments.length}</span> of <span className="font-medium text-gray-700">{payments.length}</span> payments
      </p>
      <div className="flex items-center space-x-2">
        <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors duration-200 cursor-pointer">← Previous</button>
        <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors duration-200 cursor-pointer">Next →</button>
      </div>
    </div>
  </div>
);

const InvoiceDetailModal: React.FC<{
  invoice: Invoice; onClose: () => void; onRecordPayment: (invoiceId: string, amount: number, method: string) => void;
  onDelete: (invoiceId: string) => void; formatDate: (date: string) => string; formatCurrency: (amount: number) => string;
  getStatusColor: (status: Invoice['status']) => string;
}> = ({ invoice, onClose, onRecordPayment, onDelete, formatDate, formatCurrency, getStatusColor }) => {
  const [paymentAmount, setPaymentAmount] = useState(invoice.amount - invoice.paidAmount);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const paidPercentage = (invoice.paidAmount / invoice.amount) * 100;
  
  const handleRecordPayment = () => {
    if (paymentAmount > 0) { 
      onRecordPayment(invoice._id, paymentAmount, paymentMethod); 
      onClose(); 
    }
  };
  
  const handleDeleteInvoice = () => { 
    onDelete(invoice._id); 
    onClose(); 
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-8">
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
          <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/50 rounded-xl p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Patient</p>
                <p className="font-bold text-lg text-gray-900">{invoice.patientName}</p>
                {invoice.doctorName && (
                  <>
                    <p className="text-sm text-gray-600 mb-1 mt-2">Doctor</p>
                    <p className="font-medium text-gray-900">{invoice.doctorName}</p>
                  </>
                )}
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50/50 border border-gray-200/50 rounded-xl p-5">
              <h3 className="font-medium text-gray-900 mb-4">Billing Details</h3>
              <div className="space-y-3">
                <DetailRow label="Invoice Number" value={invoice.invoiceNumber} />
                <DetailRow label="Invoice Date" value={formatDate(invoice.date)} />
                <DetailRow label="Due Date" value={formatDate(invoice.dueDate)} />
                <DetailRow label="Invoice Type" value={invoice.type.charAt(0).toUpperCase() + invoice.type.slice(1)} />
                {invoice.paymentMethod && <DetailRow label="Payment Method" value={invoice.paymentMethod} />}
              </div>
            </div>
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
                  <span className="font-bold text-lg text-gray-900">{formatCurrency(invoice.amount - invoice.paidAmount)}</span>
                </div>
              </div>
            </div>
          </div>
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
          {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
              <h3 className="font-medium text-gray-900 mb-4">Record Payment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input 
                      type="number" 
                      value={paymentAmount} 
                      onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)} 
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" 
                      max={invoice.amount - invoice.paidAmount} 
                      min="0" 
                      step="0.01" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                  <select 
                    value={paymentMethod} 
                    onChange={(e) => setPaymentMethod(e.target.value)} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="credit_card">Credit Card</option>
                    <option value="cash">Cash</option>
                    <option value="insurance">Insurance</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="online">Online</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          {invoice.notes && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
              <h3 className="font-medium text-gray-900 mb-2">Notes</h3>
              <p className="text-gray-700">{invoice.notes}</p>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-gray-200 pt-6">
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200 transition-all duration-200 cursor-pointer">
                <Download className="w-4 h-4 inline mr-2" />Download PDF
              </button>
              <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200 transition-all duration-200 cursor-pointer">
                <Printer className="w-4 h-4 inline mr-2" />Print Invoice
              </button>
              <button 
                onClick={handleDeleteInvoice} 
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-all duration-200 cursor-pointer"
              >
                Delete Invoice
              </button>
            </div>
            <div className="flex items-center space-x-3">
              {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                <button 
                  onClick={handleRecordPayment} 
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg shadow-purple-500/30 cursor-pointer"
                >
                  <DollarSign className="w-4 h-4 inline mr-2" />Record Payment
                </button>
              )}
              <button 
                onClick={onClose} 
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 cursor-pointer"
              >
                Close
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