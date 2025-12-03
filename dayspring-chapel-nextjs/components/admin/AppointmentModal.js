'use client';

import { useState, useEffect } from 'react';

export default function AppointmentModal({ appointment, onClose, onConfirm, onCancel, loading }) {
    const [confirmData, setConfirmData] = useState({
        appointmentVenue: 0,
        dateOfAppointment: '',
        appointmentTime: '',
        personToAttendToAppintmentId: '',
        notes: '',
    });
    const [isRejecting, setIsRejecting] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        if (appointment) {
            setConfirmData(prev => ({
                ...prev,
                dateOfAppointment: new Date().toISOString().split('T')[0]
            }));
            setIsRejecting(false);
            setRejectionReason('');
        }
    }, [appointment]);

    if (!appointment) return null;

    const isPending = appointment.status === 0;

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm(appointment.id, confirmData);
    };

    const handleReject = (e) => {
        e.preventDefault();
        onCancel(appointment.id, rejectionReason);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" onClick={onClose}>
            <div
                className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-4 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">
                            {isRejecting ? 'Reject Appointment' : 'Appointment Details'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">ID: {appointment.id}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center transition-all"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {/* Applicant Info Section */}
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Applicant Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                                <p className="text-gray-900 font-medium">{appointment.firstname} {appointment.surname}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Email Address</label>
                                <p className="text-gray-900 font-medium">{appointment.email}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Phone Number</label>
                                <p className="text-gray-900 font-medium">
                                    {appointment.phoneNumber?.countryCode} {appointment.phoneNumber?.number}
                                </p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Current Status</label>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${appointment.status === 1 ? 'bg-green-100 text-green-800' :
                                    appointment.status === 2 ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {appointment.status === 1 ? 'Confirmed' : appointment.status === 2 ? 'Cancelled' : 'Pending'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Request Details Section */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Request Details
                        </h4>
                        <div className="bg-white border border-gray-200 rounded-xl p-4">
                            <label className="block text-xs font-medium text-gray-500 mb-2">Purpose of Appointment</label>
                            <p className="text-gray-700 leading-relaxed">{appointment.purposeOfAppointment}</p>
                        </div>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white border border-gray-200 rounded-xl p-4">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Preferred Venue</label>
                                <p className="text-gray-900 font-medium">
                                    {appointment.venueOfMeeting === 0 ? 'Online' : appointment.venueOfMeeting === 1 ? 'Office' : 'Home'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Section - Only show if Pending */}
                    {isPending && (
                        <div className="border-t border-gray-100 pt-6">
                            {isRejecting ? (
                                <form onSubmit={handleReject} className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                    <h4 className="text-sm font-bold text-red-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        Reason for Rejection
                                    </h4>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Please provide a reason *</label>
                                        <textarea
                                            required
                                            rows={3}
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            placeholder="This will be sent to the applicant..."
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                                        />
                                    </div>
                                    <div className="flex gap-3 justify-end pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsRejecting(false)}
                                            className="px-5 py-2.5 bg-gray-100 text-gray-600 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-5 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all disabled:opacity-50"
                                        >
                                            {loading ? 'Rejecting...' : 'Confirm Rejection'}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        Confirm Appointment
                                    </h4>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                                                <input
                                                    type="date"
                                                    required
                                                    value={confirmData.dateOfAppointment}
                                                    onChange={(e) => setConfirmData({ ...confirmData, dateOfAppointment: e.target.value })}
                                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
                                                <input
                                                    type="time"
                                                    required
                                                    value={confirmData.appointmentTime}
                                                    onChange={(e) => setConfirmData({ ...confirmData, appointmentTime: e.target.value })}
                                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Venue *</label>
                                                <select
                                                    required
                                                    value={confirmData.appointmentVenue}
                                                    onChange={(e) => setConfirmData({ ...confirmData, appointmentVenue: parseInt(e.target.value) })}
                                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white"
                                                >
                                                    <option value={0}>Online</option>
                                                    <option value={1}>Office</option>
                                                    <option value={2}>Home</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Attending Staff ID</label>
                                                <input
                                                    type="text"
                                                    placeholder="Optional"
                                                    value={confirmData.personToAttendToAppintmentId}
                                                    onChange={(e) => setConfirmData({ ...confirmData, personToAttendToAppintmentId: e.target.value })}
                                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Instructions</label>
                                            <textarea
                                                rows={2}
                                                value={confirmData.notes}
                                                onChange={(e) => setConfirmData({ ...confirmData, notes: e.target.value })}
                                                placeholder="Additional details for the applicant..."
                                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                            />
                                        </div>

                                        <div className="flex gap-3 justify-end pt-4">
                                            <button
                                                type="button"
                                                onClick={() => setIsRejecting(true)}
                                                className="px-5 py-2.5 bg-red-50 text-red-700 font-semibold rounded-xl hover:bg-red-100 transition-colors"
                                            >
                                                Reject Request
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="px-5 py-2.5 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 shadow-lg shadow-orange-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {loading ? 'Processing...' : 'Confirm Appointment'}
                                            </button>
                                        </div>
                                    </form>
                                </>
                            )}
                        </div>
                    )}

                    {/* Footer Actions for non-pending */}
                    {!isPending && (
                        <div className="flex justify-end pt-4 border-t border-gray-100">
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
