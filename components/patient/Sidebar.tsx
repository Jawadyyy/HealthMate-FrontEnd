"use client";

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, Calendar, CreditCard, Settings, LogOut, HelpCircle } from 'lucide-react';

interface NavItemProps {
    icon: React.ElementType;
    label: string;
    active?: boolean;
    badge?: number;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, active = false, badge }) => (
    <div
        className={`flex items-center justify-between px-5 py-3.5 rounded-xl transition-all duration-200 cursor-pointer ${active
            ? 'bg-gradient-to-r from-blue-50 to-blue-100/50 text-blue-700 border border-blue-200/50'
            : 'text-gray-600 hover:bg-gray-50/80 hover:text-gray-900'
            }`}
    >
        <div className="flex items-center space-x-3.5">
            <Icon className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-gray-500'}`} />
            <span className="font-medium">{label}</span>
        </div>
        {badge && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[1.5rem] text-center">
                {badge}
            </span>
        )}
    </div>
);

const Sidebar = () => {
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('isLoggedIn');
        router.push('/auth/patient/login');
    };

    const isActive = (path: string) => pathname.startsWith(path);

    return (
        <div className="w-72 bg-white/95 backdrop-blur-sm border-r border-gray-200 flex flex-col fixed left-0 top-0 h-full z-20 shadow-lg shadow-blue-500/5">
            <div className="p-8 pb-6">
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                        </svg>
                    </div>
                    <div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">HealthMate</span>
                        <p className="text-xs text-gray-500 mt-1">Patient Portal</p>
                    </div>
                </div>
            </div>

            <nav className="px-5 space-y-2 flex-1">
                <div onClick={() => router.push('/patient/dashboard')}>
                    <NavItem icon={User} label="My Profile" active={isActive('/patient/dashboard')} />
                </div>
                <div onClick={() => router.push('/patient/appointments')}>
                    <NavItem icon={Calendar} label="Appointments" active={isActive('/patient/appointments')} />
                </div>
                <div onClick={() => router.push('/patient/payments')}>
                    <NavItem icon={CreditCard} label="Payments" active={isActive('/patient/payments')} />
                </div>
                <div onClick={() => router.push('/patient/med-records')}>
                    <NavItem icon={Settings} label="Medical Records" active={isActive('/patient/med-records')} />
                </div>
            </nav>

            <div className="p-5 space-y-2 border-t border-gray-200/50">
                <NavItem icon={HelpCircle} label="Help & Support" />
                <div onClick={handleLogout} className="w-full">
                    <NavItem icon={LogOut} label="Logout" />
                </div>
            </div>

            <div className="p-5 mt-auto">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200/50">
                    <p className="text-sm font-medium text-blue-800">Need assistance?</p>
                    <p className="text-xs text-blue-600/80 mt-1">Our support team is here to help</p>
                    <button className="mt-3 w-full bg-white text-blue-600 text-sm font-medium py-2 rounded-lg border border-blue-200 hover:bg-blue-50 transition-all duration-200 cursor-pointer">
                        Contact Support
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
