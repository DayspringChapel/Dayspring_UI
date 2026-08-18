'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/apiClient';
import styles from './ProfileBadge.module.css';

const ROLE_LABELS = {
    superadmin: { label: 'Overseer', color: '#7c3aed' },
    churchadmin: { label: 'Admin', color: '#0d9488' },
    churchmedia: { label: 'Head Media', color: '#db2777' },
};

const CONTENT_ROLE_LABELS = { 1: 'Media', 2: 'Graphics', 3: 'Social Media' };

function initialsFor(name) {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');
}

export default function ProfileBadge() {
    const [contentRole, setContentRole] = useState(null);
    const userData = apiClient.getUserData();

    useEffect(() => {
        const userId = userData?.id || userData?.Id;
        if (!userId) return;
        apiClient.getMemberByUserId(userId)
            .then((member) => setContentRole(member?.contentRole || null))
            .catch(() => setContentRole(null));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!userData) return null;

    const userName = userData.userName || userData.UserName || 'User';
    const roleName = (userData.role?.name || userData.role?.Name || userData.role || userData.Role || '').toString();
    const roleKey = roleName.toLowerCase();

    const systemRole = ROLE_LABELS[roleKey];
    const contentRoleLabel = CONTENT_ROLE_LABELS[contentRole];

    // No system role and no content role assigned — nothing meaningful to badge.
    if (!systemRole && !contentRoleLabel) return null;

    const badge = systemRole || { label: `${contentRoleLabel} Contributor`, color: '#0d9488' };

    return (
        <div className={styles.profileBadge}>
            <span className={styles.avatar} style={{ background: badge.color }}>
                {initialsFor(userName)}
            </span>
            <span className={styles.info}>
                <span className={styles.name}>{userName}</span>
                <span className={styles.role} style={{ color: badge.color }}>{badge.label}</span>
            </span>
        </div>
    );
}
