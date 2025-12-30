"use client";

import React, { useState, useEffect } from 'react';
import { 
  FileText, User, Search, Filter, Download, MoreVertical, 
  Eye, Edit, Trash2, Plus, AlertCircle, CheckCircle, 
  XCircle, ChevronRight, RefreshCw, Calendar, Activity,
  FilePlus, FileDown, Stethoscope, Thermometer, Heart, 
  TrendingUp, TrendingDown, Clock, Bell, FileCheck,
  Shield, Pill, Activity as ActivityIcon, FileMedical,
  Clipboard, ClipboardCheck, FileWarning, FileSearch
} from 'lucide-react';
import api from '@/lib/api/api';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

interface MedicalRecord {
  _id: string;
  patientId: string;
  patientName?: string;
  doctorId: string;
  doctorName?: string;
  doctorSpecialization?: string;
  type: 'consultation' | 'follow-up' | 'emergency' | 'surgery' | 'lab-test' | 'procedure' | 'other';
  title: string;
  description: string;
  diagnosis: string;
  treatment: string;
  prescription: string;
  notes: string;
  attachments: {
    fileName: string;
    fileUrl: string;
    fileType: string;
  }[];
  status: 'active' | 'archived' | 'pending';
  vitalSigns: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
    bmi?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
  };
  date: string;
  visitDate: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface MedicalRecordStats {
  total: number;
  active: number;
  archived: number;
  pending: number;
  consultation: number;
  surgery: number;
  emergency: number;
  labTests: number;
  avgRecordsPerPatient?: number;
  recentRecords?: number;
  byDepartment?: { [key: string]: number };
}

interface FilterState {
  status: string;
  type: string;
  dateRange: string;
  patient: string;
  doctor: string;
}

// API URLs matching your documentation
const MEDICAL_RECORDS_API = {
  ALL: '/medical-records/all',
  MY_RECORDS: '/medical-records/my',
  ADD: '/medical-records/add',
  UPDATE: (recordId: string) => `/medical-records/update/${recordId}`,
  DELETE: (recordId: string) => `/medical-records/delete/${recordId}`,
  GET_ONE: (recordId: string) => `/medical-records/${recordId}`,
  PATIENT_RECORDS: (patientId: string) => `/medical-records/patient/${patientId}`
};

const ANALYTICS_API = {
  MEDICAL_RECORDS: '/analytics/medical-records'
};

