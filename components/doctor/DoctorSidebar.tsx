"use client";

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, Calendar, Users, FileText, Settings, LogOut, HelpCircle, Stethoscope, Activity, DollarSign } from 'lucide-react';

interface NavItemProps {
    icon: React.ElementType;
    label: string;
    active?: boolean;
    badge?: number;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, active = false, badge }) => (
    <div
        className={`flex items-center justify-between px-5 py-3.5 rounded-xl transition-all duration-200 cursor-pointer ${active
            ? 'bg-gradient-to-r from-green-50 to-green-100/50 text-green-700 border border-green-200/50'
            : 'text-gray-600 hover:bg-gray-50/80 hover:text-gray-900'
            }`}
    >
        <div className="flex items-center space-x-3.5">
            <Icon className={`w-5 h-5 ${active ? 'text-green-600' : 'text-gray-500'}`} />
            <span className="font-medium">{label}</span>
        </div>
        {badge && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[1.5rem] text-center">
                {badge}
            </span>
        )}
    </div>
);

const DoctorSidebar = () => {
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('isLoggedIn');
        router.push('/auth/doctor/login');
    };

    const isActive = (path: string) => pathname.startsWith(path);

    return (
        <div className="w-72 bg-white/95 backdrop-blur-sm border-r border-gray-200 flex flex-col fixed left-0 top-0 h-full z-20 shadow-lg shadow-green-500/5">
            <div className="p-8 pb-6">
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
                        <Stethoscope className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">HealthMate</span>
                        <p className="text-xs text-gray-500 mt-1">Doctor Portal</p>
                    </div>
                </div>
            </div>

            <nav className="px-5 space-y-2 flex-1">
                <div onClick={() => router.push('/doctor/dashboard')}>
                    <NavItem icon={User} label="Dashboard" active={isActive('/doctor/dashboard')} />
                </div>
                <div onClick={() => router.push('/doctor/appointments')}>
                    <NavItem icon={Calendar} label="Appointments" active={isActive('/doctor/appointments')} badge={8} />
                </div>
                <div onClick={() => router.push('/doctor/patients')}>
                    <NavItem icon={Users} label="Patients" active={isActive('/doctor/patients')} />
                </div>
                <div onClick={() => router.push('/doctor/prescriptions')}>
                    <NavItem icon={FileText} label="Prescriptions" active={isActive('/doctor/prescriptions')} badge={3} />
                </div>
                <div onClick={() => router.push('/doctor/records')}>
                    <NavItem icon={Activity} label="Medical Records" active={isActive('/doctor/records')} />
                </div>
                <div onClick={() => router.push('/doctor/earnings')}>
                    <NavItem icon={DollarSign} label="Earnings" active={isActive('/doctor/earnings')} />
                </div>
                
            </nav>

            <div className="p-5 space-y-2 border-t border-gray-200/50">
                <NavItem icon={HelpCircle} label="Help & Support" />
                <div onClick={handleLogout} className="w-full">
                    <NavItem icon={LogOut} label="Logout" />
                </div>
            </div>

            <div className="p-5 mt-auto">
                <div className="bg-gradient-to-r from-green-50 to-green-100/50 rounded-xl p-4 border border-green-200/50">
                    <p className="text-sm font-medium text-green-800">Need assistance?</p>
                    <p className="text-xs text-green-600/80 mt-1">Our support team is here to help</p>
                    <button className="mt-3 w-full bg-white text-green-600 text-sm font-medium py-2 rounded-lg border border-green-200 hover:bg-green-50 transition-all duration-200 cursor-pointer">
                        Contact Support
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DoctorSidebar;