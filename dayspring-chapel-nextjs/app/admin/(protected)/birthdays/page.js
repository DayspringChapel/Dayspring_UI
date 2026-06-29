'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';
import BirthdayCard from '@/components/admin/BirthdayCard';
import styles from './birthdays.module.css';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function BirthdaysPage() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadMembers();
    }, []);

    const loadMembers = async () => {
        try {
            const data = await apiClient.getBioData();
            setMembers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load members:', error);

            // Handle 404 gracefully
            if (error.message?.includes('404')) {
                console.warn('BioData endpoint not found. Birthday calendar will show empty state.');
            }

            setMembers([]);
        } finally {
            setLoading(false);
        }
    };

    const getFilteredBirthdays = () => {
        return members.filter(member => {
            if (!member.dateOfBirth) return false;

            const dob = new Date(member.dateOfBirth);
            const monthMatch = dob.getMonth() === selectedMonth;

            if (searchTerm) {
                const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
                const searchMatch = fullName.includes(searchTerm.toLowerCase());
                return monthMatch && searchMatch;
            }

            return monthMatch;
        }).sort((a, b) => {
            const dateA = new Date(a.dateOfBirth).getDate();
            const dateB = new Date(b.dateOfBirth).getDate();
            return dateA - dateB;
        });
    };

    const getStats = () => {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentDate = today.getDate();

        const thisMonth = members.filter(m => {
            if (!m.dateOfBirth) return false;
            return new Date(m.dateOfBirth).getMonth() === currentMonth;
        }).length;

        const thisWeek = members.filter(m => {
            if (!m.dateOfBirth) return false;
            const dob = new Date(m.dateOfBirth);
            if (dob.getMonth() !== currentMonth) return false;
            const day = dob.getDate();
            return day >= currentDate && day < currentDate + 7;
        }).length;

        const todayBirthdays = members.filter(m => {
            if (!m.dateOfBirth) return false;
            const dob = new Date(m.dateOfBirth);
            return dob.getMonth() === currentMonth && dob.getDate() === currentDate;
        }).length;

        const upcoming = members.filter(m => {
            if (!m.dateOfBirth) return false;
            const dob = new Date(m.dateOfBirth);
            if (dob.getMonth() !== currentMonth) return false;
            const day = dob.getDate();
            return day >= currentDate && day < currentDate + 7;
        }).length;

        return { thisMonth, thisWeek, todayBirthdays, upcoming };
    };

    const handlePreviousMonth = () => {
        if (selectedMonth === 0) {
            setSelectedMonth(11);
            setSelectedYear(selectedYear - 1);
        } else {
            setSelectedMonth(selectedMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (selectedMonth === 11) {
            setSelectedMonth(0);
            setSelectedYear(selectedYear + 1);
        } else {
            setSelectedMonth(selectedMonth + 1);
        }
    };

    const handleToday = () => {
        const today = new Date();
        setSelectedMonth(today.getMonth());
        setSelectedYear(today.getFullYear());
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const filteredBirthdays = getFilteredBirthdays();
    const stats = getStats();

    if (loading) {
        return <LoadingSpinner message="Loading birthday records" />;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>🎂 Birthday Calendar</h1>
                <p>View and manage member birthdays</p>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>📅</div>
                    <div className={styles.statContent}>
                        <h3>This Month</h3>
                        <p className={styles.statValue}>{stats.thisMonth}</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>📆</div>
                    <div className={styles.statContent}>
                        <h3>This Week</h3>
                        <p className={styles.statValue}>{stats.thisWeek}</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>🎉</div>
                    <div className={styles.statContent}>
                        <h3>Today</h3>
                        <p className={styles.statValue}>{stats.todayBirthdays}</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>⏰</div>
                    <div className={styles.statContent}>
                        <h3>Next 7 Days</h3>
                        <p className={styles.statValue}>{stats.upcoming}</p>
                    </div>
                </div>
            </div>

            <div className={styles.controls}>
                <div className={styles.navigation}>
                    <button onClick={handlePreviousMonth} className={styles.navBtn}>
                        ← Previous
                    </button>
                    <div className={styles.currentMonth}>
                        <h2>{monthNames[selectedMonth]} {selectedYear}</h2>
                    </div>
                    <button onClick={handleNextMonth} className={styles.navBtn}>
                        Next →
                    </button>
                    <button onClick={handleToday} className={styles.todayBtn}>
                        Today
                    </button>
                </div>

                <div className={styles.searchBar}>
                    <input
                        type="text"
                        placeholder="Search by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
            </div>

            {filteredBirthdays.length === 0 ? (
                <div className={styles.empty}>
                    <p>
                        {searchTerm
                            ? `No birthdays found for "${searchTerm}" in ${monthNames[selectedMonth]}`
                            : `No birthdays in ${monthNames[selectedMonth]} ${selectedYear}`
                        }
                    </p>
                </div>
            ) : (
                <div className={styles.birthdaysGrid}>
                    {filteredBirthdays.map(member => (
                        <BirthdayCard key={member.id} member={member} />
                    ))}
                </div>
            )}
        </div>
    );
}
