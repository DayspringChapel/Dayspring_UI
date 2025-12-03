'use client';

import { useState } from 'react';

export default function AppointmentCalendar({ appointments, onViewDetails }) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month, 1).getDay();
    };

    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const monthName = currentDate.toLocaleString('default', { month: 'long' });
    const year = currentDate.getFullYear();

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const getAppointmentsForDate = (day) => {
        return appointments.filter(app => {
            if (!app.dateOfAppointment) return false;
            const appDate = new Date(app.dateOfAppointment);
            return (
                appDate.getDate() === day &&
                appDate.getMonth() === currentDate.getMonth() &&
                appDate.getFullYear() === currentDate.getFullYear()
            );
        });
    };

    const renderCalendarDays = () => {
        const days = [];

        // Empty cells for previous month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-32 bg-gray-50/50 border-b border-r border-gray-100"></div>);
        }

        // Days of current month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayAppointments = getAppointmentsForDate(day);
            const isToday =
                day === new Date().getDate() &&
                currentDate.getMonth() === new Date().getMonth() &&
                currentDate.getFullYear() === new Date().getFullYear();

            days.push(
                <div key={day} className={`h-32 border-b border-r border-gray-100 p-2 transition-colors hover:bg-gray-50 ${isToday ? 'bg-orange-50/30' : ''}`}>
                    <div className="flex justify-between items-start mb-1">
                        <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-orange-600 text-white' : 'text-gray-700'}`}>
                            {day}
                        </span>
                        {dayAppointments.length > 0 && (
                            <span className="text-xs font-bold text-gray-400">{dayAppointments.length}</span>
                        )}
                    </div>
                    <div className="space-y-1 overflow-y-auto max-h-[80px] custom-scrollbar">
                        {dayAppointments.map(app => (
                            <button
                                key={app.id}
                                onClick={() => onViewDetails(app)}
                                className={`w-full text-left text-xs px-2 py-1 rounded truncate transition-all ${app.status === 1 ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                                    app.status === 2 ? 'bg-red-100 text-red-800 hover:bg-red-200' :
                                        'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                    }`}
                            >
                                {app.appointmentTime?.slice(0, 5)} {app.firstname}
                            </button>
                        ))}
                    </div>
                </div>
            );
        }

        return days;
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {monthName} {year}
                </h2>
                <div className="flex gap-2">
                    <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 bg-white">
                {renderCalendarDays()}
            </div>
        </div>
    );
}
