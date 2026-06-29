'use client';

import { useEffect, useMemo, useState } from 'react';
import apiClient from '@/lib/apiClient';
import styles from '../panels/Panel.module.css';
import AdminToast, { useToast } from '../AdminToast';
import AdminConfirm, { useConfirm } from '../AdminConfirm';

// ── Enum maps ────────────────────────────────────────────────────
const APELLATION_OPTIONS = [
    { value: 0, label: 'Mr' }, { value: 1, label: 'Mrs' }, { value: 2, label: 'Ms' },
    { value: 3, label: 'Dr' }, { value: 4, label: 'Prof' }, { value: 5, label: 'Rev' },
    { value: 6, label: 'Pastor' }, { value: 7, label: 'Elder' }, { value: 8, label: 'Deacon' },
    { value: 9, label: 'Deaconess' }, { value: 10, label: 'Minister' }, { value: 11, label: 'Engr' },
];
const OFFICIAL_TYPES = [
    { value: '', label: '— None —' },
    { value: '0', label: 'Pastor' },
    { value: '1', label: 'Minister' },
];
const LEADERSHIP_ROLES = [
    { value: '', label: '— Not specified —' },
    { value: '0', label: 'Lead Pastor' }, { value: '1', label: 'Associate Pastor' },
    { value: '2', label: 'Resident Pastor' }, { value: '3', label: 'Youth Pastor' },
    { value: '4', label: 'Worship Leader' }, { value: '5', label: 'Outreach Coordinator' },
    { value: '6', label: 'Children' }, { value: '7', label: 'Small Groups Coordinator' },
    { value: '8', label: 'Counseling Pastor' }, { value: '9', label: 'Missions Pastor' },
    { value: '10', label: 'Administrative Pastor' },
];

const INITIAL_STEP1 = {
    apellation: 0, firstName: '', lastName: '', dateOfBirth: '',
    gender: 1, maritalStatus: 0,
    street: '', city: '', state: '', country: 'Nigeria',
    countryCode: '+234', phoneNumber: '',
    alternativeCountryCode: '+234', alternativePhoneNumber: '',
    occupation: '', nextOfKinName: '',
    nextOfKinCountryCode: '+234', nextOfKinPhoneNumber: '',
};

const INITIAL_STEP2 = {
    email: '', roleId: '', userId: '',
    unitId: '', smallGroupId: '',
    officialType: '', leadershipRole: '', ministerSmallGroupId: '',
};

