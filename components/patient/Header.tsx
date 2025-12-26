"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCheck, Trash2 } from 'lucide-react';

interface HeaderProps {
    patientName?: string;
    patientEmail?: string;
    userId?: string;
    apiBaseUrl?: string;
}

interface Notification {
    _id: string;
    userId: string;
    title: string;
    description: string;
    type: 'appointment' | 'reminder' | 'message' | 'alert';
    isRead: boolean;
    createdAt: string;
}

const Header: React.FC<HeaderProps> = ({
    patientName = 'Patient',
    patientEmail = '',
    userId = '',
    apiBaseUrl = '/api'
}) => {
    const [currentDate, setCurrentDate] = useState('');
    const [currentTime, setCurrentTime] = useState('');
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

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

    // Fetch notifications
    useEffect(() => {
        if (userId) {
            fetchNotifications();
            // Poll for new notifications every 30 seconds
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [userId]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await fetch(`${apiBaseUrl}/notifications`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                const data = await response.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            const response = await fetch(`${apiBaseUrl}/notifications/read/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                setNotifications(prev =>
                    prev.map(notif =>
                        notif._id === id ? { ...notif, isRead: true } : notif
                    )
                );
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${apiBaseUrl}/notifications/read-all`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                setNotifications(prev =>
                    prev.map(notif => ({ ...notif, isRead: true }))
                );
            }
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteNotification = async (id: string) => {
        try {
            const response = await fetch(`${apiBaseUrl}/notifications/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                setNotifications(prev => prev.filter(notif => notif._id !== id));
            }
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const clearAllNotifications = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${apiBaseUrl}/notifications/clear/all`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                setNotifications([]);
            }
        } catch (error) {
            console.error('Failed to clear all notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const getNotificationIcon = (type: string) => {
        const colors = {
            appointment: 'bg-blue-500',
            reminder: 'bg-yellow-500',
            message: 'bg-green-500',
            alert: 'bg-red-500'
        };
        return colors[type as keyof typeof colors] || 'bg-gray-500';
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

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
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer"
                            >
                                <Bell className="w-5 h-5 text-gray-600" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
                                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 flex items-center justify-between">
                                        <h3 className="text-white font-semibold">Notifications</h3>
                                        <div className="flex items-center space-x-2">
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={markAllAsRead}
                                                    disabled={loading}
                                                    className="text-white/90 hover:text-white text-xs flex items-center space-x-1 disabled:opacity-50"
                                                >
                                                    <CheckCheck className="w-4 h-4" />
                                                    <span>Mark all read</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="max-h-96 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-8 text-center text-gray-500">
                                                <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                                <p>No notifications</p>
                                            </div>
                                        ) : (
                                            <>
                                                {notifications.map((notification) => (
                                                    <div
                                                        key={notification._id}
                                                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${!notification.isRead ? 'bg-blue-50/50' : ''
                                                            }`}
                                                    >
                                                        <div className="flex items-start space-x-3">
                                                            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${getNotificationIcon(notification.type)}`}></div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-start justify-between">
                                                                    <h4 className={`text-sm font-medium text-gray-900 ${!notification.isRead ? 'font-semibold' : ''}`}>
                                                                        {notification.title}
                                                                    </h4>
                                                                    <button
                                                                        onClick={() => deleteNotification(notification._id)}
                                                                        className="text-gray-400 hover:text-red-500 ml-2 flex-shrink-0"
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                                <p className="text-xs text-gray-600 mt-1">{notification.description}</p>
                                                                <div className="flex items-center justify-between mt-2">
                                                                    <span className="text-xs text-gray-400">{formatTime(notification.createdAt)}</span>
                                                                    {!notification.isRead && (
                                                                        <button
                                                                            onClick={() => markAsRead(notification._id)}
                                                                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                                                        >
                                                                            Mark as read
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </>
                                        )}
                                    </div>

                                    {notifications.length > 0 && (
                                        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                                            <button
                                                onClick={clearAllNotifications}
                                                disabled={loading}
                                                className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center space-x-1 disabled:opacity-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                <span>Clear all</span>
                                            </button>
                                            <span className="text-xs text-gray-500">
                                                {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center space-x-3">
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-800">{patientName}</p>
                                <p className="text-xs text-gray-500">{patientEmail}</p>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                                {patientName.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="h-20"></div>
        </>
    );
};

export default Header;