'use client';

import { useState, useEffect, useMemo } from 'react';
import apiClient from '@/lib/apiClient';
import Image from 'next/image';

function sameDay(dateStr, year, month, day) {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
}

function formatTime(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function CalendarView() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [calendarYears, setCalendarYears] = useState([]);
    const [selectedYearId, setSelectedYearId] = useState('');
    const [loading, setLoading] = useState(true);
    const [hoveredDay, setHoveredDay] = useState(null);

    useEffect(() => {
        Promise.allSettled([
            apiClient.getAllEventsInternal(),
            apiClient.getChurchPrograms(),
            apiClient.getCalendarYears(),
        ]).then(([eventsRes, programsRes, yearsRes]) => {
            setEvents(eventsRes.status === 'fulfilled' ? eventsRes.value : []);
            setPrograms(programsRes.status === 'fulfilled' ? programsRes.value : []);
            setCalendarYears(yearsRes.status === 'fulfilled' ? yearsRes.value : []);
        }).finally(() => setLoading(false));
    }, []);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthName = currentDate.toLocaleString('default', { month: 'long' });
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const today = new Date();

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const handleYearSelect = (e) => {
        const id = e.target.value;
        setSelectedYearId(id);
        if (!id) return;
        const cy = calendarYears.find((y) => y.id === id);
        if (cy) setCurrentDate(new Date(cy.year, 0, 1));
    };

    const itemsByDay = useMemo(() => {
        const map = {};
        for (let day = 1; day <= daysInMonth; day++) {
            const dayEvents = events.filter((e) => sameDay(e.eventDate || e.datetime, year, month, day));
            const dayPrograms = programs.filter((p) => sameDay(p.programDate, year, month, day));
            if (dayEvents.length || dayPrograms.length) {
                map[day] = { events: dayEvents, programs: dayPrograms };
            }
        }
        return map;
    }, [events, programs, year, month, daysInMonth]);

    const renderDays = () => {
        const cells = [];
        for (let i = 0; i < firstDay; i++) {
            cells.push(<div key={`empty-${i}`} className="h-28 bg-gray-50/50 border-b border-r border-gray-100" />);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            const dayItems = itemsByDay[day];

            cells.push(
                <div
                    key={day}
                    className={`relative h-28 border-b border-r border-gray-100 p-2 transition-colors hover:bg-gray-50 ${isToday ? 'bg-orange-50/30' : ''}`}
                    onMouseEnter={() => dayItems && setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay((d) => (d === day ? null : d))}
                >
                    <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-orange-600 text-white' : 'text-gray-700'}`}>
                        {day}
                    </span>

                    {dayItems && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                            {dayItems.events.map((e) => (
                                <span
                                    key={e.id}
                                    title={e.heading}
                                    className={`w-2 h-2 rounded-full ${e.isPublished ? 'bg-orange-500' : 'bg-orange-300 border border-orange-500'}`}
                                />
                            ))}
                            {dayItems.programs.map((p) => (
                                <span key={p.id} title={p.title} className="w-2 h-2 rounded-full bg-blue-500" />
                            ))}
                        </div>
                    )}

                    {hoveredDay === day && dayItems && (
                        <div className="absolute z-20 top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-gray-200 p-3 space-y-2">
                            {dayItems.events.map((e) => (
                                <div key={e.id} className="flex gap-2 items-start">
                                    {e.eventImage && (
                                        <Image src={e.eventImage} alt={e.heading} width={40} height={40} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                                    )}
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{e.heading}</p>
                                        <p className="text-xs text-gray-500">
                                            {formatTime(e.eventDate || e.datetime)} · {e.isPublished ? 'Published' : 'Draft'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {dayItems.programs.map((p) => (
                                <div key={p.id}>
                                    <p className="text-sm font-semibold text-gray-900 truncate">{p.title}</p>
                                    <p className="text-xs text-gray-500">{formatTime(p.programDate)} · Program</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        return cells;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-5">
                <div className="w-11 h-11 border-3 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
                <p className="text-gray-600 text-sm font-medium">Loading calendar...</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">{monthName} {year}</h2>
                <div className="flex items-center gap-3">
                    <select
                        value={selectedYearId}
                        onChange={handleYearSelect}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700"
                    >
                        <option value="">Calendar Year…</option>
                        {calendarYears.map((cy) => (
                            <option key={cy.id} value={cy.id}>{cy.year}{cy.label ? ` — ${cy.label}` : ''}</option>
                        ))}
                    </select>
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
            </div>

            <div className="flex items-center gap-4 px-6 py-2 border-b border-gray-100 text-xs text-gray-500">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-500 inline-block" /> Published Event</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-300 border border-orange-500 inline-block" /> Draft Event</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Program</span>
            </div>

            <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 bg-white">
                {renderDays()}
            </div>
        </div>
    );
}