export default function MembersPanel() {
    const [bioData, setBioData]               = useState([]);
    const [members, setMembers]               = useState([]);
    const [users, setUsers]                   = useState([]);
    const [roles, setRoles]                   = useState([]);
    const [units, setUnits]                   = useState([]);
    const [smallGroups, setSmallGroups]       = useState([]);
    const [occupations, setOccupations]       = useState([]);
    const [loading, setLoading]               = useState(true);
    const [saving, setSaving]                 = useState(false);
    const [showModal, setShowModal]           = useState(false);
    const [editingMember, setEditingMember]   = useState(null);
    const [step1, setStep1]                   = useState(INITIAL_STEP1);
    const [step2, setStep2]                   = useState(INITIAL_STEP2);
    const [wizardStep, setWizardStep]         = useState(1);
    const [userMode, setUserMode]             = useState('new');
    const [tempPasswordResult, setTempPasswordResult] = useState(null);
    const [filterName, setFilterName]         = useState('');
    const [filterUnit, setFilterUnit]         = useState('');
    const [filterSG, setFilterSG]             = useState('');
    const [assigningId, setAssigningId]       = useState(null);
    const [assignDraft, setAssignDraft]       = useState({});

    const { toast, notify, clearToast } = useToast();
    const { dialog, confirm, closeDialog } = useConfirm();

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [bioRes, membersRes, usersRes, rolesRes, unitsRes, sgRes, occRes] = await Promise.all([
                apiClient.getBioData().catch(() => []),
                apiClient.getMembers().catch(() => []),
                apiClient.getUsers().catch(() => []),
                apiClient.getRoles().catch(() => []),
                apiClient.getUnits().catch(() => []),
                apiClient.getSmallGroups().catch(() => []),
                apiClient.getOccupations().catch(() => []),
            ]);
            setBioData(Array.isArray(bioRes) ? bioRes : []);
            setMembers(Array.isArray(membersRes) ? membersRes : []);
            setUsers(Array.isArray(usersRes) ? usersRes : []);
            setRoles(Array.isArray(rolesRes) ? rolesRes : []);
            setUnits(Array.isArray(unitsRes) ? unitsRes : []);
            setSmallGroups(Array.isArray(sgRes) ? sgRes : []);
            setOccupations(Array.isArray(occRes) ? occRes : []);
        } catch (err) {
            console.error('Failed to load member data:', err);
        } finally {
            setLoading(false);
        }
    };

    const usersById = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);
    const memberByUserId = useMemo(() => new Map(members.map((m) => [m.userId, m])), [members]);
    const unitNameById = useMemo(() => { const m = new Map(); units.forEach((u) => m.set(u.id, u.unitName)); return m; }, [units]);
    const sgNameById = useMemo(() => { const m = new Map(); smallGroups.forEach((g) => m.set(g.id, g.smallGroupName)); return m; }, [smallGroups]);

    const availableUsersForLink = useMemo(() => {
        const existingIds = new Set(members.map((m) => m.userId).filter(Boolean));
        return users.filter((u) => u.id && !existingIds.has(u.id));
    }, [members, users]);

    const enrichedMembers = useMemo(() => bioData.map((bio) => {
        const member = memberByUserId.get(bio.userId);
        const user   = usersById.get(bio.userId);
        return {
            ...bio,
            memberId:     member?.memberId || member?.id || null,
            memberEntity: member,
            unitId:       member?.unitId      || null,
            smallGroupId: member?.smallGroupId || null,
            unitName:     unitNameById.get(member?.unitId)      || null,
            sgName:       sgNameById.get(member?.smallGroupId)  || null,
            userEmail:    user?.email    || '',
            userRole:     user?.roleName || user?.role || '',
        };
    }), [bioData, memberByUserId, usersById, unitNameById, sgNameById]);

    const filteredMembers = useMemo(() => enrichedMembers.filter((m) => {
        const name = `${m.firstName || ''} ${m.lastName || ''}`.toLowerCase();
        if (filterName && !name.includes(filterName.toLowerCase())) return false;
        if (filterUnit && m.unitId !== filterUnit) return false;
        if (filterSG && m.smallGroupId !== filterSG) return false;
        return true;
    }), [enrichedMembers, filterName, filterUnit, filterSG]);

    const buildBioPayload = (overrideUserId) => ({
        userId: overrideUserId ?? step2.userId,
        apellation: Number(step1.apellation),
        firstName: step1.firstName.trim(), lastName: step1.lastName.trim(),
        address: { street: step1.street.trim(), city: step1.city.trim(), state: step1.state.trim(), country: step1.country.trim() },
        phoneNumber: step1.phoneNumber.trim() ? { countryCode: step1.countryCode.trim(), number: step1.phoneNumber.trim() } : null,
        alernativePhoneNumber: step1.alternativePhoneNumber.trim() ? { countryCode: step1.alternativeCountryCode.trim(), number: step1.alternativePhoneNumber.trim() } : null,
        dateOfBirth: step1.dateOfBirth || null,
        occupation: step1.occupation.trim() || null,
        maritalStatus: Number(step1.maritalStatus),
        gender: Number(step1.gender),
        fUllNameOfNextOfKin: step1.nextOfKinName.trim() || null,
        nextOfKinPhonenumber: step1.nextOfKinPhoneNumber.trim() ? { countryCode: step1.nextOfKinCountryCode.trim(), number: step1.nextOfKinPhoneNumber.trim() } : null,
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingMember) {
                await apiClient.updateBioData(buildBioPayload());
                await loadData();
                handleCloseModal();
                return;
            }

            let returnedUserId, returnedUserName, returnedEmail, tempPassword;

            if (userMode === 'new') {
                const result = await apiClient.createMemberWithUser({
                    firstName: step1.firstName.trim(), lastName: step1.lastName.trim(),
                    email: step2.email.trim(),
                    phoneNumber: step1.phoneNumber.trim() || null,
                    unitId: step2.unitId || null, smallGroupId: step2.smallGroupId || null,
                    roleId: step2.roleId || null,
                });
                returnedUserId   = result?.userId    ?? result?.UserId;
                returnedUserName = result?.userName  ?? result?.UserName ?? '';
                returnedEmail    = result?.email     ?? result?.Email    ?? step2.email;
                tempPassword     = result?.tempPassword ?? result?.TempPassword ?? '';
            } else {
                returnedUserId = step2.userId;
                const caller = apiClient.getUserData();
                const modifier = caller?.userName || caller?.email || 'admin';
                await apiClient.createMember({ userId: step2.userId, children: [], modifier, smallGroupId: step2.smallGroupId || null, unitId: step2.unitId || null });
            }

            await apiClient.createBioData(buildBioPayload(returnedUserId));

            if (step2.officialType !== '') {
                await apiClient.createChurchOfficial({
                    userName: returnedUserName || step1.firstName.toLowerCase(),
                    email: returnedEmail || step2.email,
                    smallGroupId: step2.ministerSmallGroupId || null,
                    apellation: Number(step1.apellation),
                    firstName: step1.firstName.trim(), lastName: step1.lastName.trim(),
                    phoneNumber: step1.phoneNumber.trim() ? { countryCode: step1.countryCode, number: step1.phoneNumber } : null,
                    alternativePhonenumber: null,
                    address: { street: step1.street.trim(), city: step1.city.trim(), state: step1.state.trim(), country: step1.country.trim() },
                    dateOfBirth: step1.dateOfBirth || null,
                    occupation: step1.occupation.trim() || '',
                    maritalStatus: Number(step1.maritalStatus),
                    gender: Number(step1.gender),
                    fUllNameOfNextOfKin: step1.nextOfKinName.trim() || null,
                    nextOfKinPhonenumber: null,
                    churchOfficialtype: Number(step2.officialType),
                    leadershipRole: step2.leadershipRole !== '' ? Number(step2.leadershipRole) : null,
                }).catch((err) => console.error('Church official creation (non-fatal):', err));
            }

            await loadData();
            if (userMode === 'new') {
                setTempPasswordResult({ userName: returnedUserName, email: returnedEmail, tempPassword });
                notify('success', 'Member registered successfully!');
            } else {
                handleCloseModal();
                notify('success', editingMember ? 'Member record updated!' : 'Member linked successfully!');
            }
        } catch (err) {
            console.error('Failed to save member:', err);
            notify('error', err.message || 'Failed to save member. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleQuickAssign = async (member) => {
        if (!member.memberId) {
            notify('warning', 'No member record linked. Create member first.');
            return;
        }
        setAssigningId(member.memberId);
        try {
            const draft = assignDraft[member.memberId] || {};
            await apiClient.assignMemberGroups(member.memberId, {
                unitId:       'unitId'       in draft ? draft.unitId       : member.unitId,
                smallGroupId: 'smallGroupId' in draft ? draft.smallGroupId : member.smallGroupId,
            });
            setAssignDraft((p) => { const n = { ...p }; delete n[member.memberId]; return n; });
            await loadData();
            notify('success', 'Group assignment saved.');
        } catch (err) {
            notify('error', err.message || 'Failed to assign. Try again.');
        } finally {
            setAssigningId(null);
        }
    };

    const handleCreate = () => {
        setEditingMember(null); setStep1(INITIAL_STEP1); setStep2(INITIAL_STEP2);
        setWizardStep(1); setUserMode('new'); setTempPasswordResult(null); setShowModal(true);
    };

    const handleEdit = (member) => {
        setEditingMember(member); setTempPasswordResult(null);
        setStep1({
            apellation: member.apellation ?? 0,
            firstName: member.firstName || '', lastName: member.lastName || '',
            dateOfBirth: member.dateOfBirth ? String(member.dateOfBirth).split('T')[0] : '',
            gender: member.gender ?? 1, maritalStatus: member.maritalStatus ?? 0,
            street: member.addressObject?.street || '', city: member.addressObject?.city || '',
            state: member.addressObject?.state || '', country: member.addressObject?.country || 'Nigeria',
            countryCode: member.phoneNumberObject?.countryCode || '+234',
            phoneNumber: member.phoneNumberObject?.number || '',
            alternativeCountryCode: member.alternativePhoneNumberObject?.countryCode || '+234',
            alternativePhoneNumber: member.alternativePhoneNumberObject?.number || '',
            occupation: member.occupation || '',
            nextOfKinName: member.fullNameOfNextOfKin || '',
            nextOfKinCountryCode: member.nextOfKinPhoneNumberObject?.countryCode || '+234',
            nextOfKinPhoneNumber: member.nextOfKinPhoneNumberObject?.number || '',
        });
        setStep2({ ...INITIAL_STEP2, userId: member.userId || '' });
        setWizardStep(1); setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false); setEditingMember(null);
        setStep1(INITIAL_STEP1); setStep2(INITIAL_STEP2);
        setWizardStep(1); setTempPasswordResult(null);
    };

    const handleDelete = async (member) => {
        const yes = await confirm({
            title: 'Delete Member',
            message: `Remove ${member.firstName} ${member.lastName} from the directory? This cannot be undone.`,
            confirmLabel: 'Delete',
            danger: true,
        });
        if (!yes) return;
        try {
            await apiClient.deleteBioData(member.id);
            await loadData();
            notify('success', `${member.firstName} ${member.lastName} removed.`);
        } catch (err) {
            notify('error', err.message || 'Failed to delete. Try again.');
        }
    };

    const s1 = (f) => (e) => setStep1((p) => ({ ...p, [f]: e.target.value }));
    const s2 = (f) => (e) => setStep2((p) => ({ ...p, [f]: e.target.value }));

    if (loading && bioData.length === 0) {
        return <div className={styles.loading}><div className={styles.spinner} /><p>Loading members...</p></div>;
    }

    return (
        <div className={styles.panel}>
            <AdminToast toast={toast} onClose={clearToast} />
            <AdminConfirm dialog={dialog} onClose={closeDialog} />
            <div className={styles.panelHeader}>
                <div>
                    <h2>Members Directory</h2>
                    <p className={styles.cardDescription}>Register new members or update existing records.</p>
                </div>
                <button className={styles.addBtn} onClick={handleCreate}>Add Member</button>
            </div>

            {/* ── Filters ── */}
            <div className={styles.filterBar}>
                <input
                    type="text" placeholder="Search by name…"
                    value={filterName} onChange={(e) => setFilterName(e.target.value)}
                    className={styles.filterInput}
                />
                <select value={filterUnit} onChange={(e) => setFilterUnit(e.target.value)} className={styles.filterSelect}>
                    <option value="">All Units</option>
                    {units.map((u) => <option key={u.id} value={u.id}>{u.unitName}</option>)}
                </select>
                <select value={filterSG} onChange={(e) => setFilterSG(e.target.value)} className={styles.filterSelect}>
                    <option value="">All Small Groups</option>
                    {smallGroups.map((g) => <option key={g.id} value={g.id}>{g.smallGroupName}</option>)}
                </select>
                {(filterName || filterUnit || filterSG) && (
                    <button onClick={() => { setFilterName(''); setFilterUnit(''); setFilterSG(''); }} className={styles.clearFilterBtn}>
                        Clear
                    </button>
                )}
                <span className={styles.filterCount}>{filteredMembers.length} of {bioData.length}</span>
            </div>

            {/* ── Table ── */}
            {filteredMembers.length === 0 ? (
                <div className={styles.empty}>
                    <p>{bioData.length === 0 ? 'No members yet. Add your first member above.' : 'No members match the filters.'}</p>
                </div>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Contact</th>
                                <th>Unit</th>
                                <th>Small Group</th>
                                <th>Role</th>
                                <th>Quick Assign</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMembers.map((member) => {
                                const mid   = member.memberId;
                                const draft = assignDraft[mid] || {};
                                const busy  = assigningId === mid;
                                const hasDraft = mid && mid in assignDraft;
                                return (
                                    <tr key={member.id}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{member.firstName} {member.lastName}</div>
                                            {member.userEmail && <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{member.userEmail}</div>}
                                        </td>
                                        <td>{member.phoneNumber || '—'}</td>
                                        <td>
                                            {member.unitName
                                                ? <span className={styles.badge}>{member.unitName}</span>
                                                : <span style={{ color: '#cbd5e1' }}>—</span>}
                                        </td>
                                        <td>
                                            {member.sgName
                                                ? <span className={`${styles.badge} ${styles.member}`}>{member.sgName}</span>
                                                : <span style={{ color: '#cbd5e1' }}>—</span>}
                                        </td>
                                        <td>
                                            <span className={`${styles.badge} ${member.userRole?.toLowerCase().includes('admin') ? styles.admin : ''}`}>
                                                {member.userRole || 'Member'}
                                            </span>
                                        </td>
                                        <td>
                                            {mid ? (
                                                <div className={styles.quickAssignRow}>
                                                    <select
                                                        value={'unitId' in draft ? (draft.unitId ?? '') : (member.unitId ?? '')}
                                                        onChange={(e) => setAssignDraft((p) => ({ ...p, [mid]: { ...(p[mid] || {}), unitId: e.target.value || null } }))}
                                                        className={styles.inlineSelect}
                                                        disabled={busy}
                                                    >
                                                        <option value="">No unit</option>
                                                        {units.map((u) => <option key={u.id} value={u.id}>{u.unitName}</option>)}
                                                    </select>
                                                    <select
                                                        value={'smallGroupId' in draft ? (draft.smallGroupId ?? '') : (member.smallGroupId ?? '')}
                                                        onChange={(e) => setAssignDraft((p) => ({ ...p, [mid]: { ...(p[mid] || {}), smallGroupId: e.target.value || null } }))}
                                                        className={styles.inlineSelect}
                                                        disabled={busy}
                                                    >
                                                        <option value="">No group</option>
                                                        {smallGroups.map((g) => <option key={g.id} value={g.id}>{g.smallGroupName}</option>)}
                                                    </select>
                                                    <button
                                                        onClick={() => handleQuickAssign(member)}
                                                        disabled={busy || !hasDraft}
                                                        className={styles.assignInlineBtn}
                                                    >
                                                        {busy ? '…' : 'Save'}
                                                    </button>
                                                </div>
                                            ) : (
                                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>No member record</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className={styles.actions}>
                                                <button className={styles.editBtn} onClick={() => handleEdit(member)}>Edit</button>
                                                <button className={styles.deleteBtn} onClick={() => handleDelete(member)}>Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ── Modal ── */}
            {showModal && (
                <div className={styles.modal} onClick={handleCloseModal}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>{editingMember ? 'Edit Member' : 'Add Member'}</h3>
                            <button className={styles.closeBtn} onClick={handleCloseModal}>✕</button>
                        </div>

                        {tempPasswordResult ? (
                            <div className={styles.tempPasswordSuccess}>
                                <div className={styles.tempPasswordBanner}>
                                    <h4>✓ Member account created</h4>
                                    <p>Share these credentials with the member. The password is shown once — it cannot be retrieved again.</p>
                                    <div className={styles.tempPasswordBox}>
                                        <div>
                                            <div className={styles.tempPasswordMeta}>Username: <strong style={{ color: '#e2e8f0' }}>{tempPasswordResult.userName}</strong></div>
                                            <div className={styles.tempPasswordMeta}>Email: <strong style={{ color: '#e2e8f0' }}>{tempPasswordResult.email}</strong></div>
                                        </div>
                                        <div>
                                            <div className={styles.tempPasswordMeta} style={{ marginBottom: '0.25rem' }}>Temporary password:</div>
                                            <div className={styles.tempPasswordValue}>{tempPasswordResult.tempPassword}</div>
                                        </div>
                                    </div>
                                    <div className={styles.tempPasswordWarning}>⚠ Copy this password now. The member must change it on first login.</div>
                                </div>
                                <div className={styles.formActions}>
                                    <button className={styles.submitBtn} onClick={handleCloseModal}>Done</button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className={styles.form}>
                                {!editingMember && (
                                    <div className={styles.stepper}>
                                        {[{ n: 1, title: 'Personal Info', sub: 'Bio data' }, { n: 2, title: 'Church Profile', sub: 'Role & assignment' }].map(({ n, title, sub }) => (
                                            <div key={n} className={`${styles.stepItem} ${wizardStep === n ? styles.stepActive : ''} ${wizardStep > n ? styles.stepDone : ''}`}>
                                                <div className={styles.stepNum}>{wizardStep > n ? '✓' : n}</div>
                                                <div className={styles.stepLabel}>
                                                    <span className={styles.stepLabelTitle}>{title}</span>
                                                    <span className={styles.stepLabelSub}>{sub}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* ── STEP 1: Personal Info ── */}
                                {(wizardStep === 1 || editingMember) && (
                                    <>
                                        <div className={styles.formRow}>
                                            <div className={styles.formGroup}><label>Title</label>
                                                <select value={step1.apellation} onChange={s1('apellation')}>
                                                    {APELLATION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                                </select>
                                            </div>
                                            <div className={styles.formGroup}><label>Gender</label>
                                                <select value={step1.gender} onChange={s1('gender')}>
                                                    <option value={1}>Male</option><option value={2}>Female</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className={styles.formRow}>
                                            <div className={styles.formGroup}><label>First Name *</label>
                                                <input required value={step1.firstName} onChange={s1('firstName')} placeholder="Jane" />
                                            </div>
                                            <div className={styles.formGroup}><label>Last Name *</label>
                                                <input required value={step1.lastName} onChange={s1('lastName')} placeholder="Doe" />
                                            </div>
                                        </div>
                                        <div className={styles.formRow}>
                                            <div className={styles.formGroup}><label>Date of Birth</label>
                                                <input type="date" value={step1.dateOfBirth} onChange={s1('dateOfBirth')} />
                                            </div>
                                            <div className={styles.formGroup}><label>Marital Status</label>
                                                <select value={step1.maritalStatus} onChange={s1('maritalStatus')}>
                                                    <option value={0}>Single</option><option value={1}>Married</option>
                                                    <option value={2}>Divorced</option><option value={3}>Widowed</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className={styles.formRow}>
                                            <div className={styles.formGroup}><label>Phone Code</label>
                                                <input value={step1.countryCode} onChange={s1('countryCode')} placeholder="+234" />
                                            </div>
                                            <div className={styles.formGroup}><label>Phone Number</label>
                                                <input type="tel" value={step1.phoneNumber} onChange={s1('phoneNumber')} placeholder="8012345678" />
                                            </div>
                                        </div>
                                        <div className={styles.formRow}>
                                            <div className={styles.formGroup}><label>Alt. Code</label>
                                                <input value={step1.alternativeCountryCode} onChange={s1('alternativeCountryCode')} placeholder="+234" />
                                            </div>
                                            <div className={styles.formGroup}><label>Alternative Phone</label>
                                                <input type="tel" value={step1.alternativePhoneNumber} onChange={s1('alternativePhoneNumber')} />
                                            </div>
                                        </div>
                                        <div className={styles.formGroup}><label>Occupation</label>
                                            <select value={step1.occupation} onChange={s1('occupation')}>
                                                <option value="">— Select occupation —</option>
                                                {occupations.length > 0
                                                    ? occupations.map((o) => {
                                                        const name = typeof o === 'string' ? o : o.name || o.Name || '';
                                                        return <option key={name} value={name}>{name}</option>;
                                                    })
                                                    : [
                                                        'Accountant','Architect','Artist','Baker','Banker','Carpenter','Chef',
                                                        'Civil Servant','Computer Programmer','Construction Worker','Counselor',
                                                        'Data Scientist','Dentist','Designer','Doctor','Economist','Editor',
                                                        'Electrician','Engineer','Farmer','Firefighter','Graphic Designer',
                                                        'Hairdresser','Human Resources','IT Professional','Journalist','Judge',
                                                        'Lawyer','Librarian','Machinist','Manager','Marketer','Mechanic',
                                                        'Medical Doctor','Military','Musician','Nurse','Optician','Painter',
                                                        'Paramedic','Pharmacist','Photographer','Physician','Pilot','Plumber',
                                                        'Police Officer','Principal','Professor','Psychiatrist','Psychologist',
                                                        'Real Estate Agent','Researcher','Salesperson','Scientist','Secretary',
                                                        'Security Guard','Singer','Social Worker','Software Developer',
                                                        'Student','Surgeon','Tailor','Teacher','Technician','Therapist',
                                                        'Translator','Truck Driver','Urban Planner','Veterinarian',
                                                        'Videographer','Waiter','Waitress','Web Developer','Writer',
                                                        'Unemployed','Other',
                                                    ].map((name) => <option key={name} value={name}>{name}</option>)
                                                }
                                            </select>
                                        </div>
                                        <div className={styles.formGroup}><label>Street Address *</label>
                                            <input required value={step1.street} onChange={s1('street')} placeholder="12 Church Road" />
                                        </div>
                                        <div className={styles.formRow}>
                                            <div className={styles.formGroup}><label>City *</label>
                                                <input required value={step1.city} onChange={s1('city')} />
                                            </div>
                                            <div className={styles.formGroup}><label>State *</label>
                                                <input required value={step1.state} onChange={s1('state')} />
                                            </div>
                                        </div>
                                        <div className={styles.formGroup}><label>Country *</label>
                                            <input required value={step1.country} onChange={s1('country')} />
                                        </div>
                                        <div className={styles.formGroup}><label>Next of Kin</label>
                                            <input value={step1.nextOfKinName} onChange={s1('nextOfKinName')} />
                                        </div>
                                        <div className={styles.formRow}>
                                            <div className={styles.formGroup}><label>Next of Kin Code</label>
                                                <input value={step1.nextOfKinCountryCode} onChange={s1('nextOfKinCountryCode')} placeholder="+234" />
                                            </div>
                                            <div className={styles.formGroup}><label>Next of Kin Phone</label>
                                                <input type="tel" value={step1.nextOfKinPhoneNumber} onChange={s1('nextOfKinPhoneNumber')} />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* ── STEP 2: Church Profile ── */}
                                {wizardStep === 2 && !editingMember && (
                                    <>
                                        <div className={styles.userModeToggle}>
                                            <button type="button" className={`${styles.userModeBtn} ${userMode === 'new' ? styles.active : ''}`} onClick={() => setUserMode('new')}>Create New User</button>
                                            <button type="button" className={`${styles.userModeBtn} ${userMode === 'existing' ? styles.active : ''}`} onClick={() => setUserMode('existing')}>Link Existing User</button>
                                        </div>

                                        {userMode === 'new' ? (
                                            <div className={styles.formRow}>
                                                <div className={styles.formGroup}><label>Email Address *</label>
                                                    <input type="email" required value={step2.email} onChange={s2('email')} placeholder="member@church.org" />
                                                </div>
                                                <div className={styles.formGroup}><label>System Role</label>
                                                    <select value={step2.roleId} onChange={s2('roleId')}>
                                                        <option value="">— No role —</option>
                                                        {roles.map((r) => <option key={r.id ?? r.Id} value={r.id ?? r.Id}>{r.name ?? r.Name}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className={styles.formGroup}><label>User Account *</label>
                                                <select required value={step2.userId} onChange={s2('userId')}>
                                                    <option value="">— Select user —</option>
                                                    {availableUsersForLink.map((u) => <option key={u.id} value={u.id}>{u.userName} — {u.email}</option>)}
                                                </select>
                                                {availableUsersForLink.length === 0 && (
                                                    <p style={{ fontSize: '0.78rem', color: '#b45309', marginTop: '0.4rem' }}>All existing users already have member profiles. Use "Create New User" instead.</p>
                                                )}
                                            </div>
                                        )}

                                        <div className={styles.formRow}>
                                            <div className={styles.formGroup}><label>Unit</label>
                                                <select value={step2.unitId} onChange={s2('unitId')}>
                                                    <option value="">— None —</option>
                                                    {units.map((u) => <option key={u.id} value={u.id}>{u.unitName}</option>)}
                                                </select>
                                            </div>
                                            <div className={styles.formGroup}><label>Small Group</label>
                                                <select value={step2.smallGroupId} onChange={s2('smallGroupId')}>
                                                    <option value="">— None —</option>
                                                    {smallGroups.map((g) => <option key={g.id} value={g.id}>{g.smallGroupName}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        <div className={styles.formGroup}><label>Church Official Designation</label>
                                            <select value={step2.officialType} onChange={s2('officialType')}>
                                                {OFFICIAL_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                            </select>
                                        </div>

                                        {step2.officialType !== '' && (
                                            <>
                                                <div className={styles.formGroup}><label>Leadership Role</label>
                                                    <select value={step2.leadershipRole} onChange={s2('leadershipRole')}>
                                                        {LEADERSHIP_ROLES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                                    </select>
                                                </div>
                                                {step2.officialType === '1' && (
                                                    <div className={styles.formGroup}><label>Minister&apos;s Small Group</label>
                                                        <select value={step2.ministerSmallGroupId} onChange={s2('ministerSmallGroupId')}>
                                                            <option value="">— None —</option>
                                                            {smallGroups.map((g) => <option key={g.id} value={g.id}>{g.smallGroupName}</option>)}
                                                        </select>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </>
                                )}

                                {/* ── Navigation ── */}
                                <div className={styles.formActions}>
                                    {!editingMember && wizardStep === 2 && (
                                        <button type="button" className={styles.backBtn} onClick={() => setWizardStep(1)}>← Back</button>
                                    )}
                                    <button type="button" className={styles.cancelBtn} onClick={handleCloseModal}>Cancel</button>
                                    {!editingMember && wizardStep === 1 ? (
                                        <button
                                            type="button"
                                            className={styles.submitBtn}
                                            onClick={() => {
                                                if (!step1.firstName.trim() || !step1.lastName.trim() || !step1.street.trim() || !step1.city.trim() || !step1.state.trim()) {
                                                    notify('warning', 'Please fill in the required fields: First Name, Last Name, and Address.');
                                                    return;
                                                }
                                                setWizardStep(2);
                                            }}
                                        >
                                            Next →
                                        </button>
                                    ) : (
                                        <button type="submit" className={styles.submitBtn} disabled={saving}>
                                            {saving ? 'Saving…' : editingMember ? 'Update' : 'Create Member'}
                                        </button>
                                    )}
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
