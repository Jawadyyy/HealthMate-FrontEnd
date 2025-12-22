"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, User, CreditCard, Settings, LogOut, HelpCircle, Search, Edit, Plus, FileText, ChevronRight, Bell, Download, Filter, MoreVertical, Stethoscope, Clock, MapPin, Phone } from 'lucide-react';
import api from '@/lib/api/api';
import { useRouter } from 'next/navigation';

interface PatientData {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

interface PatientProfile {
  _id: string;
  userId: string;
  age?: number;
  gender?: string;
  bloodGroup?: string;
  phone?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  medicalConditions?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  type: string;
  doctorName: string;
  nurseName?: string;
}

const PatientDashboard = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'records'>('upcoming');
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchPatientData(),
          fetchAppointments()
        ]);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const fetchPatientData = async () => {
    try {
      const userResponse = await api.get('/auth/me');
      console.log("HealthMate Debug: User response:", userResponse.data);

      const userData = userResponse.data.data || userResponse.data;
      setPatientData(userData);

      try {
        const profileResponse = await api.get('/patients/me');
        console.log("HealthMate Debug: Profile response:", profileResponse.data);
        setPatientProfile(profileResponse.data);
      } catch (e) {
        console.warn("Could not fetch patient profile:", e);
      }

    } catch (error) {
      console.error('Error fetching patient data:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/appointments/my');
      setAppointments(response.data.data || response.data || []);
    } catch (e) {
      console.log("Appointments endpoint not ready, using empty");
      setAppointments([]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('isLoggedIn');
    router.push('/auth/patient/login');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-gray-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">Loading your dashboard...</p>
          <p className="mt-2 text-sm text-gray-500">Please wait a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      {/* Sidebar */}
      <div className="w-72 bg-white/95 backdrop-blur-sm border-r border-gray-200 flex flex-col fixed left-0 top-0 h-full z-20 shadow-lg shadow-blue-500/5">
        <div className="p-8 pb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
              </svg>
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">HealthMate</span>
              <p className="text-xs text-gray-500 mt-1">Patient Portal</p>
            </div>
          </div>
        </div>

        <nav className="px-5 space-y-2 flex-1">
          <div onClick={() => router.push('/patient/dashboard')}>
            <NavItem icon={User} label="My Profile" active />
          </div>
          <div onClick={() => router.push('/patient/appointments')}>
            <NavItem icon={Calendar} label="Appointments" />
          </div>
          <div onClick={() => router.push('/patient/payments')}>
            <NavItem icon={CreditCard} label="Payments" />
          </div>
          <div onClick={() => router.push('/patient/med-records')}>
            <NavItem icon={Settings} label="Medical Records" />
          </div>
        </nav>

        <div className="p-5 space-y-2 border-t border-gray-200/50">
          <NavItem icon={HelpCircle} label="Help & Support" />
          <div onClick={handleLogout} className="w-full">
            <NavItem icon={LogOut} label="Logout" />
          </div>
        </div>

        <div className="p-5 mt-auto">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200/50">
            <p className="text-sm font-medium text-blue-800">Need assistance?</p>
            <p className="text-xs text-blue-600/80 mt-1">Our support team is here to help</p>
            <button className="mt-3 w-full bg-white text-blue-600 text-sm font-medium py-2 rounded-lg border border-blue-200 hover:bg-blue-50 transition-all duration-200 cursor-pointer">
              Contact Support
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto ml-72">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative flex-1 max-w-lg">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search doctors, records, medications..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              <button className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 cursor-pointer">
                <Filter className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Filters</span>
              </button>
            </div>
            <div className="flex items-center space-x-5">
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800">{patientData?.name || 'Patient'}</p>
                  <p className="text-xs text-gray-500">{patientData?.email || ''}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  {patientData?.name?.charAt(0) || 'P'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Breadcrumb & Quick Actions */}
        <div className="px-8 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {patientData?.name?.split(' ')[0] || 'Patient'}!</h1>
            <span className="text-xs font-medium bg-green-100 text-green-700 px-3 py-1 rounded-full">
              {patientProfile?.bloodGroup || 'Blood Group'} Positive
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-xl border border-gray-200 transition-all duration-200 cursor-pointer">
              <Edit className="w-4 h-4" />
              <span className="text-sm font-medium">Edit profile</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-500/30 cursor-pointer">
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">New Appointment</span>
            </button>
          </div>
        </div>

        {/* Patient Info Card */}
        <div className="px-8 pb-6">
          <div className="bg-white rounded-2xl shadow-lg shadow-blue-500/5 border border-gray-200/50 overflow-hidden">
            <div className="p-8">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Profile Avatar & Basic Info */}
                <div className="lg:w-1/3 flex flex-col items-center lg:items-start">
                  <div className="relative">
                    <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-5xl font-bold text-blue-700 shadow-xl">
                      {patientData?.name?.charAt(0) || 'P'}
                    </div>
                    <div className="absolute bottom-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-all duration-200">
                      <Edit className="w-4 h-4 text-gray-600" />
                    </div>
                  </div>

                  <div className="text-center lg:text-left mt-6">
                    <h2 className="text-2xl font-bold text-gray-900">{patientData?.name || 'Loading...'}</h2>
                    <p className="text-gray-500 mt-1">{patientData?.email || ''}</p>
                    <div className="flex items-center justify-center lg:justify-start space-x-3 mt-4">
                      <span className="text-xs font-medium bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full">
                        Patient ID: {patientData?._id?.slice(-8) || 'N/A'}
                      </span>
                      <span className="text-xs font-medium bg-green-100 text-green-700 px-3 py-1.5 rounded-full">
                        Active
                      </span>
                    </div>
                  </div>

                  <button className="w-full mt-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-500/30 cursor-pointer">
                    Book New Appointment
                  </button>
                </div>

                {/* Detailed Information */}
                <div className="lg:w-2/3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoCard
                      icon={User}
                      label="Personal Details"
                      items={[
                        { label: 'Age', value: patientProfile?.age ? `${patientProfile.age} Years` : 'N/A' },
                        { label: 'Gender', value: patientProfile?.gender?.toUpperCase() || 'N/A' },
                        { label: 'Blood Group', value: patientProfile?.bloodGroup || 'N/A' }
                      ]}
                    />

                    <InfoCard
                      icon={Phone}
                      label="Contact Information"
                      items={[
                        { label: 'Phone', value: patientProfile?.phone || 'N/A' },
                        { label: 'Emergency Contact', value: patientProfile?.emergencyContactName || 'N/A' },
                        { label: 'Emergency Phone', value: patientProfile?.emergencyContactPhone || 'N/A' }
                      ]}
                    />

                    <InfoCard
                      icon={MapPin}
                      label="Address"
                      items={[
                        { label: 'Residential Address', value: patientProfile?.address || 'N/A' }
                      ]}
                      fullWidth
                    />

                    {/* Account Timeline */}
                    <div className="md:col-span-2">
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 border border-blue-200/50 rounded-xl p-5">
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-blue-200">
                            <Calendar className="w-4 h-4 text-blue-600" />
                          </div>
                          <h3 className="font-medium text-blue-800">Account Timeline</h3>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Account Created</p>
                              <p className="text-sm text-gray-500 mt-1">{formatDate(patientProfile?.updatedAt || patientData?.updatedAt)}</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Profile Last Updated</p>
                              <p className="text-sm text-gray-500 mt-1">{formatDate(patientProfile?.updatedAt || patientData?.updatedAt)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {patientProfile?.medicalConditions && patientProfile.medicalConditions.length > 0 && (
                      <div className="md:col-span-2">
                        <div className="bg-red-50/50 border border-red-100 rounded-xl p-5">
                          <div className="flex items-center space-x-2 mb-4">
                            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                              <Stethoscope className="w-4 h-4 text-red-600" />
                            </div>
                            <h3 className="font-medium text-red-800">Medical Conditions</h3>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {patientProfile.medicalConditions.map((condition, index) => (
                              <span key={index} className="text-sm bg-white text-red-600 px-4 py-2 rounded-lg border border-red-200 hover:bg-red-50 transition-all duration-200 cursor-pointer">
                                {condition}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Appointments Section */}
        <div className="px-8 pb-8">
          <div className="bg-white rounded-2xl shadow-lg shadow-blue-500/5 border border-gray-200/50 overflow-hidden">
            <div className="border-b border-gray-200/50 px-8 py-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">My Appointments</h2>
                <p className="text-gray-500 text-sm mt-1">Manage and track your medical appointments</p>
              </div>
              <div className="flex items-center space-x-3">
                <button className="flex items-center space-x-2 px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-xl border border-gray-200 transition-all duration-200 cursor-pointer">
                  <Download className="w-4 h-4" />
                  <span className="text-sm font-medium">Export</span>
                </button>
                <button className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 rounded-xl border border-gray-200 transition-all duration-200 cursor-pointer">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="px-8 pt-6 flex space-x-8 border-b border-gray-200/50">
              {(['upcoming', 'past', 'records'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 font-medium relative transition-all duration-200 cursor-pointer ${activeTab === tab
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {tab === 'upcoming' && 'Upcoming Appointments'}
                  {tab === 'past' && 'Past Appointments'}
                  {tab === 'records' && 'Medical Records'}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-8">
              {activeTab === 'upcoming' && (
                <div className="space-y-4">
                  {appointments.length > 0 ? (
                    appointments.map((appointment) => (
                      <AppointmentCard key={appointment.id} appointment={appointment} />
                    ))
                  ) : (
                    <EmptyState
                      icon={Calendar}
                      title="No upcoming appointments"
                      description="You don't have any scheduled appointments at the moment"
                      actionText="Book New Appointment"
                      onAction={() => { }}
                    />
                  )}
                </div>
              )}
              {activeTab === 'past' && (
                <EmptyState
                  icon={Clock}
                  title="No past appointments"
                  description="Your past appointments will appear here"
                  actionText="View History"
                  onAction={() => { }}
                />
              )}
              {activeTab === 'records' && (
                <EmptyState
                  icon={FileText}
                  title="Medical records"
                  description="Your medical records feature is coming soon"
                  actionText="Learn More"
                  onAction={() => { }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats Footer */}
        <div className="px-8 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800">Total Appointments</p>
                  <p className="text-3xl font-bold text-blue-900 mt-2">12</p>
                </div>
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200/50 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">Prescriptions</p>
                  <p className="text-3xl font-bold text-green-900 mt-2">5</p>
                </div>
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/50 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-800">Upcoming Tests</p>
                  <p className="text-3xl font-bold text-purple-900 mt-2">2</p>
                </div>
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                  <Stethoscope className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  badge?: number;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, active = false, badge }) => (
  <div
    className={`flex items-center justify-between px-5 py-3.5 rounded-xl transition-all duration-200 cursor-pointer ${active
      ? 'bg-gradient-to-r from-blue-50 to-blue-100/50 text-blue-700 border border-blue-200/50'
      : 'text-gray-600 hover:bg-gray-50/80 hover:text-gray-900'
      }`}
  >
    <div className="flex items-center space-x-3.5">
      <Icon className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-gray-500'}`} />
      <span className="font-medium">{label}</span>
    </div>
    {badge && (
      <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[1.5rem] text-center">
        {badge}
      </span>
    )}
  </div>
);

interface InfoCardProps {
  icon: React.ElementType;
  label: string;
  items: { label: string; value: string }[];
  fullWidth?: boolean;
}

const InfoCard: React.FC<InfoCardProps> = ({ icon: Icon, label, items, fullWidth = false }) => (
  <div className={`${fullWidth ? 'col-span-2' : ''} bg-gray-50/50 border border-gray-200/50 rounded-xl p-5`}>
    <div className="flex items-center space-x-3 mb-4">
      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
        <Icon className="w-5 h-5 text-gray-700" />
      </div>
      <h3 className="font-medium text-gray-900">{label}</h3>
    </div>
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200/50 last:border-0">
          <span className="text-sm text-gray-600">{item.label}</span>
          <span className="font-medium text-gray-900">{item.value}</span>
        </div>
      ))}
    </div>
  </div>
);

const AppointmentCard: React.FC<{ appointment: Appointment }> = ({ appointment }) => (
  <div className="group border border-gray-200/50 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 bg-white">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-start space-x-6">
        <div className="text-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 min-w-[80px]">
          <p className="text-2xl font-bold text-blue-900">{appointment.date ? new Date(appointment.date).getDate() : '01'}</p>
          <p className="text-xs font-medium text-blue-700 mt-1">
            {appointment.date ? new Date(appointment.date).toLocaleDateString('en-US', { month: 'short' }) : 'Jan'}
          </p>
          <p className="text-sm text-gray-500 mt-2">{appointment.time || '09:00 AM'}</p>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Appointment Type</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">{appointment.type || 'General Consultation'}</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Doctor</p>
                <p className="font-medium">{appointment.doctorName || 'Dr. Smith Johnson'}</p>
              </div>
            </div>
            {appointment.nurseName && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Nurse</p>
                  <p className="font-medium">{appointment.nurseName}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <button className="flex items-center space-x-2 px-4 py-2.5 text-blue-600 hover:bg-blue-50 rounded-xl border border-blue-200 transition-all duration-200 cursor-pointer">
          <FileText className="w-4 h-4" />
          <span className="text-sm font-medium">View Details</span>
        </button>
        <button className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 cursor-pointer">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">Reschedule</span>
        </button>
      </div>
    </div>
  </div>
);

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
  actionText: string;
  onAction: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, actionText, onAction }) => (
  <div className="text-center py-12">
    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
      <Icon className="w-10 h-10 text-blue-600" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 max-w-md mx-auto mb-8">{description}</p>
    <button
      onClick={onAction}
      className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-500/30 cursor-pointer"
    >
      <span>{actionText}</span>
      <ChevronRight className="w-4 h-4" />
    </button>
  </div>
);

export default PatientDashboard;