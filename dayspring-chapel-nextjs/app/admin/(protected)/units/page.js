'use client';

import { useEffect, useMemo, useState } from 'react';
import apiClient from '@/lib/apiClient';

const emptyForm = {
    unitName: '',
    description: '',
    unitHead: '',
    countryCode: '+234',
    phoneNumber: '',
    isContentUnit: false,
};

const formatPhone = (phone) => {
    if (!phone) return 'Not set';
    if (typeof phone === 'string') return phone;
    return [phone.countryCode, phone.number].filter(Boolean).join(' ');
};

const getMemberSearchValue = (member) => (
    member ? `${member.label} (${member.memberId})` : ''
);

export default function UnitsPage() {
    const [units, setUnits] = useState([]);
    const [members, setMembers] = useState([]);
    const [bioData, setBioData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingUnit, setEditingUnit] = useState(null);
    const [formData, setFormData] = useState(emptyForm);
    const [unitHeadSearch, setUnitHeadSearch] = useState('');

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

    const filteredMemberOptions = useMemo(() => {
        const search = unitHeadSearch.trim().toLowerCase();
        if (!search) return memberOptions;

        return memberOptions.filter((member) => (
            getMemberSearchValue(member).toLowerCase().includes(search) ||
            member.label.toLowerCase().includes(search) ||
            member.memberId?.toLowerCase().includes(search) ||
            member.userId?.toLowerCase().includes(search)
        ));
    }, [memberOptions, unitHeadSearch]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [unitsData, membersData, bioDataResult] = await Promise.all([
                apiClient.getUnits().catch(() => []),
                apiClient.getMembers().catch(() => []),
                apiClient.getBioData().catch(() => []),
            ]);
            setUnits(Array.isArray(unitsData) ? unitsData : []);
            setMembers(Array.isArray(membersData) ? membersData : []);
            setBioData(Array.isArray(bioDataResult) ? bioDataResult : []);
        } catch (error) {
            console.error('Failed to load units:', error);
            setUnits([]);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setEditingUnit(null);
        setFormData(emptyForm);
        setUnitHeadSearch('');
    };

    const handleHeadInputChange = (value) => {
        setUnitHeadSearch(value);

        if (!value.trim()) {
            setFormData({
                ...formData,
                unitHead: '',
                phoneNumber: '',
            });
            return;
        }

        const selectedMember = memberOptions.find((member) => (
            getMemberSearchValue(member).toLowerCase() === value.trim().toLowerCase() ||
            member.label.toLowerCase() === value.trim().toLowerCase() ||
            member.memberId?.toLowerCase() === value.trim().toLowerCase() ||
            member.userId?.toLowerCase() === value.trim().toLowerCase()
        ));

        if (!selectedMember) {
            setFormData({
                ...formData,
                unitHead: '',
                phoneNumber: '',
            });
            return;
        }

        const phone = selectedMember?.phoneNumber;

        setFormData({
            ...formData,
            unitHead: selectedMember.memberId,
            countryCode: phone?.countryCode || formData.countryCode,
            phoneNumber: phone?.number || formData.phoneNumber,
        });
        setUnitHeadSearch(getMemberSearchValue(selectedMember));
    };

    const handleEdit = (unit) => {
        const phone = unit.unitHeadPhoneNumber;
        setEditingUnit(unit);
        setFormData({
            unitName: unit.unitName || '',
            description: unit.description || '',
            unitHead: unit.unitHeadId || '',
            countryCode: phone?.countryCode || '+234',
            phoneNumber: phone?.number || '',
            isContentUnit: unit.isContentUnit ?? false,
        });
        setUnitHeadSearch(memberNameById.get(unit.unitHeadId) || unit.unitHeadId || '');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);

        const payload = {
            unitName: formData.unitName,
            description: formData.description,
            unitHead: formData.unitHead || null,
            unitHeadPhonenumber: formData.phoneNumber
                ? { countryCode: formData.countryCode, number: formData.phoneNumber }
                : null,
            isContentUnit: formData.isContentUnit,
        };

        try {
            if (editingUnit) {
                await apiClient.updateUnit(editingUnit.id, payload);
            } else {
                await apiClient.createUnit(payload);
            }
            resetForm();
            await loadData();
        } catch (error) {
            console.error('Failed to save unit:', error);
            alert('Failed to save unit. Please check the details and try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (unitId) => {
        if (!confirm('Delete this unit?')) return;

        try {
            await apiClient.deleteUnit(unitId);
            await loadData();
        } catch (error) {
            console.error('Failed to delete unit:', error);
            alert('Failed to delete unit. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 text-gray-600">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-orange-500" />
                <p>Loading units...</p>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-[1400px] px-4">
            <div className="mb-8">
                <h1 className="mb-2 text-2xl font-bold" style={{color:'#f1f5f9',letterSpacing:'-0.02em'}}>Units</h1>
                <p className="text-lg" style={{color:'rgba(255,255,255,0.45)'}}>Manage church departments, heads, and contact details.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[420px_1fr]">
                <form onSubmit={handleSubmit} className="h-fit rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="mb-5 flex items-start justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">{editingUnit ? 'Edit Unit' : 'Add Unit'}</h2>
                            <p className="mt-1 text-sm text-gray-500">Set the unit head and phone number.</p>
                        </div>
                        {editingUnit && (
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
                            <label className="mb-1 block text-sm font-medium text-gray-700">Unit Name *</label>
                            <input
                                required
                                value={formData.unitName}
                                onChange={(event) => setFormData({ ...formData, unitName: event.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                                placeholder="Protocol"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Description *</label>
                            <textarea
                                required
                                rows={3}
                                value={formData.description}
                                onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                                placeholder="What this unit is responsible for"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Unit Head</label>
                            <input
                                list="unit-head-options"
                                value={unitHeadSearch}
                                onChange={(event) => handleHeadInputChange(event.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                                placeholder="Type a name or ID, or leave blank"
                            />
                            <datalist id="unit-head-options">
                                {filteredMemberOptions.map((member) => (
                                    <option key={member.memberId} value={getMemberSearchValue(member)} />
                                ))}
                            </datalist>
                            <p className="mt-1 text-xs text-gray-500">
                                {formData.unitHead ? `Selected: ${memberNameById.get(formData.unitHead) || formData.unitHead}` : 'No unit head selected.'}
                            </p>
                        </div>
                        <div className="grid grid-cols-[110px_1fr] gap-3">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Code</label>
                                <input
                                    value={formData.countryCode}
                                    onChange={(event) => setFormData({ ...formData, countryCode: event.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
                                <input
                                    value={formData.phoneNumber}
                                    onChange={(event) => setFormData({ ...formData, phoneNumber: event.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                                    placeholder="8012345678"
                                />
                            </div>
                        </div>
                        <label className="flex items-center gap-3 cursor-pointer select-none rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
                            <input
                                type="checkbox"
                                checked={formData.isContentUnit}
                                onChange={(event) => setFormData({ ...formData, isContentUnit: event.target.checked })}
                                className="h-4 w-4 accent-orange-600"
                            />
                            <span className="text-sm font-semibold text-orange-800">
                                Content / Media Unit
                            </span>
                            <span className="ml-auto text-xs text-orange-600 font-medium">
                                Members eligible for content personnel roles
                            </span>
                        </label>
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : editingUnit ? 'Update Unit' : 'Create Unit'}
                        </button>
                    </div>
                </form>

                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    {units.length === 0 ? (
                        <div className="p-10 text-center text-gray-500">No units found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="border-b border-gray-200 p-4 text-left text-sm font-semibold uppercase tracking-wide text-gray-600">Unit</th>
                                        <th className="border-b border-gray-200 p-4 text-left text-sm font-semibold uppercase tracking-wide text-gray-600">Description</th>
                                        <th className="border-b border-gray-200 p-4 text-left text-sm font-semibold uppercase tracking-wide text-gray-600">Type</th>
                                        <th className="border-b border-gray-200 p-4 text-left text-sm font-semibold uppercase tracking-wide text-gray-600">Head</th>
                                        <th className="border-b border-gray-200 p-4 text-left text-sm font-semibold uppercase tracking-wide text-gray-600">Phone</th>
                                        <th className="border-b border-gray-200 p-4 text-left text-sm font-semibold uppercase tracking-wide text-gray-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {units.map((unit) => (
                                        <tr key={unit.id} className="hover:bg-gray-50">
                                            <td className="border-t border-gray-200 p-4 text-sm font-semibold text-gray-900">{unit.unitName}</td>
                                            <td className="max-w-md border-t border-gray-200 p-4 text-sm text-gray-600">{unit.description}</td>
                                            <td className="border-t border-gray-200 p-4">
                                                {unit.isContentUnit ? (
                                                    <span className="inline-block rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-orange-700">
                                                        Content
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-gray-400">—</span>
                                                )}
                                            </td>
                                            <td className="border-t border-gray-200 p-4 text-sm text-gray-700">{memberNameById.get(unit.unitHeadId) || unit.unitHeadId || 'Not set'}</td>
                                            <td className="border-t border-gray-200 p-4 text-sm text-gray-700">{formatPhone(unit.unitHeadPhoneNumber)}</td>
                                            <td className="border-t border-gray-200 p-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEdit(unit)}
                                                        className="rounded-lg bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-100"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(unit.id)}
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
