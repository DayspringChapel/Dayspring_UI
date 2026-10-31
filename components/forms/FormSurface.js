import { appearanceStyle, formAppearance } from '@/lib/formAppearance';
import styles from './FormSurface.module.css';

export default function FormSurface({ settings, children, compact = false }) {
    const appearance = formAppearance(settings);
    return <div className={`${styles.surface} ${compact ? styles.compact : ''} ${styles[appearance.backgroundPattern.toLowerCase()]}`} style={appearanceStyle(settings)}>
        <div className={styles.sheet}>
            {appearance.headerImageDataUrl ? <div className={styles.headerImage}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={appearance.headerImageDataUrl} alt="" />
            </div> : <div className={styles.banner} aria-hidden="true"><span>DAYSPRING</span><span>✦</span></div>}
            <div className={styles.content}>{children}</div>
        </div>
        <p className={styles.brand}>Dayspring OS · Thoughtfully made for community</p>
    </div>;
}
