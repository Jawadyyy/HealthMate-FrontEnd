"use client";

import React from 'react';
import { 
  BarChart3, Stethoscope, UserPlus, Calendar, CreditCard,
  HelpCircle, LogOut, Shield
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import NavItem from './NavItem';

interface SidebarProps {
  pendingApprovals?: number;
  activeRoute?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  pendingApprovals = 0,
  activeRoute
}) => {
  const router = useRouter();
  const pathname = usePathname();
  
  // Determine active route based on current pathname if not provided
  const currentRoute = activeRoute || pathname;
  
  // Helper function to check if a route is active
  const isRouteActive = (route: string) => {
    return currentRoute.startsWith(route);
  };
  
  const handleLogout = () => {
    ['token', 'role', 'isLoggedIn'].forEach(key => localStorage.removeItem(key));
    router.push('/auth/admin/login');
  };

  return (
    <div className="w-72 bg-white/95 backdrop-blur-sm border-r border-gray-200 flex flex-col fixed left-0 top-0 h-full z-20 shadow-lg shadow-purple-500/5">
      <div className="p-8 pb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">HealthMate</span>
            <p className="text-xs text-gray-500 mt-1">Admin Portal</p>
          </div>
        </div>
      </div>

      <nav className="px-5 space-y-2 flex-1">
        <NavItem 
          icon={BarChart3} 
          label="Dashboard" 
          route="/admin/dashboard" 
          active={isRouteActive('/admin/dashboard')} 
        />
        <NavItem 
          icon={Stethoscope} 
          label="Doctors" 
          badge={pendingApprovals} 
          route="/admin/doctors" 
          active={isRouteActive('/admin/doctors')} 
        />
        <NavItem 
          icon={UserPlus} 
          label="Patients" 
          route="/admin/patients" 
          active={isRouteActive('/admin/patients')} 
        />
        <NavItem 
          icon={Calendar} 
          label="Appointments" 
          route="/admin/appointments" 
          active={isRouteActive('/admin/appointments')} 
        />
        <NavItem 
          icon={CreditCard} 
          label="Billing" 
          route="/admin/billing" 
          active={isRouteActive('/admin/billing')} 
        />
      </nav>

      <div className="p-5 space-y-2 border-t border-gray-200/50">
        <NavItem icon={HelpCircle} label="Help & Support" route="/admin/help" />
        <div onClick={handleLogout} className="w-full">
          <NavItem icon={LogOut} label="Logout" />
        </div>
      </div>

      <div className="p-5 mt-auto">
        <div className="bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-xl p-4 border border-purple-200/50">
          <p className="text-sm font-medium text-purple-800">System Status</p>
          <div className="flex items-center space-x-2 mt-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <p className="text-xs text-purple-600/80">All systems operational</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;