'use client';

import { useState } from 'react';
import apiClient from '@/lib/apiClient';

function resolveRole() {
    const userData = apiClient.getUserData();
    if (!userData) return 'member';
    const r = userData.role || userData.Role || {};
    const name = (typeof r === 'string' ? r : r.name || r.Name || '').toLowerCase();
    if (name.includes('super')) return 'superAdmin';
    if (name.includes('media')) return 'churchMedia';
    if (name.includes('admin')) return 'churchAdmin';
    return 'member';
}

const TIPS = {
    superAdmin: [
        'Assign roles from Sidebar → User Roles — churchMedia can only go to members of the content unit.',
        'Approvals split by stage: Admin Queue then Super Admin Queue — content needs both to publish.',
        'Fine-tune what each role can do from Sidebar → Permissions.',
        'Birthdays and the Calendar are visible to everyone, not just admins.',
    ],
    churchAdmin: [
        'Add a new member from Members → Add Member.',
        'Content waiting on your approval shows up in Approvals → Admin Queue.',
        'Pending Appointments and Requisitions on your dashboard link straight to the action.',
        'Uploading media (images, sermons, event fliers) is done by the Media team, not Admin.',
    ],
    churchMedia: [
        'Upload new media from Media → Upload Media — it starts as a Draft.',
        'Submit drafts for review, then track their progress in Workflow.',
        'Once fully approved, publish it from Publishing → Ready to Publish.',
        'Assign content roles (Media, Graphics, Social Media) to your unit from Content Unit.',
    ],
    member: [
        'If you have a content role, upload your work from Quick Actions above.',
        'Track the status of what you have submitted under My Content.',
        'No content role yet? Ask the Media team to assign you one.',
        'Birthdays and the Calendar are available to you from the sidebar.',
    ],
};

const TITLE = {
    superAdmin: 'Quick Guide for Super Admins',
    churchAdmin: 'Quick Guide for Admins',
    churchMedia: 'Quick Guide for Media Team',
    member: 'Quick Guide',
};

export default function QuickGuideWidget() {
    const [expanded, setExpanded] = useState(false);
    const role = resolveRole();
    const tips = TIPS[role] || TIPS.member;

    return (
        <div style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: '1rem', overflow: 'hidden',
        }}>
            <button
                onClick={() => setExpanded((v) => !v)}
                style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.9rem 1.1rem', background: 'transparent', border: 'none', cursor: 'pointer',
                    color: '#f1f5f9', fontWeight: 800, fontSize: '0.85rem', fontFamily: 'inherit',
                }}
            >
                <span>💡 {TITLE[role]}</span>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>{expanded ? '▲' : '▼'}</span>
            </button>
            {expanded && (
                <ul style={{ margin: 0, padding: '0 1.1rem 1rem 1.6rem', listStyle: 'disc' }}>
                    {tips.map((tip, i) => (
                        <li key={i} style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.8rem', lineHeight: 1.6, marginBottom: '0.4rem' }}>
                            {tip}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
