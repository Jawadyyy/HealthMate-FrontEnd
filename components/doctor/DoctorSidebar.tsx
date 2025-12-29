"use client";

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, Calendar, Users, FileText, Settings, LogOut, HelpCircle, Stethoscope, Activity, DollarSign } from 'lucide-react';

interface NavItemProps {
    icon: React.ElementType;
    label: string;
    active?: boolean;
    badge?: number;
    onClick?: () => void;
}

const handleLogout = async () => {
    try {
        // Call logout API
        await fetch('/auth/log-out', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Ensure cookies are sent
        });
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        // Force a full page reload to login page
        if (typeof window !== 'undefined') {
            // Clear any cached data
            window.location.replace('/auth/doctor/login');
        }
    }
};

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
                    <NavItem icon={Activity} label="Medi
                    cal Records" active={isActive('/doctor/records')} />
                </div>
                <div onClick={() => router.push('/doctor/earnings')}>
                    <NavItem icon={DollarSign} label="Earnings" active={isActive('/doctor/earnings')} />
                </div>

                <div className="p-5 space-y-2 border-t border-gray-200/50">
                    <NavItem
                        icon={LogOut}
                        label="Logout"
                        onClick={handleLogout}
                    />
                </div>


            </nav>




        </div>
    );
};

export default DoctorSidebar;