import CertificateDownload from '@/components/forms/CertificateDownload';
import styles from '@/components/forms/forms.module.css';

export const metadata = { title: 'Certificate downloads', robots: { index: false, follow: false }, referrer: 'no-referrer' };

export default function CertificateDownloadsPage() {
    return <div className={styles.page}><section className={`${styles.card} ${styles.stack}`}>
        <h1>Download your certificate</h1>
        <p>Enter the code you received after submitting your form. Your certificate becomes available here once the church has issued it.</p>
        <CertificateDownload />
    </section></div>;
}
