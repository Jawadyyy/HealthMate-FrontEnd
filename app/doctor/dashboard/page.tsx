"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, User, CreditCard, Settings, LogOut, HelpCircle, Search, Edit, Plus, FileText, ChevronRight, Bell, Download, Filter, MoreVertical, Stethoscope, Clock, MapPin, Phone, Users, BriefcaseMedical, Award, Hospital, Clock4, CheckCircle, XCircle } from 'lucide-react';
import api from '@/lib/api/api';
import { useRouter } from 'next/navigation';

interface DoctorData {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

interface DoctorProfile {
  _id: string;
  userId: string;
  fullName: string;
  specialization: string;
  degrees: string;
  phone: string;
  hospitalName: string;
  experienceYears: number;
  availableSlots: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  type: string;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

const DoctorDashboard = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'past' | 'patients'>('today');
  const [doctorData, setDoctorData] = useState<DoctorData | null>(null);
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    pendingConsultations: 0,
    monthlyRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchDoctorData(),
          fetchAppointments(),
          fetchStats()
        ]);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const fetchDoctorData = async () => {
    try {
      const userResponse = await api.get('/auth/me');
      console.log("HealthMate Debug: Doctor user response:", userResponse.data);

      const userData = userResponse.data.data || userResponse.data;
      setDoctorData(userData);

      try {
        const profileResponse = await api.get('/doctors/me');
        console.log("HealthMate Debug: Doctor profile response:", profileResponse.data);
        setDoctorProfile(profileResponse.data);
      } catch (e) {
        console.warn("Could not fetch doctor profile:", e);
      }

    } catch (error) {
      console.error('Error fetching doctor data:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/appointments/doctor/my');
      const appointmentsData = response.data.data || response.data || [];
      setAppointments(appointmentsData);
    } catch (e) {
      console.log("Appointments endpoint not ready, using mock data");
      setAppointments([
        {
          id: '1',
          date: '2024-01-15',
          time: '09:00 AM',
          type: 'Follow-up',
          patientName: 'John Smith',
          patientAge: 45,
          patientGender: 'Male',
          status: 'scheduled',
          notes: 'Blood pressure check'
        },
        {
          id: '2',
          date: '2024-01-15',
          time: '10:30 AM',
          type: 'General Consultation',
          patientName: 'Sarah Johnson',
          patientAge: 32,
          patientGender: 'Female',
          status: 'scheduled'
        }
      ]);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/doctors/stats');
      setStats(response.data);
    } catch (e) {
      console.log("Stats endpoint not ready, using mock data");
      setStats({
        totalPatients: 245,
        todayAppointments: 8,
        pendingConsultations: 3,
        monthlyRevenue: 12500
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('isLoggedIn');
    router.push('/auth/doctor/login');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-green-50 to-gray-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-green-100 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-green-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">Loading your dashboard...</p>
          <p className="mt-2 text-sm text-gray-500">Please wait a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 via-white to-gray-50">
      {/* Sidebar */}
      <div className="w-72 bg-white/95 backdrop-blur-sm border-r border-gray-200 flex flex-col fixed left-0 top-0 h-full z-20 shadow-lg shadow-green-500/5">
        <div className="p-8 pb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
              <Stethoscope className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">HealthMate</span>
              <p className="text-xs text-gray-500 mt-1">Doctor Portal</p>
            </div>
          </div>
        </div>

        <nav className="px-5 space-y-2 flex-1">
          <NavItem icon={User} label="My Profile" active />
          <NavItem icon={Calendar} label="Schedule" />
          <NavItem icon={Users} label="Patients" badge={12} />
          <NavItem icon={CreditCard} label="Earnings" />
          <NavItem icon={CreditCard} label="Medical Records" />
        </nav>

        <div className="p-5 space-y-2 border-t border-gray-200/50">
          <NavItem icon={HelpCircle} label="Help & Support" />
          <div onClick={handleLogout} className="w-full">
            <NavItem icon={LogOut} label="Logout" />
          </div>
        </div>

        <div className="p-5 mt-auto">
          <div className="bg-gradient-to-r from-green-50 to-green-100/50 rounded-xl p-4 border border-green-200/50">
            <p className="text-sm font-medium text-green-800">Need assistance?</p>
            <p className="text-xs text-green-600/80 mt-1">Our support team is here to help</p>
            <button className="mt-3 w-full bg-white text-green-600 text-sm font-medium py-2 rounded-lg border border-green-200 hover:bg-green-50 transition-all duration-200 cursor-pointer">
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
                  placeholder="Search patients, records, medications..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all duration-200"
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
                  <p className="text-sm font-medium text-gray-800">{doctorData?.name || 'Doctor'}</p>
                  <p className="text-xs text-gray-500">{doctorProfile?.specialization || 'Specialization'}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  {doctorData?.name?.charAt(0) || 'D'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Breadcrumb & Quick Actions */}
        <div className="px-8 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, Dr. {doctorData?.name?.split(' ')[0] || 'Doctor'}!</h1>
            <span className="text-xs font-medium bg-green-100 text-green-700 px-3 py-1 rounded-full">
              {doctorProfile?.specialization || 'General Physician'}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-xl border border-gray-200 transition-all duration-200 cursor-pointer">
              <Edit className="w-4 h-4" />
              <span className="text-sm font-medium">Edit profile</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg shadow-green-500/30 cursor-pointer">
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Add Slot</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="px-8 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={Users}
              label="Total Patients"
              value={stats.totalPatients}
              change="+12%"
              color="green"
            />
            <StatCard
              icon={Calendar}
              label="Today's Appointments"
              value={stats.todayAppointments}
              change="+3"
              color="blue"
            />
            <StatCard
              icon={Clock4}
              label="Pending Consultations"
              value={stats.pendingConsultations}
              change="-2"
              color="orange"
            />
            <StatCard
              icon={CreditCard}
              label="Monthly Revenue"
              value={`$${stats.monthlyRevenue.toLocaleString()}`}
              change="+8%"
              color="purple"
            />
          </div>
        </div>

        {/* Doctor Info Card */}
        <div className="px-8 pb-6">
          <div className="bg-white rounded-2xl shadow-lg shadow-green-500/5 border border-gray-200/50 overflow-hidden">
            <div className="p-8">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Profile Avatar & Basic Info */}
                <div className="lg:w-1/3 flex flex-col items-center lg:items-start">
                  <div className="relative">
                    <div className="w-40 h-40 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center text-5xl font-bold text-green-700 shadow-xl">
                      {doctorData?.name?.charAt(0) || 'D'}
                    </div>
                    <div className="absolute bottom-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-all duration-200">
                      <Edit className="w-4 h-4 text-gray-600" />
                    </div>
                  </div>

                  <div className="text-center lg:text-left mt-6">
                    <h2 className="text-2xl font-bold text-gray-900">Dr. {doctorProfile?.fullName || doctorData?.name || 'Loading...'}</h2>
                    <p className="text-gray-500 mt-1">{doctorData?.email || ''}</p>
                    <div className="flex items-center justify-center lg:justify-start space-x-3 mt-4">
                      <span className="text-xs font-medium bg-green-100 text-green-700 px-3 py-1.5 rounded-full">
                        Doctor ID: {doctorData?._id?.slice(-8) || 'N/A'}
                      </span>
                      <span className="text-xs font-medium bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full">
                        Verified
                      </span>
                    </div>

                    {/* Account Information */}
                    <div className="mt-6 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Account Created:</span>
                        <span className="font-medium text-gray-900">{formatDate(doctorData?.createdAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Last Updated:</span>
                        <span className="font-medium text-gray-900">{formatDate(doctorProfile?.updatedAt || doctorData?.updatedAt)}</span>
                      </div>
                    </div>
                  </div>

                  <button className="w-full mt-8 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl font-medium hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg shadow-green-500/30 cursor-pointer">
                    View Schedule
                  </button>
                </div>

                {/* Detailed Information */}
                <div className="lg:w-2/3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoCard
                      icon={BriefcaseMedical}
                      label="Professional Details"
                      items={[
                        { label: 'Specialization', value: doctorProfile?.specialization || 'N/A' },
                        { label: 'Degrees', value: doctorProfile?.degrees || 'N/A' },
                        { label: 'Experience', value: doctorProfile?.experienceYears ? `${doctorProfile.experienceYears} Years` : 'N/A' }
                      ]}
                    />

                    <InfoCard
                      icon={Hospital}
                      label="Hospital Information"
                      items={[
                        { label: 'Hospital', value: doctorProfile?.hospitalName || 'N/A' },
                        { label: 'Phone', value: doctorProfile?.phone || 'N/A' },
                        { label: 'Available Slots', value: doctorProfile?.availableSlots?.length?.toString() || '0' }
                      ]}
                    />

                    <InfoCard
                      icon={Award}
                      label="Certifications"
                      items={[
                        { label: 'Medical License', value: 'Active' },
                        { label: 'Board Certified', value: 'Yes' },
                        { label: 'Insurance', value: 'Accepted' }
                      ]}
                    />

                    {/* Available Slots */}
                    {doctorProfile?.availableSlots && doctorProfile.availableSlots.length > 0 && (
                      <div className="md:col-span-2">
                        <div className="bg-gradient-to-r from-green-50 to-green-100/50 border border-green-200/50 rounded-xl p-5">
                          <div className="flex items-center space-x-2 mb-4">
                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-green-200">
                              <Clock className="w-4 h-4 text-green-600" />
                            </div>
                            <h3 className="font-medium text-green-800">Available Time Slots</h3>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {doctorProfile.availableSlots.map((slot, index) => (
                              <span key={index} className="text-sm bg-white text-green-600 px-4 py-2 rounded-lg border border-green-200 hover:bg-green-50 transition-all duration-200 cursor-pointer">
                                {slot}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

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
                              <p className="text-sm text-gray-500 mt-1">{formatDate(doctorData?.createdAt)}</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Profile Last Updated</p>
                              <p className="text-sm text-gray-500 mt-1">{formatDate(doctorProfile?.updatedAt || doctorData?.updatedAt)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Appointments Section */}
        <div className="px-8 pb-8">
          <div className="bg-white rounded-2xl shadow-lg shadow-green-500/5 border border-gray-200/50 overflow-hidden">
            <div className="border-b border-gray-200/50 px-8 py-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Appointments</h2>
                <p className="text-gray-500 text-sm mt-1">Manage and track patient appointments</p>
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
              {(['today', 'upcoming', 'past', 'patients'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 font-medium relative transition-all duration-200 cursor-pointer ${activeTab === tab
                    ? 'text-green-600'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {tab === 'today' && "Today's Appointments"}
                  {tab === 'upcoming' && 'Upcoming Schedule'}
                  {tab === 'past' && 'Past Appointments'}
                  {tab === 'patients' && 'Patients List'}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-500 to-green-600 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-8">
              {activeTab === 'today' && (
                <div className="space-y-4">
                  {appointments.length > 0 ? (
                    appointments.map((appointment) => (
                      <DoctorAppointmentCard key={appointment.id} appointment={appointment} />
                    ))
                  ) : (
                    <EmptyState
                      icon={Calendar}
                      title="No appointments for today"
                      description="You don't have any scheduled appointments today"
                      actionText="View Schedule"
                      onAction={() => setActiveTab('upcoming')}
                      theme="green"
                    />
                  )}
                </div>
              )}
              {activeTab === 'upcoming' && (
                <EmptyState
                  icon={Clock}
                  title="No upcoming appointments"
                  description="Your upcoming appointments will appear here"
                  actionText="Add Time Slots"
                  onAction={() => { }}
                  theme="green"
                />
              )}
              {activeTab === 'past' && (
                <EmptyState
                  icon={Clock}
                  title="No past appointments"
                  description="Your past appointments will appear here"
                  actionText="View History"
                  onAction={() => { }}
                  theme="green"
                />
              )}
              {activeTab === 'patients' && (
                <EmptyState
                  icon={Users}
                  title="Patients List"
                  description="Your patients list feature is coming soon"
                  actionText="View All Patients"
                  onAction={() => { }}
                  theme="green"
                />
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions Footer */}
        <div className="px-8 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200/50 rounded-2xl p-6">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="w-7 h-7 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-green-900">Write Prescription</h3>
                  <p className="text-sm text-green-700 mt-1">Quickly create prescriptions for patients</p>
                  <button className="mt-3 text-sm font-medium text-green-600 hover:text-green-700 cursor-pointer">
                    Create New →
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50 rounded-2xl p-6">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-lg">
                  <Calendar className="w-7 h-7 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-blue-900">Manage Schedule</h3>
                  <p className="text-sm text-blue-700 mt-1">Update your availability and time slots</p>
                  <button className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer">
                    Edit Schedule →
                  </button>
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
      ? 'bg-gradient-to-r from-green-50 to-green-100/50 text-green-700 border border-green-200/50'
      : 'text-gray-600 hover:bg-gray-50/80 hover:text-gray-900'
      }`}
  >
    <div className="flex items-center space-x-3.5">
      <Icon className={`w-5 h-5 ${active ? 'text-green-600' : 'text-gray-500'}`} />
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

const DoctorAppointmentCard: React.FC<{ appointment: Appointment }> = ({ appointment }) => (
  <div className="group border border-gray-200/50 rounded-xl p-6 hover:border-green-300 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300 bg-white">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-start space-x-6">
        <div className="text-center bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 min-w-[80px]">
          <p className="text-2xl font-bold text-green-900">{appointment.date ? new Date(appointment.date).getDate() : '01'}</p>
          <p className="text-xs font-medium text-green-700 mt-1">
            {appointment.date ? new Date(appointment.date).toLocaleDateString('en-US', { month: 'short' }) : 'Jan'}
          </p>
          <p className="text-sm text-gray-500 mt-2">{appointment.time || '09:00 AM'}</p>
        </div>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Patient</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">{appointment.patientName}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-sm text-gray-600">Age: {appointment.patientAge || 'N/A'}</span>
                <span className="text-sm text-gray-600">Gender: {appointment.patientGender || 'N/A'}</span>
              </div>
            </div>
            <span className={`text-xs font-medium px-3 py-1 rounded-full ${appointment.status === 'scheduled' ? 'bg-green-100 text-green-700' : appointment.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </span>
          </div>
          {appointment.notes && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">{appointment.notes}</p>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <button className="flex items-center space-x-2 px-4 py-2.5 text-green-600 hover:bg-green-50 rounded-xl border border-green-200 transition-all duration-200 cursor-pointer">
          <FileText className="w-4 h-4" />
          <span className="text-sm font-medium">View Details</span>
        </button>
        <button className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 cursor-pointer">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Start Consultation</span>
        </button>
      </div>
    </div>
  </div>
);

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number | string;
  change: string;
  color: 'green' | 'blue' | 'orange' | 'purple';
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, change, color }) => {
  const colorClasses = {
    green: 'from-green-50 to-green-100/50 border-green-200/50 text-green-600',
    blue: 'from-blue-50 to-blue-100/50 border-blue-200/50 text-blue-600',
    orange: 'from-orange-50 to-orange-100/50 border-orange-200/50 text-orange-600',
    purple: 'from-purple-50 to-purple-100/50 border-purple-200/50 text-purple-600'
  };

  const bgColorClasses = {
    green: 'bg-gradient-to-br from-green-50 to-green-100/50 border-green-200/50',
    blue: 'bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200/50',
    orange: 'bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200/50',
    purple: 'bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200/50'
  };

  return (
    <div className={`${bgColorClasses[color]} border rounded-2xl p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          <p className={`text-xs font-medium mt-2 ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
            {change} from last week
          </p>
        </div>
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
          <Icon className={`w-6 h-6 ${colorClasses[color].split(' ')[colorClasses[color].split(' ').length - 1]}`} />
        </div>
      </div>
    </div>
  );
};

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
  actionText: string;
  onAction: () => void;
  theme?: 'blue' | 'green';
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, actionText, onAction, theme = 'blue' }) => {
  const themeColors = theme === 'green' ? {
    bg: 'from-green-100 to-green-200',
    icon: 'text-green-600',
    button: 'from-green-600 to-green-700 hover:from-green-700 hover:to-green-800',
    shadow: 'shadow-green-500/30'
  } : {
    bg: 'from-blue-100 to-blue-200',
    icon: 'text-blue-600',
    button: 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800',
    shadow: 'shadow-blue-500/30'
  };

  return (
    <div className="text-center py-12">
      <div className={`w-20 h-20 bg-gradient-to-br ${themeColors.bg} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
        <Icon className={`w-10 h-10 ${themeColors.icon}`} />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-md mx-auto mb-8">{description}</p>
      <button
        onClick={onAction}
        className={`inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r ${themeColors.button} text-white rounded-xl font-medium transition-all duration-200 shadow-lg ${themeColors.shadow} cursor-pointer`}
      >
        <span>{actionText}</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default DoctorDashboard;