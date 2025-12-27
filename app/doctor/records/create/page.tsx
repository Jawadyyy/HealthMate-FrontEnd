"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save, Stethoscope, User, Search, Plus, X, Activity, Heart, Thermometer, AlertCircle, Calendar } from 'lucide-react';
import api from '@/lib/api/api';

interface Patient {
    _id: string;
    userId: any;
    name?: string;
}

interface Medication {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
}

const CreateMedicalRecordPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const patientIdFromQuery = searchParams.get('patientId');
    
    const [loading, setLoading] = useState(false);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [selectedPatient, setSelectedPatient] = useState(patientIdFromQuery || '');
    const [recordType, setRecordType] = useState<'consultation' | 'diagnosis' | 'lab-report' | 'other'>('consultation');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [treatment, setTreatment] = useState('');
    const [notes, setNotes] = useState('');
    const [patientSearch, setPatientSearch] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    
    // Vital Signs
    const [vitalSigns, setVitalSigns] = useState({
        bloodPressure: '',
        heartRate: '',
        temperature: '',
        weight: '',
        respiratoryRate: '',
        oxygenSaturation: ''
    });

    // Medications
    const [medications, setMedications] = useState<Medication[]>([
        { name: '', dosage: '', frequency: '', duration: '' }
    ]);

    // Tags
    const [tags, setTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState('');

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const response = await api.get('/patients/all');
            const data = response.data.data || response.data || [];
            
            const formattedPatients = data.map((patient: any) => ({
                _id: patient._id,
                userId: patient.userId,
                name: patient.userId?.name || `Patient ${patient._id.slice(-6)}`
            }));
            
            setPatients(formattedPatients);
        } catch (error) {
            console.error('Error fetching patients:', error);
        }
    };

    const addMedication = () => {
        setMedications([
            ...medications,
            { name: '', dosage: '', frequency: '', duration: '' }
        ]);
    };

    const removeMedication = (index: number) => {
        if (medications.length > 1) {
            setMedications(medications.filter((_, i) => i !== index));
        }
    };

    const updateMedication = (index: number, field: keyof Medication, value: string) => {
        const updatedMedications = [...medications];
        updatedMedications[index][field] = value;
        setMedications(updatedMedications);
    };

    const addTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()]);
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const filteredPatients = patients.filter(patient =>
        patient.name?.toLowerCase().includes(patientSearch.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedPatient) {
            alert('Please select a patient');
            return;
        }

        if (!title.trim()) {
            alert('Please enter a title');
            return;
        }

        if (!date) {
            alert('Please select a date');
            return;
        }

        try {
            setLoading(true);
            
            const recordData = {
                patientId: selectedPatient,
                type: recordType,
                title: title.trim(),
                description: description.trim() || undefined,
                diagnosis: diagnosis.trim() || undefined,
                treatment: treatment.trim() || undefined,
                notes: notes.trim() || undefined,
                date: new Date(date).toISOString(),
                vitalSigns: vitalSigns.bloodPressure || vitalSigns.heartRate || vitalSigns.temperature || vitalSigns.weight 
                    ? {
                        bloodPressure: vitalSigns.bloodPressure || undefined,
                        heartRate: vitalSigns.heartRate ? parseInt(vitalSigns.heartRate) : undefined,
                        temperature: vitalSigns.temperature ? parseFloat(vitalSigns.temperature) : undefined,
                        weight: vitalSigns.weight ? parseFloat(vitalSigns.weight) : undefined,
                        respiratoryRate: vitalSigns.respiratoryRate ? parseInt(vitalSigns.respiratoryRate) : undefined,
                        oxygenSaturation: vitalSigns.oxygenSaturation ? parseFloat(vitalSigns.oxygenSaturation) : undefined
                    }
                    : undefined,
                tags: tags.length > 0 ? tags : undefined,
                medications: medications.some(m => m.name.trim()) ? medications.filter(m => m.name.trim()) : undefined
            };

            await api.post('/medical-records/add', recordData);
            
            alert('Medical record created successfully!');
            router.push('/doctor/records');
        } catch (error: any) {
            console.error('Error creating medical record:', error);
            alert(error.response?.data?.message || 'Failed to create medical record');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 cursor-pointer"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back to Records</span>
                    </button>

                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Create Medical Record</h1>
                        <p className="text-gray-500 mt-2">Document patient consultation and treatment</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Patient Selection */}
                    <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                                <User className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Select Patient</h2>
                                <p className="text-sm text-gray-500">Choose the patient for this record</p>
                            </div>
                        </div>

                        <div className="relative mb-4">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search patients..."
                                value={patientSearch}
                                onChange={(e) => setPatientSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                            />
                        </div>

                        <div className="space-y-3 max-h-60 overflow-y-auto">
                            {filteredPatients.map((patient) => (
                                <label
                                    key={patient._id}
                                    className={`flex items-center space-x-4 p-4 border rounded-xl cursor-pointer transition-all duration-200 ${selectedPatient === patient._id
                                        ? 'border-emerald-500 bg-emerald-50'
                                        : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="patient"
                                        value={patient._id}
                                        checked={selectedPatient === patient._id}
                                        onChange={(e) => setSelectedPatient(e.target.value)}
                                        className="w-4 h-4 text-emerald-600"
                                    />
                                    <div className="flex-1">
                                        <span className="font-medium text-gray-900">{patient.name}</span>
                                        <div className="text-sm text-gray-500 mt-1">
                                            ID: {patient._id.slice(-8)}
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Record Type & Basic Info */}
                    <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Stethoscope className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Record Information</h2>
                                <p className="text-sm text-gray-500">Basic information about this record</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Record Type *
                                </label>
                                <select
                                    value={recordType}
                                    onChange={(e) => setRecordType(e.target.value as any)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                                    required
                                >
                                    <option value="consultation">Consultation</option>
                                    <option value="diagnosis">Diagnosis</option>
                                    <option value="lab-report">Lab Report</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date *
                                </label>
                                <div className="flex items-center">
                                    <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g., Annual Checkup, Follow-up Visit, Lab Results"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Brief description of this record..."
                                    className="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Diagnosis & Treatment */}
                    <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                                <AlertCircle className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Diagnosis & Treatment</h2>
                                <p className="text-sm text-gray-500">Medical diagnosis and prescribed treatment</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Diagnosis
                                </label>
                                <textarea
                                    value={diagnosis}
                                    onChange={(e) => setDiagnosis(e.target.value)}
                                    placeholder="Enter medical diagnosis..."
                                    className="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Treatment Plan
                                </label>
                                <textarea
                                    value={treatment}
                                    onChange={(e) => setTreatment(e.target.value)}
                                    placeholder="Describe the treatment plan..."
                                    className="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Vital Signs */}
                    <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                                <Activity className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Vital Signs</h2>
                                <p className="text-sm text-gray-500">Patient vital signs measurements</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Blood Pressure
                                </label>
                                <div className="flex items-center">
                                    <Heart className="w-4 h-4 text-gray-400 mr-3" />
                                    <input
                                        type="text"
                                        value={vitalSigns.bloodPressure}
                                        onChange={(e) => setVitalSigns({...vitalSigns, bloodPressure: e.target.value})}
                                        placeholder="e.g., 120/80"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Heart Rate (BPM)
                                </label>
                                <input
                                    type="number"
                                    value={vitalSigns.heartRate}
                                    onChange={(e) => setVitalSigns({...vitalSigns, heartRate: e.target.value})}
                                    placeholder="e.g., 72"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Temperature (°F)
                                </label>
                                <div className="flex items-center">
                                    <Thermometer className="w-4 h-4 text-gray-400 mr-3" />
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={vitalSigns.temperature}
                                        onChange={(e) => setVitalSigns({...vitalSigns, temperature: e.target.value})}
                                        placeholder="e.g., 98.6"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Weight (kg)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={vitalSigns.weight}
                                    onChange={(e) => setVitalSigns({...vitalSigns, weight: e.target.value})}
                                    placeholder="e.g., 68.5"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Respiratory Rate
                                </label>
                                <input
                                    type="number"
                                    value={vitalSigns.respiratoryRate}
                                    onChange={(e) => setVitalSigns({...vitalSigns, respiratoryRate: e.target.value})}
                                    placeholder="e.g., 16"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    O₂ Saturation (%)
                                </label>
                                <input
                                    type="number"
                                    value={vitalSigns.oxygenSaturation}
                                    onChange={(e) => setVitalSigns({...vitalSigns, oxygenSaturation: e.target.value})}
                                    placeholder="e.g., 98"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Medications */}
                    <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                                    <AlertCircle className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Medications</h2>
                                    <p className="text-sm text-gray-500">Prescribed medications (optional)</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={addMedication}
                                className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="font-medium">Add Medication</span>
                            </button>
                        </div>

                        <div className="space-y-6">
                            {medications.map((medication, index) => (
                                <div key={index} className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-medium text-gray-900">Medication {index + 1}</h3>
                                        {medications.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeMedication(index)}
                                                className="p-1 hover:bg-white rounded-lg transition-colors"
                                            >
                                                <X className="w-4 h-4 text-gray-500" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Medication Name
                                            </label>
                                            <input
                                                type="text"
                                                value={medication.name}
                                                onChange={(e) => updateMedication(index, 'name', e.target.value)}
                                                placeholder="e.g., Amoxicillin"
                                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Dosage
                                            </label>
                                            <input
                                                type="text"
                                                value={medication.dosage}
                                                onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                                                placeholder="e.g., 500mg"
                                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Frequency
                                            </label>
                                            <input
                                                type="text"
                                                value={medication.frequency}
                                                onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                                                placeholder="e.g., 3 times daily"
                                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Duration
                                            </label>
                                            <input
                                                type="text"
                                                value={medication.duration}
                                                onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                                                placeholder="e.g., 7 days"
                                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tags & Notes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                            <div className="mb-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-2">Tags</h2>
                                <p className="text-sm text-gray-500">Add tags for better organization</p>
                            </div>

                            <div className="flex space-x-3 mb-3">
                                <input
                                    type="text"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    placeholder="Add a tag (e.g., follow-up, chronic)"
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                />
                                <button
                                    type="button"
                                    onClick={addTag}
                                    className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer"
                                >
                                    Add
                                </button>
                            </div>

                            {tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-200"
                                        >
                                            <span className="text-sm font-medium">{tag}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeTag(tag)}
                                                className="text-emerald-500 hover:text-emerald-700 cursor-pointer"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                            <div className="mb-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-2">Additional Notes</h2>
                                <p className="text-sm text-gray-500">Any additional observations or notes</p>
                            </div>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Enter any additional notes..."
                                className="w-full h-40 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                        <div className="flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-medium rounded-xl hover:from-emerald-700 hover:to-green-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30 cursor-pointer"
                            >
                                <Save className="w-5 h-5" />
                                <span>{loading ? 'Creating...' : 'Create Medical Record'}</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateMedicalRecordPage;