'use client';

import { useEffect, useMemo, useState } from 'react';
import apiClient from '@/lib/apiClient';
import styles from './GroupLeaderSection.module.css';

export default function GroupLeaderSection() {
    const [loading, setLoading]           = useState(true);
    const [units, setUnits]               = useState([]);
    const [smallGroups, setSmallGroups]   = useState([]);
    const [members, setMembers]           = useState([]);
    const [bioDataMap, setBioDataMap]     = useState(new Map());
    const [groupType, setGroupType]       = useState('unit');
    const [selectedGroupId, setSelectedGroupId] = useState('');
    const [assigning, setAssigning]       = useState(null);
    const [message, setMessage]           = useState(null);

    useEffect(() => { loadAll(); }, []);

    const loadAll = async () => {
        try {
            const [unitsRes, sgRes, membersRes, bioRes] = await Promise.allSettled([
                apiClient.getUnits(),
                apiClient.getSmallGroups(),
                apiClient.getMembers(),
                apiClient.getBioData(),
            ]);

            const v = (r) => (r.status === 'fulfilled' ? r.value || [] : []);

            const u  = v(unitsRes);
            const sg = v(sgRes);
            const m  = v(membersRes);
            const bd = v(bioRes);

            setUnits(u);
            setSmallGroups(sg);
            setMembers(m);

            const map = new Map();
            bd.forEach((b) => {
                if (b.userId) {
                    map.set(b.userId, {
                        firstName: b.firstName || '',
                        lastName:  b.lastName  || '',
                    });
                }
            });
            setBioDataMap(map);
        } finally {
            setLoading(false);
        }
    };

    const groups = groupType === 'unit' ? units : smallGroups;

    const selectedGroup = useMemo(
        () => groups.find((g) => g.id === selectedGroupId) ?? null,
        [groups, selectedGroupId]
    );

    const currentHeadMemberId = useMemo(() => {
        if (!selectedGroup) return null;
        return groupType === 'unit'
            ? (selectedGroup.unitHeadId || '')
            : (selectedGroup.smallGroupHeadMemberId || '');
    }, [selectedGroup, groupType]);

    const membersInGroup = useMemo(() => {
        if (!selectedGroupId) return [];
        return members
            .filter((m) =>
                groupType === 'unit'
                    ? m.unitId === selectedGroupId
                    : m.smallGroupId === selectedGroupId
            )
            .map((m) => {
                const bio  = bioDataMap.get(m.userId) ?? {};
                const name = [bio.firstName, bio.lastName].filter(Boolean).join(' ') ||
                             `Member ${(m.memberId || m.id || '').slice(0, 6)}…`;
                const mId  = m.memberId || m.id;
                return {
                    ...m,
                    memberId: mId,
                    name,
                    isHead: mId && (mId === currentHeadMemberId),
                };
            });
    }, [members, selectedGroupId, groupType, currentHeadMemberId, bioDataMap]);

    const switchType = (type) => {
        setGroupType(type);
        setSelectedGroupId('');
        setMessage(null);
    };

    const handleGroupChange = (id) => {
        setSelectedGroupId(id);
        setMessage(null);
    };

    const assignHead = async (memberId) => {
        if (!selectedGroup) return;
        setAssigning(memberId);
        setMessage(null);
        try {
            if (groupType === 'unit') {
                await apiClient.updateUnit(selectedGroupId, {
                    UnitName:    selectedGroup.unitName    || selectedGroup.unitName,
                    Description: selectedGroup.description || '',
                    UnitHead:    memberId,
                });
            } else {
                await apiClient.assignSmallGroupLeader(selectedGroupId, memberId, null);
            }
            setMessage({ type: 'success', text: 'Head assigned. The previous head designation has been revoked.' });
            await loadAll();
        } catch (err) {
            setMessage({ type: 'error', text: err.message || 'Failed to assign head. Please try again.' });
        } finally {
            setAssigning(null);
        }
    };

    return (
        <div className={styles.section}>
            <header className={styles.header}>
                <div>
                    <h3 className={styles.title}>Assign Group / Unit Head</h3>
                    <p className={styles.sub}>
                        Choose a group type, select a group, then designate a member as head.
                        Only members belonging to the selected group are eligible.
                    </p>
                </div>
            </header>

            {/* ── Type toggle ── */}
            <div className={styles.typeToggle}>
                <button
                    type="button"
                    className={`${styles.typeBtn} ${groupType === 'unit' ? styles.active : ''}`}
                    onClick={() => switchType('unit')}
                >
                    <span className={styles.typeBtnIcon}>🏛️</span>
                    Ministry Units
                </button>
                <button
                    type="button"
                    className={`${styles.typeBtn} ${groupType === 'smallGroup' ? styles.active : ''}`}
                    onClick={() => switchType('smallGroup')}
                >
                    <span className={styles.typeBtnIcon}>🤝</span>
                    Small Groups
                </button>
            </div>

            {/* ── Group dropdown ── */}
            <div className={styles.selectWrap}>
                <select
                    className={styles.groupSelect}
                    value={selectedGroupId}
                    onChange={(e) => handleGroupChange(e.target.value)}
                >
                    <option value="">
                        — Select a {groupType === 'unit' ? 'ministry unit' : 'small group'} —
                    </option>
                    {groups.map((g) => (
                        <option key={g.id} value={g.id}>
                            {g.unitName || g.smallGroupName || g.name || g.id}
                        </option>
                    ))}
                </select>
                {groups.length === 0 && !loading && (
                    <p className={styles.hint}>
                        No {groupType === 'unit' ? 'units' : 'small groups'} found.
                    </p>
                )}
            </div>

            {/* ── Status message ── */}
            {message && (
                <div className={`${styles.msg} ${styles[message.type]}`}>
                    {message.type === 'success' ? '✓ ' : '✕ '}{message.text}
                </div>
            )}

            {/* ── Member list ── */}
            {loading ? (
                <div className={styles.loader}>
                    <span className={styles.loaderDot} />
                    <span>Loading group data…</span>
                </div>
            ) : selectedGroupId ? (
                membersInGroup.length === 0 ? (
                    <div className={styles.empty}>
                        No members assigned to this {groupType === 'unit' ? 'unit' : 'small group'} yet.
                    </div>
                ) : (
                    <ul className={styles.memberList}>
                        {membersInGroup.map((m) => (
                            <li
                                key={m.memberId}
                                className={`${styles.memberRow} ${m.isHead ? styles.headRow : ''}`}
                            >
                                <div className={styles.memberInfo}>
                                    <span className={styles.avatar}>
                                        {m.name.charAt(0).toUpperCase()}
                                    </span>
                                    <span className={styles.memberName}>{m.name}</span>
                                    {m.isHead && (
                                        <span className={styles.headBadge}>Current Head</span>
                                    )}
                                </div>
                                {!m.isHead && (
                                    <button
                                        type="button"
                                        className={styles.assignBtn}
                                        onClick={() => assignHead(m.memberId)}
                                        disabled={!!assigning}
                                    >
                                        {assigning === m.memberId ? (
                                            <>
                                                <span className={styles.btnSpinner} />
                                                Assigning…
                                            </>
                                        ) : (
                                            'Make Head'
                                        )}
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                )
            ) : (
                <div className={styles.placeholder}>
                    Select a {groupType === 'unit' ? 'unit' : 'small group'} above to see its members.
                </div>
            )}
        </div>
    );
}
