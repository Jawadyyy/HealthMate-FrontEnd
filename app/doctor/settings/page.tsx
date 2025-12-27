"use client";

import React, { useState } from 'react';
import { Settings, Bell, Shield, Lock, Globe, Moon, Palette, CreditCard, User, Mail, Phone, Save } from 'lucide-react';

const DoctorSettingsPage = () => {
    const [settings, setSettings] = useState({
        // Profile Settings
        profileVisibility: 'public',
        showEmail: true,
        showPhone: false,
        
        // Notification Settings
        emailNotifications: true,
        appointmentReminders: true,
        prescriptionUpdates: true,
        newsletter: false,
        
        // Security Settings
        twoFactorAuth: false,
        loginAlerts: true,
        
        // Display Settings
        theme: 'light',
        language: 'english',
        timezone: 'UTC',
        
        // Billing Settings
        autoPay: false,
        invoiceEmail: true,
        
        // Privacy Settings
        dataCollection: true,
        analytics: true
    });

    const [loading, setLoading] = useState(false);

    const handleSettingChange = (category: string, setting: string, value: any) => {
        setSettings(prev => ({
            ...prev,
            [setting]: value
        }));
    };

    const handleSaveSettings = async () => {
        setLoading(true);
        try {
            // Save settings to API
            // await api.patch('/doctors/settings', settings);
            setTimeout(() => {
                alert('Settings saved successfully!');
                setLoading(false);
            }, 1000);
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Failed to save settings');
            setLoading(false);
        }
    };

    const settingSections = [
        {
            id: 'profile',
            title: 'Profile Settings',
            icon: User,
            description: 'Control your profile visibility and information',
            settings: [
                {
                    id: 'profileVisibility',
                    label: 'Profile Visibility',
                    type: 'select',
                    options: [
                        { value: 'public', label: 'Public' },
                        { value: 'patients-only', label: 'Patients Only' },
                        { value: 'private', label: 'Private' }
                    ],
                    value: settings.profileVisibility
                },
                {
                    id: 'showEmail',
                    label: 'Show Email to Patients',
                    type: 'toggle',
                    value: settings.showEmail
                },
                {
                    id: 'showPhone',
                    label: 'Show Phone Number to Patients',
                    type: 'toggle',
                    value: settings.showPhone
                }
            ]
        },
        {
            id: 'notifications',
            title: 'Notifications',
            icon: Bell,
            description: 'Manage your notification preferences',
            settings: [
                {
                    id: 'emailNotifications',
                    label: 'Email Notifications',
                    type: 'toggle',
                    value: settings.emailNotifications
                },
                {
                    id: 'appointmentReminders',
                    label: 'Appointment Reminders',
                    type: 'toggle',
                    value: settings.appointmentReminders
                },
                {
                    id: 'prescriptionUpdates',
                    label: 'Prescription Updates',
                    type: 'toggle',
                    value: settings.prescriptionUpdates
                },
                {
                    id: 'newsletter',
                    label: 'Newsletter & Updates',
                    type: 'toggle',
                    value: settings.newsletter
                }
            ]
        },
        {
            id: 'security',
            title: 'Security',
            icon: Shield,
            description: 'Manage your account security settings',
            settings: [
                {
                    id: 'twoFactorAuth',
                    label: 'Two-Factor Authentication',
                    type: 'toggle',
                    value: settings.twoFactorAuth
                },
                {
                    id: 'loginAlerts',
                    label: 'Login Alerts',
                    type: 'toggle',
                    value: settings.loginAlerts
                }
            ]
        },
        {
            id: 'display',
            title: 'Display',
            icon: Palette,
            description: 'Customize your display preferences',
            settings: [
                {
                    id: 'theme',
                    label: 'Theme',
                    type: 'select',
                    options: [
                        { value: 'light', label: 'Light' },
                        { value: 'dark', label: 'Dark' },
                        { value: 'auto', label: 'Auto' }
                    ],
                    value: settings.theme
                },
                {
                    id: 'language',
                    label: 'Language',
                    type: 'select',
                    options: [
                        { value: 'english', label: 'English' },
                        { value: 'spanish', label: 'Spanish' },
                        { value: 'french', label: 'French' }
                    ],
                    value: settings.language
                },
                {
                    id: 'timezone',
                    label: 'Timezone',
                    type: 'select',
                    options: [
                        { value: 'UTC', label: 'UTC' },
                        { value: 'EST', label: 'Eastern Time' },
                        { value: 'PST', label: 'Pacific Time' }
                    ],
                    value: settings.timezone
                }
            ]
        },
        {
            id: 'billing',
            title: 'Billing',
            icon: CreditCard,
            description: 'Manage your billing preferences',
            settings: [
                {
                    id: 'autoPay',
                    label: 'Auto-pay Invoices',
                    type: 'toggle',
                    value: settings.autoPay
                },
                {
                    id: 'invoiceEmail',
                    label: 'Email Invoice Receipts',
                    type: 'toggle',
                    value: settings.invoiceEmail
                }
            ]
        },
        {
            id: 'privacy',
            title: 'Privacy',
            icon: Lock,
            description: 'Control your data and privacy settings',
            settings: [
                {
                    id: 'dataCollection',
                    label: 'Allow Data Collection',
                    type: 'toggle',
                    value: settings.dataCollection
                },
                {
                    id: 'analytics',
                    label: 'Share Analytics',
                    type: 'toggle',
                    value: settings.analytics
                }
            ]
        }
    ];

    return (
        <div className="p-8 min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                            <p className="text-gray-500 mt-2">Manage your account preferences and settings</p>
                        </div>
                        <button
                            onClick={handleSaveSettings}
                            disabled={loading}
                            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-800 transition-all duration-200 shadow-lg shadow-emerald-500/30 cursor-pointer disabled:opacity-50"
                        >
                            <Save className="w-5 h-5" />
                            <span className="font-medium">{loading ? 'Saving...' : 'Save Changes'}</span>
                        </button>
                    </div>
                </div>

                <div className="space-y-8">
                    {settingSections.map((section) => {
                        const Icon = section.icon;
                        return (
                            <div key={section.id} className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                                        <Icon className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">{section.title}</h2>
                                        <p className="text-sm text-gray-500">{section.description}</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {section.settings.map((setting) => (
                                        <div key={setting.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                                            <div>
                                                <p className="font-medium text-gray-900">{setting.label}</p>
                                                {setting.type === 'toggle' && (
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {setting.value ? 'Enabled' : 'Disabled'}
                                                    </p>
                                                )}
                                            </div>
                                            
                                            <div>
                                                {setting.type === 'toggle' && (
                                                    <button
                                                        onClick={() => handleSettingChange(section.id, setting.id, !setting.value)}
                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${setting.value ? 'bg-emerald-600' : 'bg-gray-200'}`}
                                                    >
                                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${setting.value ? 'translate-x-6' : 'translate-x-1'}`} />
                                                    </button>
                                                )}
                                                
                                                {setting.type === 'select' && (
                                                    <select
                                                        value={setting.value as string}
                                                        onChange={(e) => handleSettingChange(section.id, setting.id, e.target.value)}
                                                        className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                                                    >
                                                        {setting.options?.map((option) => (
                                                            <option key={option.value} value={option.value}>
                                                                {option.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default DoctorSettingsPage;