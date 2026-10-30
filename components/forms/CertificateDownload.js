'use client';

import { useRef, useState } from 'react';
import { retrieveCertificate, saveCertificate } from '@/lib/formCertificates';
import styles from './forms.module.css';

export default function CertificateDownload({ initialCode = '' }) {
    const [code, setCode] = useState(initialCode);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const pending = useRef(false);
    async function download(event) {
        event.preventDefault();
        if (pending.current) return;
        pending.current = true;
        setBusy(true); setError(''); setMessage('');
        try {
            const result = await retrieveCertificate(code.trim());
            if (result.status === 'Pending') setMessage(result.message);
            else { saveCertificate(result.file); setMessage('Your certificate download has started.'); }
        } catch (err) { setError(err.message || 'Unable to connect. Please try again.'); }
        finally { pending.current = false; setBusy(false); }
    }
    return <form onSubmit={download} className={styles.stack}>
        <label className={styles.label}>Certificate download code
            <input value={code} onChange={(event) => setCode(event.target.value)} autoComplete="off" autoCapitalize="characters"
                spellCheck={false} required maxLength={100} placeholder="Enter the code from your form confirmation" />
        </label>
        <p className={styles.muted}>Keep your code private. It gives access to your certificate once it has been issued.</p>
        <button disabled={busy || !code.trim()} type="submit">{busy ? 'Checking certificate…' : 'Download my certificate'}</button>
        {message && <p role="status" className={styles.notice}>{message}</p>}
        {error && <p role="alert" className={styles.error}>{error}</p>}
    </form>;
}
