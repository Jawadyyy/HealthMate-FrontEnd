"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Pill, User, Search, Plus, X, Calendar, Clock, AlertCircle } from 'lucide-react';
import api from '@/lib/api/api';

interface Medication {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
}

interface Patient {
    _id: string;
    userId: any;
    name?: string;
    age?: number;
}

const CreatePrescriptionPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<string>('');
    const [diagnosis, setDiagnosis] = useState('');
    const [medications, setMedications] = useState<Medication[]>([
        { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
    ]);
    const [notes, setNotes] = useState('');
    const [refills, setRefills] = useState(0);
    const [patientSearch, setPatientSearch] = useState('');

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
                name: patient.userId?.name || `Patient ${patient._id.slice(-6)}`,
                age: patient.age
            }));
            
            setPatients(formattedPatients);
        } catch (error) {
            console.error('Error fetching patients:', error);
        }
    };

    const addMedication = () => {
        setMedications([
            ...medications,
            { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
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

    const filteredPatients = patients.filter(patient =>
        patient.name?.toLowerCase().includes(patientSearch.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedPatient) {
            alert('Please select a patient');
            return;
        }

        if (!diagnosis.trim()) {
            alert('Please enter a diagnosis');
            return;
        }

        const validMedications = medications.filter(med => 
            med.name.trim() && med.dosage.trim() && med.frequency.trim() && med.duration.trim()
        );

        if (validMedications.length === 0) {
            alert('Please add at least one medication');
            return;
        }

        try {
            setLoading(true);
            
            const prescriptionData = {
                patientId: selectedPatient,
                diagnosis,
                medications: validMedications,
                notes: notes.trim() || undefined,
                refills,
                date: new Date().toISOString()
            };

            await api.post('/prescriptions/create', prescriptionData);
            
            alert('Prescription created successfully!');
            router.push('/doctor/prescriptions');
        } catch (error: any) {
            console.error('Error creating prescription:', error);
            alert(error.response?.data?.message || 'Failed to create prescription');
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
                        <span>Back to Prescriptions</span>
                    </button>

                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Create New Prescription</h1>
                        <p className="text-gray-500 mt-2">Prescribe medications for your patient</p>
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
                                <p className="text-sm text-gray-500">Choose the patient for this prescription</p>
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
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-gray-900">{patient.name}</span>
                                            {patient.age && (
                                                <span className="text-sm text-gray-500">{patient.age} years</span>
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-500 mt-1">
                                            ID: {patient._id.slice(-8)}
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Diagnosis */}
                    <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                        <div className="mb-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-2">Diagnosis</h2>
                            <p className="text-sm text-gray-500">Enter the primary diagnosis for this prescription</p>
                        </div>
                        <textarea
                            value={diagnosis}
                            onChange={(e) => setDiagnosis(e.target.value)}
                            placeholder="Enter diagnosis (e.g., Upper Respiratory Infection, Hypertension, etc.)"
                            className="w-full h-32 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200"
                            required
                        />
                    </div>

                    {/* Medications */}
                    <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                                    <Pill className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Medications</h2>
                                    <p className="text-sm text-gray-500">Prescribe medications for the patient</p>
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
                                                Medication Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={medication.name}
                                                onChange={(e) => updateMedication(index, 'name', e.target.value)}
                                                placeholder="e.g., Amoxicillin"
                                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Dosage *
                                            </label>
                                            <input
                                                type="text"
                                                value={medication.dosage}
                                                onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                                                placeholder="e.g., 500mg"
                                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Frequency *
                                            </label>
                                            <select
                                                value={medication.frequency}
                                                onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                                                required
                                            >
                                                <option value="">Select frequency</option>
                                                <option value="Once daily">Once daily</option>
                                                <option value="Twice daily">Twice daily</option>
                                                <option value="Three times daily">Three times daily</option>
                                                <option value="Four times daily">Four times daily</option>
                                                <option value="As needed">As needed</option>
                                                <option value="Every 4 hours">Every 4 hours</option>
                                                <option value="Every 6 hours">Every 6 hours</option>
                                                <option value="Every 8 hours">Every 8 hours</option>
                                                <option value="Every 12 hours">Every 12 hours</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Duration *
                                            </label>
                                            <input
                                                type="text"
                                                value={medication.duration}
                                                onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                                                placeholder="e.g., 7 days, 30 days"
                                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                                                required
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Instructions (Optional)
                                            </label>
                                            <textarea
                                                value={medication.instructions}
                                                onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                                                placeholder="e.g., Take with food, Avoid alcohol, etc."
                                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                                                rows={2}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                            <div className="mb-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-2">Additional Notes</h2>
                                <p className="text-sm text-gray-500">Any special instructions or notes</p>
                            </div>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Enter any additional notes or instructions..."
                                className="w-full h-40 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200"
                            />
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                            <div className="mb-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-2">Prescription Details</h2>
                                <p className="text-sm text-gray-500">Set prescription validity and refills</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Number of Refills
                                    </label>
                                    <input
                                        type="number"
                                        value={refills}
                                        onChange={(e) => setRefills(parseInt(e.target.value) || 0)}
                                        min="0"
                                        max="10"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                                    />
                                </div>

                                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                                    <div className="flex items-start space-x-3">
                                        <AlertCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-emerald-800 font-medium mb-1">Important Information</p>
                                            <ul className="text-xs text-emerald-700 space-y-1">
                                                <li>• This prescription will be valid for 6 months</li>
                                                <li>• Patient can refill up to the specified number of times</li>
                                                <li>• Prescription will be sent to the patient's email</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
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
                                <span>{loading ? 'Creating...' : 'Create Prescription'}</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePrescriptionPage;