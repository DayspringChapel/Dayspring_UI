'use client';

import { useState } from 'react';
import apiClient from '@/lib/apiClient';
import { EventProvider } from '@/context/EventContext';
import EventsPanel from '@/components/admin/panels/EventsPanel';
import SermonsPanel from '@/components/admin/panels/SermonsPanel';
import BooksPanel from '@/components/admin/panels/BooksPanel';
import AlbumsPanel from '@/components/admin/panels/AlbumsPanel';
import SeriesPanel from '@/components/admin/panels/SeriesPanel';

function resolveRole() {
    const userData = apiClient.getUserData();
    if (!userData) return 'churchAdmin';
    const r = userData.role || userData.Role || {};
    const name = (typeof r === 'string' ? r : r.name || r.Name || '').toLowerCase();
    if (name.includes('super')) return 'superAdmin';
    if (name.includes('media')) return 'churchMedia';
    return 'churchAdmin';
}

const ALL_TABS = [
    { id: 'events',  label: 'Events',  icon: '🎉', roles: 'all' },
    { id: 'sermons', label: 'Sermons', icon: '🎤', roles: 'all' },
    { id: 'series',  label: 'Series',  icon: '📺', roles: 'all' },
    { id: 'books',   label: 'Books',   icon: '📚', roles: 'all' },
    { id: 'albums',  label: 'Albums',  icon: '📸', roles: 'all' },
];

export default function ContentManagement() {
    const role = resolveRole();
    const tabs = ALL_TABS.filter(t => t.roles === 'all' || t.roles.includes(role));
    const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? 'sermons');

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    Content Management
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                    Manage all your church content from one place
                </p>
            </div>

            <div className="mb-6 border-b-2 border-gray-200">
                <div className="flex flex-wrap gap-2 pb-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={`
                                flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3
                                font-semibold text-sm sm:text-base rounded-lg
                                transition-all duration-200
                                ${activeTab === tab.id
                                    ? 'bg-orange-100 text-orange-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-orange-600'
                                }
                            `}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <span className="text-lg">{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {activeTab === 'events'  && <EventProvider><EventsPanel /></EventProvider>}
                {activeTab === 'sermons' && <SermonsPanel />}
                {activeTab === 'series'  && <SeriesPanel />}
                {activeTab === 'books'   && <BooksPanel />}
                {activeTab === 'albums'  && <AlbumsPanel />}
            </div>
        </div>
    );
}
