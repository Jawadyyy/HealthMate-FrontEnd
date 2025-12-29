"use client";

import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, AlertCircle, Calendar, User, X, Eye, EyeOff } from 'lucide-react';
import api from '@/lib/api/api';

interface Notification {
    _id: string;
    title: string;
    message: string;
    type: 'appointment' | 'prescription' | 'patient' | 'system';
    read: boolean;
    createdAt: string;
    metadata?: {
        appointmentId?: string;
        prescriptionId?: string;
        patientId?: string;
    };
}

const DoctorNotificationsPage = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await api.get('/notifications');
            setNotifications(response.data.data || response.data || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId: string) => {
        try {
            await api.patch(`/notifications/read/${notificationId}`);
            setNotifications(prev => prev.map(n =>
                n._id === notificationId ? { ...n, read: true } : n
            ));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.patch('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            alert('All notifications marked as read');
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const deleteNotification = async (notificationId: string) => {
        if (confirm('Are you sure you want to delete this notification?')) {
            try {
                await api.delete(`/notifications/${notificationId}`);
                setNotifications(prev => prev.filter(n => n._id !== notificationId));
            } catch (error) {
                console.error('Error deleting notification:', error);
            }
        }
    };

    const clearAllNotifications = async () => {
        if (confirm('Are you sure you want to clear all notifications?')) {
            try {
                await api.delete('/notifications/clear/all');
                setNotifications([]);
                alert('All notifications cleared');
            } catch (error) {
                console.error('Error clearing all notifications:', error);
            }
        }
    };

    const filteredNotifications = notifications.filter(notification => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !notification.read;
        if (filter === 'read') return notification.read;
        return true;
    });

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'appointment': return <Calendar className="w-5 h-5" />;
            case 'prescription': return <AlertCircle className="w-5 h-5" />;
            case 'patient': return <User className="w-5 h-5" />;
            default: return <Bell className="w-5 h-5" />;
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'appointment': return 'bg-blue-100 text-blue-600';
            case 'prescription': return 'bg-red-100 text-red-600';
            case 'patient': return 'bg-emerald-100 text-emerald-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-emerald-100 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-emerald-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="mt-6 text-gray-600 font-medium">Loading notifications...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                            <p className="text-gray-500 mt-2">
                                {notifications.filter(n => !n.read).length} unread notifications
                            </p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={markAllAsRead}
                                className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer"
                                disabled={notifications.filter(n => !n.read).length === 0}
                            >
                                <CheckCircle className="w-4 h-4" />
                                <span className="font-medium">Mark All Read</span>
                            </button>
                            <button
                                onClick={clearAllNotifications}
                                className="flex items-center space-x-2 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors cursor-pointer"
                                disabled={notifications.length === 0}
                            >
                                <X className="w-4 h-4" />
                                <span className="font-medium">Clear All</span>
                            </button>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex space-x-2 mb-8">
                        {(['all', 'unread', 'read'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setFilter(tab)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === tab
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                {tab !== 'all' && ` (${notifications.filter(n => tab === 'unread' ? !n.read : n.read).length})`}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Notifications List */}
                <div className="space-y-4">
                    {filteredNotifications.length > 0 ? (
                        filteredNotifications.map((notification) => (
                            <div
                                key={notification._id}
                                className={`bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border ${notification.read
                                    ? 'border-gray-200/50'
                                    : 'border-emerald-300 bg-emerald-50/30'
                                } p-6`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="font-bold text-gray-900">{notification.title}</h3>
                                                <span className="text-sm text-gray-500">
                                                    {formatTime(notification.createdAt)}
                                                </span>
                                            </div>
                                            <p className="text-gray-600">{notification.message}</p>
                                            {!notification.read && (
                                                <span className="inline-block mt-2 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                                                    New
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-6">
                                    <div className="flex items-center space-x-3">
                                        {!notification.read ? (
                                            <button
                                                onClick={() => markAsRead(notification._id)}
                                                className="flex items-center space-x-2 text-sm text-emerald-600 hover:text-emerald-700 cursor-pointer"
                                            >
                                                <Eye className="w-4 h-4" />
                                                <span>Mark as read</span>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => markAsRead(notification._id)}
                                                className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
                                            >
                                                <EyeOff className="w-4 h-4" />
                                                <span>Mark as unread</span>
                                            </button>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => deleteNotification(notification._id)}
                                        className="text-gray-400 hover:text-red-600 cursor-pointer"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-16 bg-white rounded-2xl">
                            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No notifications</h3>
                            <p className="text-gray-500">
                                {filter === 'all' 
                                    ? 'You have no notifications'
                                    : `No ${filter} notifications`
                                }
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DoctorNotificationsPage;