'use client';

import CalendarView from '@/components/admin/CalendarView';

export default function CalendarPage() {
    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    Calendar
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                    All church events and programs at a glance. Hover a day to see details.
                </p>
            </div>

            <CalendarView />
        </div>
    );
}
