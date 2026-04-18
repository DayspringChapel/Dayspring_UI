'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';
import AppointmentModal from '@/components/admin/AppointmentModal';
import AppointmentCalendar from '@/components/admin/AppointmentCalendar';

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'

    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        loadAppointments();
    }, []);

    const loadAppointments = async () => {
        try {
            const response = await apiClient.getAppointments();
            // API returns { data: [...] } format
            const appointmentsData = response?.data || response || [];
            setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
        } catch (error) {
            console.error('Failed to load appointments:', error);
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    };

    // Sort appointments by latest first
    // Backend may return oldest first, so we reverse. If createdAt exists, use it.
    const sortedAppointments = [...appointments].reverse();

    // Filter Logic
    const filteredAppointments = sortedAppointments.filter(app => {
        const matchesSearch = (
            app.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.surname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const matchesStatus = statusFilter === 'all' || app.status === parseInt(statusFilter);

        const matchesDate = !dateFilter || (app.dateOfAppointment && app.dateOfAppointment.startsWith(dateFilter));

        return matchesSearch && matchesStatus && matchesDate;
    });

    // Pagination calculations
    const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedAppointments = filteredAppointments.slice(startIndex, startIndex + itemsPerPage);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, dateFilter]);

    const handleViewDetails = (appointment) => {
        setSelectedAppointment(appointment);
        setShowModal(true);
    };

    const handleConfirm = async (appointmentId, confirmData) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('AppointmentId', appointmentId);
            formData.append('AppointmentVenue', String(confirmData.appointmentVenue));
            formData.append('DateOfAppointment', `${confirmData.dateOfAppointment}T${confirmData.appointmentTime}`);
            formData.append('AttendingPersonnelId', confirmData.attendingPersonnelId);

            await apiClient.confirmAppointment(formData);

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
        try {
            await apiClient.cancelAppointment(appointmentId);
            await loadAppointments();
            handleCloseModal();
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
                <div className="w-10 h-10 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
                <p className="text-gray-500 text-sm">Loading appointments...</p>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto px-4">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Appointments</h1>
                    <p className="text-gray-500 text-lg">Manage appointment requests from members</p>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === 'list'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        List View
                    </button>
                    <button
                        onClick={() => setViewMode('calendar')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === 'calendar'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Calendar View
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 mb-6 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all"
                    />
                </div>
                <div className="w-full md:w-48">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all bg-white"
                    >
                        <option value="all">All Status</option>
                        <option value="0">Pending</option>
                        <option value="1">Confirmed</option>
                        <option value="2">Cancelled</option>
                    </select>
                </div>
                <div className="w-full md:w-48">
                    <input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all"
                    />
                </div>
            </div>

            {viewMode === 'list' ? (
                filteredAppointments.length === 0 ? (
                    <div className="text-center py-16 px-8 bg-white rounded-2xl border border-gray-200 text-gray-500">
                        <p>No appointments found matching your filters.</p>
                    </div>
                ) : (
                    <>
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
                                    {paginatedAppointments.map((appointment) => (
                                        <tr key={appointment.id} className="hover:bg-gray-50">
                                            <td className="p-4 border-t border-gray-200 text-gray-700 text-sm">
                                                {appointment.firstname} {appointment.surname}
                                            </td>
                                            <td className="p-4 border-t border-gray-200 text-gray-700 text-sm">{appointment.email}</td>
                                            <td className="p-4 border-t border-gray-200 text-gray-700 text-sm">
                                                {appointment.phoneNumber?.countryCode} {appointment.phoneNumber?.number}
                                            </td>
                                            <td className="p-4 border-t border-gray-200 text-gray-700 text-sm max-w-xs truncate">{appointment.purposeOfAppointment}</td>
                                            <td className="p-4 border-t border-gray-200 text-gray-700 text-sm">
                                                {appointment.venueOfMeeting === 0 ? 'Online' : appointment.venueOfMeeting === 1 ? 'Office' : 'Home'}
                                            </td>
                                            <td className="p-4 border-t border-gray-200 text-gray-700 text-sm">{getStatusBadge(appointment.status || 0)}</td>
                                            <td className="p-4 border-t border-gray-200 text-gray-700 text-sm">
                                                <button
                                                    className="bg-orange-50 text-orange-700 hover:bg-orange-100 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                                                    onClick={() => handleViewDetails(appointment)}
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-6 bg-white p-4 rounded-xl border border-gray-200">
                                <div className="text-sm text-gray-600">
                                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredAppointments.length)} of {filteredAppointments.length} appointments
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(1)}
                                        disabled={currentPage === 1}
                                        className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        ««
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        «
                                    </button>

                                    {/* Page numbers */}
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                                                    ? 'bg-orange-500 text-white'
                                                    : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}

                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        »
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(totalPages)}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        »»
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )
            ) : (
                <AppointmentCalendar
                    appointments={filteredAppointments}
                    onViewDetails={handleViewDetails}
                />
            )}

            {showModal && selectedAppointment && (
                <AppointmentModal
                    appointment={selectedAppointment}
                    onClose={handleCloseModal}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                    loading={loading}
                />
            )}
        </div>
    );
}
