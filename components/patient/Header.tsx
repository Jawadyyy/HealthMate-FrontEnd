"use client";

import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';

interface HeaderProps {
    patientName?: string;
    patientEmail?: string;
}

const Header: React.FC<HeaderProps> = ({ patientName = 'Patient', patientEmail = '' }) => {
    const [currentDate, setCurrentDate] = useState('');
    const [currentTime, setCurrentTime] = useState('');

    useEffect(() => {
        const updateDateTime = () => {
            const now = new Date();
            setCurrentDate(now.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }));
            setCurrentTime(now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }));
        };

        updateDateTime();
        const interval = setInterval(updateDateTime, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <div className="fixed top-0 left-72 right-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-8 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="text-left">
                            <p className="text-sm font-medium text-gray-800">{currentDate}</p>
                            <p className="text-xs text-gray-500">{currentTime}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-5">
                        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer">
                            <Bell className="w-5 h-5 text-gray-600" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        <div className="flex items-center space-x-3">
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-800">{patientName}</p>
                                <p className="text-xs text-gray-500">{patientEmail}</p>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                                {patientName.charAt(0)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Spacer to push content below fixed header */}
            <div className="h-20"></div>
        </>
    );
};

export default Header;