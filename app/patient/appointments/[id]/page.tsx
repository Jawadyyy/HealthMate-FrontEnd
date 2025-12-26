// app/patient/appointments/[id]/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
    Calendar,
    Clock,
    User,
    ArrowLeft,
    MapPin,
    DollarSign,
    Edit,
    XCircle,
    CheckCircle,
    AlertCircle,
    FileText,
    CalendarDays,
    Phone,
    Mail,
    Building,
    Stethoscope,
    BadgeCheck,
    Shield,
    Info,
    ChevronRight
} from 'lucide-react';
import api from '@/lib/api/api';

interface Appointment {
    _id: string;
    doctorId: string;
    patientId: string;
    appointmentDate: string;
    status: 'upcoming' | 'pending' | 'scheduled' | 'completed' | 'cancelled' | 'missed';
    notes?: string;
    createdAt: string;
    updatedAt: string;
    doctor?: {
        _id: string;
        fullName?: string;
        name?: string;
        specialization?: string;
        fee?: number;
        contactNumber?: string;
        email?: string;
        hospital?: string;
        availability?: {
            day: string;
            startTime: string;
            endTime: string;
        }[];
    };
}

const AppointmentDetailsPage = () => {
    const params = useParams();
    const router = useRouter();
    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = sessionStorage.getItem('selectedAppointment');
        if (stored) {
            const apt = JSON.parse(stored);
            if (apt._id === params.id) {
                setAppointment(apt);
                setLoading(false);
                return;
            }
        }
        fetchAppointmentDetails();
    }, [params.id]);

    const fetchAppointmentDetails = async () => {
        try {
            const response = await api.get('/appointments/my');
            const appointments = response.data.data || response.data || [];
            const foundAppointment = appointments.find((apt: any) => apt._id === params.id);

            if (foundAppointment) {
                try {
                    const doctorResponse = await api.get(`/doctors/${foundAppointment.doctorId._id || foundAppointment.doctorId}`);
                    const doctorData = doctorResponse.data.data || doctorResponse.data;

                    const fullAppointment = {
                        ...foundAppointment,
                        doctor: {
                            ...foundAppointment.doctorId,
                            fee: doctorData.fee,
                            availability: doctorData.availability,
                            contactNumber: doctorData.contactNumber,
                            email: doctorData.email,
                            hospital: doctorData.hospital
                        },
                        doctorId: foundAppointment.doctorId._id || foundAppointment.doctorId
                    };

                    setAppointment(fullAppointment);
                } catch (error) {
                    setAppointment({
                        ...foundAppointment,
                        doctor: foundAppointment.doctorId,
                        doctorId: foundAppointment.doctorId._id || foundAppointment.doctorId
                    });
                }
            } else {
                alert('Appointment not found');
                router.push('/patient/appointments');
            }
        } catch (error) {
            console.error('Error fetching appointment:', error);
            alert('Failed to load appointment details');
            router.push('/patient/appointments');
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            time: date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }),
            day: date.toLocaleDateString('en-US', { weekday: 'long' })
        };
    };

    const getStatusConfig = (status: string) => {
        const configs: Record<string, { color: string; bg: string; icon: any; label: string; description: string }> = {
            scheduled: {
                color: 'text-blue-700',
                bg: 'bg-blue-50 border-blue-200',
                icon: CheckCircle,
                label: 'Scheduled',
                description: 'Appointment is confirmed'
            },
            upcoming: {
                color: 'text-emerald-700',
                bg: 'bg-emerald-50 border-emerald-200',
                icon: Calendar,
                label: 'Upcoming',
                description: 'Appointment is scheduled'
            },
            pending: {
                color: 'text-amber-700',
                bg: 'bg-amber-50 border-amber-200',
                icon: Clock,
                label: 'Pending',
                description: 'Awaiting confirmation'
            },
            completed: {
                color: 'text-green-700',
                bg: 'bg-green-50 border-green-200',
                icon: CheckCircle,
                label: 'Completed',
                description: 'Appointment finished'
            },
            cancelled: {
                color: 'text-rose-700',
                bg: 'bg-rose-50 border-rose-200',
                icon: XCircle,
                label: 'Cancelled',
                description: 'Appointment cancelled'
            },
            missed: {
                color: 'text-gray-700',
                bg: 'bg-gray-50 border-gray-200',
                icon: AlertCircle,
                label: 'Missed',
                description: 'Appointment was missed'
            }
        };
        return configs[status] || configs.pending;
    };

    const handleCancelAppointment = async () => {
        if (!appointment) return;

        // Check if appointment can be cancelled (only upcoming/pending/scheduled appointments)
        if (!['upcoming', 'pending', 'scheduled'].includes(appointment.status)) {
            alert(`Cannot cancel a ${appointment.status} appointment`);
            return;
        }

        const confirmMessage = `Are you sure you want to cancel this appointment?\n\nThis action cannot be undone and may incur a cancellation fee if done within 24 hours of the scheduled time.`;

        if (!confirm(confirmMessage)) {
            return;
        }

        try {
            await api.patch(`/appointments/cancel/${params.id}`);
            alert('Appointment cancelled successfully');
            router.push('/patient/appointments');
        } catch (error: any) {
            console.error('Error cancelling appointment:', error);
            alert(error.response?.data?.message || 'Failed to cancel appointment');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
                <div className="text-center space-y-4">
                    <div className="relative mx-auto w-16 h-16">
                        <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                        <Stethoscope className="absolute inset-0 m-auto w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-lg font-semibold text-slate-700">Loading appointment details</p>
                        <p className="text-sm text-slate-500 mt-1">Please wait while we fetch your information</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!appointment) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
                <div className="text-center space-y-6 max-w-md">
                    <div className="w-20 h-20 mx-auto bg-rose-100 rounded-2xl flex items-center justify-center">
                        <AlertCircle className="w-10 h-10 text-rose-600" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">Appointment Not Found</h3>
                        <p className="text-slate-600">The appointment you're looking for doesn't exist or has been removed.</p>
                    </div>
                    <button
                        onClick={() => router.push('/patient/appointments')}
                        className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-600/20"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Appointments</span>
                    </button>
                </div>
            </div>
        );
    }

    const dateTime = formatDateTime(appointment.appointmentDate);
    const statusConfig = getStatusConfig(appointment.status);
    const StatusIcon = statusConfig.icon;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => router.back()}
                            className="group flex items-center space-x-2 px-4 py-2.5 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all"
                        >
                            <ArrowLeft className="w-4 h-4 text-slate-600 group-hover:text-blue-600" />
                            <span className="font-medium text-slate-700 group-hover:text-blue-700">Back</span>
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Appointment Details</h1>
                            <p className="text-sm text-slate-500 mt-1">ID: APPT-{appointment._id.slice(-8).toUpperCase()}</p>
                        </div>
                    </div>

                    <div className="flex flex-col md:items-end gap-2">
                        <div className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl border-2 ${statusConfig.bg} ${statusConfig.color} font-medium`}>
                            <StatusIcon className="w-4 h-4" />
                            <span>{statusConfig.label}</span>
                        </div>
                        <p className="text-sm text-slate-500">{statusConfig.description}</p>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Appointment Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Doctor Card */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 md:p-8">
                                <div className="flex items-start gap-6">
                                    <div className="relative">
                                        <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                                            <User className="w-10 h-10 md:w-12 md:h-12 text-white" />
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center">
                                            <BadgeCheck className="w-4 h-4 text-white" />
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <h2 className="text-2xl font-bold text-slate-900">
                                                {appointment.doctor?.fullName || appointment.doctor?.name || 'Doctor'}
                                            </h2>
                                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                                                {appointment.doctor?.specialization || 'Specialist'}
                                            </span>
                                        </div>

                                        {appointment.doctor?.hospital && (
                                            <div className="flex items-center gap-2 text-slate-600 mb-3">
                                                <Building className="w-4 h-4" />
                                                <span className="font-medium">{appointment.doctor.hospital}</span>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                            {appointment.doctor?.contactNumber && (
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <Phone className="w-4 h-4" />
                                                    <span className="font-medium">{appointment.doctor.contactNumber}</span>
                                                </div>
                                            )}

                                            {appointment.doctor?.email && (
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <Mail className="w-4 h-4" />
                                                    <span className="font-medium truncate">{appointment.doctor.email}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Schedule & Notes Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Schedule Card */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                                        <Calendar className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">Appointment Schedule</h3>
                                        <p className="text-sm text-slate-500">Date and time details</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                                        <div className="flex items-center gap-3 mb-2">
                                            <CalendarDays className="w-5 h-5 text-blue-600" />
                                            <span className="font-bold text-slate-900">{dateTime.day}</span>
                                        </div>
                                        <p className="text-lg font-bold text-slate-900">{dateTime.date}</p>
                                    </div>

                                    <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Clock className="w-5 h-5 text-purple-600" />
                                            <span className="font-bold text-slate-900">Scheduled Time</span>
                                        </div>
                                        <p className="text-lg font-bold text-slate-900">{dateTime.time}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Notes & Fee Card */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                                        <FileText className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">Notes & Payment</h3>
                                        <p className="text-sm text-slate-500">Additional information</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {appointment.notes && (
                                        <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl">
                                            <p className="text-sm text-amber-800 font-medium mb-1">Doctor's Notes</p>
                                            <p className="text-slate-700">{appointment.notes}</p>
                                        </div>
                                    )}

                                    {appointment.doctor?.fee && (
                                        <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-emerald-800 font-medium mb-1">Consultation Fee</p>
                                                    <p className="text-2xl font-bold text-slate-900">${appointment.doctor.fee}</p>
                                                </div>
                                                <DollarSign className="w-8 h-8 text-emerald-600" />
                                            </div>
                                            <p className="text-xs text-emerald-600 mt-2">Payment due at appointment time</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Availability Section */}
                        {appointment.doctor?.availability && appointment.doctor.availability.length > 0 && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                                        <CalendarDays className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">Doctor's Weekly Schedule</h3>
                                        <p className="text-sm text-slate-500">Available time slots</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                    {appointment.doctor.availability.map((slot, index) => (
                                        <div
                                            key={index}
                                            className={`p-4 rounded-xl border ${slot.day === dateTime.day
                                                ? 'border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50'
                                                : 'border-slate-200 bg-slate-50'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={`font-bold ${slot.day === dateTime.day ? 'text-blue-700' : 'text-slate-700'
                                                    }`}>
                                                    {slot.day}
                                                </span>
                                                {slot.day === dateTime.day && (
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                                        Today
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-sm text-slate-600">
                                                <span className="font-medium">{slot.startTime}</span>
                                                <span className="mx-2">–</span>
                                                <span className="font-medium">{slot.endTime}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons - Only show for cancellable appointments */}
                        {(appointment.status === 'upcoming' || appointment.status === 'pending' || appointment.status === 'scheduled') && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                                <div className="mb-4">
                                    <h3 className="font-bold text-slate-900 mb-2">Appointment Actions</h3>
                                    <p className="text-sm text-slate-500">
                                        You can manage your appointment with the options below
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        onClick={handleCancelAppointment}
                                        className="group flex-1 flex items-center justify-center gap-3 px-6 py-3.5 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl hover:from-rose-700 hover:to-pink-700 transition-all font-medium shadow-lg shadow-rose-600/20"
                                    >
                                        <XCircle className="w-5 h-5" />
                                        <span>Cancel Appointment</span>
                                    </button>
                                </div>

                                {/* Cancellation Policy Notice */}
                                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-amber-800">
                                            <span className="font-medium">Cancellation Policy:</span> Free cancellation up to 24 hours before appointment. Late cancellations may incur a fee.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Status-specific messages */}
                        {appointment.status === 'completed' && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                                        <CheckCircle className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">Appointment Completed</h3>
                                        <p className="text-sm text-slate-500">This appointment has been successfully completed</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-sm text-green-800">
                                        Your appointment was completed on {new Date(appointment.updatedAt).toLocaleDateString()}.
                                        Please check your email for any follow-up instructions or prescriptions.
                                    </p>
                                </div>
                            </div>
                        )}

                        {appointment.status === 'cancelled' && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center">
                                        <XCircle className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">Appointment Cancelled</h3>
                                        <p className="text-sm text-slate-500">This appointment has been cancelled</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg">
                                    <p className="text-sm text-rose-800">
                                        This appointment was cancelled on {new Date(appointment.updatedAt).toLocaleDateString()}.
                                        If this was a mistake or you need to schedule a new appointment, please contact support.
                                    </p>
                                </div>
                            </div>
                        )}

                        {appointment.status === 'missed' && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-slate-600 rounded-xl flex items-center justify-center">
                                        <AlertCircle className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">Appointment Missed</h3>
                                        <p className="text-sm text-slate-500">This appointment was not attended</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                    <p className="text-sm text-gray-800">
                                        You missed your scheduled appointment. Multiple missed appointments may affect your ability to schedule future appointments.
                                        Please contact the clinic to reschedule or discuss any issues.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Timeline & Info */}
                    <div className="space-y-6">
                        {/* Timeline Card */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                            <h3 className="font-bold text-slate-900 mb-6">Appointment Timeline</h3>

                            <div className="relative pl-8 space-y-6">
                                {/* Timeline line */}
                                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 to-blue-100"></div>

                                {/* Created */}
                                <div className="relative">
                                    <div className="absolute left-[-32px] top-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full border-4 border-white flex items-center justify-center">
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">Appointment Created</p>
                                        <p className="text-sm text-slate-500 mt-1">
                                            {new Date(appointment.createdAt).toLocaleString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>

                                {/* Updated */}
                                {appointment.updatedAt !== appointment.createdAt && (
                                    <div className="relative">
                                        <div className="absolute left-[-32px] top-0 w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full border-4 border-white flex items-center justify-center">
                                            <div className="w-2 h-2 bg-white rounded-full"></div>
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900">Status Updated</p>
                                            <p className="text-sm text-slate-500 mt-1">
                                                {new Date(appointment.updatedAt).toLocaleString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Appointment Date */}
                                <div className="relative">
                                    <div className="absolute left-[-32px] top-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full border-4 border-white flex items-center justify-center">
                                        <Calendar className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">Scheduled For</p>
                                        <p className="text-sm text-slate-500 mt-1">
                                            {new Date(appointment.appointmentDate).toLocaleString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppointmentDetailsPage;