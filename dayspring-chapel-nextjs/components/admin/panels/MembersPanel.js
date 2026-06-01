'use client';

import { useEffect, useMemo, useState } from 'react';
import apiClient from '@/lib/apiClient';
import styles from '../panels/Panel.module.css';

const INITIAL_FORM_DATA = {
    userId: '',
    apellation: 0,
    firstName: '',
    lastName: '',
    countryCode: '',
    phoneNumber: '',
    alternativeCountryCode: '',
    alternativePhoneNumber: '',
    dateOfBirth: '',
    occupation: '',
    street: '',
    city: '',
    state: '',
    country: '',
    maritalStatus: 0,
    gender: 1,
    nextOfKinName: '',
    nextOfKinCountryCode: '',
    nextOfKinPhoneNumber: '',
};

export default function MembersPanel() {
    const [members, setMembers] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [bioData, allUsers] = await Promise.all([
                apiClient.getBioData().catch(() => []),
                apiClient.getUsers().catch(() => []),
            ]);

            setMembers(Array.isArray(bioData) ? bioData : []);
            setUsers(Array.isArray(allUsers) ? allUsers : []);
        } catch (error) {
            console.error('Failed to load member data:', error);
            setMembers([]);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const usersById = useMemo(
        () => new Map(users.map((user) => [user.id, user])),
        [users]
    );

    const availableUsersForCreate = useMemo(() => {
        const existingUserIds = new Set(members.map((member) => member.userId).filter(Boolean));
        return users.filter((user) => user.id && !existingUserIds.has(user.id));
    }, [members, users]);

    const buildPayload = () => ({
        userId: formData.userId,
        apellation: Number(formData.apellation),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        address: {
            street: formData.street.trim(),
            city: formData.city.trim(),
            state: formData.state.trim(),
            country: formData.country.trim(),
        },
        phoneNumber: formData.phoneNumber.trim()
            ? {
                countryCode: formData.countryCode.trim(),
                number: formData.phoneNumber.trim(),
            }
            : null,
        alernativePhoneNumber: formData.alternativePhoneNumber.trim()
            ? {
                countryCode: formData.alternativeCountryCode.trim(),
                number: formData.alternativePhoneNumber.trim(),
            }
            : null,
        dateOfBirth: formData.dateOfBirth || null,
        occupation: formData.occupation.trim() || null,
        maritalStatus: Number(formData.maritalStatus),
        gender: Number(formData.gender),
        fUllNameOfNextOfKin: formData.nextOfKinName.trim() || null,
        nextOfKinPhonenumber: formData.nextOfKinPhoneNumber.trim()
            ? {
                countryCode: formData.nextOfKinCountryCode.trim(),
                number: formData.nextOfKinPhoneNumber.trim(),
            }
            : null,
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const payload = buildPayload();

            if (editingMember) {
                await apiClient.updateBioData(payload);
            } else {
                await apiClient.createBioData(payload);

                const currentUser = apiClient.getUserData();
                const modifier =
                    currentUser?.userName ||
                    currentUser?.UserName ||
                    currentUser?.email ||
                    currentUser?.Email ||
                    'admin';

                try {
                    await apiClient.createMember({
                        userId: formData.userId,
                        children: [],
                        modifier,
                        smallGroupId: null,
                        unitId: null,
                    });
                } catch (memberError) {
                    console.error('Failed to create member record:', memberError);
                }
            }

            await loadData();
            handleCloseModal();
        } catch (error) {
            console.error('Failed to save member:', error);
            alert(error.message || 'Failed to save member. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (memberId) => {
        if (!confirm('Are you sure you want to delete this member?')) return;

        try {
            await apiClient.deleteBioData(memberId);
            await loadData();
        } catch (error) {
            console.error('Failed to delete member:', error);
            alert('Failed to delete member. Please try again.');
        }
    };

    const handleCreate = () => {
        setEditingMember(null);
        setFormData(INITIAL_FORM_DATA);
        setShowModal(true);
    };

    const handleEdit = (member) => {
        setEditingMember(member);
        setFormData({
            userId: member.userId || '',
            apellation: member.apellation ?? 0,
            firstName: member.firstName || '',
            lastName: member.lastName || '',
            countryCode: member.phoneNumberObject?.countryCode || '',
            phoneNumber: member.phoneNumberObject?.number || '',
            alternativeCountryCode: member.alternativePhoneNumberObject?.countryCode || '',
            alternativePhoneNumber: member.alternativePhoneNumberObject?.number || '',
            dateOfBirth: member.dateOfBirth ? String(member.dateOfBirth).split('T')[0] : '',
            occupation: member.occupation || '',
            street: member.addressObject?.street || '',
            city: member.addressObject?.city || '',
            state: member.addressObject?.state || '',
            country: member.addressObject?.country || '',
            maritalStatus: member.maritalStatus ?? 0,
            gender: member.gender ?? 1,
            nextOfKinName: member.fullNameOfNextOfKin || '',
            nextOfKinCountryCode: member.nextOfKinPhoneNumberObject?.countryCode || '',
            nextOfKinPhoneNumber: member.nextOfKinPhoneNumberObject?.number || '',
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingMember(null);
        setFormData(INITIAL_FORM_DATA);
    };

    const updateField = (field, value) => {
        setFormData((current) => ({ ...current, [field]: value }));
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
                <div>
                    <h2>Members Directory</h2>
                    <p className={styles.cardDescription}>
                        Create biodata for existing users and edit current member records.
                    </p>
                </div>
                <button
                    className={styles.addBtn}
                    onClick={handleCreate}
                    disabled={availableUsersForCreate.length === 0}
                    title={availableUsersForCreate.length === 0 ? 'No unassigned users available' : 'Add member'}
                >
                    Add Member
                </button>
            </div>

            {members.length === 0 ? (
                <div className={styles.empty}>
                    <p>No members found.</p>
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
                            {members.map((member) => {
                                const user = usersById.get(member.userId);

                                return (
                                    <tr key={member.id}>
                                        <td>{member.firstName} {member.lastName}</td>
                                        <td>{user?.email || member.email || 'N/A'}</td>
                                        <td>{member.phoneNumber || 'N/A'}</td>
                                        <td>{member.dateOfBirth || 'N/A'}</td>
                                        <td>
                                            <span className={`${styles.badge} ${user?.role === 'Admin' ? styles.admin : styles.member}`}>
                                                {user?.role || member.role}
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
                                );
                            })}
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
                            <h3>{editingMember ? 'Edit Member' : 'Create Member'}</h3>
                            <button className={styles.closeBtn} onClick={handleCloseModal}>
                                x
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            {!editingMember && (
                                <div className={styles.formGroup}>
                                    <label htmlFor="userId">User Account *</label>
                                    <select
                                        id="userId"
                                        value={formData.userId}
                                        onChange={(e) => updateField('userId', e.target.value)}
                                        required
                                    >
                                        <option value="">Select a user</option>
                                        {availableUsersForCreate.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.userName} - {user.email}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className={styles.grid}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="apellation">Title</label>
                                    <select
                                        id="apellation"
                                        value={formData.apellation}
                                        onChange={(e) => updateField('apellation', e.target.value)}
                                    >
                                        <option value={0}>Mr</option>
                                        <option value={1}>Mrs</option>
                                        <option value={2}>Ms</option>
                                        <option value={3}>Dr</option>
                                        <option value={4}>Prof</option>
                                        <option value={5}>Rev</option>
                                        <option value={6}>Pastor</option>
                                        <option value={7}>Elder</option>
                                        <option value={8}>Deacon</option>
                                        <option value={9}>Deaconess</option>
                                        <option value={10}>Minister</option>
                                        <option value={11}>Engr</option>
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="gender">Gender</label>
                                    <select
                                        id="gender"
                                        value={formData.gender}
                                        onChange={(e) => updateField('gender', e.target.value)}
                                    >
                                        <option value={1}>Male</option>
                                        <option value={2}>Female</option>
                                    </select>
                                </div>
                            </div>

                            <div className={styles.grid}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="firstName">First Name *</label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        value={formData.firstName}
                                        onChange={(e) => updateField('firstName', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="lastName">Last Name *</label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        value={formData.lastName}
                                        onChange={(e) => updateField('lastName', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className={styles.grid}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="countryCode">Phone Country Code</label>
                                    <input
                                        type="text"
                                        id="countryCode"
                                        value={formData.countryCode}
                                        onChange={(e) => updateField('countryCode', e.target.value)}
                                        placeholder="+234"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="phoneNumber">Phone Number</label>
                                    <input
                                        type="tel"
                                        id="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={(e) => updateField('phoneNumber', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className={styles.grid}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="alternativeCountryCode">Alt. Country Code</label>
                                    <input
                                        type="text"
                                        id="alternativeCountryCode"
                                        value={formData.alternativeCountryCode}
                                        onChange={(e) => updateField('alternativeCountryCode', e.target.value)}
                                        placeholder="+234"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="alternativePhoneNumber">Alternative Phone</label>
                                    <input
                                        type="tel"
                                        id="alternativePhoneNumber"
                                        value={formData.alternativePhoneNumber}
                                        onChange={(e) => updateField('alternativePhoneNumber', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className={styles.grid}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="dateOfBirth">Date of Birth</label>
                                    <input
                                        type="date"
                                        id="dateOfBirth"
                                        value={formData.dateOfBirth}
                                        onChange={(e) => updateField('dateOfBirth', e.target.value)}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="maritalStatus">Marital Status</label>
                                    <select
                                        id="maritalStatus"
                                        value={formData.maritalStatus}
                                        onChange={(e) => updateField('maritalStatus', e.target.value)}
                                    >
                                        <option value={0}>Single</option>
                                        <option value={1}>Married</option>
                                        <option value={2}>Divorced</option>
                                        <option value={3}>Widowed</option>
                                    </select>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="occupation">Occupation</label>
                                <input
                                    type="text"
                                    id="occupation"
                                    value={formData.occupation}
                                    onChange={(e) => updateField('occupation', e.target.value)}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="street">Street *</label>
                                <input
                                    type="text"
                                    id="street"
                                    value={formData.street}
                                    onChange={(e) => updateField('street', e.target.value)}
                                    required
                                />
                            </div>

                            <div className={styles.grid}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="city">City *</label>
                                    <input
                                        type="text"
                                        id="city"
                                        value={formData.city}
                                        onChange={(e) => updateField('city', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="state">State *</label>
                                    <input
                                        type="text"
                                        id="state"
                                        value={formData.state}
                                        onChange={(e) => updateField('state', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="country">Country *</label>
                                <input
                                    type="text"
                                    id="country"
                                    value={formData.country}
                                    onChange={(e) => updateField('country', e.target.value)}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="nextOfKinName">Next of Kin</label>
                                <input
                                    type="text"
                                    id="nextOfKinName"
                                    value={formData.nextOfKinName}
                                    onChange={(e) => updateField('nextOfKinName', e.target.value)}
                                />
                            </div>

                            <div className={styles.grid}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="nextOfKinCountryCode">Next of Kin Country Code</label>
                                    <input
                                        type="text"
                                        id="nextOfKinCountryCode"
                                        value={formData.nextOfKinCountryCode}
                                        onChange={(e) => updateField('nextOfKinCountryCode', e.target.value)}
                                        placeholder="+234"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="nextOfKinPhoneNumber">Next of Kin Phone</label>
                                    <input
                                        type="tel"
                                        id="nextOfKinPhoneNumber"
                                        value={formData.nextOfKinPhoneNumber}
                                        onChange={(e) => updateField('nextOfKinPhoneNumber', e.target.value)}
                                    />
                                </div>
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
                                    disabled={saving}
                                >
                                    {saving ? 'Saving...' : editingMember ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
