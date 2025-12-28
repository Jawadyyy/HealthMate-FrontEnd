"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, User, Edit, Plus, FileText, ChevronRight, Download, MoreVertical, Stethoscope, Clock, MapPin, Phone } from 'lucide-react';
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
  _id: string;
  doctorId: string;
  patientId: string;
  appointmentDate: string;
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  doctor?: {
    _id: string;
    fullName?: string;
    name?: string;
    specialization?: string;
  };
}

const PatientDashboard = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'records'>('upcoming');
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    loadData();

    // Refresh data when the page becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("Page became visible, refreshing data...");
        loadData();
      }
    };

    // Also refresh when window gains focus
    const handleFocus = () => {
      console.log("Window gained focus, refreshing data...");
      loadData();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const fetchPatientData = async () => {
    try {
      const userResponse = await api.get('/auth/me');
      console.log("HealthMate Debug: User response:", userResponse.data);
      console.log("HealthMate Debug: Full user response structure:", JSON.stringify(userResponse, null, 2));

      const userData = userResponse.data.data || userResponse.data;
      setPatientData(userData);

      try {
        const profileResponse = await api.get('/patients/me');
        console.log("HealthMate Debug: Profile response:", profileResponse.data);
        console.log("HealthMate Debug: Full profile response structure:", JSON.stringify(profileResponse, null, 2));

        // Try different possible response structures
        const profileData = profileResponse.data.data || profileResponse.data.profile || profileResponse.data;
        console.log("HealthMate Debug: Extracted profile data:", profileData);

        setPatientProfile(profileData);
      } catch (e) {
        console.error("Could not fetch patient profile - Full error:", e);
        console.error("Error response:", e);
      }

    } catch (error) {
      console.error('Error fetching patient data:', error);
      console.error('Error response:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/appointments/my');
      let appointmentsData = response.data.data || response.data || [];

      // The doctorId is already populated with doctor info, just rename it
      const appointmentsWithDoctors = appointmentsData.map((appointment: any) => ({
        ...appointment,
        doctor: appointment.doctorId,
        doctorId: appointment.doctorId._id
      }));

      setAppointments(appointmentsWithDoctors);
    } catch (e) {
      console.error("Appointments endpoint error:", e);
      setAppointments([]);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const getUpcomingAppointments = () => {
    const now = new Date();
    return appointments.filter(apt => {
      const appointmentDate = new Date(apt.appointmentDate);
      return (apt.status === 'scheduled' || apt.status === 'pending') && appointmentDate >= now;
    });
  };

  const getPastAppointments = () => {
    const now = new Date();
    return appointments.filter(apt => {
      const appointmentDate = new Date(apt.appointmentDate);
      return apt.status === 'completed' || appointmentDate < now;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-transparent">
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

  const upcomingAppointments = getUpcomingAppointments();
  const pastAppointments = getPastAppointments();

  return (
    <>
      {/* Breadcrumb & Quick Actions */}
      <div className="px-8 py-5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {patientData?.name?.split(' ')[0] || 'Patient'}!</h1>
          {patientProfile?.bloodGroup && (
            <span className="text-xs font-medium bg-green-100 text-green-700 px-3 py-1 rounded-full">
              {patientProfile.bloodGroup}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push('/patient/profile')}
            className="flex items-center space-x-2 px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-xl border border-gray-200 transition-all duration-200 cursor-pointer"
          >
            <Edit className="w-4 h-4" />
            <span className="text-sm font-medium">Edit profile</span>
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

                <button
                  onClick={() => router.push('/patient/appointments/book')}
                  className="w-full mt-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-500/30 cursor-pointer"
                >
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
                            <p className="text-sm text-gray-500 mt-1">{formatDate(patientProfile?.createdAt || patientData?.createdAt)}</p>
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
      <div className="px-8 pb-6">
        <div className="bg-white rounded-2xl shadow-lg shadow-blue-500/5 border border-gray-200/50 overflow-hidden">
          <div className="border-b border-gray-200/50 px-8 py-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">My Appointments</h2>
              <p className="text-gray-500 text-sm mt-1">Manage and track your medical appointments</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push('/patient/appointments')}
                className="flex items-center space-x-2 px-4 py-2.5 text-blue-600 hover:bg-blue-50 rounded-xl border border-blue-200 transition-all duration-200 cursor-pointer"
              >
                <span className="text-sm font-medium">View All</span>
                <ChevronRight className="w-4 h-4" />
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
                {tab === 'upcoming' && `Upcoming (${upcomingAppointments.length})`}
                {tab === 'past' && `Past (${pastAppointments.length})`}
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
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map((appointment) => (
                    <AppointmentCard key={appointment._id} appointment={appointment} formatDateTime={formatDateTime} />
                  ))
                ) : (
                  <EmptyState
                    icon={Calendar}
                    title="No upcoming appointments"
                    description="You don't have any scheduled appointments at the moment"
                    actionText="Book New Appointment"
                    onAction={() => router.push('/patient/appointments/book')}
                  />
                )}
              </div>
            )}
            {activeTab === 'past' && (
              <div className="space-y-4">
                {pastAppointments.length > 0 ? (
                  pastAppointments.map((appointment) => (
                    <AppointmentCard key={appointment._id} appointment={appointment} formatDateTime={formatDateTime} isPast />
                  ))
                ) : (
                  <EmptyState
                    icon={Clock}
                    title="No past appointments"
                    description="Your past appointments will appear here"
                    actionText="View History"
                    onAction={() => { }}
                  />
                )}
              </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Total Appointments</p>
                <p className="text-3xl font-bold text-blue-900 mt-2">{appointments.length}</p>
              </div>
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200/50 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Upcoming</p>
                <p className="text-3xl font-bold text-green-900 mt-2">{upcomingAppointments.length}</p>
              </div>
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/50 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-800">Completed</p>
                <p className="text-3xl font-bold text-purple-900 mt-2">{appointments.filter(a => a.status === 'completed').length}</p>
              </div>
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <Stethoscope className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200/50 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-800">Cancelled</p>
                <p className="text-3xl font-bold text-red-900 mt-2">{appointments.filter(a => a.status === 'cancelled').length}</p>
              </div>
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-200/50 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-800">Missed</p>
                <p className="text-3xl font-bold text-orange-900 mt-2">
                  {appointments.filter(a => {
                    const appointmentDate = new Date(a.appointmentDate);
                    const now = new Date();
                    return a.status === 'pending' && appointmentDate < now;
                  }).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

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

interface AppointmentCardProps {
  appointment: Appointment;
  formatDateTime: (dateString: string) => { date: string; time: string };
  isPast?: boolean;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, formatDateTime, isPast = false }) => {
  const dateTime = formatDateTime(appointment.appointmentDate);
  const appointmentDate = new Date(appointment.appointmentDate);

  return (
    <div className="group border border-gray-200/50 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 bg-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-6">
          <div className={`text-center bg-gradient-to-br ${isPast ? 'from-gray-50 to-gray-100' : 'from-blue-50 to-blue-100'} rounded-xl p-4 min-w-[80px]`}>
            <p className={`text-2xl font-bold ${isPast ? 'text-gray-700' : 'text-blue-900'}`}>
              {appointmentDate.getDate()}
            </p>
            <p className={`text-xs font-medium mt-1 ${isPast ? 'text-gray-600' : 'text-blue-700'}`}>
              {appointmentDate.toLocaleDateString('en-US', { month: 'short' })}
            </p>
            <p className="text-sm text-gray-500 mt-2">{dateTime.time}</p>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Appointment</p>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${appointment.status === 'scheduled' || appointment.status === 'pending'
                  ? 'bg-blue-100 text-blue-700'
                  : appointment.status === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                  }`}>
                  {appointment.status}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Doctor</p>
                  <p className="font-medium">
                    {appointment.doctor?.fullName || appointment.doctor?.name || 'Doctor'}
                  </p>
                </div>
              </div>
              {appointment.doctor?.specialization && (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Stethoscope className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Specialization</p>
                    <p className="font-medium">{appointment.doctor.specialization}</p>
                  </div>
                </div>
              )}
            </div>
            {appointment.notes && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Notes:</p>
                <p className="text-sm text-gray-700">{appointment.notes}</p>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-3">
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