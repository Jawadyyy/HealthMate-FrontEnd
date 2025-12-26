"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  badge?: number;
  route?: string;
  active?: boolean;
}

export const NavItem: React.FC<NavItemProps> = ({ 
  icon: Icon, 
  label, 
  badge, 
  route,
  active = false
}) => {
  const router = useRouter();
  
  const handleClick = () => {
    if (route) {
      router.push(route);
    }
  };

  if (active) {
    return (
      <div className="flex items-center justify-between px-5 py-3.5 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100/50 text-purple-700 border border-purple-200/50 cursor-pointer">
        <div className="flex items-center space-x-3.5">
          <Icon className="w-5 h-5 text-purple-600" />
          <span className="font-medium">{label}</span>
        </div>
        {badge && (
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[1.5rem] text-center">
            {badge}
          </span>
        )}
      </div>
    );
  }

  return (
    <div 
      onClick={handleClick}
      className="flex items-center justify-between px-5 py-3.5 rounded-xl transition-all duration-200 cursor-pointer text-gray-600 hover:bg-gray-50/80 hover:text-gray-900"
    >
      <div className="flex items-center space-x-3.5">
        <Icon className="w-5 h-5 text-gray-500" />
        <span className="font-medium">{label}</span>
      </div>
      {badge && (
        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[1.5rem] text-center">
          {badge}
        </span>
      )}
    </div>
  );
};

export default NavItem;