"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
  Filter,
  Calendar,
  CreditCard,
  Wallet,
  PieChart,
  BarChart3,
  Receipt,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Printer,
  Activity,
} from "lucide-react";
import api from "@/lib/api/api";

/* ================= TYPES ================= */

interface Transaction {
  _id: string;
  date: string;
  patientName: string;
  type: "consultation" | "follow-up" | "procedure" | "test";
  amount: number;
  status: "paid" | "pending" | "cancelled";
  paymentMethod: "credit-card" | "insurance" | "cash" | "online";
  invoiceNumber: string;
}

interface EarningsSummary {
  totalEarnings: number;
  thisMonth: number;
  lastMonth: number;
  pendingPayments: number;
  completedTransactions: number;
  averageTransaction: number;
}

interface PaymentMethodDistribution {
  method: string;
  percentage: number;
  color: string;
}

/* ============ NORMALIZER (IMPORTANT) ============ */

const normalizeTransaction = (t: any): Transaction => ({
  _id: t._id || "",
  date: t.date || new Date().toISOString().split('T')[0],
  patientName: t.patientName || "Unknown Patient",
  type: t.type as Transaction["type"] || "consultation",
  amount: Number(t.amount) || 0,
  status: t.status as Transaction["status"] || "pending",
  paymentMethod: t.paymentMethod as Transaction["paymentMethod"] || "cash",
  invoiceNumber: t.invoiceNumber || `INV-${Date.now()}`,
});

/* ================= COMPONENT ================= */

const DoctorEarningsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"all" | "this-month" | "last-month" | "pending">("all");
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month");
  
  const [earningsSummary, setEarningsSummary] = useState<EarningsSummary>({
    totalEarnings: 0,
    thisMonth: 0,
    lastMonth: 0,
    pendingPayments: 0,
    completedTransactions: 0,
    averageTransaction: 0,
  });

  /* ================= HELPER FUNCTIONS ================= */

  const getPaymentMethodIcon = (method: Transaction["paymentMethod"]) => {
    switch (method) {
      case "credit-card":
        return <CreditCard className="w-4 h-4 text-gray-400" />;
      case "insurance":
        return <Receipt className="w-4 h-4 text-gray-400" />;
      case "online":
        return <Wallet className="w-4 h-4 text-gray-400" />;
      case "cash":
        return <DollarSign className="w-4 h-4 text-gray-400" />;
      default:
        return <CreditCard className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusIcon = (status: Transaction["status"]) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "cancelled":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: Transaction["status"]) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const calculateGrowth = useCallback((): number => {
    if (earningsSummary.lastMonth === 0) return 0;
    const growth = ((earningsSummary.thisMonth - earningsSummary.lastMonth) / earningsSummary.lastMonth) * 100;
    return Number(growth.toFixed(1));
  }, [earningsSummary.thisMonth, earningsSummary.lastMonth]);

  const formatCurrency = useCallback((n: number): string => {
    return new Intl.NumberFormat("en-US", { 
      style: "currency", 
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }).format(n);
  }, []);

  const formatDate = useCallback((dateString: string): string => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    });
  }, []);

  const handleExportReport = useCallback(() => {
    // Implement export functionality
    console.log("Exporting report...");
    // This would typically call an API endpoint to generate a report
    alert("Export functionality would be implemented here");
  }, []);

  /* ================= CALCULATION FUNCTIONS ================= */

  const calculateSummary = useCallback(() => {
    const paidTransactions = transactions.filter((t) => t.status === "paid");
    const pendingTransactions = transactions.filter((t) => t.status === "pending");
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const thisMonthTransactions = paidTransactions.filter((t) => {
      const transactionDate = new Date(t.date);
      return (
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear
      );
    });

    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    const lastMonthTransactions = paidTransactions.filter((t) => {
      const transactionDate = new Date(t.date);
      return (
        transactionDate.getMonth() === lastMonth &&
        transactionDate.getFullYear() === lastMonthYear
      );
    });

    const totalEarnings = paidTransactions.reduce((sum, t) => sum + t.amount, 0);
    const thisMonthEarnings = thisMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
    const lastMonthEarnings = lastMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
    const pendingPayments = pendingTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    const averageTransaction = paidTransactions.length > 0 
      ? totalEarnings / paidTransactions.length 
      : 0;

    setEarningsSummary({
      totalEarnings,
      thisMonth: thisMonthEarnings,
      lastMonth: lastMonthEarnings,
      pendingPayments,
      completedTransactions: paidTransactions.length,
      averageTransaction,
    });
  }, [transactions]);

  const filterTransactions = useCallback(() => {
    let filtered = [...transactions];
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    if (activeFilter === "pending") {
      filtered = filtered.filter((t) => t.status === "pending");
    } else if (activeFilter === "this-month") {
      filtered = filtered.filter((t) => {
        const transactionDate = new Date(t.date);
        return (
          transactionDate.getMonth() === currentMonth &&
          transactionDate.getFullYear() === currentYear
        );
      });
    } else if (activeFilter === "last-month") {
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      
      filtered = filtered.filter((t) => {
        const transactionDate = new Date(t.date);
        return (
          transactionDate.getMonth() === lastMonth &&
          transactionDate.getFullYear() === lastMonthYear
        );
      });
    }

    setFilteredTransactions(filtered);
  }, [transactions, activeFilter]);

  /* ================= EFFECTS ================= */

  useEffect(() => {
    fetchEarningsData();
  }, []);

  useEffect(() => {
    if (transactions.length > 0) {
      filterTransactions();
      calculateSummary();
    }
  }, [transactions, activeFilter, filterTransactions, calculateSummary]);

  /* ================= API ================= */

  const fetchEarningsData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/doctors/earnings");

      if (response.data?.data?.transactions) {
        const rawTransactions = response.data.data.transactions;
        const normalized = rawTransactions.map(normalizeTransaction);
        setTransactions(normalized);
        
        if (response.data.data.summary) {
          setEarningsSummary(response.data.data.summary);
        }
      } else {
        throw new Error("Invalid response structure");
      }
    } catch (error) {
      console.error("API failed, using mock data:", error);
      
      // Mock data for fallback
      const mockTransactions: Transaction[] = [
        {
          _id: "1",
          date: "2024-01-15",
          patientName: "John Smith",
          type: "consultation",
          amount: 150,
          status: "paid",
          paymentMethod: "credit-card",
          invoiceNumber: "INV-2024-001",
        },
        {
          _id: "2",
          date: "2024-01-14",
          patientName: "Sarah Johnson",
          type: "follow-up",
          amount: 100,
          status: "paid",
          paymentMethod: "insurance",
          invoiceNumber: "INV-2024-002",
        },
        {
          _id: "3",
          date: "2024-01-13",
          patientName: "Michael Brown",
          type: "procedure",
          amount: 500,
          status: "pending",
          paymentMethod: "online",
          invoiceNumber: "INV-2024-003",
        },
        {
          _id: "4",
          date: "2024-01-12",
          patientName: "Emma Wilson",
          type: "test",
          amount: 250,
          status: "paid",
          paymentMethod: "cash",
          invoiceNumber: "INV-2024-004",
        },
        {
          _id: "5",
          date: "2024-01-11",
          patientName: "Robert Davis",
          type: "consultation",
          amount: 150,
          status: "cancelled",
          paymentMethod: "credit-card",
          invoiceNumber: "INV-2024-005",
        },
      ];

      setTransactions(mockTransactions);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ================= CALCULATED VALUES ================= */

  const serviceTypeDistribution = useMemo(() => {
    const serviceTypes = ["consultation", "follow-up", "procedure", "test"] as const;
    return serviceTypes.map(type => {
      const typeTransactions = transactions.filter(t => t.type === type && t.status === "paid");
      const amount = typeTransactions.reduce((sum, t) => sum + t.amount, 0);
      return {
        type: type.charAt(0).toUpperCase() + type.slice(1),
        amount,
        color: 
          type === "consultation" ? "bg-green-500" :
          type === "follow-up" ? "bg-blue-500" :
          type === "procedure" ? "bg-purple-500" : "bg-yellow-500"
      };
    }).filter(item => item.amount > 0);
  }, [transactions]);

  const paymentMethodDistribution = useMemo((): PaymentMethodDistribution[] => {
    const paymentMethods = ["credit-card", "insurance", "cash", "online"] as const;
    const paidTransactions = transactions.filter(t => t.status === "paid");
    
    if (paidTransactions.length === 0) return [];
    
    const methodCounts = paymentMethods.map(method => {
      const count = paidTransactions.filter(t => t.paymentMethod === method).length;
      return {
        method: method.replace('-', ' ').toUpperCase(),
        count,
        percentage: (count / paidTransactions.length) * 100,
        color: 
          method === "credit-card" ? "bg-green-500" :
          method === "insurance" ? "bg-blue-500" :
          method === "cash" ? "bg-yellow-500" : "bg-purple-500"
      };
    });
    
    return methodCounts.filter(m => m.count > 0);
  }, [transactions]);

  /* ================= LOADING STATE ================= */

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-gray-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-green-100 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-green-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">Loading earnings data...</p>
        </div>
      </div>
    );
  }

  /* ================= RENDER ================= */

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Earnings & Revenue</h1>
              <p className="text-gray-500 mt-2">Track your practice earnings and financial performance</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleExportReport}
                className="flex items-center space-x-2 px-4 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span className="font-medium">Export Report</span>
              </button>
              <button 
                onClick={() => window.print()}
                className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg shadow-green-500/30 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span className="font-medium">Print Statement</span>
              </button>
            </div>
          </div>

          {/* Time Range Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <div className="flex flex-wrap items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
                {(['all', 'this-month', 'last-month', 'pending'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeFilter === filter
                        ? 'bg-green-600 text-white'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {filter === 'all' ? 'All Time' : 
                     filter === 'this-month' ? 'This Month' :
                     filter === 'last-month' ? 'Last Month' : 'Pending'}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {(['week', 'month', 'year'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    timeRange === range
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Earnings Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Earnings Card */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 text-white shadow-lg shadow-green-500/30">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-green-100">Total Earnings</p>
                  <p className="text-3xl md:text-4xl font-bold mt-2">{formatCurrency(earningsSummary.totalEarnings)}</p>
                </div>
                <DollarSign className="w-10 h-10 md:w-12 md:h-12 text-green-200" />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-green-200 text-sm">This Month</p>
                  <p className="text-xl font-bold mt-1">{formatCurrency(earningsSummary.thisMonth)}</p>
                  <div className="flex items-center mt-2">
                    {calculateGrowth() >= 0 ? (
                      <>
                        <TrendingUp className="w-4 h-4 mr-1" />
                        <span className="text-green-200">+{calculateGrowth().toFixed(1)}%</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-4 h-4 mr-1" />
                        <span className="text-yellow-200">{calculateGrowth().toFixed(1)}%</span>
                      </>
                    )}
                    <span className="text-green-200 ml-2 text-sm">from last month</span>
                  </div>
                </div>
                <div>
                  <p className="text-green-200 text-sm">Last Month</p>
                  <p className="text-xl font-bold mt-1">{formatCurrency(earningsSummary.lastMonth)}</p>
                  <p className="text-green-200 text-sm mt-2">Completed transactions</p>
                  <p className="text-lg font-bold">{earningsSummary.completedTransactions}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg shadow-green-500/5 border border-gray-200/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pending Payments</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {formatCurrency(earningsSummary.pendingPayments)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg shadow-green-500/5 border border-gray-200/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Avg. Transaction</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {formatCurrency(earningsSummary.averageTransaction)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg shadow-green-500/5 border border-gray-200/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">By Service Type</h3>
              <PieChart className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {serviceTypeDistribution.length > 0 ? (
                serviceTypeDistribution.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                      <span className="text-sm text-gray-700">{item.type}</span>
                    </div>
                    <span className="font-medium">{formatCurrency(item.amount)}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No service data available</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg shadow-green-500/5 border border-gray-200/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Payment Methods</h3>
              <CreditCard className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {paymentMethodDistribution.length > 0 ? (
                paymentMethodDistribution.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{item.method}</span>
                      <span className="text-sm font-medium">{item.percentage.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No payment method data</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg shadow-green-500/5 border border-gray-200/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Recent Activity</h3>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {[
                { time: 'Today', action: '2 new payments received', amount: '+$250' },
                { time: 'Yesterday', action: '1 pending payment cleared', amount: '+$150' },
                { time: 'Jan 12', action: 'Monthly statement generated', amount: '' },
                { time: 'Jan 10', action: 'Insurance claim submitted', amount: '' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                  <div>
                    <p className="text-sm text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                  {activity.amount && (
                    <span className="text-sm font-medium text-green-600">{activity.amount}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-2xl shadow-lg shadow-green-500/5 border border-gray-200/50 overflow-hidden mb-8">
          <div className="p-4 md:p-6 border-b border-gray-200/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
              <p className="text-gray-500 text-sm">Detailed breakdown of all transactions</p>
            </div>
            <button className="text-green-600 hover:text-green-700 font-medium cursor-pointer self-start sm:self-auto">
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200/50">
                  <th className="text-left py-4 px-4 md:px-6 text-sm font-medium text-gray-700">Date</th>
                  <th className="text-left py-4 px-4 md:px-6 text-sm font-medium text-gray-700">Patient</th>
                  <th className="text-left py-4 px-4 md:px-6 text-sm font-medium text-gray-700">Service Type</th>
                  <th className="text-left py-4 px-4 md:px-6 text-sm font-medium text-gray-700">Amount</th>
                  <th className="text-left py-4 px-4 md:px-6 text-sm font-medium text-gray-700">Payment Method</th>
                  <th className="text-left py-4 px-4 md:px-6 text-sm font-medium text-gray-700">Status</th>
                  <th className="text-left py-4 px-4 md:px-6 text-sm font-medium text-gray-700">Invoice</th>
                  <th className="text-left py-4 px-4 md:px-6 text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction) => (
                    <tr key={transaction._id} className="border-b border-gray-200/50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-4 md:px-6">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-700 whitespace-nowrap">{formatDate(transaction.date)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 md:px-6">
                        <div className="font-medium text-gray-900 truncate max-w-[120px]">{transaction.patientName}</div>
                      </td>
                      <td className="py-4 px-4 md:px-6">
                        <div className="text-gray-700 capitalize">{transaction.type}</div>
                      </td>
                      <td className="py-4 px-4 md:px-6">
                        <div className={`font-bold ${
                          transaction.status === 'paid' ? 'text-green-600' : 
                          transaction.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(transaction.amount)}
                        </div>
                      </td>
                      <td className="py-4 px-4 md:px-6">
                        <div className="flex items-center space-x-2">
                          {getPaymentMethodIcon(transaction.paymentMethod)}
                          <span className="text-gray-700 capitalize whitespace-nowrap">
                            {transaction.paymentMethod.replace('-', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 md:px-6">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(transaction.status)}`}>
                            {getStatusIcon(transaction.status)}
                            <span>{transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}</span>
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 md:px-6">
                        <div className="text-gray-700 font-mono text-sm">{transaction.invoiceNumber}</div>
                      </td>
                      <td className="py-4 px-4 md:px-6">
                        <div className="flex items-center space-x-1">
                          <button
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg cursor-pointer"
                            title="View Details"
                            onClick={() => console.log("View details:", transaction._id)}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                            title="Download Invoice"
                            onClick={() => console.log("Download invoice:", transaction._id)}
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                            title="Print Receipt"
                            onClick={() => console.log("Print receipt:", transaction._id)}
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <DollarSign className="w-12 h-12 text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">No transactions found</h3>
                      <p className="text-gray-500 max-w-md mx-auto mb-8">
                        No transactions match your selected filter
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Overview */}
        <div className="bg-white rounded-2xl shadow-lg shadow-green-500/5 border border-gray-200/50 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Monthly Earnings Overview</h2>
              <p className="text-gray-500">Track your earnings growth over time</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Earnings</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Patients</span>
              </div>
            </div>
          </div>

          <div className="h-64 flex items-end justify-between space-x-2 md:space-x-4 pt-8 overflow-x-auto">
            {[
              { month: 'Sep', earnings: 3200, patients: 18 },
              { month: 'Oct', earnings: 4200, patients: 22 },
              { month: 'Nov', earnings: 3800, patients: 20 },
              { month: 'Dec', earnings: 4500, patients: 25 },
              { month: 'Jan', earnings: earningsSummary.thisMonth || 5000, patients: Math.ceil(earningsSummary.completedTransactions * 1.2) || 28 }
            ].map((data, index) => (
              <div key={index} className="flex flex-col items-center flex-shrink-0" style={{ width: '18%', minWidth: '60px' }}>
                <div className="w-full flex justify-center space-x-1 mb-2">
                  <div 
                    className="w-4 md:w-6 bg-green-500 rounded-t-lg"
                    style={{ height: `${Math.max(10, (data.earnings / 5000) * 120)}px` }}
                  ></div>
                  <div 
                    className="w-4 md:w-6 bg-blue-500 rounded-t-lg"
                    style={{ height: `${Math.max(10, (data.patients / 30) * 120)}px` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-500">{data.month}</span>
                <span className="text-xs text-gray-400">{formatCurrency(data.earnings)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorEarningsPage;