'use client';

import { useEffect, useState } from 'react';
import styles from './BrandedSplash.module.css';

const SUBTITLE = {
    login:  'Signing you in',
    logout: 'See you soon',
};

export default function BrandedSplash({ visible, mode = 'login' }) {
    const [mounted, setMounted] = useState(visible);
    const [exiting, setExiting] = useState(false);

    useEffect(() => {
        if (visible) {
            setMounted(true);
            setExiting(false);
        } else {
            setExiting(true);
            const t = setTimeout(() => setMounted(false), 420);
            return () => clearTimeout(t);
        }
    }, [visible]);

    if (!mounted) return null;

    return (
        <div className={`${styles.overlay} ${exiting ? styles.exit : ''}`}>
            <div className={styles.glowRing} />

            <div className={styles.content}>
                {/* Cross icon */}
                <div className={styles.iconWrap}>
                    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Outer rings */}
                        <circle cx="36" cy="36" r="34" stroke="#F58634" strokeWidth="1.5" strokeOpacity="0.25" />
                        <circle cx="36" cy="36" r="28" stroke="#F58634" strokeWidth="1" strokeOpacity="0.12" />
                        {/* Rotating dashes */}
                        <circle cx="36" cy="36" r="34" stroke="#F58634" strokeWidth="1" strokeOpacity="0.18"
                            strokeDasharray="5 9">
                            <animateTransform attributeName="transform" type="rotate"
                                from="0 36 36" to="360 36 36" dur="28s" repeatCount="indefinite" />
                        </circle>
                        {/* Cross */}
                        <rect x="33" y="14" width="6" height="44" rx="3" fill="#F58634" />
                        <rect x="19" y="30" width="34" height="6" rx="3" fill="#F58634" />
                        {/* Center highlight */}
                        <circle cx="36" cy="36" r="5" fill="rgba(245,134,52,0.35)" />
                    </svg>
                </div>

                {/* Church name */}
                <div className={styles.nameBlock}>
                    <span className={styles.nameMain}>DAYSPRING</span>
                    <span className={styles.nameSub}>CHAPEL</span>
                </div>

                {/* Shimmer divider */}
                <div className={styles.divider} />

                {/* Mode text */}
                <p className={styles.subtitle}>
                    {SUBTITLE[mode]}
                    <span className={styles.dot}>.</span>
                    <span className={styles.dot}>.</span>
                    <span className={styles.dot}>.</span>
                </p>

                {/* Branding */}
                <p className={styles.poweredBy}>
                    Powered by{' '}
                    <span className={styles.brand}>Airis</span>
                    {' & '}
                    <span className={styles.brand}>Dayspring Tech</span>
                </p>
            </div>
        </div>
    );
}
