'use client';

import { useState } from 'react';
import EventsPanel from '@/components/admin/panels/EventsPanel';
import SermonsPanel from '@/components/admin/panels/SermonsPanel';
import BooksPanel from '@/components/admin/panels/BooksPanel';
import AlbumsPanel from '@/components/admin/panels/AlbumsPanel';
import SeriesPanel from '@/components/admin/panels/SeriesPanel';
import styles from './content.module.css';

export default function ContentManagement() {
    const [activeTab, setActiveTab] = useState('events');

    const tabs = [
        { id: 'events', label: 'Events', icon: '🎉' },
        { id: 'sermons', label: 'Sermons', icon: '🎤' },
        { id: 'series', label: 'Series', icon: '📺' },
        { id: 'books', label: 'Books', icon: '📚' },
        { id: 'albums', label: 'Albums', icon: '📸' },
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Content Management</h1>
                <p>Manage all your church content from one place</p>
            </div>

            <div className={styles.tabs}>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <span className={styles.tabIcon}>{tab.icon}</span>
                        <span className={styles.tabLabel}>{tab.label}</span>
                    </button>
                ))}
            </div>

            <div className={styles.content}>
                {activeTab === 'events' && <EventsPanel />}
                {activeTab === 'sermons' && <SermonsPanel />}
                {activeTab === 'series' && <SeriesPanel />}
                {activeTab === 'books' && <BooksPanel />}
                {activeTab === 'albums' && <AlbumsPanel />}
            </div>
        </div>
    );
}
