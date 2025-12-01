'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';
import styles from './appointments.module.css';

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
            0: { label: 'Pending', className: 'pending' },
            1: { label: 'Confirmed', className: 'confirmed' },
            2: { label: 'Cancelled', className: 'cancelled' },
        };
        const statusInfo = statusMap[status] || statusMap[0];
        return <span className={`${styles.badge} ${styles[statusInfo.className]}`}>{statusInfo.label}</span>;
    };

    if (loading && appointments.length === 0) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Loading appointments...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Appointments</h1>
                <p>Manage appointment requests from members</p>
            </div>

            {appointments.length === 0 ? (
                <div className={styles.empty}>
                    <p>No appointments found.</p>
                </div>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Purpose</th>
                                <th>Venue</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map((appointment) => (
                                <tr key={appointment.id}>
                                    <td>
                                        {appointment.firstname} {appointment.surname}
                                    </td>
                                    <td>{appointment.email}</td>
                                    <td>
                                        {appointment.phoneNumber?.countryCode} {appointment.phoneNumber?.number}
                                    </td>
                                    <td>{appointment.purposeOfAppointment}</td>
                                    <td>{appointment.venueOfMeeting === 0 ? 'Online' : appointment.venueOfMeeting === 1 ? 'Office' : 'Home'}</td>
                                    <td>{getStatusBadge(appointment.status || 0)}</td>
                                    <td>
                                        <div className={styles.actions}>
                                            {appointment.status !== 1 && (
                                                <button
                                                    className={styles.confirmBtn}
                                                    onClick={() => handleConfirm(appointment)}
                                                >
                                                    Confirm
                                                </button>
                                            )}
                                            {appointment.status !== 2 && (
                                                <button
                                                    className={styles.cancelBtn}
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
                <div className={styles.modal} onClick={handleCloseModal}>
                    <div
                        className={styles.modalContent}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={styles.modalHeader}>
                            <h3>Confirm Appointment</h3>
                            <button className={styles.closeBtn} onClick={handleCloseModal}>
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmitConfirm} className={styles.form}>
                            <div className={styles.formGroup}>
                                <label htmlFor="dateOfAppointment">Appointment Date *</label>
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
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="appointmentTime">Appointment Time *</label>
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
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="appointmentVenue">Venue *</label>
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
                                >
                                    <option value={0}>Online</option>
                                    <option value={1}>Office</option>
                                    <option value={2}>Home</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="personToAttendToAppintmentId">
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
                                />
                            </div>

                            <div className={styles.formActions}>
                                <button
                                    type="button"
                                    className={styles.cancelBtnForm}
                                    onClick={handleCloseModal}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={styles.submitBtn}
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
