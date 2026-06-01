'use client';

import { useEffect, useMemo, useState } from 'react';
import apiClient from '@/lib/apiClient';

const emptyForm = {
    smallGroupName: '',
    description: '',
    leaderMemberId: '',
    countryCode: '+234',
    phoneNumber: '',
};

const formatPhone = (phone) => {
    if (!phone) return 'Not set';
    if (typeof phone === 'string') return phone;
    return [phone.countryCode, phone.number].filter(Boolean).join(' ');
};

export default function SmallGroupsPage() {
    const [smallGroups, setSmallGroups] = useState([]);
    const [members, setMembers] = useState([]);
    const [bioData, setBioData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);
    const [formData, setFormData] = useState(emptyForm);

    useEffect(() => {
        loadData();
    }, []);

    const memberOptions = useMemo(() => {
        const bioByUserId = new Map(bioData.map((bio) => [bio.userId, bio]));

        return members.map((member) => {
            const bio = bioByUserId.get(member.userId);
            const name = [bio?.firstName, bio?.lastName].filter(Boolean).join(' ').trim();

            return {
                ...member,
                label: name || member.userId || member.memberId,
                phoneNumber: bio?.phoneNumberObject || null,
            };
        });
    }, [members, bioData]);

    const memberNameById = useMemo(() => {
        const map = new Map();
        memberOptions.forEach((member) => {
            map.set(member.memberId, member.label);
            map.set(member.userId, member.label);
        });
        return map;
    }, [memberOptions]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [groupsData, membersData, bioDataResult] = await Promise.all([
                apiClient.getSmallGroups().catch(() => []),
                apiClient.getMembers().catch(() => []),
                apiClient.getBioData().catch(() => []),
            ]);
            setSmallGroups(Array.isArray(groupsData) ? groupsData : []);
            setMembers(Array.isArray(membersData) ? membersData : []);
            setBioData(Array.isArray(bioDataResult) ? bioDataResult : []);
        } catch (error) {
            console.error('Failed to load small groups:', error);
            setSmallGroups([]);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setEditingGroup(null);
        setFormData(emptyForm);
    };

    const handleLeaderChange = (memberId) => {
        const selectedMember = memberOptions.find((member) => member.memberId === memberId);
        const phone = selectedMember?.phoneNumber;

        setFormData({
            ...formData,
            leaderMemberId: memberId,
            countryCode: phone?.countryCode || formData.countryCode,
            phoneNumber: phone?.number || formData.phoneNumber,
        });
    };

    const handleEdit = (group) => {
        const phone = group.smallGroupHeadPhoneNumber;
        setEditingGroup(group);
        setFormData({
            smallGroupName: group.smallGroupName || '',
            description: group.description || '',
            leaderMemberId: group.smallGroupHeadMemberId || '',
            countryCode: phone?.countryCode || '+234',
            phoneNumber: phone?.number || '',
        });
    };

    const phonePayload = {
        countryCode: formData.countryCode,
        number: formData.phoneNumber,
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);

        try {
            if (editingGroup) {
                await apiClient.updateSmallGroup(editingGroup.id, {
                    smallGroupName: formData.smallGroupName,
                    description: formData.description,
                    smallGroupHeadMemberId: formData.leaderMemberId,
                    smallGroupHeadPhoneNumber: phonePayload,
                });
            } else {
                await apiClient.createSmallGroup({
                    smallGroupName: formData.smallGroupName,
                    description: formData.description,
                });
            }
            resetForm();
            await loadData();
        } catch (error) {
            console.error('Failed to save small group:', error);
            alert('Failed to save small group. Please check the details and try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleAssignLeader = async (group) => {
        if (!formData.leaderMemberId) {
            alert('Select a leader first.');
            return;
        }

        setSaving(true);
        try {
            await apiClient.assignSmallGroupLeader(group.id, formData.leaderMemberId, phonePayload);
            await loadData();
        } catch (error) {
            console.error('Failed to assign leader:', error);
            alert('Failed to assign leader. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (groupId) => {
        if (!confirm('Delete this small group?')) return;

        try {
            await apiClient.deleteSmallGroup(groupId);
            await loadData();
        } catch (error) {
            console.error('Failed to delete small group:', error);
            alert('Failed to delete small group. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 text-gray-600">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-orange-500" />
                <p>Loading small groups...</p>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-[1400px] px-4">
            <div className="mb-8">
                <h1 className="mb-2 text-2xl font-bold text-gray-900">Small Groups</h1>
                <p className="text-lg text-gray-500">Manage care groups and assign small group leaders.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[420px_1fr]">
                <form onSubmit={handleSubmit} className="h-fit rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="mb-5 flex items-start justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">{editingGroup ? 'Edit Small Group' : 'Add Small Group'}</h2>
                            <p className="mt-1 text-sm text-gray-500">
                                {editingGroup ? 'Update details and leader assignment.' : 'Create the group first, then assign a leader.'}
                            </p>
                        </div>
                        {editingGroup && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200"
                            >
                                New
                            </button>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Group Name *</label>
                            <input
                                required
                                value={formData.smallGroupName}
                                onChange={(event) => setFormData({ ...formData, smallGroupName: event.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                                placeholder="Grace Cell"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                rows={3}
                                value={formData.description}
                                onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                                placeholder="Meeting location, area, or notes"
                            />
                        </div>

                        {editingGroup && (
                            <>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Leader *</label>
                                    <select
                                        required
                                        value={formData.leaderMemberId}
                                        onChange={(event) => handleLeaderChange(event.target.value)}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                                    >
                                        <option value="">Select member</option>
                                        {memberOptions.map((member) => (
                                            <option key={member.memberId} value={member.memberId}>
                                                {member.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-[110px_1fr] gap-3">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">Code *</label>
                                        <input
                                            required
                                            value={formData.countryCode}
                                            onChange={(event) => setFormData({ ...formData, countryCode: event.target.value })}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">Phone *</label>
                                        <input
                                            required
                                            value={formData.phoneNumber}
                                            onChange={(event) => setFormData({ ...formData, phoneNumber: event.target.value })}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                                            placeholder="8012345678"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : editingGroup ? 'Update Small Group' : 'Create Small Group'}
                        </button>

                        {editingGroup && (
                            <button
                                type="button"
                                onClick={() => handleAssignLeader(editingGroup)}
                                disabled={saving}
                                className="w-full rounded-xl bg-green-50 px-5 py-3 font-semibold text-green-800 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Assign Leader Only
                            </button>
                        )}
                    </div>
                </form>

                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    {smallGroups.length === 0 ? (
                        <div className="p-10 text-center text-gray-500">No small groups found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="border-b border-gray-200 p-4 text-left text-sm font-semibold uppercase tracking-wide text-gray-600">Group</th>
                                        <th className="border-b border-gray-200 p-4 text-left text-sm font-semibold uppercase tracking-wide text-gray-600">Description</th>
                                        <th className="border-b border-gray-200 p-4 text-left text-sm font-semibold uppercase tracking-wide text-gray-600">Leader</th>
                                        <th className="border-b border-gray-200 p-4 text-left text-sm font-semibold uppercase tracking-wide text-gray-600">Phone</th>
                                        <th className="border-b border-gray-200 p-4 text-left text-sm font-semibold uppercase tracking-wide text-gray-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {smallGroups.map((group) => (
                                        <tr key={group.id} className="hover:bg-gray-50">
                                            <td className="border-t border-gray-200 p-4 text-sm font-semibold text-gray-900">{group.smallGroupName}</td>
                                            <td className="max-w-md border-t border-gray-200 p-4 text-sm text-gray-600">{group.description || 'No description'}</td>
                                            <td className="border-t border-gray-200 p-4 text-sm text-gray-700">{memberNameById.get(group.smallGroupHeadMemberId) || group.smallGroupHeadMemberId || 'Not assigned'}</td>
                                            <td className="border-t border-gray-200 p-4 text-sm text-gray-700">{formatPhone(group.smallGroupHeadPhoneNumber)}</td>
                                            <td className="border-t border-gray-200 p-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEdit(group)}
                                                        className="rounded-lg bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-100"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(group.id)}
                                                        className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
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
                </div>
            </div>
        </div>
    );
}
