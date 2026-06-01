'use client';

import { useState } from 'react';
import EventsPanel from '@/components/admin/panels/EventsPanel';
import SermonsPanel from '@/components/admin/panels/SermonsPanel';
import BooksPanel from '@/components/admin/panels/BooksPanel';
import AlbumsPanel from '@/components/admin/panels/AlbumsPanel';
import SeriesPanel from '@/components/admin/panels/SeriesPanel';

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
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    Content Management
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                    Manage all your church content from one place
                </p>
            </div>

            {/* Tabs - Wrap on Mobile */}
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

            {/* Content Area */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {activeTab === 'events' && <EventsPanel />}
                {activeTab === 'sermons' && <SermonsPanel />}
                {activeTab === 'series' && <SeriesPanel />}
                {activeTab === 'books' && <BooksPanel />}
                {activeTab === 'albums' && <AlbumsPanel />}
            </div>
        </div>
    );
}
