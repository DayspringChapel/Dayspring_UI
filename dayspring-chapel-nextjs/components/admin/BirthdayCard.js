'use client';

import styles from './BirthdayCard.module.css';

export default function BirthdayCard({ member }) {
    const formatBirthday = (dateString) => {
        const date = new Date(dateString);
        const options = { month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    const getDayOfWeek = (dateString) => {
        const date = new Date(dateString);
        const currentYear = new Date().getFullYear();
        const birthdayThisYear = new Date(currentYear, date.getMonth(), date.getDate());
        return birthdayThisYear.toLocaleDateString('en-US', { weekday: 'long' });
    };

    const getAge = (dateString) => {
        const birthDate = new Date(dateString);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    };

    const handleSendWish = () => {
        alert(`Sending birthday wish to ${member.firstName} ${member.lastName}...`);
    };

    if (!member || !member.dateOfBirth) return null;

    const initials = `${member.firstName?.[0] || ''}${member.lastName?.[0] || ''}`;
    const age = getAge(member.dateOfBirth);

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <div className={styles.avatar}>
                    {initials}
                </div>
                <div className={styles.info}>
                    <h3 className={styles.name}>
                        {member.firstName} {member.lastName}
                    </h3>
                    <p className={styles.date}>
                        {formatBirthday(member.dateOfBirth)}
                    </p>
                </div>
            </div>

            <div className={styles.details}>
                <div className={styles.detailItem}>
                    <span className={styles.label}>Day:</span>
                    <span className={styles.value}>{getDayOfWeek(member.dateOfBirth)}</span>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.label}>Turning:</span>
                    <span className={styles.value}>{age} years old</span>
                </div>
            </div>

            <div className={styles.actions}>
                <button
                    className={styles.wishBtn}
                    onClick={handleSendWish}
                >
                    💌 Send Wish
                </button>
            </div>
        </div>
    );
}
