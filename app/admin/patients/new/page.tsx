"use client";

import React, { useState } from 'react';
import { 
  User, UserPlus, ArrowLeft, Save, X, Plus, Trash2,
  Mail, Phone, MapPin, Calendar, Activity, AlertCircle,
  CreditCard, Bell
} from 'lucide-react';
import api from '@/lib/api/api';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';

// ========== TYPES ==========
interface PatientFormData {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  bloodGroup: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  medicalConditions: string[];
  allergies: string[];
  medications: string[];
  insuranceProvider: string;
  insuranceNumber: string;
  notes: string;
}

interface FormError {
  field: keyof PatientFormData;
  message: string;
}

// ========== MAIN COMPONENT ==========
const AddPatientModule = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormError[]>([]);
  const [newCondition, setNewCondition] = useState('');
  const [newAllergy, setNewAllergy] = useState('');
  const [newMedication, setNewMedication] = useState('');
  const [searchQuery, setSearchQuery] = useState('');


  const [formData, setFormData] = useState<PatientFormData>({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'male',
    bloodGroup: 'O+',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    medicalConditions: [],
    allergies: [],
    medications: [],
    insuranceProvider: '',
    insuranceNumber: '',
    notes: ''
  });

  const bloodGroups = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
  const emergencyRelations = ['Spouse', 'Parent', 'Child', 'Sibling', 'Friend', 'Other'];

  const handleInputChange = (field: keyof PatientFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field if exists
    setErrors(prev => prev.filter(error => error.field !== field));
  };

  const addItem = (type: 'condition' | 'allergy' | 'medication', value: string, setNewValue: React.Dispatch<React.SetStateAction<string>>) => {
    if (value.trim() && !formData[{
      condition: 'medicalConditions',
      allergy: 'allergies',
      medication: 'medications'
    }[type] as keyof PatientFormData].includes(value.trim())) {
      
      const key = {
        condition: 'medicalConditions',
        allergy: 'allergies',
        medication: 'medications'
      }[type] as keyof PatientFormData;
      
      setFormData(prev => ({
        ...prev,
        [key]: [...(prev[key] as string[]), value.trim()]
      }));
      setNewValue('');
    }
  };

  const removeItem = (type: 'condition' | 'allergy' | 'medication', index: number) => {
    const key = {
      condition: 'medicalConditions',
      allergy: 'allergies',
      medication: 'medications'
    }[type] as keyof PatientFormData;
    
    setFormData(prev => ({
      ...prev,
      [key]: (prev[key] as string[]).filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormError[] = [];

    if (!formData.name.trim()) {
      newErrors.push({ field: 'name', message: 'Name is required' });
    }

    if (!formData.email.trim()) {
      newErrors.push({ field: 'email', message: 'Email is required' });
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.push({ field: 'email', message: 'Email is invalid' });
    }

    if (!formData.phone.trim()) {
      newErrors.push({ field: 'phone', message: 'Phone number is required' });
    }

    if (!formData.dateOfBirth) {
      newErrors.push({ field: 'dateOfBirth', message: 'Date of birth is required' });
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      if (birthDate > today) {
        newErrors.push({ field: 'dateOfBirth', message: 'Date of birth cannot be in the future' });
      }
    }

    if (!formData.address.trim()) {
      newErrors.push({ field: 'address', message: 'Address is required' });
    }

    if (formData.emergencyContactName && !formData.emergencyContactPhone) {
      newErrors.push({ field: 'emergencyContactPhone', message: 'Emergency contact phone is required' });
    }

    if (formData.emergencyContactPhone && !formData.emergencyContactName) {
      newErrors.push({ field: 'emergencyContactName', message: 'Emergency contact name is required' });
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      // In real app, this would be an API call
      // await api.post('/patients', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      alert('Patient added successfully!');
      router.push('/admin/patients');
      
    } catch (error) {
      console.error('Error adding patient:', error);
      alert('Failed to add patient. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getError = (field: keyof PatientFormData) => {
    return errors.find(error => error.field === field);
  };

  return (
     <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-white to-gray-50">
      {/* Update Sidebar usage - let it auto-detect route from usePathname */}
      <Sidebar />
      
      <div className="flex-1 overflow-auto ml-72">
        <Header 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          adminData={{ name: 'System Admin' }}
          searchPlaceholder="Search..."
        />
        
        {/* Breadcrumb & Actions */}
        <div className="px-8 py-5">
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <button 
              onClick={() => router.push('/admin/patients')}
              className="hover:text-purple-600 cursor-pointer flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Patients
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add New Patient</h1>
              <p className="text-gray-500 text-sm mt-1">Register a new patient in the system</p>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Personal Information */}
              <div className="lg:col-span-2 space-y-6">
                {/* Personal Information Card */}
                <div className="bg-white rounded-2xl shadow-lg shadow-purple-500/5 border border-gray-200/50 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <User className="w-5 h-5 mr-2 text-purple-600" />
                    Personal Information
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all duration-200 ${
                          getError('name') 
                            ? 'border-red-300 focus:border-red-500' 
                            : 'border-gray-200 focus:border-purple-500'
                        }`}
                        placeholder="John Doe"
                      />
                      {getError('name') && (
                        <p className="mt-2 text-sm text-red-600">{getError('name')?.message}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all duration-200 ${
                          getError('email') 
                            ? 'border-red-300 focus:border-red-500' 
                            : 'border-gray-200 focus:border-purple-500'
                        }`}
                        placeholder="john.doe@example.com"
                      />
                      {getError('email') && (
                        <p className="mt-2 text-sm text-red-600">{getError('email')?.message}</p>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all duration-200 ${
                          getError('phone') 
                            ? 'border-red-300 focus:border-red-500' 
                            : 'border-gray-200 focus:border-purple-500'
                        }`}
                        placeholder="+1 (555) 123-4567"
                      />
                      {getError('phone') && (
                        <p className="mt-2 text-sm text-red-600">{getError('phone')?.message}</p>
                      )}
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all duration-200 ${
                          getError('dateOfBirth') 
                            ? 'border-red-300 focus:border-red-500' 
                            : 'border-gray-200 focus:border-purple-500'
                        }`}
                      />
                      {getError('dateOfBirth') && (
                        <p className="mt-2 text-sm text-red-600">{getError('dateOfBirth')?.message}</p>
                      )}
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender *
                      </label>
                      <div className="flex space-x-4">
                        {(['male', 'female', 'other'] as const).map(gender => (
                          <label key={gender} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name="gender"
                              value={gender}
                              checked={formData.gender === gender}
                              onChange={(e) => handleInputChange('gender', e.target.value)}
                              className="text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-gray-700 capitalize">{gender}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Blood Group */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Blood Group
                      </label>
                      <select
                        value={formData.bloodGroup}
                        onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200"
                      >
                        <option value="">Select blood group</option>
                        {bloodGroups.map(group => (
                          <option key={group} value={group}>{group}</option>
                        ))}
                      </select>
                    </div>

                    {/* Address */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address *
                      </label>
                      <textarea
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        rows={3}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all duration-200 resize-none ${
                          getError('address') 
                            ? 'border-red-300 focus:border-red-500' 
                            : 'border-gray-200 focus:border-purple-500'
                        }`}
                        placeholder="Street address, City, State, ZIP code"
                      />
                      {getError('address') && (
                        <p className="mt-2 text-sm text-red-600">{getError('address')?.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Emergency Contact Card */}
                <div className="bg-white rounded-2xl shadow-lg shadow-purple-500/5 border border-gray-200/50 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
                    Emergency Contact Information
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Name
                      </label>
                      <input
                        type="text"
                        value={formData.emergencyContactName}
                        onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all duration-200 ${
                          getError('emergencyContactName') 
                            ? 'border-red-300 focus:border-red-500' 
                            : 'border-gray-200 focus:border-purple-500'
                        }`}
                        placeholder="Jane Smith"
                      />
                      {getError('emergencyContactName') && (
                        <p className="mt-2 text-sm text-red-600">{getError('emergencyContactName')?.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Relationship
                      </label>
                      <select
                        value={formData.emergencyContactRelation}
                        onChange={(e) => handleInputChange('emergencyContactRelation', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200"
                      >
                        <option value="">Select relationship</option>
                        {emergencyRelations.map(relation => (
                          <option key={relation} value={relation}>{relation}</option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.emergencyContactPhone}
                        onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all duration-200 ${
                          getError('emergencyContactPhone') 
                            ? 'border-red-300 focus:border-red-500' 
                            : 'border-gray-200 focus:border-purple-500'
                        }`}
                        placeholder="+1 (555) 987-6543"
                      />
                      {getError('emergencyContactPhone') && (
                        <p className="mt-2 text-sm text-red-600">{getError('emergencyContactPhone')?.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Medical Information Card */}
                <div className="bg-white rounded-2xl shadow-lg shadow-purple-500/5 border border-gray-200/50 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-purple-600" />
                    Medical Information
                  </h2>
                  
                  {/* Medical Conditions */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Medical Conditions
                    </label>
                    <div className="flex space-x-2 mb-3">
                      <input
                        type="text"
                        value={newCondition}
                        onChange={(e) => setNewCondition(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('condition', newCondition, setNewCondition))}
                        placeholder="Add a medical condition"
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => addItem('condition', newCondition, setNewCondition)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all duration-200 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {formData.medicalConditions.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.medicalConditions.map((condition, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2 bg-red-50 text-red-700 px-4 py-2 rounded-lg border border-red-200"
                          >
                            <span className="text-sm">{condition}</span>
                            <button
                              type="button"
                              onClick={() => removeItem('condition', index)}
                              className="text-red-500 hover:text-red-700 cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Allergies */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Allergies
                    </label>
                    <div className="flex space-x-2 mb-3">
                      <input
                        type="text"
                        value={newAllergy}
                        onChange={(e) => setNewAllergy(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('allergy', newAllergy, setNewAllergy))}
                        placeholder="Add an allergy"
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => addItem('allergy', newAllergy, setNewAllergy)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all duration-200 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {formData.allergies.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.allergies.map((allergy, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2 bg-yellow-50 text-yellow-700 px-4 py-2 rounded-lg border border-yellow-200"
                          >
                            <span className="text-sm">{allergy}</span>
                            <button
                              type="button"
                              onClick={() => removeItem('allergy', index)}
                              className="text-yellow-500 hover:text-yellow-700 cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Current Medications */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Medications
                    </label>
                    <div className="flex space-x-2 mb-3">
                      <input
                        type="text"
                        value={newMedication}
                        onChange={(e) => setNewMedication(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('medication', newMedication, setNewMedication))}
                        placeholder="Add a medication"
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => addItem('medication', newMedication, setNewMedication)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all duration-200 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {formData.medications.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.medications.map((medication, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg border border-green-200"
                          >
                            <span className="text-sm">{medication}</span>
                            <button
                              type="button"
                              onClick={() => removeItem('medication', index)}
                              className="text-green-500 hover:text-green-700 cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Insurance & Actions */}
              <div className="lg:col-span-1 space-y-6">
                {/* Insurance Information Card */}
                <div className="bg-white rounded-2xl shadow-lg shadow-purple-500/5 border border-gray-200/50 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-purple-600" />
                    Insurance Information
                  </h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Insurance Provider
                      </label>
                      <input
                        type="text"
                        value={formData.insuranceProvider}
                        onChange={(e) => handleInputChange('insuranceProvider', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200"
                        placeholder="Blue Cross Blue Shield"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Insurance Policy Number
                      </label>
                      <input
                        type="text"
                        value={formData.insuranceNumber}
                        onChange={(e) => handleInputChange('insuranceNumber', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200"
                        placeholder="BCBS-12345678"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Notes Card */}
                <div className="bg-white rounded-2xl shadow-lg shadow-purple-500/5 border border-gray-200/50 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 text-purple-600" />
                    Additional Notes
                  </h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200 resize-none"
                      placeholder="Any additional information, special requirements, or notes about the patient..."
                    />
                  </div>
                </div>

                {/* Summary & Actions Card */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/50 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Summary</h2>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center pb-2 border-b border-purple-200/50">
                      <span className="text-sm text-gray-600">Name</span>
                      <span className="font-medium text-gray-900">{formData.name || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-purple-200/50">
                      <span className="text-sm text-gray-600">Email</span>
                      <span className="font-medium text-gray-900">{formData.email || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-purple-200/50">
                      <span className="text-sm text-gray-600">Phone</span>
                      <span className="font-medium text-gray-900">{formData.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-purple-200/50">
                      <span className="text-sm text-gray-600">Conditions</span>
                      <span className="font-medium text-gray-900">{formData.medicalConditions.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Allergies</span>
                      <span className="font-medium text-gray-900">{formData.allergies.length}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg shadow-purple-500/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          <span>Save Patient</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => router.push('/admin/patients')}
                      className="w-full px-6 py-3 text-gray-600 hover:bg-gray-50 rounded-xl border border-gray-200 transition-all duration-200 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPatientModule;