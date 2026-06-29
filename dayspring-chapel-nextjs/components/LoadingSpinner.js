'use client';

import styles from './LoadingSpinner.module.css';

export default function LoadingSpinner({ message = 'Loading', minHeight = '360px' }) {
    // Strip any trailing dots/ellipsis from the message — we add our own animated ones
    const text = message.replace(/\.+$/, '');

    return (
        <div className={styles.wrap} style={{ minHeight }}>
            <div className={styles.ring}>
                <span className={styles.dot} />
            </div>
            <div className={styles.messageRow}>
                <p className={styles.message}>{text}</p>
                <span className={styles.d}>.</span>
                <span className={styles.d}>.</span>
                <span className={styles.d}>.</span>
            </div>
        </div>
    );
}
