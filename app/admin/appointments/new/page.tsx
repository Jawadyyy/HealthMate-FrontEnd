"use client";

import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, User, Search, Plus, ChevronRight, 
  Phone, Mail, MapPin, Stethoscope, AlertCircle, X,
  Shield, LogOut, HelpCircle, Settings, Users, UserPlus, 
  CreditCard, BarChart3, Bell, ArrowLeft, Save, FileText,
  ChevronDown, CheckCircle, XCircle
} from 'lucide-react';
import api from '@/lib/api/api';
import { useRouter } from 'next/navigation';

// ========== TYPES ==========
interface Patient {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
}

interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  availableSlots: string[];
  department: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

interface AppointmentFormData {
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  type: 'consultation' | 'follow-up' | 'emergency' | 'routine' | 'surgery';
  reason: string;
  notes: string;
  symptoms: string[];
  urgency: 'low' | 'medium' | 'high';
}

// ========== MAIN COMPONENT ==========
const NewAppointmentModule = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);

  const [formData, setFormData] = useState<AppointmentFormData>({
    patientId: '',
    doctorId: '',
    date: '',
    time: '',
    type: 'consultation',
    reason: '',
    notes: '',
    symptoms: [],
    urgency: 'medium'
  });

  const [newSymptom, setNewSymptom] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.phone?.includes(searchQuery)
      );
      setFilteredPatients(filtered);
    }
  }, [searchQuery, patients]);

  useEffect(() => {
    if (formData.doctorId && formData.date) {
      fetchTimeSlots(formData.doctorId, formData.date);
    }
  }, [formData.doctorId, formData.date]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [patientsRes, doctorsRes] = await Promise.all([
        api.get('/patients'),
        api.get('/doctors/available')
      ]);

      setPatients(patientsRes.data.data || patientsRes.data || getMockPatients());
      setDoctors(doctorsRes.data.data || doctorsRes.data || getMockDoctors());
      setFilteredPatients(patientsRes.data.data || patientsRes.data || getMockPatients());
    } catch (error) {
      console.error('Error loading data:', error);
      setPatients(getMockPatients());
      setDoctors(getMockDoctors());
      setFilteredPatients(getMockPatients());
    } finally {
      setLoading(false);
    }
  };

  const getMockPatients = (): Patient[] => [
    { _id: 'p001', name: 'John Smith', email: 'john.smith@email.com', phone: '+1 (555) 123-4567', dateOfBirth: '1985-03-15' },
    { _id: 'p002', name: 'Emily Johnson', email: 'emily.j@email.com', phone: '+1 (555) 987-6543', dateOfBirth: '1990-07-22' },
    { _id: 'p003', name: 'Michael Brown', email: 'michael.b@email.com', phone: '+1 (555) 456-7890', dateOfBirth: '1978-11-30' },
    { _id: 'p004', name: 'Sophia Davis', email: 'sophia.d@email.com', phone: '+1 (555) 321-0987', dateOfBirth: '1995-05-18' },
    { _id: 'p005', name: 'David Wilson', email: 'david.w@email.com', phone: '+1 (555) 654-3210', dateOfBirth: '1982-09-25' },
  ];

  const getMockDoctors = (): Doctor[] => [
    { _id: 'd001', name: 'Dr. Robert Wilson', specialization: 'Cardiology', department: 'Heart Center', availableSlots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
    { _id: 'd002', name: 'Dr. Sarah Miller', specialization: 'Pediatrics', department: 'Children\'s Health', availableSlots: ['08:00', '09:30', '11:00', '13:30', '15:00'] },
    { _id: 'd003', name: 'Dr. James Wilson', specialization: 'Orthopedics', department: 'Bone & Joint', availableSlots: ['10:00', '11:30', '14:00', '15:30', '16:30'] },
    { _id: 'd004', name: 'Dr. Lisa Anderson', specialization: 'Dermatology', department: 'Skin Care', availableSlots: ['09:00', '10:30', '12:00', '14:00', '16:00'] },
    { _id: 'd005', name: 'Dr. Michael Chen', specialization: 'Neurology', department: 'Brain & Spine', availableSlots: ['08:30', '10:00', '11:30', '14:30', '16:00'] },
  ];

  const fetchTimeSlots = async (doctorId: string, date: string) => {
    try {
      // In a real app, this would fetch from backend
      const mockSlots: TimeSlot[] = [
        { time: '09:00 AM', available: true },
        { time: '10:00 AM', available: true },
        { time: '11:00 AM', available: false },
        { time: '02:00 PM', available: true },
        { time: '03:00 PM', available: true },
        { time: '04:00 PM', available: false },
      ];
      setTimeSlots(mockSlots);
    } catch (error) {
      console.error('Error fetching time slots:', error);
    }
  };

  const handleInputChange = (field: keyof AppointmentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSymptom = () => {
    if (newSymptom.trim() && !formData.symptoms.includes(newSymptom.trim())) {
      setFormData(prev => ({
        ...prev,
        symptoms: [...prev.symptoms, newSymptom.trim()]
      }));
      setNewSymptom('');
    }
  };

  const removeSymptom = (index: number) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      // In real app, this would be an API call
      // await api.post('/appointments', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Appointment scheduled successfully!');
      router.push('/admin/appointments');
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Failed to schedule appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.patientId) {
      alert('Please select a patient');
      return false;
    }
    if (!formData.doctorId) {
      alert('Please select a doctor');
      return false;
    }
    if (!formData.date) {
      alert('Please select a date');
      return false;
    }
    if (!formData.time) {
      alert('Please select a time');
      return false;
    }
    if (!formData.reason.trim()) {
      alert('Please provide a reason for the appointment');
      return false;
    }
    return true;
  };

  const handleLogout = () => {
    ['token', 'role', 'isLoggedIn'].forEach(key => localStorage.removeItem(key));
    router.push('/auth/admin/login');
  };

  if (loading && !patients.length) {
    return <LoadingScreen message="Loading appointment form..." />;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-white to-gray-50">
      <Sidebar handleLogout={handleLogout} />

      <div className="flex-1 overflow-auto ml-72">
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        {/* Breadcrumb */}
        <div className="px-8 py-5">
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <button 
              onClick={() => router.push('/admin/appointments')}
              className="hover:text-purple-600 cursor-pointer flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Appointments
            </button>
            <ChevronRight className="w-4 h-4" />
            <span className="text-purple-600 font-medium">New Appointment</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Schedule New Appointment</h1>
              <p className="text-gray-500 text-sm mt-1">Create a new medical appointment for a patient</p>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="px-8 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Patient Selection & Basic Info */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg shadow-purple-500/5 border border-gray-200/50 p-6">
                {/* Patient Selection */}
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-purple-600" />
                    Select Patient
                  </h2>
                  
                  <div className="mb-4">
                    <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                  </div>

                  <div className="border border-gray-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                    {filteredPatients.map(patient => (
                      <PatientCard
                        key={patient._id}
                        patient={patient}
                        isSelected={formData.patientId === patient._id}
                        onSelect={() => handleInputChange('patientId', patient._id)}
                      />
                    ))}
                    
                    {filteredPatients.length === 0 && (
                      <div className="p-8 text-center text-gray-400">
                        <User className="w-12 h-12 mx-auto mb-4" />
                        <p>No patients found</p>
                        <p className="text-sm mt-1">Try a different search term</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Appointment Details */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                    Appointment Details
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Doctor Selection */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Stethoscope className="w-4 h-4 inline mr-2 text-purple-600" />
                        Select Doctor
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {doctors.map(doctor => (
                          <DoctorCard
                            key={doctor._id}
                            doctor={doctor}
                            isSelected={formData.doctorId === doctor._id}
                            onSelect={() => handleInputChange('doctorId', doctor._id)}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Date & Time */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="w-4 h-4 inline mr-2 text-purple-600" />
                        Appointment Date
                      </label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Clock className="w-4 h-4 inline mr-2 text-purple-600" />
                        Time Slot
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {timeSlots.length > 0 ? (
                          timeSlots.map((slot, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleInputChange('time', slot.time)}
                              disabled={!slot.available}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                                formData.time === slot.time
                                  ? 'bg-purple-600 text-white'
                                  : slot.available
                                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                              }`}
                            >
                              {slot.time}
                            </button>
                          ))
                        ) : (
                          <div className="col-span-3 text-center py-4 text-gray-400">
                            <p>Select a doctor and date to see available slots</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Appointment Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Appointment Type
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => handleInputChange('type', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200"
                      >
                        <option value="consultation">Consultation</option>
                        <option value="follow-up">Follow-up</option>
                        <option value="emergency">Emergency</option>
                        <option value="routine">Routine Checkup</option>
                        <option value="surgery">Surgery</option>
                      </select>
                    </div>

                    {/* Urgency Level */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Urgency Level
                      </label>
                      <div className="flex space-x-2">
                        {(['low', 'medium', 'high'] as const).map(level => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => handleInputChange('urgency', level)}
                            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                              formData.urgency === level
                                ? level === 'low' ? 'bg-green-100 text-green-700 border-green-200' :
                                  level === 'medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                  'bg-red-100 text-red-700 border-red-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            } border`}
                          >
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Reason */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason for Appointment *
                      </label>
                      <textarea
                        value={formData.reason}
                        onChange={(e) => handleInputChange('reason', e.target.value)}
                        rows={3}
                        placeholder="Briefly describe the reason for this appointment..."
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200 resize-none"
                      />
                    </div>

                    {/* Symptoms */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <AlertCircle className="w-4 h-4 inline mr-2 text-red-600" />
                        Symptoms (Optional)
                      </label>
                      <div className="mb-3">
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={newSymptom}
                            onChange={(e) => setNewSymptom(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSymptom())}
                            placeholder="Add a symptom..."
                            className="flex-1 px-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200"
                          />
                          <button
                            type="button"
                            onClick={addSymptom}
                            className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all duration-200 cursor-pointer"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {formData.symptoms.map((symptom, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2 bg-red-50 text-red-700 px-4 py-2 rounded-lg border border-red-200"
                          >
                            <span className="text-sm">{symptom}</span>
                            <button
                              type="button"
                              onClick={() => removeSymptom(index)}
                              className="text-red-500 hover:text-red-700 cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Additional Notes */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FileText className="w-4 h-4 inline mr-2 text-gray-600" />
                        Additional Notes (Optional)
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        rows={4}
                        placeholder="Any additional information or special requirements..."
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200 resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Summary & Actions */}
            <div className="lg:col-span-1">
              {/* Appointment Summary */}
              <div className="bg-white rounded-2xl shadow-lg shadow-purple-500/5 border border-gray-200/50 p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Appointment Summary</h2>
                
                <div className="space-y-4">
                  <SummaryItem label="Patient" value={
                    formData.patientId 
                      ? patients.find(p => p._id === formData.patientId)?.name || 'Not selected'
                      : 'Not selected'
                  } />
                  
                  <SummaryItem label="Doctor" value={
                    formData.doctorId 
                      ? doctors.find(d => d._id === formData.doctorId)?.name || 'Not selected'
                      : 'Not selected'
                  } />
                  
                  <SummaryItem label="Date" value={
                    formData.date 
                      ? new Date(formData.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })
                      : 'Not selected'
                  } />
                  
                  <SummaryItem label="Time" value={formData.time || 'Not selected'} />
                  
                  <SummaryItem label="Type" value={
                    formData.type 
                      ? formData.type.charAt(0).toUpperCase() + formData.type.slice(1)
                      : 'Not selected'
                  } />
                  
                  <SummaryItem label="Urgency" value={
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      formData.urgency === 'low' ? 'bg-green-100 text-green-700' :
                      formData.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {formData.urgency.charAt(0).toUpperCase() + formData.urgency.slice(1)}
                    </span>
                  } />
                  
                  {formData.reason && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Reason</p>
                      <p className="text-gray-900 text-sm line-clamp-3">{formData.reason}</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg shadow-purple-500/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Scheduling...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>Schedule Appointment</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => router.push('/admin/appointments')}
                    className="w-full mt-3 px-6 py-3 text-gray-600 hover:bg-gray-50 rounded-xl border border-gray-200 transition-all duration-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              {/* Quick Tips */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/50 rounded-2xl p-6">
                <h3 className="font-semibold text-purple-900 mb-3">Quick Tips</h3>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-purple-700">Verify patient information before scheduling</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-purple-700">Check doctor availability for emergency cases</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-purple-700">Include all relevant symptoms for better diagnosis</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-purple-700">Send appointment confirmation to patient</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ========== SIDEBAR COMPONENT ==========
const Sidebar: React.FC<{ handleLogout: () => void }> = ({ handleLogout }) => (
  <div className="w-72 bg-white/95 backdrop-blur-sm border-r border-gray-200 flex flex-col fixed left-0 top-0 h-full z-20 shadow-lg shadow-purple-500/5">
    <div className="p-8 pb-6">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
          <Shield className="w-7 h-7 text-white" />
        </div>
        <div>
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">HealthMate</span>
          <p className="text-xs text-gray-500 mt-1">Admin Portal</p>
        </div>
      </div>
    </div>

    <nav className="px-5 space-y-2 flex-1">
      <NavItem icon={BarChart3} label="Dashboard" route="/admin/dashboard" />
      <NavItem icon={Stethoscope} label="Doctors" route="/admin/doctors" />
      <NavItem icon={UserPlus} label="Patients" route="/admin/patients" />
      <NavItem icon={Calendar} label="Appointments" route="/admin/appointments" />
      <ActiveNavItem icon={Plus} label="New Appointment" />
      <NavItem icon={CreditCard} label="Billing" route="/admin/billing" />
    </nav>

    <div className="p-5 space-y-2 border-t border-gray-200/50">
      <NavItem icon={HelpCircle} label="Help & Support" route="/admin/help" />
      <div onClick={handleLogout} className="w-full"><NavItem icon={LogOut} label="Logout" /></div>
    </div>

    <div className="p-5 mt-auto">
      <div className="bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-xl p-4 border border-purple-200/50">
        <p className="text-sm font-medium text-purple-800">System Status</p>
        <div className="flex items-center space-x-2 mt-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <p className="text-xs text-purple-600/80">All systems operational</p>
        </div>
      </div>
    </div>
  </div>
);

const NavItem: React.FC<{ 
  icon: React.ElementType; 
  label: string; 
  route?: string;
}> = ({ icon: Icon, label, route }) => {
  const router = useRouter();
  
  return (
    <div 
      onClick={() => route && router.push(route)}
      className="flex items-center justify-between px-5 py-3.5 rounded-xl transition-all duration-200 cursor-pointer text-gray-600 hover:bg-gray-50/80 hover:text-gray-900"
    >
      <div className="flex items-center space-x-3.5">
        <Icon className="w-5 h-5 text-gray-500" />
        <span className="font-medium">{label}</span>
      </div>
    </div>
  );
};

const ActiveNavItem: React.FC<{ icon: React.ElementType; label: string }> = ({ icon: Icon, label }) => (
  <div className="flex items-center justify-between px-5 py-3.5 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100/50 text-purple-700 border border-purple-200/50 cursor-pointer">
    <div className="flex items-center space-x-3.5">
      <Icon className="w-5 h-5 text-purple-600" />
      <span className="font-medium">{label}</span>
    </div>
  </div>
);

// ========== HEADER COMPONENT ==========
const Header: React.FC<{
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}> = ({ searchQuery, setSearchQuery }) => (
  <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-8 py-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-6">
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      </div>
      <div className="flex items-center space-x-5">
        <BellButton />
        <AdminProfile />
      </div>
    </div>
  </div>
);

const SearchBar: React.FC<{ 
  searchQuery: string; 
  setSearchQuery: (query: string) => void 
}> = ({ searchQuery, setSearchQuery }) => (
  <div className="relative flex-1 max-w-lg">
    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
    <input
      type="text"
      placeholder="Search patients by name, email, or phone..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200"
    />
  </div>
);

const BellButton: React.FC = () => (
  <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer">
    <Bell className="w-5 h-5 text-gray-600" />
    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
  </button>
);

const AdminProfile: React.FC = () => (
  <div className="flex items-center space-x-3">
    <div className="text-right">
      <p className="text-sm font-medium text-gray-800">Admin User</p>
      <p className="text-xs text-gray-500">System Administrator</p>
    </div>
    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
      A
    </div>
  </div>
);

// ========== PATIENT CARD COMPONENT ==========
const PatientCard: React.FC<{
  patient: Patient;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ patient, isSelected, onSelect }) => (
  <div 
    onClick={onSelect}
    className={`p-4 border-b border-gray-100 last:border-0 transition-all duration-200 cursor-pointer ${
      isSelected 
        ? 'bg-gradient-to-r from-purple-50 to-purple-100/50 border-purple-200' 
        : 'hover:bg-gray-50'
    }`}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isSelected ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
        }`}>
          <User className="w-5 h-5" />
        </div>
        <div>
          <p className={`font-medium ${isSelected ? 'text-purple-700' : 'text-gray-900'}`}>
            {patient.name}
          </p>
          <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
            <span className="flex items-center">
              <Mail className="w-3 h-3 mr-1" />
              {patient.email}
            </span>
            {patient.phone && (
              <span className="flex items-center">
                <Phone className="w-3 h-3 mr-1" />
                {patient.phone}
              </span>
            )}
          </div>
        </div>
      </div>
      {isSelected && (
        <CheckCircle className="w-5 h-5 text-purple-600" />
      )}
    </div>
  </div>
);

// ========== DOCTOR CARD COMPONENT ==========
const DoctorCard: React.FC<{
  doctor: Doctor;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ doctor, isSelected, onSelect }) => (
  <button
    type="button"
    onClick={onSelect}
    className={`p-4 border rounded-xl text-left transition-all duration-200 cursor-pointer ${
      isSelected
        ? 'bg-gradient-to-r from-purple-50 to-purple-100/50 border-purple-300 shadow-sm'
        : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
    }`}
  >
    <div className="flex items-start space-x-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
        isSelected ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
      }`}>
        <Stethoscope className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <p className={`font-medium ${isSelected ? 'text-purple-700' : 'text-gray-900'}`}>
          {doctor.name}
        </p>
        <p className="text-sm text-gray-600 mt-1">{doctor.specialization}</p>
        <p className="text-xs text-gray-500 mt-2">{doctor.department}</p>
        <div className="flex flex-wrap gap-1 mt-2">
          {doctor.availableSlots.slice(0, 3).map((slot, idx) => (
            <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              {slot}
            </span>
          ))}
          {doctor.availableSlots.length > 3 && (
            <span className="text-xs text-gray-400">+{doctor.availableSlots.length - 3} more</span>
          )}
        </div>
      </div>
    </div>
  </button>
);

// ========== SUMMARY ITEM COMPONENT ==========
const SummaryItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-600 mb-1">{label}</p>
    <div className="text-gray-900 font-medium">{value}</div>
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

export default NewAppointmentModule;