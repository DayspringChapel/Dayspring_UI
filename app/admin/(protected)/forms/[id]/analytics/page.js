'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import styles from './analytics.module.css';
const number = (value) => value == null ? '—' : Number(value).toLocaleString(undefined, { maximumFractionDigits:2 });
const answerLabel = (value, type) => ['checkbox','consent'].includes(type) ? value === 'true' ? type === 'consent' ? 'Agreed' : 'Checked' : value === 'false' ? type === 'consent' ? 'Did not agree' : 'Not checked' : value : value;
function AnswerBars({ rows = [], basis, type }) {
    return <ul className={styles.bars}>{rows.map((row) => { const percentage = row.percentage ?? (basis ? Math.round(row.count / basis * 1000) / 10 : 0); return <li key={row.value}><div className={styles.barLabel}><span>{answerLabel(row.value,type)}</span><strong>{row.count} <small>({number(percentage)}%)</small></strong></div><div className={styles.track} aria-hidden="true"><div style={{ width:`${Math.min(100,percentage)}%` }} /></div></li>; })}</ul>;
}
function QuestionResult({ question, index }) {
    const matrix = ['grid','checkboxgrid'].includes(question.type); const rows = question.rows || [];
    return <article className={styles.question} aria-labelledby={`question-${index}`}><header className={styles.questionHeader}><div><p className={styles.eyebrow}>QUESTION {index + 1}{question.historical ? ' · PREVIOUS DEFINITION' : ''}</p><h3 id={`question-${index}`}>{question.label}</h3></div><span className={styles.kind}>{({ yesno:'Yes / No', radio:'Single choice', select:'Dropdown', multiselect:'Multiple selections', grid:'Likert / choice grid', checkboxgrid:'Multiple-selection grid', rating:'Rating', scale:'Numeric scale' })[question.type] || 'Answer summary'}</span></header>
        <p className={styles.answerMeta}><strong>{number(question.answered)}</strong> answered · <strong>{number(question.skipped)}</strong> skipped{question.notApplicable > 0 && <> · {question.notApplicable} not applicable / other revisions</>}</p>
        {question.historical && <p className={styles.hint}>This saved question definition differs from the current form. Its answers are kept separate.</p>}
        {question.numbers && <dl className={styles.numberStats}>{[['Average',question.numbers.average],['Median',question.numbers.median],['Lowest',question.numbers.minimum],['Highest',question.numbers.maximum]].map(([label,value]) => <div key={label}><dt>{label}</dt><dd>{number(value)}</dd></div>)}</dl>}
        {question.multipleSelections && <p className={styles.hint}>Respondents could select more than one answer. Percentages use people who answered {matrix ? 'each row' : 'this question'} and may total more than 100%.</p>}
        {matrix ? rows.length ? rows.map((row) => <section className={styles.matrixRow} key={row.label}><h4>{row.label}</h4><p className={styles.hint}>{row.answered} answered · {row.skipped} skipped</p><AnswerBars rows={row.distribution} basis={row.answered} type={question.type} /></section>) : <p>No row summaries available yet.</p> : question.distribution?.length ? <AnswerBars rows={question.distribution} basis={question.answered} type={question.type} /> : <p className={styles.hint}>{question.answered ? 'Open-ended answers and uploads can be read in Responses.' : 'No answers to this question yet.'}</p>}
        {question.distributionTruncated && <p className={styles.hint}>Showing the 50 most frequent numeric values. Summary statistics include every numeric answer.</p>}
    </article>;
}
export default function AnalyticsPage({ embedded = false }) {
    const { id } = useParams(); const [data,setData] = useState(null); const [error,setError] = useState(''); const [busy,setBusy] = useState(false); const [search,setSearch] = useState(''); const [reload,setReload] = useState(0);
    useEffect(() => { const controller=new AbortController(); apiClient.request(`/api/v1/forms/${id}/analytics`,{signal:controller.signal}).then((value) => { setData(value); setError(''); }).catch((e) => { if (!controller.signal.aborted) setError(e.message); }); return () => controller.abort(); },[id,reload]);
    async function download(format) {
        setError(''); setBusy(true);
        try {
            if (format === 'svg') await apiClient.downloadFile(`/api/v1/forms/${id}/qr`, 'dayspring-form-qr.svg');
            else {
                const response = await fetch(`/api/backend/api/v1/forms/${id}/qr`, { cache: 'no-store' });
                if (!response.ok) throw new Error('QR download failed. Check your permission and the public origin configuration.');
                const url = URL.createObjectURL(await response.blob());
                try {
                    const image = new Image(); image.src = url; await image.decode();
                    const canvas = document.createElement('canvas'); canvas.width = 1600; canvas.height = 1600;
                    canvas.getContext('2d').drawImage(image, 0, 0, 1600, 1600);
                    const a = document.createElement('a'); a.href = canvas.toDataURL('image/png'); a.download = 'dayspring-form-qr.png'; a.click();
                } finally { URL.revokeObjectURL(url); }
            }
        } catch (e) { setError(e.message); } finally { setBusy(false); }
    }

    const questions = (data?.fields || []).filter((field) => field.label.toLowerCase().includes(search.toLowerCase()));
    return <section className={`${styles.analysis} ${embedded ? styles.embedded : ''}`}><header className={styles.header}><div><p className={styles.eyebrow}>UNDERSTAND YOUR ANSWERS</p><h2>Question analysis</h2><p>{data?.title || 'Results for each question in your form'}</p></div><div className={styles.actions}><button onClick={() => setReload((value) => value + 1)}>Refresh results</button>{!embedded && <a href={`/admin/forms/${id}?view=Responses`}>Back to responses</a>}</div></header>
        {error && <p role="alert" className={styles.error}>{error}</p>}{!data ? <p role="status">{error ? 'Results could not be loaded. Use Refresh results to try again.' : 'Analyzing saved answers…'}</p> : <>
        <div className={styles.summary}><div><strong>{number(data.total)}</strong><span>saved responses</span></div><div><strong>{data.fields.filter((field) => !field.historical).length}</strong><span>current questions</span></div><p>Counts and percentages describe the answers people selected. Skipped and conditional questions are tracked separately.</p></div>
        <label className={styles.search}>Find a question<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search question text" /></label>
        {questions.map((question,index) => <QuestionResult key={question.id || question.key} question={question} index={index} />)}{questions.length === 0 && <article className={styles.question}><h3>{search ? 'No matching questions' : 'No question results yet'}</h3><p>{search ? 'Try another question name.' : 'Question summaries will appear here when the form has questions.'}</p></article>}
        <details className={styles.secondary}><summary>Response activity & review status</summary><p>Submission activity is separate from the question results above. Dates use UTC.</p><h3>Review status</h3><AnswerBars rows={(data.statuses || []).map((row) => ({ value:row.status,count:row.count }))} basis={data.total} /><h3>Recent weekly responses</h3><AnswerBars rows={(data.weekly || []).slice(-12).map((row) => ({ value:row.date.slice(0,10),count:row.count }))} basis={data.total} /></details>
        <details className={styles.secondary}><summary>Share this form with a QR code</summary><p>The QR opens the respondent page. Access and collection dates still apply.</p><div className={styles.actions}><button disabled={busy} onClick={() => download('svg')}>Download SVG</button><button disabled={busy} onClick={() => download('png')}>Download PNG</button></div></details>
        <p className={styles.footnote}>Updated {new Date(data.generatedAt).toLocaleString()}. Percentages exclude skipped answers. Different saved question definitions are reported separately.</p></>}
    </section>;
}
