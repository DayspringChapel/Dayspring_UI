'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [confirmData, setConfirmData] = useState({
        appointmentVenue: 0,
        dateOfAppointment: '',
        appointmentTime: '',
        personToAttendToAppintmentId: '',
    });

    useEffect(() => {
        loadAppointments();
    }, []);

    const loadAppointments = async () => {
        try {
            const data = await apiClient.getAppointments();
            setAppointments(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load appointments:', error);
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = (appointment) => {
        setSelectedAppointment(appointment);
        setConfirmData({
            appointmentVenue: 0,
            dateOfAppointment: new Date().toISOString().split('T')[0],
            appointmentTime: '',
            personToAttendToAppintmentId: '',
        });
        setShowModal(true);
    };

    const handleSubmitConfirm = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await apiClient.confirmAppointment({
                appointmentId: selectedAppointment.id,
                ...confirmData,
            });

            await loadAppointments();
            handleCloseModal();
        } catch (error) {
            console.error('Failed to confirm appointment:', error);
            alert('Failed to confirm appointment. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (appointmentId) => {
        if (!confirm('Are you sure you want to cancel this appointment?')) return;

        try {
            await apiClient.cancelAppointment(appointmentId);
            await loadAppointments();
        } catch (error) {
            console.error('Failed to cancel appointment:', error);
            alert('Failed to cancel appointment. Please try again.');
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedAppointment(null);
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            0: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
            1: { label: 'Confirmed', className: 'bg-green-100 text-green-800' },
            2: { label: 'Cancelled', className: 'bg-red-100 text-red-800' },
        };
        const statusInfo = statusMap[status] || statusMap[0];
        return (
            <span className={`inline-block px-3 py-1 rounded-xl text-xs font-semibold uppercase tracking-wide ${statusInfo.className}`}>
                {statusInfo.label}
            </span>
        );
    };

    if (loading && appointments.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-purple-500 rounded-full animate-spin"></div>
                <p className="text-gray-500 text-sm">Loading appointments...</p>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto px-4">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Appointments</h1>
                <p className="text-gray-500 text-lg">Manage appointment requests from members</p>
            </div>

            {appointments.length === 0 ? (
                <div className="text-center py-16 px-8 bg-white rounded-2xl border border-gray-200 text-gray-500">
                    <p>No appointments found.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto shadow-sm">
                    <table className="w-full border-collapse">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider border-b-2 border-gray-200">Name</th>
                                <th className="text-left p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider border-b-2 border-gray-200">Email</th>
                                <th className="text-left p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider border-b-2 border-gray-200">Phone</th>
                                <th className="text-left p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider border-b-2 border-gray-200">Purpose</th>
                                <th className="text-left p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider border-b-2 border-gray-200">Venue</th>
                                <th className="text-left p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider border-b-2 border-gray-200">Status</th>
                                <th className="text-left p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider border-b-2 border-gray-200">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map((appointment) => (
                                <tr key={appointment.id} className="hover:bg-gray-50">
                                    <td className="p-4 border-t border-gray-200 text-gray-700 text-sm">
                                        {appointment.firstname} {appointment.surname}
                                    </td>
                                    <td className="p-4 border-t border-gray-200 text-gray-700 text-sm">{appointment.email}</td>
                                    <td className="p-4 border-t border-gray-200 text-gray-700 text-sm">
                                        {appointment.phoneNumber?.countryCode} {appointment.phoneNumber?.number}
                                    </td>
                                    <td className="p-4 border-t border-gray-200 text-gray-700 text-sm">{appointment.purposeOfAppointment}</td>
                                    <td className="p-4 border-t border-gray-200 text-gray-700 text-sm">
                                        {appointment.venueOfMeeting === 0 ? 'Online' : appointment.venueOfMeeting === 1 ? 'Office' : 'Home'}
                                    </td>
                                    <td className="p-4 border-t border-gray-200 text-gray-700 text-sm">{getStatusBadge(appointment.status || 0)}</td>
                                    <td className="p-4 border-t border-gray-200 text-gray-700 text-sm">
                                        <div className="flex gap-2">
                                            {appointment.status !== 1 && (
                                                <button
                                                    className="bg-green-100 text-green-800 hover:bg-green-200 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                                                    onClick={() => handleConfirm(appointment)}
                                                >
                                                    Confirm
                                                </button>
                                            )}
                                            {appointment.status !== 2 && (
                                                <button
                                                    className="bg-red-100 text-red-800 hover:bg-red-200 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                                                    onClick={() => handleCancel(appointment.id)}
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" onClick={handleCloseModal}>
                    <div
                        className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-4 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900">Confirm Appointment</h3>
                            <button className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg w-8 h-8 flex items-center justify-center transition-colors text-2xl" onClick={handleCloseModal}>
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmitConfirm} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="dateOfAppointment" className="block font-semibold text-gray-700 text-sm">Appointment Date *</label>
                                <input
                                    type="date"
                                    id="dateOfAppointment"
                                    value={confirmData.dateOfAppointment}
                                    onChange={(e) =>
                                        setConfirmData({
                                            ...confirmData,
                                            dateOfAppointment: e.target.value,
                                        })
                                    }
                                    required
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="appointmentTime" className="block font-semibold text-gray-700 text-sm">Appointment Time *</label>
                                <input
                                    type="time"
                                    id="appointmentTime"
                                    value={confirmData.appointmentTime}
                                    onChange={(e) =>
                                        setConfirmData({
                                            ...confirmData,
                                            appointmentTime: e.target.value,
                                        })
                                    }
                                    required
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="appointmentVenue" className="block font-semibold text-gray-700 text-sm">Venue *</label>
                                <select
                                    id="appointmentVenue"
                                    value={confirmData.appointmentVenue}
                                    onChange={(e) =>
                                        setConfirmData({
                                            ...confirmData,
                                            appointmentVenue: parseInt(e.target.value),
                                        })
                                    }
                                    required
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all appearance-none bg-white"
                                >
                                    <option value={0}>Online</option>
                                    <option value={1}>Office</option>
                                    <option value={2}>Home</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="personToAttendToAppintmentId" className="block font-semibold text-gray-700 text-sm">
                                    Person to Attend (User ID)
                                </label>
                                <input
                                    type="text"
                                    id="personToAttendToAppintmentId"
                                    value={confirmData.personToAttendToAppintmentId}
                                    onChange={(e) =>
                                        setConfirmData({
                                            ...confirmData,
                                            personToAttendToAppintmentId: e.target.value,
                                        })
                                    }
                                    placeholder="Enter user ID"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
                                />
                            </div>

                            <div className="flex gap-4 justify-end pt-4">
                                <button
                                    type="button"
                                    className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                                    onClick={handleCloseModal}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-xl font-semibold hover:translate-y-[-2px] hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                    disabled={loading}
                                >
                                    {loading ? 'Confirming...' : 'Confirm Appointment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
