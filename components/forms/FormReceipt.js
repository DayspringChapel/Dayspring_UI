'use client';

import { useState } from 'react';
import CertificateDownload from './CertificateDownload';
import styles from './forms.module.css';

export default function FormReceipt({ receipt }) {
    const [copyStatus, setCopyStatus] = useState('');
    async function copy() {
        try { await navigator.clipboard.writeText(receipt.certificateCode); setCopyStatus('Code copied. Save it somewhere private.'); }
        catch { setCopyStatus('Select the code below and copy it manually.'); }
    }
    return <section className={styles.stack} aria-labelledby="receipt-title">
        <h1 id="receipt-title">Your form has been submitted</h1>
        <p>Submission reference: <code className={styles.reference}>{receipt.reference}</code></p>
        {receipt.certificateCode ? <>
            <h2>Save your certificate download code</h2>
            <p>A certificate is attached to this form. Use this private code to collect yours after it has been prepared, approved and issued.</p>
            <code className={styles.code}>{receipt.certificateCode}</code>
            <button type="button" onClick={copy}>Copy my code</button>
            {copyStatus && <p role="status">{copyStatus}</p>}
            <p>You can return to <a href="/certificates/download">Certificate downloads</a> and enter this code. Keep it before leaving this page.</p>
            <CertificateDownload initialCode={receipt.certificateCode} />
        </> : <p>Thank you. Your response has been saved.</p>}
    </section>;
}
