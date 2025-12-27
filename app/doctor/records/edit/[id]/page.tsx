"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Stethoscope, User, Activity, Heart, Thermometer, AlertCircle, Pill, X } from 'lucide-react';
import api from '@/lib/api/api';

interface VitalSigns {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    weight?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
}

interface Medication {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
}

interface MedicalRecord {
    _id: string;
    patientId: any;
    type: 'consultation' | 'diagnosis' | 'lab-report' | 'other';
    title: string;
    description?: string;
    diagnosis?: string;
    treatment?: string;
    vitalSigns?: VitalSigns;
    medications?: Medication[];
    notes?: string;
    date: string;
    tags: string[];
}

const EditMedicalRecordPage = () => {
    const params = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [record, setRecord] = useState<MedicalRecord | null>(null);
    const [patientDetails, setPatientDetails] = useState<any>(null);
    
    // Form states
    const [recordType, setRecordType] = useState<'consultation' | 'diagnosis' | 'lab-report' | 'other'>('consultation');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [treatment, setTreatment] = useState('');
    const [notes, setNotes] = useState('');
    const [date, setDate] = useState('');
    
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
    const [medications, setMedications] = useState<Medication[]>([]);

    // Tags
    const [tags, setTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState('');

    useEffect(() => {
        fetchRecord();
    }, [params.id]);

    const fetchRecord = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/medical-records/${params.id}`);
            const data = response.data;
            setRecord(data);
            
            // Set form values
            setRecordType(data.type);
            setTitle(data.title);
            setDescription(data.description || '');
            setDiagnosis(data.diagnosis || '');
            setTreatment(data.treatment || '');
            setNotes(data.notes || '');
            setDate(data.date.split('T')[0]);
            setTags(data.tags || []);
            
            // Set vital signs
            if (data.vitalSigns) {
                setVitalSigns({
                    bloodPressure: data.vitalSigns.bloodPressure || '',
                    heartRate: data.vitalSigns.heartRate?.toString() || '',
                    temperature: data.vitalSigns.temperature?.toString() || '',
                    weight: data.vitalSigns.weight?.toString() || '',
                    respiratoryRate: data.vitalSigns.respiratoryRate?.toString() || '',
                    oxygenSaturation: data.vitalSigns.oxygenSaturation?.toString() || ''
                });
            }
            
            // Set medications
            setMedications(data.medications || []);
            
            // Fetch patient details
            if (data.patientId) {
                try {
                    const patientResponse = await api.get(`/patients/${data.patientId._id || data.patientId}`);
                    setPatientDetails(patientResponse.data);
                } catch (error) {
                    console.error('Error fetching patient details:', error);
                }
            }
        } catch (error) {
            console.error('Error fetching medical record:', error);
            alert('Failed to load medical record');
            router.push('/doctor/records');
        } finally {
            setLoading(false);
        }
    };

    const addMedication = () => {
        setMedications([
            ...medications,
            { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
        ]);
    };

    const removeMedication = (index: number) => {
        setMedications(medications.filter((_, i) => i !== index));
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!title.trim()) {
            alert('Please enter a title');
            return;
        }

        if (!date) {
            alert('Please select a date');
            return;
        }

        try {
            setSaving(true);
            
            const recordData = {
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

            await api.patch(`/medical-records/update/${params.id}`, recordData);
            
            alert('Medical record updated successfully!');
            router.push(`/doctor/records/${params.id}`);
        } catch (error: any) {
            console.error('Error updating medical record:', error);
            alert(error.response?.data?.message || 'Failed to update medical record');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-emerald-100 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-emerald-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="mt-6 text-gray-600 font-medium">Loading medical record...</p>
                </div>
            </div>
        );
    }

    if (!record || !patientDetails) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
                <div className="text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-10 h-10 text-red-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Record Not Found</h3>
                    <p className="text-gray-600 mb-8">The medical record you're looking for doesn't exist.</p>
                    <button
                        onClick={() => router.push('/doctor/records')}
                        className="inline-flex items-center space-x-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Records</span>
                    </button>
                </div>
            </div>
        );
    }

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
                        <span>Back to Record</span>
                    </button>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Edit Medical Record</h1>
                            <p className="text-gray-500 mt-2">Update patient medical record</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl">
                                <User className="w-4 h-4" />
                                <span className="font-medium">{patientDetails.userId?.name || 'Patient'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Information */}
                    <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                                <Stethoscope className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Basic Information</h2>
                                <p className="text-sm text-gray-500">Record type and basic details</p>
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
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
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
                                    <Pill className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Medications</h2>
                                    <p className="text-sm text-gray-500">Prescribed medications</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={addMedication}
                                className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer"
                            >
                                <span className="font-medium">Add Medication</span>
                            </button>
                        </div>

                        <div className="space-y-6">
                            {medications.map((medication, index) => (
                                <div key={index} className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-medium text-gray-900">Medication {index + 1}</h3>
                                        <button
                                            type="button"
                                            onClick={() => removeMedication(index)}
                                            className="p-1 hover:bg-white rounded-lg transition-colors"
                                        >
                                            <X className="w-4 h-4 text-gray-500" />
                                        </button>
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

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Instructions (Optional)
                                            </label>
                                            <textarea
                                                value={medication.instructions || ''}
                                                onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                                                placeholder="Special instructions..."
                                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                                                rows={2}
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
                                disabled={saving}
                                className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-medium rounded-xl hover:from-emerald-700 hover:to-green-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30 cursor-pointer"
                            >
                                <Save className="w-5 h-5" />
                                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditMedicalRecordPage;