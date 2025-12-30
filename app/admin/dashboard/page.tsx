"use client";

import React, { useState, useEffect } from 'react';
import { 
  UserPlus, Stethoscope, Calendar, CreditCard, UserCheck, Activity,
  Plus, Download, TrendingUp, AlertCircle, CheckCircle,
  Clock, DollarSign
} from 'lucide-react';
import api from '@/lib/api/api';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
         ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, 
         AreaChart, Area } from 'recharts';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

interface AdminData {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AnalyticsData {
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  totalRevenue: number;
  pendingApprovals: number;
  activeAppointments: number;
  appointmentsByDate?: { date: string; count: number }[];
  revenueByMonth?: { month: string; revenue: number }[];
  patientGrowth?: { month: string; patients: number }[];
  topDoctors?: { name: string; specialization: string; appointments: number; revenue: number }[];
  diseaseTrends?: { disease: string; count: number; trend: 'up' | 'down' }[];
}

interface PatientTrendData {
  month: string;
  appointments: number;
  revenue: number;
  adherence?: number;
}

interface DoctorStats {
  _id: string;
  name: string;
  specialization: string;
  appointmentCount: number;
  revenue: number;
}

interface DiseaseTrend {
  disease: string;
  count: number;
  trend: 'up' | 'down';
}

const COLORS = ['#7c3aed', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const AdminDashboard = () => {
  const router = useRouter();
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
    activeAppointments: 0,
    appointmentsByDate: [],
    revenueByMonth: [],
    patientGrowth: [],
    topDoctors: [],
    diseaseTrends: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    loadDashboardData();
  }, [selectedTimeRange]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    console.log('Loading dashboard data...');
    
    try {
      await Promise.all([fetchAdminData(), fetchAnalytics()]);
      console.log('Dashboard data loaded successfully');
    } catch (error) {
      console.error("Error loading admin dashboard data:", error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load dashboard data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      console.log('Fetching admin data from /auth/me...');
      const response = await api.get('/auth/me');
      console.log('Admin API response:', response);
      console.log('Response data:', response.data);
      console.log('Response data.data:', response.data?.data);
      
      const userData = response.data.data || response.data;
      console.log('Processed admin data:', userData);
      
      if (userData && userData.role) {
        setAdminData(userData);
      } else {
        console.warn('Admin data missing role or invalid structure:', userData);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      console.error('Error details:', (error as any).response?.data || (error as Error).message);
    }
  };

  const fetchAnalytics = async () => {
    try {
      console.log('Fetching analytics data...');
      
      // Fetch basic analytics from your API endpoints
      const [patientsRes, doctorsRes, appointmentsRes, revenueRes] = await Promise.all([
        api.get('/analytics/total-patients'),
        api.get('/analytics/total-doctors'),
        api.get('/analytics/appointments'),
        api.get('/analytics/revenue')
      ]);

      console.log('Patients response:', patientsRes.data);
      console.log('Doctors response:', doctorsRes.data);
      console.log('Appointments response:', appointmentsRes.data);
      console.log('Revenue response:', revenueRes.data);

      // Helper function to extract data consistently
      const extractData = (response: any, keys: string[]): number => {
        let data = response.data;
        console.log('Extracting data from:', data);
        
        for (const key of keys) {
          if (data && typeof data === 'object' && key in data) {
            console.log(`Found key "${key}" in data:`, data[key]);
            data = data[key];
          }
        }
        
        const result = typeof data === 'number' ? data : 0;
        console.log('Extracted value:', result);
        return result;
      };

      // Extract basic metrics
      const totalPatients = extractData(patientsRes, ['total', 'count', 'data', 'patients']);
      const totalDoctors = extractData(doctorsRes, ['total', 'count', 'data', 'doctors']);
      const totalAppointments = extractData(appointmentsRes, ['total', 'count', 'data', 'appointments']);
      const totalRevenue = extractData(revenueRes, ['total', 'amount', 'revenue', 'data']);

      // Fetch additional analytics data
      let topDoctorsData = [];
      let diseaseTrendsData = [];
      let appointmentsByDateData = [];
      let revenueByMonthData = [];
      let patientGrowthData = [];

      try {
        const [topDoctorsRes, diseaseTrendsRes] = await Promise.all([
          api.get('/analytics/top-doctors'),
          api.get('/analytics/disease-trends')
        ]);

        console.log('Top doctors response:', topDoctorsRes.data);
        console.log('Disease trends response:', diseaseTrendsRes.data);

        // Process top doctors data
        if (topDoctorsRes.data && Array.isArray(topDoctorsRes.data)) {
          topDoctorsData = topDoctorsRes.data.slice(0, 5).map((doctor: any) => ({
            name: doctor.name || doctor.fullName || `Dr. ${doctor._id?.substring(0, 8) || 'Unknown'}`,
            specialization: doctor.specialization || doctor.qualification || 'General',
            appointments: doctor.appointmentCount || doctor.totalAppointments || 0,
            revenue: doctor.revenue || doctor.totalRevenue || 0
          }));
        } else if (topDoctorsRes.data?.data && Array.isArray(topDoctorsRes.data.data)) {
          topDoctorsData = topDoctorsRes.data.data.slice(0, 5).map((doctor: any) => ({
            name: doctor.name || doctor.fullName || `Dr. ${doctor._id?.substring(0, 8) || 'Unknown'}`,
            specialization: doctor.specialization || doctor.qualification || 'General',
            appointments: doctor.appointmentCount || doctor.totalAppointments || 0,
            revenue: doctor.revenue || doctor.totalRevenue || 0
          }));
        }

        // Process disease trends data
        if (diseaseTrendsRes.data && Array.isArray(diseaseTrendsRes.data)) {
          diseaseTrendsData = diseaseTrendsRes.data.slice(0, 6).map((disease: any, index: number) => ({
            disease: disease.disease || disease.name || `Condition ${index + 1}`,
            count: disease.count || disease.frequency || 0,
            trend: disease.trend || (index % 2 === 0 ? 'up' : 'down')
          }));
        } else if (diseaseTrendsRes.data?.data && Array.isArray(diseaseTrendsRes.data.data)) {
          diseaseTrendsData = diseaseTrendsRes.data.data.slice(0, 6).map((disease: any, index: number) => ({
            disease: disease.disease || disease.name || `Condition ${index + 1}`,
            count: disease.count || disease.frequency || 0,
            trend: disease.trend || (index % 2 === 0 ? 'up' | 'down' : 'down')
          }));
        }
      } catch (e) {
        console.log("Error fetching additional analytics:", e);
        console.log("Error details:", (e as any).response?.data || (e as Error).message);
      }

      // Fetch all doctors to calculate pending approvals
      let pendingApprovals = 0;
      let activeAppointments = 0;
      
      try {
        // Get all doctors for pending approvals
        const allDoctorsRes = await api.get('/doctors/all');
        console.log('All doctors response:', allDoctorsRes.data);
        
        const doctorsData = allDoctorsRes.data?.data || allDoctorsRes.data || [];
        const pendingDoctors = Array.isArray(doctorsData) ? 
          doctorsData.filter((doctor: any) => 
            doctor.status === 'pending' || 
            doctor.approvalStatus === 'pending' ||
            !doctor.isApproved ||
            (doctor.approved !== undefined && !doctor.approved)
          ) : [];
        pendingApprovals = pendingDoctors.length;

        // Calculate active appointments from appointments data
        const appointmentsData = appointmentsRes.data || appointmentsRes.data?.data || {};
        console.log('Appointments data for active calculation:', appointmentsData);
        
        // Try to get active appointments from different possible structures
        activeAppointments = appointmentsData.active || 
                           appointmentsData.current || 
                           appointmentsData.today || 
                           appointmentsData.activeAppointments ||
                           appointmentsData.activeCount ||
                           appointmentsData.count || 
                           0;

        // If we have array of appointments, filter for active ones
        if (Array.isArray(appointmentsData)) {
          const today = new Date().toISOString().split('T')[0];
          activeAppointments = appointmentsData.filter((appt: any) => {
            const status = appt.status?.toLowerCase();
            const date = appt.date || appt.appointmentDate;
            return (status === 'active' || status === 'scheduled' || status === 'confirmed') && 
                   date === today;
          }).length;
        }
      } catch (e) {
        console.log('Error fetching additional data:', e);
      }

      // Generate time-based data from appointments API if needed
      try {
        // Get appointments for time-based charts
        const appointmentsForCharts = await api.get('/appointments/all', {
          params: { timeframe: selectedTimeRange }
        });
        
        const appointmentsList = appointmentsForCharts.data?.data || appointmentsForCharts.data || [];
        
        // Generate appointments by date data
        if (Array.isArray(appointmentsList)) {
          appointmentsByDateData = generateAppointmentsByDate(appointmentsList, selectedTimeRange);
          revenueByMonthData = generateRevenueByMonth(appointmentsList);
          patientGrowthData = generatePatientGrowth(patientsRes.data, selectedTimeRange);
        }
      } catch (e) {
        console.log('Error generating time-based data:', e);
        // Generate placeholder time-based data
        appointmentsByDateData = generatePlaceholderTimeData(selectedTimeRange);
        revenueByMonthData = generatePlaceholderRevenueData();
        patientGrowthData = generatePlaceholderGrowthData();
      }

      // If top doctors data is empty, try to generate from doctors data
      if (topDoctorsData.length === 0) {
        try {
          const doctorsWithStats = await api.get('/doctors/all');
          const doctorsList = doctorsWithStats.data?.data || doctorsWithStats.data || [];
          if (Array.isArray(doctorsList)) {
            topDoctorsData = doctorsList.slice(0, 5).map((doctor: any) => ({
              name: doctor.name || doctor.fullName || `Dr. ${doctor._id?.substring(0, 8) || 'Unknown'}`,
              specialization: doctor.specialization || doctor.qualification || 'General',
              appointments: doctor.appointmentCount || 0,
              revenue: doctor.totalRevenue || 0
            }));
          }
        } catch (e) {
          console.log('Error generating top doctors from doctors list:', e);
        }
      }

      const newAnalyticsData = {
        totalPatients,
        totalDoctors,
        totalAppointments,
        totalRevenue,
        pendingApprovals,
        activeAppointments,
        appointmentsByDate: appointmentsByDateData,
        revenueByMonth: revenueByMonthData,
        patientGrowth: patientGrowthData,
        topDoctors: topDoctorsData.length > 0 ? topDoctorsData : getPlaceholderTopDoctors(),
        diseaseTrends: diseaseTrendsData.length > 0 ? diseaseTrendsData : getPlaceholderDiseaseTrends()
      };

      console.log('Setting analytics data:', newAnalyticsData);
      setAnalytics(newAnalyticsData);

    } catch (error) {
      console.error("Full error details in fetchAnalytics:", {
        message: (error as Error).message,
        response: (error as any).response?.data,
        status: (error as any).response?.status
      });
      
      // Try to fetch minimal data from individual endpoints
      await fetchMinimalData();
    }
  };

  const fetchMinimalData = async () => {
    try {
      // Try to get basic counts from direct endpoints
      const [patients, doctors, appointments] = await Promise.all([
        api.get('/patients/all').then(res => {
          const data = res.data?.data || res.data;
          return Array.isArray(data) ? data.length : 0;
        }).catch(() => 0),
        
        api.get('/doctors/all').then(res => {
          const data = res.data?.data || res.data;
          return Array.isArray(data) ? data.length : 0;
        }).catch(() => 0),
        
        api.get('/appointments/all').then(res => {
          const data = res.data?.data || res.data;
          return Array.isArray(data) ? data.length : 0;
        }).catch(() => 0)
      ]);

      const minimalAnalytics = {
        totalPatients: patients,
        totalDoctors: doctors,
        totalAppointments: appointments,
        totalRevenue: 0,
        pendingApprovals: 0,
        activeAppointments: 0,
        appointmentsByDate: generatePlaceholderTimeData(selectedTimeRange),
        revenueByMonth: generatePlaceholderRevenueData(),
        patientGrowth: generatePlaceholderGrowthData(),
        topDoctors: getPlaceholderTopDoctors(),
        diseaseTrends: getPlaceholderDiseaseTrends()
      };

      setAnalytics(minimalAnalytics);
      setError('Loaded minimal data. Some APIs may not be available.');
      
    } catch (error) {
      console.error('Failed to load even minimal data:', error);
      const placeholderData = getPlaceholderAnalytics();
      setAnalytics(placeholderData);
      setError('Failed to load analytics data. Showing placeholder data.');
    }
  };

  // Helper function to generate appointments by date from real data
  const generateAppointmentsByDate = (appointments: any[], timeframe: string) => {
    const dateCounts: { [key: string]: number } = {};
    const now = new Date();
    
    appointments.forEach((appointment: any) => {
      const dateStr = appointment.date || appointment.appointmentDate;
      if (dateStr) {
        const date = new Date(dateStr);
        
        // Filter based on timeframe
        let include = false;
        if (timeframe === 'week') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          include = date >= weekAgo;
        } else if (timeframe === 'month') {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          include = date >= monthAgo;
        } else { // year
          const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          include = date >= yearAgo;
        }
        
        if (include) {
          const key = timeframe === 'week' 
            ? date.toLocaleDateString('en-US', { weekday: 'short' })
            : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          
          dateCounts[key] = (dateCounts[key] || 0) + 1;
        }
      }
    });
    
    // Convert to array format
    return Object.entries(dateCounts).map(([date, count]) => ({ date, count }));
  };

  // Helper function to generate revenue by month
  const generateRevenueByMonth = (appointments: any[]) => {
    const monthRevenue: { [key: string]: number } = {};
    
    appointments.forEach((appointment: any) => {
      if (appointment.amount || appointment.fee) {
        const amount = appointment.amount || appointment.fee || 0;
        const dateStr = appointment.date || appointment.appointmentDate || appointment.createdAt;
        
        if (dateStr) {
          const date = new Date(dateStr);
          const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          monthRevenue[monthKey] = (monthRevenue[monthKey] || 0) + amount;
        }
      }
    });
    
    return Object.entries(monthRevenue).map(([month, revenue]) => ({ month, revenue }));
  };

  // Helper function to generate patient growth data
  const generatePatientGrowth = (patientsData: any, timeframe: string) => {
    // Extract patients array
    const patients = patientsData?.data || patientsData || [];
    if (!Array.isArray(patients)) return [];
    
    const monthCounts: { [key: string]: number } = {};
    
    patients.forEach((patient: any) => {
      const createdAt = patient.createdAt || patient.registrationDate;
      if (createdAt) {
        const date = new Date(createdAt);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
      }
    });
    
    // Sort by date and calculate cumulative sum
    const sortedMonths = Object.entries(monthCounts)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime());
    
    let cumulative = 0;
    return sortedMonths.map(([month, count]) => {
      cumulative += count;
      return { month, patients: cumulative };
    });
  };

  const generatePlaceholderTimeData = (timeframe: string) => {
    if (timeframe === 'week') {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      return days.map(day => ({ date: day, count: Math.floor(Math.random() * 20) + 5 }));
    } else if (timeframe === 'month') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      return months.map(month => ({ date: month, count: Math.floor(Math.random() * 50) + 20 }));
    } else {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months.slice(0, 6).map(month => ({ date: month, count: Math.floor(Math.random() * 100) + 50 }));
    }
  };

  const generatePlaceholderRevenueData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({ 
      month, 
      revenue: Math.floor(Math.random() * 10000) + 5000 
    }));
  };

  const generatePlaceholderGrowthData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    let cumulative = 0;
    return months.map(month => {
      cumulative += Math.floor(Math.random() * 50) + 20;
      return { month, patients: cumulative };
    });
  };

  const getPlaceholderTopDoctors = () => [
    { name: 'Loading...', specialization: 'Fetching data', appointments: 0, revenue: 0 },
    { name: 'Please wait', specialization: 'Data loading', appointments: 0, revenue: 0 },
    { name: 'Data incoming', specialization: 'From API', appointments: 0, revenue: 0 }
  ];

  const getPlaceholderDiseaseTrends = () => [
    { disease: 'Loading trends...', count: 0, trend: 'up' },
    { disease: 'Data loading', count: 0, trend: 'down' },
    { disease: 'Please wait', count: 0, trend: 'up' }
  ];

  const getPlaceholderAnalytics = (): AnalyticsData => ({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
    activeAppointments: 0,
    appointmentsByDate: generatePlaceholderTimeData(selectedTimeRange),
    revenueByMonth: generatePlaceholderRevenueData(),
    patientGrowth: generatePlaceholderGrowthData(),
    topDoctors: getPlaceholderTopDoctors(),
    diseaseTrends: getPlaceholderDiseaseTrends()
  });

  // Helper function to export analytics data
  const handleExportReport = async () => {
    try {
      // You might want to create a dedicated export endpoint
      const response = await api.get('/analytics/appointments', {
        params: { format: 'csv', timeframe: selectedTimeRange }
      });
      
      // Create a blob and download link for the CSV
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `healthmate-analytics-${selectedTimeRange}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Failed to export report. Please try again.');
    }
  };

  // Helper function to generate custom report
  const handleGenerateReport = async () => {
    try {
      const reportData = {
        timeframe: selectedTimeRange,
        metrics: ['patients', 'doctors', 'appointments', 'revenue'],
        includeCharts: true
      };

      // You might need to create a dedicated report endpoint
      const response = await api.post('/analytics/report', reportData, {
        responseType: 'blob'
      });

      // Create PDF download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `healthmate-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    }
  };

  if (loading) {
    return <LoadingScreen message="Loading admin dashboard..." />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-white to-gray-50">
        <Sidebar pendingApprovals={analytics.pendingApprovals} />
        
        <div className="flex-1 overflow-auto ml-72 flex items-center justify-center">
          <div className="text-center max-w-md p-8">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-gray-900 mb-3">Error Loading Dashboard</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex flex-col space-y-3">
              <button 
                onClick={loadDashboardData}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 cursor-pointer"
              >
                Retry Loading Data
              </button>
              <button 
                onClick={() => setError(null)}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-50 border border-gray-200 rounded-xl transition-all duration-200 cursor-pointer"
              >
                Continue with Available Data
              </button>
            </div>
            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-left">
              <p className="text-sm text-yellow-800 font-medium mb-2">API Status:</p>
              <p className="text-xs text-yellow-700 mb-1">• Check if backend server is running</p>
              <p className="text-xs text-yellow-700 mb-1">• Verify API endpoints are accessible</p>
              <p className="text-xs text-yellow-700">• Ensure authentication token is valid</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-white to-gray-50">
      <Sidebar pendingApprovals={analytics.pendingApprovals} />
      
      <div className="flex-1 overflow-auto ml-72">
        <Header 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedTimeRange={selectedTimeRange}
          setSelectedTimeRange={setSelectedTimeRange}
          adminData={adminData}
        />

        <div className="px-8 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <span className="text-xs font-medium bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
              {analytics.totalPatients > 0 ? 'Real-time Insights' : 'Demo Mode'}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <ActionButton 
              icon={Download} 
              label="Export Report" 
              onClick={handleExportReport}
            />
            <ActionButton 
              icon={Plus} 
              label="Generate Report" 
              primary 
              onClick={handleGenerateReport}
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/30"
            />
          </div>
        </div>

        {analytics.totalPatients === 0 && analytics.totalDoctors === 0 && (
          <div className="px-8 pb-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-2">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Limited data available from APIs.
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Some analytics features may use generated data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <StatsGrid analytics={analytics} />
        <ChartsGrid analytics={analytics} />
        <DataTables analytics={analytics} />
        <QuickInsights />
      </div>
    </div>
  );
};

// ... (rest of the component code remains the same - ActionButton, StatsGrid, StatCard, ChartsGrid, etc.)

const ActionButton: React.FC<{ 
  icon: React.ElementType; 
  label: string; 
  primary?: boolean;
  className?: string;
  onClick?: () => void;
}> = ({ icon: Icon, label, primary, className = '', onClick }) => (
  <button 
    onClick={onClick}
    className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
      primary 
        ? `bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-lg shadow-purple-500/30 ${className}`
        : 'text-gray-600 hover:bg-gray-50 border border-gray-200'
    }`}
  >
    <Icon className="w-4 h-4" />
    <span className="text-sm font-medium">{label}</span>
  </button>
);

const StatsGrid: React.FC<{ analytics: AnalyticsData }> = ({ analytics }) => (
  <div className="px-8 pb-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      <StatCard icon={UserPlus} label="Total Patients" value={analytics.totalPatients || 0} change={analytics.totalPatients > 0 ? "+12%" : "No data"} color="purple" />
      <StatCard icon={Stethoscope} label="Total Doctors" value={analytics.totalDoctors || 0} change={analytics.totalDoctors > 0 ? "+8%" : "No data"} color="green" />
      <StatCard icon={Calendar} label="Active Appointments" value={analytics.activeAppointments || 0} change={analytics.activeAppointments > 0 ? "+15" : "No data"} color="blue" />
      <StatCard icon={CreditCard} label="Total Revenue" value={`$${(analytics.totalRevenue || 0).toLocaleString()}`} change={analytics.totalRevenue > 0 ? "+18%" : "No data"} color="orange" />
      <StatCard icon={UserCheck} label="Pending Approvals" value={analytics.pendingApprovals || 0} change={analytics.pendingApprovals > 0 ? "+3" : "No data"} color="yellow" />
      <StatCard icon={Activity} label="System Health" value="100%" change="+0%" color="purple" />
    </div>
  </div>
);

const StatCard: React.FC<{
  icon: React.ElementType;
  label: string;
  value: number | string;
  change: string;
  color: 'purple' | 'green' | 'blue' | 'orange' | 'yellow';
}> = ({ icon: Icon, label, value, change, color }) => {
  const colorConfig = {
    purple: { bg: 'from-purple-50 to-purple-100/50 border-purple-200/50', text: 'text-purple-600' },
    green: { bg: 'from-green-50 to-green-100/50 border-green-200/50', text: 'text-green-600' },
    blue: { bg: 'from-blue-50 to-blue-100/50 border-blue-200/50', text: 'text-blue-600' },
    orange: { bg: 'from-orange-50 to-orange-100/50 border-orange-200/50', text: 'text-orange-600' },
    yellow: { bg: 'from-yellow-50 to-yellow-100/50 border-yellow-200/50', text: 'text-yellow-600' }
  };

  return (
    <div className={`bg-gradient-to-br ${colorConfig[color].bg} border rounded-2xl p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          <p className={`text-xs font-medium mt-2 ${change.includes('+') ? 'text-green-600' : change.includes('No') ? 'text-gray-500' : 'text-red-600'}`}>
            {change} from last month
          </p>
        </div>
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
          <Icon className={`w-6 h-6 ${colorConfig[color].text}`} />
        </div>
      </div>
    </div>
  );
};

const ChartsGrid: React.FC<{ analytics: AnalyticsData }> = ({ analytics }) => (
  <div className="px-8 pb-8">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartContainer title="Appointments Trend" description="Weekly appointment statistics">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={analytics.appointmentsByDate}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip contentStyle={chartTooltipStyle} />
            <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Appointments" />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      <ChartContainer title="Revenue Overview" description="Monthly revenue growth">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={analytics.revenueByMonth}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip contentStyle={chartTooltipStyle} formatter={(value) => [`$${value}`, 'Revenue']} />
            <Area type="monotone" dataKey="revenue" fill="url(#colorRevenue)" stroke="#10b981" strokeWidth={2} name="Revenue" />
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>

      <ChartContainer title="Top Performing Doctors" description="Based on appointments and revenue">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={analytics.topDoctors} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={true} vertical={false} />
            <XAxis type="number" stroke="#6b7280" />
            <YAxis type="category" dataKey="name" stroke="#6b7280" width={100} tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={chartTooltipStyle} formatter={doctorTooltipFormatter} />
            <Legend />
            <Bar dataKey="appointments" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Appointments" />
            <Bar dataKey="revenue" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Revenue ($)" />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      <ChartContainer title="Disease Trends" description="Common conditions analysis">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={analytics.diseaseTrends} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="count" nameKey="disease">
              {analytics.diseaseTrends?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={chartTooltipStyle} formatter={(value, name, props) => [`${value} cases`, props.payload.disease]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>

      <ChartContainer title="Patient Growth" description="Cumulative patient growth over time" fullWidth>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={analytics.patientGrowth}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip contentStyle={chartTooltipStyle} formatter={(value) => [value, 'Patients']} />
            <Legend />
            <Line type="monotone" dataKey="patients" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Total Patients" />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  </div>
);

const ChartContainer: React.FC<{
  title: string;
  description: string;
  children: React.ReactNode;
  fullWidth?: boolean;
}> = ({ title, description, children, fullWidth = false }) => (
  <div className={`bg-white rounded-2xl shadow-lg shadow-purple-500/5 border border-gray-200/50 p-6 ${fullWidth ? 'lg:col-span-2' : ''}`}>
    <div className="flex items-center justify-between mb-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
    <div className="h-72">{children}</div>
  </div>
);

const chartTooltipStyle = {
  backgroundColor: 'white',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
};

const doctorTooltipFormatter = (value: number, name: string) => {
  if (name === 'appointments') return [value, 'Appointments'];
  if (name === 'revenue') return [`$${value}`, 'Revenue'];
  return [value, name];
};

const DataTables: React.FC<{ analytics: AnalyticsData }> = ({ analytics }) => (
  <div className="px-8 pb-8">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <DataTable title="Top Doctors Performance" data={analytics.topDoctors} columns={[
        { header: 'Doctor', key: 'name', render: (doctor) => <DoctorCell doctor={doctor} /> },
        { header: 'Specialization', key: 'specialization' },
        { header: 'Appointments', key: 'appointments' },
        { header: 'Revenue', key: 'revenue', render: (revenue) => <span className="font-medium text-green-600">${revenue.toLocaleString()}</span> }
      ]} />

      <DataTable title="Disease Trends Analysis" data={analytics.diseaseTrends} columns={[
        { header: 'Disease', key: 'disease', render: (disease) => <DiseaseCell disease={disease} /> },
        { header: 'Cases', key: 'count' },
        { header: 'Trend', key: 'trend', render: (trend) => <TrendCell trend={trend} /> },
        { header: 'Status', key: 'trend', render: (trend) => <StatusBadge trend={trend} /> }
      ]} />
    </div>
  </div>
);

const DataTable: React.FC<{
  title: string;
  data: any[];
  columns: { header: string; key: string; render?: (value: any, row?: any) => React.ReactNode }[];
}> = ({ title, data, columns }) => (
  <div className="bg-white rounded-2xl shadow-lg shadow-purple-500/5 border border-gray-200/50 overflow-hidden">
    <div className="border-b border-gray-200/50 px-6 py-4">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    </div>
    <div className="p-6">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              {columns.map((col, index) => (
                <th key={index} className="text-left py-3 px-4 text-sm font-medium text-gray-500">{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data?.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-200">
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="py-3 px-4">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const DoctorCell: React.FC<{ doctor: any }> = ({ doctor }) => (
  <div className="flex items-center space-x-3">
    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
      <Stethoscope className="w-4 h-4 text-purple-600" />
    </div>
    <div>
      <p className="font-medium text-gray-900">{doctor.name}</p>
    </div>
  </div>
);

const DiseaseCell: React.FC<{ disease: any }> = ({ disease }) => (
  <div className="flex items-center space-x-3">
    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
      <AlertCircle className="w-4 h-4 text-red-600" />
    </div>
    <div>
      <p className="font-medium text-gray-900">{disease.disease}</p>
    </div>
  </div>
);

const TrendCell: React.FC<{ trend: 'up' | 'down' }> = ({ trend }) => (
  <div className="flex items-center space-x-1">
    {trend === 'up' ? (
      <>
        <TrendingUp className="w-4 h-4 text-red-500" />
        <span className="text-sm text-red-600">Increasing</span>
      </>
    ) : (
      <>
        <TrendingUp className="w-4 h-4 text-green-500 rotate-180" />
        <span className="text-sm text-green-600">Decreasing</span>
      </>
    )}
  </div>
);

const StatusBadge: React.FC<{ trend: 'up' | 'down' }> = ({ trend }) => (
  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
    trend === 'up' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
  }`}>
    {trend === 'up' ? 'High Priority' : 'Under Control'}
  </span>
);

const QuickInsights: React.FC = () => (
  <div className="px-8 pb-8">
    <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Quick Insights</h3>
          <p className="text-sm text-gray-500">Key findings from the analytics</p>
        </div>
        <button className="text-sm text-purple-600 hover:text-purple-700 cursor-pointer">
          View Detailed Report →
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InsightCard
          title="Peak Appointment Hours"
          description="Most appointments occur between 10 AM - 12 PM"
          icon={Clock}
          color="purple"
        />
        <InsightCard
          title="Highest Revenue Stream"
          description="Cardiology generates 25% of total revenue"
          icon={DollarSign}
          color="green"
        />
        <InsightCard
          title="Patient Satisfaction"
          description="94% positive feedback this month"
          icon={CheckCircle}
          color="blue"
        />
      </div>
    </div>
  </div>
);

const InsightCard: React.FC<{
  icon: React.ElementType;
  title: string;
  description: string;
  color: 'purple' | 'green' | 'blue';
}> = ({ icon: Icon, title, description, color }) => {
  const colorClasses = {
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600'
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200">
      <div className="flex items-start space-x-4">
        <div className={`w-12 h-12 ${colorClasses[color]} rounded-xl flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </div>
  );
};

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

export default AdminDashboard;