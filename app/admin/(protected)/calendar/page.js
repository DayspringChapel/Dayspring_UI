'use client';

import CalendarView from '@/components/admin/CalendarView';

export default function CalendarPage() {
    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
            <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    Calendar
                </h1>
                <p className="text-sm sm:text-base text-slate-400">
                    All church events and programs at a glance. Select a day to see its agenda.
                </p>
            </div>

            <CalendarView />
        </div>
    );
}
