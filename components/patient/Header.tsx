"use client";

import React from 'react';
import { Search, Filter, Bell } from 'lucide-react';

interface HeaderProps {
    patientName?: string;
    patientEmail?: string;
}

const Header: React.FC<HeaderProps> = ({ patientName = 'Patient', patientEmail = '' }) => {
    return (
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-8 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                    <div className="relative flex-1 max-w-lg">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search doctors, records, medications..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200"
                        />
                    </div>
                    <button className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 cursor-pointer">
                        <Filter className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Filters</span>
                    </button>
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
    );
};

export default Header;
