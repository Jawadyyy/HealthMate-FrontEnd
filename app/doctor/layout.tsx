"use client";

import React, { useState, useEffect } from 'react';
import DoctorSidebar from '../../components/doctor/DoctorSidebar';
import DoctorHeader from '../../components/doctor/DoctorHeader';
import api from '@/lib/api/api';

interface DoctorData {
    name: string;
    email: string;
}

export default function DoctorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [doctorData, setDoctorData] = useState<DoctorData | null>(null);

    useEffect(() => {
        const fetchDoctorData = async () => {
            try {
                const userResponse = await api.get('/auth/me');
                const userData = userResponse.data.data || userResponse.data;
                setDoctorData(userData);
            } catch (error) {
                console.error('Error fetching doctor data for layout:', error);
            }
        };

        fetchDoctorData();
    }, []);

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-green-50 via-white to-gray-50">
            <DoctorSidebar />
            <div className="flex-1 overflow-auto ml-72">
                <DoctorHeader
                    doctorName={doctorData?.name}
                    doctorEmail={doctorData?.email}
                />
                {children}
            </div>
        </div>
    );
}