const MedicalRecordsModule = () => {
  const router = useRouter();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>([]);
  const [stats, setStats] = useState<MedicalRecordStats>({ 
    total: 0, active: 0, archived: 0, pending: 0, 
    consultation: 0, surgery: 0, emergency: 0, labTests: 0 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ 
    status: 'all', 
    type: 'all', 
    dateRange: 'all', 
    patient: 'all',
    doctor: 'all'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => { 
    console.log('MedicalRecordsModule loading...');
    loadRecords(); 
    loadStats(); 
  }, []);

  useEffect(() => { 
    filterRecords(); 
  }, [searchQuery, filters, records]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading medical records from API:', MEDICAL_RECORDS_API.ALL);
      
      const response = await api.get(MEDICAL_RECORDS_API.ALL);
      console.log('Medical Records API Response:', {
        status: response.status,
        data: response.data,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data)
      });
      
      let recordsData: MedicalRecord[] = [];
      if (response.data && Array.isArray(response.data)) {
        recordsData = response.data.map((record: any) => ({
          _id: record._id || record.id,
          patientId: record.patientId,
          patientName: record.patientName || record.patient?.name || `Patient ${record.patientId?.slice(-8)}`,
          doctorId: record.doctorId,
          doctorName: record.doctorName || record.doctor?.name || 'Dr. Unknown',
          doctorSpecialization: record.doctorSpecialization || record.doctor?.specialization || 'General',
          type: mapRecordType(record.type),
          title: record.title || 'Untitled Record',
          description: record.description || '',
          diagnosis: record.diagnosis || '',
          treatment: record.treatment || '',
          prescription: record.prescription || '',
          notes: record.notes || '',
          attachments: record.attachments || [],
          status: record.status || 'active',
          vitalSigns: record.vitalSigns || {},
          date: record.date || new Date().toISOString().split('T')[0],
          visitDate: record.visitDate || record.date || new Date().toISOString().split('T')[0],
          tags: record.tags || [],
          createdAt: record.createdAt || new Date().toISOString(),
          updatedAt: record.updatedAt || new Date().toISOString()
        }));
      } else {
        console.warn('Invalid response format - expected array:', response.data);
        setError('Invalid data format received from server');
      }
      
      setRecords(recordsData);
      setFilteredRecords(recordsData);
      console.log('Total records loaded:', recordsData.length);
      
      if (recordsData.length === 0) {
        console.warn('No medical records data received from API');
      }
    } catch (error) {
      console.error('Error loading medical records:', error);
      console.error('Error details:', {
        message: (error as any).message,
        response: (error as any).response?.data,
        status: (error as any).response?.status
      });
      
      setRecords([]);
      setFilteredRecords([]);
      setError(`Failed to load medical records: ${(error as any).message || 'Network error'}`);
    } finally {
      setLoading(false);
      console.log('Medical records load completed');
    }
  };

  const loadStats = async () => {
    try {
      console.log('Loading medical records stats from:', ANALYTICS_API.MEDICAL_RECORDS);
      const response = await api.get(ANALYTICS_API.MEDICAL_RECORDS);
      
      console.log('Medical records stats response:', {
        status: response.status,
        data: response.data
      });
      
      if (response.data) {
        setStats(response.data);
        console.log('Medical records stats set:', response.data);
      } else {
        console.warn('No medical records stats data received');
        // Calculate stats from local data
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        const defaultStats: MedicalRecordStats = {
          total: records.length,
          active: records.filter(r => r.status === 'active').length,
          archived: records.filter(r => r.status === 'archived').length,
          pending: records.filter(r => r.status === 'pending').length,
          consultation: records.filter(r => r.type === 'consultation').length,
          surgery: records.filter(r => r.type === 'surgery').length,
          emergency: records.filter(r => r.type === 'emergency').length,
          labTests: records.filter(r => r.type === 'lab-test').length,
          recentRecords: records.filter(r => {
            const created = r.createdAt ? new Date(r.createdAt) : null;
            return created && created >= oneWeekAgo;
          }).length
        };
        
        setStats(defaultStats);
      }
    } catch (error) {
      console.error('Error loading medical records stats:', error);
      console.error('Error details:', (error as any).response?.data || (error as any).message);
      
      // Calculate stats from local data on error
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const defaultStats: MedicalRecordStats = {
        total: records.length,
        active: records.filter(r => r.status === 'active').length,
        archived: records.filter(r => r.status === 'archived').length,
        pending: records.filter(r => r.status === 'pending').length,
        consultation: records.filter(r => r.type === 'consultation').length,
        surgery: records.filter(r => r.type === 'surgery').length,
        emergency: records.filter(r => r.type === 'emergency').length,
        labTests: records.filter(r => r.type === 'lab-test').length,
        recentRecords: records.filter(r => {
          const created = r.createdAt ? new Date(r.createdAt) : null;
          return created && created >= oneWeekAgo;
        }).length
      };
      
      setStats(defaultStats);
    }
  };

  const mapRecordType = (type: string): MedicalRecord['type'] => {
    const typeMap: { [key: string]: MedicalRecord['type'] } = {
      'consultation': 'consultation',
      'follow-up': 'follow-up',
      'followup': 'follow-up',
      'emergency': 'emergency',
      'surgery': 'surgery',
      'lab-test': 'lab-test',
      'lab': 'lab-test',
      'procedure': 'procedure',
      'other': 'other'
    };
    return typeMap[type?.toLowerCase()] || 'consultation';
  };

  const handleAddRecord = async (recordData: any) => {
    try {
      console.log('Adding new medical record:', recordData);
      console.log('API endpoint:', MEDICAL_RECORDS_API.ADD);
      
      // Validate required fields
      const requiredFields = ['patientId', 'doctorId', 'title', 'diagnosis'];
      const missingFields = requiredFields.filter(field => !recordData[field]);
      
      if (missingFields.length > 0) {
        alert(`Missing required fields: ${missingFields.join(', ')}`);
        return;
      }
      
      // Prepare data matching API structure
      const apiData = {
        patientId: recordData.patientId,
        doctorId: recordData.doctorId,
        type: recordData.type,
        title: recordData.title,
        description: recordData.description,
        diagnosis: recordData.diagnosis,
        treatment: recordData.treatment,
        prescription: recordData.prescription,
        notes: recordData.notes,
        attachments: recordData.attachments || [],
        status: recordData.status || 'active',
        vitalSigns: recordData.vitalSigns || {},
        date: recordData.date,
        visitDate: recordData.visitDate || recordData.date,
        tags: recordData.tags || []
      };
      
      console.log('Sending to API:', apiData);
      
      const response = await api.post(MEDICAL_RECORDS_API.ADD, apiData);
      console.log('Add medical record response:', response);
      console.log('Response data:', response.data);
      
      if (response.data) {
        const newRecord: MedicalRecord = {
          _id: response.data.id || response.data._id || `temp-${Date.now()}`,
          patientId: response.data.patientId || apiData.patientId,
          patientName: response.data.patientName || recordData.patientName || `Patient ${apiData.patientId.slice(-8)}`,
          doctorId: response.data.doctorId || apiData.doctorId,
          doctorName: response.data.doctorName || recordData.doctorName || 'Dr. Unknown',
          doctorSpecialization: response.data.doctorSpecialization || recordData.doctorSpecialization || 'General',
          type: response.data.type || apiData.type,
          title: response.data.title || apiData.title,
          description: response.data.description || apiData.description,
          diagnosis: response.data.diagnosis || apiData.diagnosis,
          treatment: response.data.treatment || apiData.treatment,
          prescription: response.data.prescription || apiData.prescription,
          notes: response.data.notes || apiData.notes,
          attachments: response.data.attachments || apiData.attachments,
          status: response.data.status || apiData.status,
          vitalSigns: response.data.vitalSigns || apiData.vitalSigns,
          date: response.data.date || apiData.date,
          visitDate: response.data.visitDate || apiData.visitDate,
          tags: response.data.tags || apiData.tags,
          createdAt: response.data.createdAt || new Date().toISOString(),
          updatedAt: response.data.updatedAt || new Date().toISOString()
        };
        
        console.log('Created new medical record:', newRecord);
        
        setRecords([...records, newRecord]);
        setIsAddModalOpen(false);
        loadStats();
        alert('Medical record added successfully!');
      }
    } catch (error: any) {
      console.error('Error adding medical record:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        config: error.config
      });
      
      let errorMessage = 'Failed to add medical record. ';
      
      if (error.response) {
        if (error.response.status === 500) {
          errorMessage += 'Server error (500). Please check server logs.';
        } else if (error.response.data?.message) {
          errorMessage += error.response.data.message;
        } else if (error.response.data?.error) {
          errorMessage += error.response.data.error;
        } else if (error.response.data) {
          errorMessage += JSON.stringify(error.response.data);
        } else {
          errorMessage += `Server responded with status ${error.response.status}`;
        }
      } else if (error.request) {
        errorMessage += 'No response from server. Please check your connection.';
      } else {
        errorMessage += error.message;
      }
      
      alert(errorMessage);
      
      if (confirm('Would you like to try again?')) {
        console.log('User wants to retry adding medical record');
      }
    }
  };

  const handleUpdateRecord = async (recordId: string, updateData: any) => {
    try {
      console.log('Updating medical record:', { recordId, updateData });
      const response = await api.patch(MEDICAL_RECORDS_API.UPDATE(recordId), updateData);
      console.log('Update response:', response.data);
      
      if (response.data) {
        setRecords(records.map(record => 
          record._id === recordId ? { ...record, ...updateData } : record
        ));
        setIsEditModalOpen(false);
        alert('Medical record updated successfully!');
      }
    } catch (error) {
      console.error('Error updating medical record:', error);
      alert('Failed to update medical record. Please try again.');
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (confirm('Are you sure you want to delete this medical record? This action cannot be undone.')) {
      try {
        console.log('Deleting medical record:', recordId);
        await api.delete(MEDICAL_RECORDS_API.DELETE(recordId));
        
        setRecords(records.filter(record => record._id !== recordId));
        loadStats();
        alert('Medical record deleted successfully.');
      } catch (error) {
        console.error('Error deleting medical record:', error);
        alert('Failed to delete medical record. Please try again.');
      }
    }
  };

  const handleExportRecords = async () => {
    try {
      console.log('Exporting medical records data');
      const response = await api.get(MEDICAL_RECORDS_API.ALL, { 
        params: { format: 'csv' }, 
        responseType: 'blob' 
      });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `medical-records-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      console.log('Export completed');
    } catch (error) {
      console.error('Error exporting medical records:', error);
      alert('Failed to export medical records. Please try again.');
    }
  };

  const filterRecords = () => {
    console.log('Filtering medical records with:', {
      searchQuery,
      filters,
      totalRecords: records.length
    });
    
    let filtered = [...records];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(record =>
        record.title.toLowerCase().includes(query) ||
        record.diagnosis.toLowerCase().includes(query) ||
        record.patientName?.toLowerCase().includes(query) ||
        record.doctorName?.toLowerCase().includes(query) ||
        record.tags.some(tag => tag.toLowerCase().includes(query)) ||
        record._id.toLowerCase().includes(query)
      );
      console.log(`Filtered by search "${searchQuery}": ${filtered.length} records`);
    }
    
    if (filters.status !== 'all') {
      filtered = filtered.filter(record => record.status === filters.status);
      console.log(`Filtered by status "${filters.status}": ${filtered.length} records`);
    }
    
    if (filters.type !== 'all') {
      filtered = filtered.filter(record => record.type === filters.type);
      console.log(`Filtered by type "${filters.type}": ${filtered.length} records`);
    }
    
    if (filters.dateRange !== 'all') {
      const today = new Date();
      filtered = filtered.filter(record => {
        const recordDate = record.date ? new Date(record.date) : null;
        if (!recordDate) return false;
        
        switch (filters.dateRange) {
          case 'today': 
            return recordDate.toDateString() === today.toDateString();
          case 'week': 
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return recordDate >= weekAgo;
          case 'month': 
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            return recordDate >= monthAgo;
          case 'year': 
            const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
            return recordDate >= yearAgo;
          default: 
            return true;
        }
      });
      console.log(`Filtered by date range "${filters.dateRange}": ${filtered.length} records`);
    }
    
    console.log('Final filtered records count:', filtered.length);
    setFilteredRecords(filtered);
    setCurrentPage(1);
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    console.log(`Filter changed: ${key} = ${value}`);
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'Not specified';
      return new Date(dateString).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return 'Invalid date';
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      if (!dateString) return 'Not specified';
      return new Date(dateString).toLocaleString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = { 
      active: 'bg-green-100 text-green-700', 
      archived: 'bg-gray-100 text-gray-700', 
      pending: 'bg-yellow-100 text-yellow-700' 
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getTypeColor = (type: MedicalRecord['type']) => {
    const colors: Record<string, string> = {
      consultation: 'bg-blue-100 text-blue-700',
      'follow-up': 'bg-purple-100 text-purple-700',
      emergency: 'bg-red-100 text-red-700',
      surgery: 'bg-orange-100 text-orange-700',
      'lab-test': 'bg-indigo-100 text-indigo-700',
      procedure: 'bg-teal-100 text-teal-700',
      other: 'bg-gray-100 text-gray-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  console.log('Component render state:', {
    loading,
    error,
    recordsCount: records.length,
    filteredCount: filteredRecords.length,
    currentRecordsCount: currentRecords.length,
    stats
  });

  if (loading && !records.length) {
    return <LoadingScreen message="Loading medical records..." />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
        <Sidebar activeRoute="/admin/medical-records" />
        
        <div className="flex-1 overflow-auto ml-72 flex items-center justify-center">
          <div className="text-center max-w-md p-8">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-gray-900 mb-3">Error Loading Medical Records</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button 
                onClick={() => {
                  setError(null);
                  loadRecords();
                }}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 cursor-pointer"
              >
                Retry Loading
              </button>
              <button 
                onClick={() => {
                  setError(null);
                  setRecords([]);
                }}
                className="w-full px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-50 border border-gray-200 rounded-xl transition-all duration-200 cursor-pointer"
              >
                Continue Anyway
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      <Sidebar activeRoute="/admin/medical-records" />
      <div className="flex-1 overflow-auto ml-72">
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} adminData={{ name: 'System Admin' }} searchPlaceholder="Search medical records..." />
        
        {/* Page Header */}
        <div className="sticky top-[84px] z-10 bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Medical Records Management</h1>
              <span className="text-sm font-medium bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                {filteredRecords.length} records
                {records.length === 0 && ' (No data loaded)'}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <button onClick={() => { loadRecords(); loadStats(); }} className="flex items-center space-x-2 px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-xl border border-gray-200 transition-all duration-200 cursor-pointer">
                <RefreshCw className="w-4 h-4" /><span className="text-sm font-medium">Refresh</span>
              </button>
              <button onClick={() => setIsAddModalOpen(true)} className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-500/30 cursor-pointer">
                <Plus className="w-4 h-4" /><span className="text-sm font-medium">Add New Record</span>
              </button>
            </div>
          </div>
        </div>

        {/* Debug Info Banner */}
        {records.length === 0 && (
          <div className="px-8 py-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-2">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    No medical records data loaded. Showing placeholder data.
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Check browser console for API debugging information.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <StatCard icon={FileText} label="Total Records" value={stats.total} change="+15%" color="blue" />
            <StatCard icon={CheckCircle} label="Active" value={stats.active} change="+8%" color="green" />
            <StatCard icon={FileDown} label="Archived" value={stats.archived} change="+3%" color="gray" />
            <StatCard icon={AlertCircle} label="Pending" value={stats.pending} change="+5%" color="yellow" />
            <StatCard icon={Stethoscope} label="Consultations" value={stats.consultation} change="+12%" color="purple" />
            <StatCard icon={ActivityIcon} label="Surgeries" value={stats.surgery} change="+8%" color="orange" />
            <StatCard icon={FileWarning} label="Emergency" value={stats.emergency} change="+20%" color="red" />
            <StatCard icon={FileMedical} label="Lab Tests" value={stats.labTests} change="+10%" color="indigo" />
          </div>
        </div>

        {/* Filters Panel */}
        <div className="px-8 pb-6">
          <div className="bg-white rounded-2xl shadow-lg shadow-blue-500/5 border border-gray-200/50 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1 max-w-lg">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="text" 
                    placeholder="Search medical records by title, diagnosis, patient, or tags..." 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200" 
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select 
                    value={filters.status} 
                    onChange={(e) => handleFilterChange('status', e.target.value)} 
                    className="px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <select 
                  value={filters.type} 
                  onChange={(e) => handleFilterChange('type', e.target.value)} 
                  className="px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="consultation">Consultation</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="emergency">Emergency</option>
                  <option value="surgery">Surgery</option>
                  <option value="lab-test">Lab Test</option>
                  <option value="procedure">Procedure</option>
                  <option value="other">Other</option>
                </select>
                <select 
                  value={filters.dateRange} 
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)} 
                  className="px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 text-sm"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="year">Last Year</option>
                </select>
                <button onClick={handleExportRecords} className="flex items-center space-x-2 px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-xl border border-gray-200 transition-all duration-200 cursor-pointer">
                  <Download className="w-4 h-4" /><span className="text-sm font-medium">Export</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Medical Records List */}
        <div className="px-8 pb-8">
          <div className="bg-white rounded-2xl shadow-lg shadow-blue-500/5 border border-gray-200/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">All Medical Records</h3>
              <p className="text-sm text-gray-500">
                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredRecords.length)} of {filteredRecords.length} records
              </p>
            </div>
            {currentRecords.length > 0 ? (
              <div className="space-y-4">
                {currentRecords.map((record) => (
                  <MedicalRecordCard 
                    key={record._id} 
                    record={record} 
                    onView={() => { 
                      setSelectedRecord(record); 
                      setIsDetailModalOpen(true); 
                    }} 
                    onEdit={() => { 
                      setSelectedRecord(record); 
                      setIsEditModalOpen(true); 
                    }} 
                    onDelete={() => handleDeleteRecord(record._id)} 
                    formatDate={formatDate} 
                    getStatusColor={getStatusColor} 
                    getTypeColor={getTypeColor} 
                  />
                ))}
              </div>
            ) : (
              <div className="py-12 px-6 text-center">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No medical records found</p>
                  <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                </div>
              </div>
            )}
            {filteredRecords.length > itemsPerPage && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-8 pb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                <p className="text-sm text-gray-500">Manage medical records efficiently</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <ActionCard icon={FilePlus} title="Add Record" description="Create new medical record" color="blue" onClick={() => setIsAddModalOpen(true)} />
              <ActionCard icon={FileCheck} title="Batch Import" description="Import multiple records" color="green" onClick={() => router.push('/admin/import')} />
              <ActionCard icon={ClipboardCheck} title="Audit Logs" description="View access history" color="purple" onClick={() => router.push('/admin/audit')} />
              <ActionCard icon={Bell} title="Alerts" description="Critical records alerts" color="red" onClick={() => router.push('/admin/alerts')} />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isDetailModalOpen && selectedRecord && (
        <MedicalRecordDetailModal 
          record={selectedRecord} 
          onClose={() => { 
            setIsDetailModalOpen(false); 
            setSelectedRecord(null); 
          }} 
          formatDate={formatDate}
          formatDateTime={formatDateTime}
          getStatusColor={getStatusColor}
          getTypeColor={getTypeColor}
        />
      )}
      {isAddModalOpen && <AddMedicalRecordModal onClose={() => setIsAddModalOpen(false)} onSubmit={handleAddRecord} />}
      {isEditModalOpen && selectedRecord && <EditMedicalRecordModal record={selectedRecord} onClose={() => { setIsEditModalOpen(false); setSelectedRecord(null); }} onSubmit={handleUpdateRecord} />}
    </div>
  );
};

// Medical Record Card Component
const MedicalRecordCard: React.FC<{
  record: MedicalRecord; 
  onView: () => void; 
  onEdit: () => void; 
  onDelete: () => void;
  formatDate: (date: string) => string; 
  getStatusColor: (status: string) => string;
  getTypeColor: (type: MedicalRecord['type']) => string;
}> = ({ record, onView, onEdit, onDelete, formatDate, getStatusColor, getTypeColor }) => {
  return (
    <div className="bg-white border border-gray-200/50 rounded-2xl p-5 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-all duration-200">
              {record.title}
            </h3>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getTypeColor(record.type)}`}>
                {record.type}
              </span>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                {record.status === 'active' && <CheckCircle className="w-3 h-3 mr-1" />}
                {record.status === 'pending' && <AlertCircle className="w-3 h-3 mr-1" />}
                {record.status?.charAt(0).toUpperCase() + record.status?.slice(1)}
              </span>
            </div>
          </div>
          
          <p className="text-gray-600 text-sm mt-2 line-clamp-2">{record.description || record.diagnosis}</p>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="flex items-center">
              <User className="w-4 h-4 text-gray-400 mr-2" />
              <div>
                <p className="text-xs text-gray-500">Patient</p>
                <p className="text-sm font-medium text-gray-900">{record.patientName || 'Unknown'}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Stethoscope className="w-4 h-4 text-gray-400 mr-2" />
              <div>
                <p className="text-xs text-gray-500">Doctor</p>
                <p className="text-sm font-medium text-gray-900">{record.doctorName || 'Dr. Unknown'}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 ml-4">
          <button onClick={onView} className="p-1.5 hover:bg-blue-50 rounded-lg transition-all duration-200 cursor-pointer text-gray-500 hover:text-blue-600" title="View Details">
            <Eye className="w-4 h-4" />
          </button>
          <button onClick={onEdit} className="p-1.5 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer text-gray-500 hover:text-blue-600" title="Edit">
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={onDelete} className="p-1.5 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer text-gray-500 hover:text-red-600" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200/50">
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {record.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                {tag}
              </span>
            ))}
            {record.tags.length > 3 && (
              <span className="text-xs text-gray-400">+{record.tags.length - 3} more</span>
            )}
            {record.tags.length === 0 && (
              <span className="text-xs text-gray-400">No tags</span>
            )}
          </div>
          
          <div className="text-right">
            <p className="text-xs text-gray-500">Date</p>
            <p className="text-sm font-medium text-gray-900">{formatDate(record.date)}</p>
          </div>
        </div>
        
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            {record.vitalSigns.heartRate && (
              <span className="flex items-center">
                <Heart className="w-3 h-3 mr-1" />
                {record.vitalSigns.heartRate} bpm
              </span>
            )}
            {record.vitalSigns.temperature && (
              <span className="flex items-center">
                <Thermometer className="w-3 h-3 mr-1" />
                {record.vitalSigns.temperature}°C
              </span>
            )}
            {record.vitalSigns.bloodPressure && (
              <span className="flex items-center">
                <ActivityIcon className="w-3 h-3 mr-1" />
                {record.vitalSigns.bloodPressure}
              </span>
            )}
          </div>
          
          <div className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {formatDate(record.createdAt)}
          </div>
        </div>
      </div>
    </div>
  );
};

// Stats Card Component
const StatCard: React.FC<{
  icon: React.ElementType; 
  label: string; 
  value: number; 
  change: string; 
  color: 'blue' | 'green' | 'gray' | 'yellow' | 'purple' | 'orange' | 'red' | 'indigo';
}> = ({ icon: Icon, label, value, change, color }) => {
  const colorConfig = {
    blue: { bg: 'from-blue-50 to-blue-100/50 border-blue-200/50', text: 'text-blue-600' },
    green: { bg: 'from-green-50 to-green-100/50 border-green-200/50', text: 'text-green-600' },
    gray: { bg: 'from-gray-50 to-gray-100/50 border-gray-200/50', text: 'text-gray-600' },
    yellow: { bg: 'from-yellow-50 to-yellow-100/50 border-yellow-200/50', text: 'text-yellow-600' },
    purple: { bg: 'from-purple-50 to-purple-100/50 border-purple-200/50', text: 'text-purple-600' },
    orange: { bg: 'from-orange-50 to-orange-100/50 border-orange-200/50', text: 'text-orange-600' },
    red: { bg: 'from-red-50 to-red-100/50 border-red-200/50', text: 'text-red-600' },
    indigo: { bg: 'from-indigo-50 to-indigo-100/50 border-indigo-200/50', text: 'text-indigo-600' }
  };
  return (
    <div className={`bg-gradient-to-br ${colorConfig[color].bg} border rounded-xl p-4`}>
      <div className="text-center">
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mx-auto shadow-sm mb-2">
          <Icon className={`w-5 h-5 ${colorConfig[color].text}`} />
        </div>
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
        <div className="flex items-center justify-center mt-1">
          {change.startsWith('+') ? <TrendingUp className="w-3 h-3 text-green-500 mr-1" /> : <TrendingDown className="w-3 h-3 text-red-500 mr-1" />}
          <span className={`text-xs font-medium ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
            {change}
          </span>
        </div>
      </div>
    </div>
  );
};

// Action Card Component
const ActionCard: React.FC<{
  icon: React.ElementType; 
  title: string; 
  description: string; 
  color: 'blue' | 'green' | 'purple' | 'red'; 
  onClick: () => void;
}> = ({ icon: Icon, title, description, color, onClick }) => {
  const colorClasses = { 
    blue: 'bg-blue-100 text-blue-600', 
    green: 'bg-green-100 text-green-600', 
    purple: 'bg-purple-100 text-purple-600', 
    red: 'bg-red-100 text-red-600' 
  };
  return (
    <button onClick={onClick} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200 cursor-pointer text-left group">
      <div className="flex items-start space-x-4">
        <div className={`w-12 h-12 ${colorClasses[color]} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-all duration-200`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-all duration-200">{title}</h4>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </button>
  );
};

// Pagination Component
const Pagination: React.FC<{ currentPage: number; totalPages: number; onPageChange: (page: number) => void; }> = ({ currentPage, totalPages, onPageChange }) => (
  <div className="border-t border-gray-200/50 px-6 py-4 mt-6">
    <div className="flex items-center justify-between">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className={`flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all duration-200 ${currentPage === 1 ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer'}`}>
        <ChevronRight className="w-4 h-4 rotate-180" /><span className="text-sm font-medium">Previous</span>
      </button>
      <div className="flex items-center space-x-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button key={page} onClick={() => onPageChange(page)} className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 ${currentPage === page ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
            {page}
          </button>
        ))}
      </div>
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className={`flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all duration-200 ${currentPage === totalPages ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer'}`}>
        <span className="text-sm font-medium">Next</span><ChevronRight className="w-4 h-4" />
      </button>
    </div>
  </div>
);

// Medical Record Detail Modal Component
const MedicalRecordDetailModal: React.FC<{
  record: MedicalRecord; 
  onClose: () => void;
  formatDate: (date: string) => string;
  formatDateTime: (date: string) => string;
  getStatusColor: (status: string) => string;
  getTypeColor: (type: MedicalRecord['type']) => string;
}> = ({ record, onClose, formatDate, formatDateTime, getStatusColor, getTypeColor }) => {
  
  const getStatusText = (status: string) => {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300" onClick={onClose} />
      <div className="relative w-full max-w-6xl mx-auto max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl transition-all duration-300">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{record.title}</h2>
              <div className="flex items-center space-x-3 mt-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(record.status)}`}>
                  {record.status === 'active' && <CheckCircle className="w-4 h-4 mr-1" />}
                  {record.status === 'pending' && <AlertCircle className="w-4 h-4 mr-1" />}
                  {getStatusText(record.status)}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(record.type)}`}>
                  {record.type}
                </span>
                <span className="text-sm text-gray-600">
                  {formatDate(record.date)}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer">
              <XCircle className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Patient & Doctor Information */}
            <div className="bg-gray-50/50 border border-gray-200/50 rounded-xl p-5">
              <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Patient & Doctor Information
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Patient</p>
                  <p className="font-medium text-gray-900 mt-1">{record.patientName || 'Unknown'}</p>
                  <p className="text-xs text-gray-500 mt-1">ID: {record.patientId || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Doctor</p>
                  <p className="font-medium text-gray-900 mt-1">{record.doctorName || 'Dr. Unknown'}</p>
                  <p className="text-xs text-gray-500 mt-1">{record.doctorSpecialization || 'General'} • ID: {record.doctorId || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Record Information */}
            <div className="bg-gray-50/50 border border-gray-200/50 rounded-xl p-5">
              <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Record Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Visit Date</p>
                  <p className="font-medium text-gray-900 mt-1">{formatDate(record.visitDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Record Date</p>
                  <p className="font-medium text-gray-900 mt-1">{formatDate(record.date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="font-medium text-gray-900 mt-1">{formatDateTime(record.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="font-medium text-gray-900 mt-1">{formatDateTime(record.updatedAt)}</p>
                </div>
              </div>
            </div>

            {/* Diagnosis & Treatment */}
            <div className="lg:col-span-2 bg-blue-50/50 border border-blue-200/50 rounded-xl p-5">
              <h3 className="font-medium text-blue-900 mb-4 flex items-center">
                <FileSearch className="w-5 h-5 mr-2 text-blue-600" />
                Diagnosis & Treatment
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Diagnosis</p>
                  <div className="bg-white p-4 rounded-lg border border-blue-100">
                    <p className="text-gray-700">{record.diagnosis || 'No diagnosis recorded'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Treatment</p>
                  <div className="bg-white p-4 rounded-lg border border-blue-100">
                    <p className="text-gray-700">{record.treatment || 'No treatment recorded'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Prescription */}
            {record.prescription && (
              <div className="lg:col-span-2 bg-green-50/50 border border-green-200/50 rounded-xl p-5">
                <h3 className="font-medium text-green-900 mb-4 flex items-center">
                  <Pill className="w-5 h-5 mr-2 text-green-600" />
                  Prescription
                </h3>
                <div className="bg-white p-4 rounded-lg border border-green-100">
                  <p className="text-gray-700 whitespace-pre-line">{record.prescription}</p>
                </div>
              </div>
            )}

            {/* Vital Signs */}
            {Object.keys(record.vitalSigns).length > 0 && (
              <div className="lg:col-span-2 bg-purple-50/50 border border-purple-200/50 rounded-xl p-5">
                <h3 className="font-medium text-purple-900 mb-4 flex items-center">
                  <ActivityIcon className="w-5 h-5 mr-2 text-purple-600" />
                  Vital Signs
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {record.vitalSigns.bloodPressure && (
                    <div className="bg-white p-4 rounded-xl border border-purple-100">
                      <div className="flex items-center">
                        <ActivityIcon className="w-4 h-4 text-purple-600 mr-2" />
                        <p className="text-sm text-gray-600">Blood Pressure</p>
                      </div>
                      <p className="font-medium text-gray-900 mt-1 text-lg">{record.vitalSigns.bloodPressure}</p>
                    </div>
                  )}
                  {record.vitalSigns.heartRate && (
                    <div className="bg-white p-4 rounded-xl border border-purple-100">
                      <div className="flex items-center">
                        <Heart className="w-4 h-4 text-purple-600 mr-2" />
                        <p className="text-sm text-gray-600">Heart Rate</p>
                      </div>
                      <p className="font-medium text-gray-900 mt-1 text-lg">{record.vitalSigns.heartRate} bpm</p>
                    </div>
                  )}
                  {record.vitalSigns.temperature && (
                    <div className="bg-white p-4 rounded-xl border border-purple-100">
                      <div className="flex items-center">
                        <Thermometer className="w-4 h-4 text-purple-600 mr-2" />
                        <p className="text-sm text-gray-600">Temperature</p>
                      </div>
                      <p className="font-medium text-gray-900 mt-1 text-lg">{record.vitalSigns.temperature}°C</p>
                    </div>
                  )}
                  {record.vitalSigns.weight && (
                    <div className="bg-white p-4 rounded-xl border border-purple-100">
                      <div className="flex items-center">
                        <ActivityIcon className="w-4 h-4 text-purple-600 mr-2" />
                        <p className="text-sm text-gray-600">Weight</p>
                      </div>
                      <p className="font-medium text-gray-900 mt-1 text-lg">{record.vitalSigns.weight} kg</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            {record.notes && (
              <div className="lg:col-span-2 bg-gray-50/50 border border-gray-200/50 rounded-xl p-5">
                <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                  <Clipboard className="w-5 h-5 mr-2 text-gray-600" />
                  Notes
                </h3>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-700 whitespace-pre-line">{record.notes}</p>
                </div>
              </div>
            )}

            {/* Tags */}
            {record.tags.length > 0 && (
              <div className="lg:col-span-2">
                <p className="text-sm font-medium text-gray-700 mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {record.tags.map((tag, index) => (
                    <span key={index} className="text-sm bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Attachments */}
            {record.attachments.length > 0 && (
              <div className="lg:col-span-2 bg-indigo-50/50 border border-indigo-200/50 rounded-xl p-5">
                <h3 className="font-medium text-indigo-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                  Attachments ({record.attachments.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {record.attachments.map((attachment, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border border-indigo-100 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm truncate">{attachment.fileName}</p>
                          <p className="text-xs text-gray-500 mt-1">{attachment.fileType}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => window.open(attachment.fileUrl, '_blank')}
                        className="w-full mt-3 px-3 py-1.5 text-xs text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200 cursor-pointer"
                      >
                        View File
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-8 pt-8 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 cursor-pointer">
                Download PDF
              </button>
              <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200 transition-all duration-200 cursor-pointer">
                Share Record
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-all duration-200 cursor-pointer">
                Archive Record
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-500/30 cursor-pointer">
                Edit Record
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add Medical Record Modal
const AddMedicalRecordModal: React.FC<{ onClose: () => void; onSubmit: (recordData: any) => void; }> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    doctorId: '',
    doctorName: '',
    type: 'consultation' as MedicalRecord['type'],
    title: '',
    description: '',
    diagnosis: '',
    treatment: '',
    prescription: '',
    notes: '',
    status: 'active',
    vitalSigns: {
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      weight: ''
    },
    date: new Date().toISOString().split('T')[0],
    visitDate: new Date().toISOString().split('T')[0],
    tags: ''
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.patientId.trim()) newErrors.patientId = 'Patient ID is required';
    if (!formData.doctorId.trim()) newErrors.doctorId = 'Doctor ID is required';
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.diagnosis.trim()) newErrors.diagnosis = 'Diagnosis is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    
    if (!validateForm()) {
      alert('Please fix the errors in the form');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Process vital signs
      const vitalSigns: any = {};
      if (formData.vitalSigns.bloodPressure) vitalSigns.bloodPressure = formData.vitalSigns.bloodPressure;
      if (formData.vitalSigns.heartRate) vitalSigns.heartRate = parseInt(formData.vitalSigns.heartRate) || 0;
      if (formData.vitalSigns.temperature) vitalSigns.temperature = parseFloat(formData.vitalSigns.temperature) || 0;
      if (formData.vitalSigns.weight) vitalSigns.weight = parseFloat(formData.vitalSigns.weight) || 0;
      
      // Process tags
      const tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      await onSubmit({ 
        ...formData,
        vitalSigns,
        tags,
        attachments: [] // Empty array for now, can be extended for file uploads
      });
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { 
    const { name, value } = e.target;
    
    if (name.startsWith('vitalSigns.')) {
      const vitalSignField = name.split('.')[1];
      setFormData({ 
        ...formData, 
        vitalSigns: { 
          ...formData.vitalSigns, 
          [vitalSignField]: value 
        } 
      });
    } else {
      setFormData({ ...formData, [name]: value }); 
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({...errors, [name]: ''});
    }
  };

  const recordTypes: MedicalRecord['type'][] = ['consultation', 'follow-up', 'emergency', 'surgery', 'lab-test', 'procedure', 'other'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300" onClick={onClose} />
      <div className="relative w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Add New Medical Record</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer">
              <XCircle className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">Fill in medical record information (fields marked with * are required)</p>
        </div>
        
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleChange} 
                  required 
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${errors.title ? 'border-red-300' : 'border-gray-300'}`} 
                  placeholder="e.g., Annual Checkup, Emergency Visit" 
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient ID <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  name="patientId" 
                  value={formData.patientId} 
                  onChange={handleChange} 
                  required 
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${errors.patientId ? 'border-red-300' : 'border-gray-300'}`} 
                  placeholder="Patient identifier" 
                />
                {errors.patientId && <p className="mt-1 text-sm text-red-600">{errors.patientId}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient Name
                </label>
                <input 
                  type="text" 
                  name="patientName" 
                  value={formData.patientName} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200" 
                  placeholder="Optional - will auto-fill if available" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Doctor ID <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  name="doctorId" 
                  value={formData.doctorId} 
                  onChange={handleChange} 
                  required 
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${errors.doctorId ? 'border-red-300' : 'border-gray-300'}`} 
                  placeholder="Doctor identifier" 
                />
                {errors.doctorId && <p className="mt-1 text-sm text-red-600">{errors.doctorId}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Doctor Name
                </label>
                <input 
                  type="text" 
                  name="doctorName" 
                  value={formData.doctorName} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200" 
                  placeholder="Optional - will auto-fill if available" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Record Type <span className="text-red-500">*</span>
                </label>
                <select 
                  name="type" 
                  value={formData.type} 
                  onChange={handleChange} 
                  required 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                >
                  {recordTypes.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select 
                  name="status" 
                  value={formData.status} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visit Date
                </label>
                <input 
                  type="date" 
                  name="visitDate" 
                  value={formData.visitDate} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Record Date
                </label>
                <input 
                  type="date" 
                  name="date" 
                  value={formData.date} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200" 
                />
              </div>
              
              {/* Medical Information */}
              <div className="md:col-span-2 mt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Information</h3>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diagnosis <span className="text-red-500">*</span>
                </label>
                <textarea 
                  name="diagnosis" 
                  value={formData.diagnosis} 
                  onChange={handleChange} 
                  required 
                  rows={3} 
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${errors.diagnosis ? 'border-red-300' : 'border-gray-300'}`} 
                  placeholder="Enter primary diagnosis" 
                />
                {errors.diagnosis && <p className="mt-1 text-sm text-red-600">{errors.diagnosis}</p>}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Treatment
                </label>
                <textarea 
                  name="treatment" 
                  value={formData.treatment} 
                  onChange={handleChange} 
                  rows={3} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200" 
                  placeholder="Enter treatment provided" 
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prescription
                </label>
                <textarea 
                  name="prescription" 
                  value={formData.prescription} 
                  onChange={handleChange} 
                  rows={3} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200" 
                  placeholder="Enter medication prescriptions" 
                />
              </div>
              
              {/* Vital Signs */}
              <div className="md:col-span-2 mt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Vital Signs</h3>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blood Pressure
                </label>
                <input 
                  type="text" 
                  name="vitalSigns.bloodPressure" 
                  value={formData.vitalSigns.bloodPressure} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200" 
                  placeholder="e.g., 120/80" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Heart Rate (bpm)
                </label>
                <input 
                  type="number" 
                  name="vitalSigns.heartRate" 
                  value={formData.vitalSigns.heartRate} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200" 
                  placeholder="e.g., 72" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperature (°C)
                </label>
                <input 
                  type="number" 
                  step="0.1" 
                  name="vitalSigns.temperature" 
                  value={formData.vitalSigns.temperature} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200" 
                  placeholder="e.g., 36.6" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (kg)
                </label>
                <input 
                  type="number" 
                  step="0.1" 
                  name="vitalSigns.weight" 
                  value={formData.vitalSigns.weight} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200" 
                  placeholder="e.g., 70.5" 
                />
              </div>
              
              {/* Additional Information */}
              <div className="md:col-span-2 mt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  rows={3} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200" 
                  placeholder="Brief description of the medical record" 
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea 
                  name="notes" 
                  value={formData.notes} 
                  onChange={handleChange} 
                  rows={3} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200" 
                  placeholder="Additional notes or observations" 
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <textarea 
                  name="tags" 
                  value={formData.tags} 
                  onChange={handleChange} 
                  rows={2} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200" 
                  placeholder="Chronic, Follow-up, Hypertension (comma separated)" 
                />
                <p className="mt-1 text-xs text-gray-500">Separate multiple tags with commas</p>
              </div>
            </div>
            
            <div className="sticky bottom-0 bg-white pt-6 mt-6 border-t border-gray-200">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Medical records are confidential and protected by HIPAA regulations.
                  Required fields are marked with <span className="text-red-500">*</span>.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={onClose} 
                  disabled={isSubmitting}
                  className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-300 transition-all duration-200 cursor-pointer disabled:opacity-50 font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 cursor-pointer disabled:opacity-50 font-medium flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Adding Record...
                    </>
                  ) : (
                    'Add Medical Record'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Edit Medical Record Modal
const EditMedicalRecordModal: React.FC<{ 
  record: MedicalRecord; 
  onClose: () => void; 
  onSubmit: (recordId: string, updateData: any) => void; 
}> = ({ record, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    type: record.type,
    title: record.title,
    description: record.description,
    diagnosis: record.diagnosis,
    treatment: record.treatment,
    prescription: record.prescription,
    notes: record.notes,
    status: record.status,
    vitalSigns: {
      bloodPressure: record.vitalSigns.bloodPressure || '',
      heartRate: record.vitalSigns.heartRate?.toString() || '',
      temperature: record.vitalSigns.temperature?.toString() || '',
      weight: record.vitalSigns.weight?.toString() || ''
    },
    date: record.date.split('T')[0],
    visitDate: record.visitDate.split('T')[0],
    tags: record.tags.join(', ')
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.diagnosis.trim()) newErrors.diagnosis = 'Diagnosis is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert('Please fix the errors in the form');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Process vital signs
      const vitalSigns: any = {};
      if (formData.vitalSigns.bloodPressure) vitalSigns.bloodPressure = formData.vitalSigns.bloodPressure;
      if (formData.vitalSigns.heartRate) vitalSigns.heartRate = parseInt(formData.vitalSigns.heartRate) || 0;
      if (formData.vitalSigns.temperature) vitalSigns.temperature = parseFloat(formData.vitalSigns.temperature) || 0;
      if (formData.vitalSigns.weight) vitalSigns.weight = parseFloat(formData.vitalSigns.weight) || 0;
      
      // Process tags
      const tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      await onSubmit(record._id, { 
        ...formData,
        vitalSigns,
        tags
      });
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('vitalSigns.')) {
      const vitalSignField = name.split('.')[1];
      setFormData({ 
        ...formData, 
        vitalSigns: { 
          ...formData.vitalSigns, 
          [vitalSignField]: value 
        } 
      });
    } else {
      setFormData({ ...formData, [name]: value }); 
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({...errors, [name]: ''});
    }
  };

  const recordTypes: MedicalRecord['type'][] = ['consultation', 'follow-up', 'emergency', 'surgery', 'lab-test', 'procedure', 'other'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300" onClick={onClose} />
      <div className="relative w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Edit Medical Record</h2>
              <p className="text-sm text-gray-500 mt-1">Record ID: {record._id.substring(0, 8)}...</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer">
              <XCircle className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
        
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Patient</p>
                  <p className="font-medium text-gray-900">{record.patientName || 'Unknown'}</p>
                  <p className="text-xs text-gray-500 mt-1">ID: {record.patientId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Doctor</p>
                  <p className="font-medium text-gray-900">{record.doctorName || 'Dr. Unknown'}</p>
                  <p className="text-xs text-gray-500 mt-1">ID: {record.doctorId}</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleChange} 
                  required 
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${errors.title ? 'border-red-300' : 'border-gray-300'}`}
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Record Type
                </label>
                <select 
                  name="type" 
                  value={formData.type} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                >
                  {recordTypes.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select 
                  name="status" 
                  value={formData.status} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visit Date
                </label>
                <input 
                  type="date" 
                  name="visitDate" 
                  value={formData.visitDate} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Record Date
                </label>
                <input 
                  type="date" 
                  name="date" 
                  value={formData.date} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                />
              </div>
              
              {/* Medical Information */}
              <div className="md:col-span-2 mt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Information</h3>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diagnosis <span className="text-red-500">*</span>
                </label>
                <textarea 
                  name="diagnosis" 
                  value={formData.diagnosis} 
                  onChange={handleChange} 
                  required 
                  rows={3} 
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${errors.diagnosis ? 'border-red-300' : 'border-gray-300'}`}
                />
                {errors.diagnosis && <p className="mt-1 text-sm text-red-600">{errors.diagnosis}</p>}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Treatment
                </label>
                <textarea 
                  name="treatment" 
                  value={formData.treatment} 
                  onChange={handleChange} 
                  rows={3} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prescription
                </label>
                <textarea 
                  name="prescription" 
                  value={formData.prescription} 
                  onChange={handleChange} 
                  rows={3} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                />
              </div>
              
              {/* Vital Signs */}
              <div className="md:col-span-2 mt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Vital Signs</h3>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blood Pressure
                </label>
                <input 
                  type="text" 
                  name="vitalSigns.bloodPressure" 
                  value={formData.vitalSigns.bloodPressure} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  placeholder="e.g., 120/80"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Heart Rate (bpm)
                </label>
                <input 
                  type="number" 
                  name="vitalSigns.heartRate" 
                  value={formData.vitalSigns.heartRate} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  placeholder="e.g., 72"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperature (°C)
                </label>
                <input 
                  type="number" 
                  step="0.1" 
                  name="vitalSigns.temperature" 
                  value={formData.vitalSigns.temperature} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  placeholder="e.g., 36.6"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (kg)
                </label>
                <input 
                  type="number" 
                  step="0.1" 
                  name="vitalSigns.weight" 
                  value={formData.vitalSigns.weight} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  placeholder="e.g., 70.5"
                />
              </div>
              
              {/* Additional Information */}
              <div className="md:col-span-2 mt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  rows={3} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea 
                  name="notes" 
                  value={formData.notes} 
                  onChange={handleChange} 
                  rows={3} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <textarea 
                  name="tags" 
                  value={formData.tags} 
                  onChange={handleChange} 
                  rows={2} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  placeholder="Chronic, Follow-up, Hypertension (comma separated)"
                />
                <p className="mt-1 text-xs text-gray-500">Separate multiple tags with commas</p>
              </div>
            </div>
            
            <div className="sticky bottom-0 bg-white pt-6 mt-6 border-t border-gray-200">
              <div className="flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={onClose} 
                  disabled={isSubmitting}
                  className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-300 transition-all duration-200 cursor-pointer disabled:opacity-50 font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 cursor-pointer disabled:opacity-50 font-medium flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    'Update Medical Record'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Loading Screen
const LoadingScreen: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-gray-50">
    <div className="text-center">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="mt-6 text-gray-600 font-medium">{message}</p>
      <p className="mt-2 text-sm text-gray-500">Please wait a moment</p>
    </div>
  </div>
);

export default MedicalRecordsModule;