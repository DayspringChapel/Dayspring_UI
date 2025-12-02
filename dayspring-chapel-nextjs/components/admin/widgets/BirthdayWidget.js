'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';
import styles from './BirthdayWidget.module.css';

export default function BirthdayWidget() {
    const [birthdays, setBirthdays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState('');

    useEffect(() => {
        const date = new Date();
        setCurrentMonth(date.toLocaleString('default', { month: 'long' }));
        loadBirthdays();
    }, []);

    const loadBirthdays = async () => {
        try {
            const members = await apiClient.getBioData();
            if (Array.isArray(members)) {
                const currentMonthIndex = new Date().getMonth();

                const upcomingBirthdays = members.filter(member => {
                    if (!member.dateOfBirth) return false;
                    const dob = new Date(member.dateOfBirth);
                    return dob.getMonth() === currentMonthIndex;
                }).sort((a, b) => {
                    const dateA = new Date(a.dateOfBirth).getDate();
                    const dateB = new Date(b.dateOfBirth).getDate();
                    return dateA - dateB;
                });

                setBirthdays(upcomingBirthdays);
            }
        } catch (error) {
            console.error('Failed to load birthdays:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDaySuffix = (day) => {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
            case 1: return "st";
            case 2: return "nd";
            case 3: return "rd";
            default: return "th";
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate();
        return `${day}${getDaySuffix(day)}`;
    };

    if (loading) {
        return <div className={styles.loading}>Loading birthdays...</div>;
    }

    return (
        <div className={styles.widget}>
            <div className={styles.header}>
                <h3>🎂 {currentMonth} Birthdays</h3>
                <span className={styles.count}>{birthdays.length}</span>
            </div>

            {birthdays.length === 0 ? (
                <div className={styles.empty}>
                    <p>No birthdays this month</p>
                </div>
            ) : (
                <div className={styles.list}>
                    {birthdays.map(member => (
                        <div key={member.id} className={styles.item}>
                            <div className={styles.avatar}>
                                {member.firstName[0]}{member.lastName[0]}
                            </div>
                            <div className={styles.info}>
                                <span className={styles.name}>
                                    {member.firstName} {member.lastName}
                                </span>
                                <span className={styles.date}>
                                    {formatDate(member.dateOfBirth)}
                                </span>
                            </div>
                            <button
                                className={styles.wishBtn}
                                title="Send Birthday Wish"
                                onClick={() => alert(`Sending wish to ${member.firstName}...`)}
                            >
                                💌
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
