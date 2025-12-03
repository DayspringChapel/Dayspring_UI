'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';
import styles from '../panels/Panel.module.css';

export default function MembersPanel() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        dateOfBirth: '',
        address: '',
        role: 'Member',
    });

    useEffect(() => {
        loadMembers();
    }, []);

    const loadMembers = async () => {
        try {
            const data = await apiClient.getBioData();
            setMembers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load members:', error);

            // Show user-friendly error message
            if (error.message?.includes('404')) {
                console.warn('BioData endpoint not found. The backend may not have this endpoint deployed yet.');
            }

            setMembers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingMember) {
                await apiClient.updateBioData({ ...formData, id: editingMember.id });
            } else {
                await apiClient.createBioData(formData);
            }

            await loadMembers();
            handleCloseModal();
        } catch (error) {
            console.error('Failed to save member:', error);
            alert('Failed to save member. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (memberId) => {
        if (!confirm('Are you sure you want to delete this member?')) return;

        try {
            await apiClient.deleteBioData(memberId);
            await loadMembers();
        } catch (error) {
            console.error('Failed to delete member:', error);
            alert('Failed to delete member. Please try again.');
        }
    };

    const handleEdit = (member) => {
        setEditingMember(member);
        setFormData({
            firstName: member.firstName || '',
            lastName: member.lastName || '',
            email: member.email || '',
            phoneNumber: member.phoneNumber || '',
            dateOfBirth: member.dateOfBirth ? member.dateOfBirth.split('T')[0] : '',
            address: member.address || '',
            role: member.role || 'Member',
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingMember(null);
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
            dateOfBirth: '',
            address: '',
            role: 'Member',
        });
    };

    if (loading && members.length === 0) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Loading members...</p>
            </div>
        );
    }

    return (
        <div className={styles.panel}>
            <div className={styles.panelHeader}>
                <h2>Members Directory</h2>
                <button className={styles.addBtn} onClick={() => setShowModal(true)}>
                    + Add Member
                </button>
            </div>

            {members.length === 0 ? (
                <div className={styles.empty}>
                    <p>No members found. Add your first member!</p>
                </div>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Birthday</th>
                                <th>Role</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.map((member) => (
                                <tr key={member.id}>
                                    <td>{member.firstName} {member.lastName}</td>
                                    <td>{member.email}</td>
                                    <td>{member.phoneNumber}</td>
                                    <td>{member.dateOfBirth}</td>
                                    <td>
                                        <span className={`${styles.badge} ${member.role === 'Admin' ? styles.admin : styles.member}`}>
                                            {member.role}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            <button
                                                className={styles.editBtn}
                                                onClick={() => handleEdit(member)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className={styles.deleteBtn}
                                                onClick={() => handleDelete(member.id)}
                                            >
                                                Delete
                                            </button>
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
                            <h3>{editingMember ? 'Edit Member' : 'Add New Member'}</h3>
                            <button className={styles.closeBtn} onClick={handleCloseModal}>
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.grid}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="firstName">First Name *</label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        value={formData.firstName}
                                        onChange={(e) =>
                                            setFormData({ ...formData, firstName: e.target.value })
                                        }
                                        required
                                        placeholder="John"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="lastName">Last Name *</label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        value={formData.lastName}
                                        onChange={(e) =>
                                            setFormData({ ...formData, lastName: e.target.value })
                                        }
                                        required
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="email">Email *</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({ ...formData, email: e.target.value })
                                    }
                                    required
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="phoneNumber">Phone Number</label>
                                <input
                                    type="tel"
                                    id="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={(e) =>
                                        setFormData({ ...formData, phoneNumber: e.target.value })
                                    }
                                    placeholder="+1234567890"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="dateOfBirth">Date of Birth</label>
                                <input
                                    type="date"
                                    id="dateOfBirth"
                                    value={formData.dateOfBirth}
                                    onChange={(e) =>
                                        setFormData({ ...formData, dateOfBirth: e.target.value })
                                    }
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="role">Role</label>
                                <select
                                    id="role"
                                    value={formData.role}
                                    onChange={(e) =>
                                        setFormData({ ...formData, role: e.target.value })
                                    }
                                >
                                    <option value="Member">Member</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Pastor">Pastor</option>
                                </select>
                            </div>

                            <div className={styles.formActions}>
                                <button
                                    type="button"
                                    className={styles.cancelBtn}
                                    onClick={handleCloseModal}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={styles.submitBtn}
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : editingMember ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
