'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
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
                {/* Church logo */}
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
                    </svg>
                    <Image
                        src="/logo.png"
                        alt="Dayspring Chapel"
                        width={56}
                        height={30}
                        className={styles.logoImage}
                        priority
                    />
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
