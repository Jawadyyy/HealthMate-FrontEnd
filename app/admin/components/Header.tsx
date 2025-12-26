"use client";

import React, { useState } from 'react';
import { Search, Bell, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AdminData {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  adminData: AdminData | null;
  showTimeRange?: boolean;
  timeRange?: 'week' | 'month' | 'year';
  setTimeRange?: (range: 'week' | 'month' | 'year') => void;
  searchPlaceholder?: string;
}

const BellButton: React.FC = () => {
  const router = useRouter();
  
  const handleNotificationClick = () => {
    router.push('/admin/notifications');
  };

  return (
    <button 
      onClick={handleNotificationClick}
      className="relative p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer"
    >
      <Bell className="w-5 h-5 text-gray-600" />
      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
    </button>
  );
};

const TimeRangeSelector: React.FC<{
  selectedTimeRange: 'week' | 'month' | 'year';
  setSelectedTimeRange: (range: 'week' | 'month' | 'year') => void;
}> = ({ selectedTimeRange, setSelectedTimeRange }) => (
  <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-xl p-1">
    {(['week', 'month', 'year'] as const).map((range) => (
      <button
        key={range}
        onClick={() => setSelectedTimeRange(range)}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
          selectedTimeRange === range
            ? 'bg-purple-600 text-white'
            : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        {range.charAt(0).toUpperCase() + range.slice(1)}
      </button>
    ))}
  </div>
);

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  adminData,
  showTimeRange = false,
  timeRange = 'month',
  setTimeRange,
  searchPlaceholder = "Search analytics, reports..."
}) => {
  const router = useRouter();
  
  const handleProfileClick = () => {
    router.push('/admin/profile');
  };

  return (
    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200"
            />
          </div>
          {showTimeRange && setTimeRange && (
            <TimeRangeSelector 
              selectedTimeRange={timeRange}
              setSelectedTimeRange={setTimeRange}
            />
          )}
        </div>
        <div className="flex items-center space-x-5">
          <BellButton />
          <div 
            onClick={handleProfileClick}
            className="flex items-center space-x-3 cursor-pointer"
          >
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">{adminData?.name || 'Admin'}</p>
              <p className="text-xs text-gray-500">System Administrator</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
              {adminData?.name?.charAt(0) || 'A'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;