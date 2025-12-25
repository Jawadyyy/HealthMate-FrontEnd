"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, User, Edit, Plus, FileText, ChevronRight, Download, MoreVertical, Stethoscope, Clock, MapPin, Phone, Users, Activity, TrendingUp, CheckCircle } from 'lucide-react';
import api from '@/lib/api/api';
import { useRouter } from 'next/navigation';

interface DoctorData {
  _id: string;
  name: string;
  email: string;
  role: string;
  specialization: string;
  qualification: string;
  createdAt?: string;
  updatedAt?: string;
}

interface DoctorProfile {
  _id: string;
  userId: string;
  experience?: number;
  consultationFee?: number;
  phone?: string;
  address?: string;
  bio?: string;
  languages?: string[];
  certifications?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface Appointment {
  id: string;
  patientName: string;
  date: string;
  time: string;
  type: 'consultation' | 'follow-up' | 'checkup' | 'emergency';
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
}

const DoctorDashboard = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'completed'>('today');
  const [doctorData, setDoctorData] = useState<DoctorData | null>(null);
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    completedAppointments: 0,
    revenue: 0
  });

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
      const userData = userResponse.data.data || userResponse.data;
      setDoctorData(userData);

      try {
        const profileResponse = await api.get('/doctors/me');
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
      const response = await api.get('/appointments/today');
      setAppointments(response.data.data || response.data || []);
    } catch (e) {
      console.log("Appointments endpoint not ready, using mock data");
      // Mock data
      setAppointments([
        {
          id: '1',
          patientName: 'John Smith',
          date: new Date().toISOString().split('T')[0],
          time: '10:00',
          type: 'consultation',
          status: 'scheduled',
          notes: 'Follow-up for prescription'
        },
        {
          id: '2',
          patientName: 'Sarah Johnson',
          date: new Date().toISOString().split('T')[0],
          time: '11:30',
          type: 'follow-up',
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
      // Mock stats
      setStats({
        totalPatients: 124,
        todayAppointments: 8,
        completedAppointments: 156,
        revenue: 24500
      });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-transparent">
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
    <>
      {/* Header & Quick Stats */}
      <div className="px-8 py-5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, Dr. {doctorData?.name?.split(' ')[0] || ''}!</h1>
            <p className="text-gray-500 mt-1">Here's your practice overview for today</p>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2.5 text-green-600 hover:bg-green-50 rounded-xl border border-green-200 transition-all duration-200 cursor-pointer">
            <Edit className="w-4 h-4" />
            <span className="text-sm font-medium">Edit Profile</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg shadow-green-500/5 border border-gray-200/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Today's Appointments</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.todayAppointments}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg shadow-green-500/5 border border-gray-200/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalPatients}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg shadow-green-500/5 border border-gray-200/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.completedAppointments}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg shadow-green-500/5 border border-gray-200/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">${stats.revenue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile & Today's Schedule */}
      <div className="px-8 pb-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Doctor Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg shadow-green-500/5 border border-gray-200/50 overflow-hidden sticky top-6">
            <div className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center text-4xl font-bold text-green-700 shadow-xl">
                    {doctorData?.name?.charAt(0) || 'D'}
                  </div>
                  <div className="absolute bottom-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-all duration-200">
                    <Edit className="w-4 h-4 text-gray-600" />
                  </div>
                </div>

                <h2 className="text-xl font-bold text-gray-900">Dr. {doctorData?.name || 'Loading...'}</h2>
                <p className="text-green-600 font-medium mt-1">{doctorData?.specialization || 'Doctor'}</p>
                <p className="text-gray-500 text-sm mt-1">{doctorData?.qualification || ''}</p>

                <div className="w-full mt-6 space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Experience</span>
                    <span className="font-medium text-gray-900">{doctorProfile?.experience || 0} years</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Consultation Fee</span>
                    <span className="font-medium text-gray-900">${doctorProfile?.consultationFee || 0}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600">Languages</span>
                    <span className="font-medium text-gray-900">
                      {doctorProfile?.languages?.slice(0, 2).join(', ') || 'English'}
                    </span>
                  </div>
                </div>

                <button className="w-full mt-6 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl font-medium hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg shadow-green-500/30 cursor-pointer">
                  Update Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg shadow-green-500/5 border border-gray-200/50 overflow-hidden">
            <div className="border-b border-gray-200/50 px-6 py-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Today's Schedule</h2>
                <p className="text-gray-500 text-sm mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
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
            <div className="px-6 pt-6 flex space-x-6 border-b border-gray-200/50">
              {(['today', 'upcoming', 'completed'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 font-medium relative transition-all duration-200 cursor-pointer ${activeTab === tab
                    ? 'text-green-600'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {tab === 'today' && "Today's Schedule"}
                  {tab === 'upcoming' && 'Upcoming'}
                  {tab === 'completed' && 'Completed'}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-500 to-green-600 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Appointments List */}
            <div className="p-6">
              {appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="group border border-gray-200/50 rounded-xl p-5 hover:border-green-300 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300 bg-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="text-center bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 min-w-[80px]">
                            <p className="text-lg font-bold text-green-900">{appointment.time}</p>
                            <p className="text-xs font-medium text-green-700 mt-1">Duration: 30m</p>
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">{appointment.patientName}</h3>
                            <div className="flex items-center space-x-3 mt-2">
                              <span className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                                {appointment.type}
                              </span>
                              <span className={`text-sm px-3 py-1 rounded-full ${appointment.status === 'scheduled' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                {appointment.status}
                              </span>
                            </div>
                            {appointment.notes && (
                              <p className="text-sm text-gray-600 mt-3">{appointment.notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors cursor-pointer">
                            Start
                          </button>
                          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer">
                            Reschedule
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Calendar className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No appointments scheduled</h3>
                  <p className="text-gray-500 max-w-md mx-auto">You have no appointments scheduled for today</p>
                </div>
              )}

              {/* Quick Actions */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-50 to-green-100/50 border border-green-200 rounded-xl hover:bg-green-100 transition-all duration-200 cursor-pointer">
                    <Plus className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-700">Add Time Slot</span>
                  </button>
                  <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100/50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-all duration-200 cursor-pointer">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-700">View All Patients</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Quick Stats */}
      <div className="px-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-lg shadow-green-500/5 border border-gray-200/50 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {[
                { time: '10:30 AM', action: 'Completed consultation with John Smith', type: 'completed' },
                { time: '09:15 AM', action: 'Added new prescription for Sarah Johnson', type: 'prescription' },
                { time: 'Yesterday', action: 'Updated patient records for 3 patients', type: 'records' },
                { time: 'Jan 12', action: 'Scheduled follow-up for Michael Brown', type: 'scheduled' }
              ].map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.type === 'completed' ? 'bg-green-100' : activity.type === 'prescription' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                    {activity.type === 'completed' ? <CheckCircle className="w-4 h-4 text-green-600" /> :
                      activity.type === 'prescription' ? <FileText className="w-4 h-4 text-blue-600" /> :
                        <Activity className="w-4 h-4 text-purple-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-2xl shadow-lg shadow-green-500/5 border border-gray-200/50 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Links</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => router.push('/doctor/patients')}
                className="flex flex-col items-center p-4 bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200 rounded-xl hover:bg-green-100 transition-all duration-200 cursor-pointer"
              >
                <Users className="w-8 h-8 text-green-600 mb-3" />
                <span className="font-medium text-gray-900">My Patients</span>
                <span className="text-sm text-gray-500 mt-1">124 patients</span>
              </button>

              <button
                onClick={() => router.push('/doctor/appointments')}
                className="flex flex-col items-center p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-all duration-200 cursor-pointer"
              >
                <Calendar className="w-8 h-8 text-blue-600 mb-3" />
                <span className="font-medium text-gray-900">All Appointments</span>
                <span className="text-sm text-gray-500 mt-1">Manage schedule</span>
              </button>

              <button
                onClick={() => router.push('/doctor/prescriptions')}
                className="flex flex-col items-center p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200 rounded-xl hover:bg-purple-100 transition-all duration-200 cursor-pointer"
              >
                <FileText className="w-8 h-8 text-purple-600 mb-3" />
                <span className="font-medium text-gray-900">Prescriptions</span>
                <span className="text-sm text-gray-500 mt-1">Write new</span>
              </button>

              <button
                onClick={() => router.push('/doctor/reports')}
                className="flex flex-col items-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100/50 border border-yellow-200 rounded-xl hover:bg-yellow-100 transition-all duration-200 cursor-pointer"
              >
                <Activity className="w-8 h-8 text-yellow-600 mb-3" />
                <span className="font-medium text-gray-900">Reports</span>
                <span className="text-sm text-gray-500 mt-1">Generate reports</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DoctorDashboard;