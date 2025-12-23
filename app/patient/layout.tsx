"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/patient/Sidebar';
import Header from '@/components/patient/Header';
import api from '@/lib/api/api';

interface PatientData {
    name: string;
    email: string;
}

export default function PatientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [patientData, setPatientData] = useState<PatientData | null>(null);

    useEffect(() => {
        const fetchPatientData = async () => {
            try {
                const userResponse = await api.get('/auth/me');
                const userData = userResponse.data.data || userResponse.data;
                setPatientData(userData);
            } catch (error) {
                console.error('Error fetching patient data for layout:', error);
            }
        };

        fetchPatientData();
    }, []);

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
            <Sidebar />
            <div className="flex-1 overflow-auto ml-72">
                <Header
                    patientName={patientData?.name}
                    patientEmail={patientData?.email}
                />
                {children}
            </div>
        </div>
    );
}
