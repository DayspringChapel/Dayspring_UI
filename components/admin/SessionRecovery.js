'use client';
import { useEffect, useState } from 'react';
import styles from './Management.module.css';

export default function SessionRecovery({ error, onRetry, onSignIn }) {
    const [now, setNow] = useState(() => Date.now());
    const retryAt = error?.retryAt || 0;
    useEffect(() => {
        if (retryAt <= Date.now()) return;
        const timer = setInterval(() => { const time = Date.now(); setNow(time); if (time >= retryAt) clearInterval(timer); }, 1000);
        return () => clearInterval(timer);
    }, [retryAt]);
    const seconds = Math.max(0, Math.ceil((retryAt - now) / 1000));
    const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
    const limited = error?.status === 429;
    const unavailable = error?.status >= 500;
    const heading = offline ? 'You appear to be offline' : limited ? 'Session checks temporarily paused' : unavailable ? 'Server temporarily unavailable' : 'Session check interrupted';
    const message = offline ? 'Reconnect to the internet, then try again.' : limited ? 'Dayspring is limiting session checks. Please wait for the countdown before trying again.' : unavailable ? 'Dayspring’s server could not confirm your session. Please try again in a moment.' : 'We could not reach Dayspring’s server to confirm your session. Please try again.';
    return <section className={`${styles.page} ${styles.sessionRecovery}`}><article className={styles.card} role="alert"><p className={styles.eyebrow}>DAYSPRING ADMIN</p><h1>{heading}</h1><p>{message}</p><div className={styles.actions}><button className={styles.primary} disabled={limited && seconds > 0} onClick={onRetry}>{limited && seconds > 0 ? `Try again in ${seconds}s` : 'Try again'}</button><button onClick={onSignIn}>Sign in again</button></div></article></section>;
}
