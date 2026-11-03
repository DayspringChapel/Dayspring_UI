'use client';
import styles from './Management.module.css';

export default function SessionRecovery({ error, onRetry, onSignIn }) {
    const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
    const unavailable = error?.status >= 500;
    const heading = offline ? 'You appear to be offline' : unavailable ? 'Server temporarily unavailable' : 'Session check interrupted';
    const message = offline ? 'Reconnect to the internet, then try again.' : unavailable ? 'Dayspring’s server could not confirm your session. Please try again in a moment.' : 'We could not reach Dayspring’s server to confirm your session. Please try again.';
    return <section className={`${styles.page} ${styles.sessionRecovery}`}><article className={styles.card} role="alert"><p className={styles.eyebrow}>DAYSPRING ADMIN</p><h1>{heading}</h1><p>{message}</p><div className={styles.actions}><button className={styles.primary} onClick={onRetry}>Try again</button><button onClick={onSignIn}>Sign in again</button></div></article></section>;
}
