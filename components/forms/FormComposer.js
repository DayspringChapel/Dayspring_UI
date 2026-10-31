'use client';
import { useEffect, useState } from 'react';
import BuilderFields from './BuilderFields';
import SectionedFields from './SectionedFields';
import PublicationSettings from './PublicationSettings';
import FormThemeEditor from './FormThemeEditor';
import FormSurface from './FormSurface';
import { appearanceStyle, formAppearance } from '@/lib/formAppearance';
import styles from './FormComposer.module.css';
import { addSection } from '@/lib/formStructure';

const TABS = [{ id: 'build', label: 'Questions' }, { id: 'theme', label: 'Theme' }, { id: 'settings', label: 'Settings' }, { id: 'certificate', label: 'Certificate' }];
export default function FormComposer({ draft, onChange, onSave, onClose, busy, error }) {
    const [section, setSection] = useState('build'); const [answers, setAnswers] = useState({}); const [preview, setPreview] = useState(false);
    const [initial] = useState(() => JSON.stringify(draft)); const dirty = initial !== JSON.stringify(draft);
    const appearance = formAppearance(draft.settings);
    const canAddSection = draft.fields.length + (draft.fields.some((field) => ['section', 'pagebreak'].includes(field.type)) ? 1 : 2) <= 40;
    useEffect(() => {
        if (!dirty) return;
        const warn = (event) => { event.preventDefault(); event.returnValue = ''; };
        window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn);
    }, [dirty]);
    function close() { if (!dirty || window.confirm('Discard your unsaved form changes?')) onClose(); }
    function addField(type = 'text') {
        if (draft.fields.length >= 40) return;
        setSection('build');
        if (type === 'section') { if (!canAddSection) return; onChange({ ...draft, fields: addSection(draft.fields) }); return; }
        onChange({ ...draft, fields: [...draft.fields, { key: `field_${crypto.randomUUID().slice(0, 8)}`, label: type === 'section' ? 'New section' : '', type, required: false, options: [] }] });
    }
    return <form onSubmit={onSave} className={styles.composer} style={appearanceStyle(draft.settings)} aria-busy={busy}>
        <header className={styles.topbar}><div className={styles.titleGroup}><button type="button" className={styles.back} disabled={busy} onClick={close} aria-label="Back to forms">←</button><div><p className={styles.eyebrow}>FORM STUDIO</p><h2>{draft.id ? 'Edit your form' : 'Create something meaningful'}</h2><small>{dirty ? 'Changes not saved yet' : draft.id ? 'Saved form · Ready to edit' : 'Start with a title and your first question'}</small></div></div><div className={styles.topActions}><button type="button" className={styles.secondary} aria-pressed={preview} onClick={() => setPreview(!preview)}>Preview</button><button className={styles.primary} disabled={busy} type="submit">{busy ? 'Saving…' : 'Save form'}</button></div></header>
        <nav className={styles.tabs} aria-label="Form setup">{TABS.map((tab) => <button type="button" key={tab.id} className={section === tab.id ? styles.activeTab : styles.tab} aria-current={section === tab.id ? 'page' : undefined} onClick={() => setSection(tab.id)}>{tab.label}</button>)}</nav>
        {error && <p className={styles.error} role="alert">{error}</p>}
        <div className={`${styles.layout} ${preview ? styles.withPreview : ''}`} inert={busy}>
            <div className={styles.canvas}>
                {section === 'build' && <>
                    <div className={styles.questionToolbar}><span>{draft.fields.length} / 40 fields</span><div><button type="button" disabled={busy || draft.fields.length >= 40} onClick={() => addField()}>＋ Add a question</button><button type="button" disabled={busy || !canAddSection} onClick={() => addField('section')}>Add section</button><button type="button" onClick={() => setSection('theme')}>Customize theme</button></div></div>
                    <div className={styles.titleCard}>
                        {appearance.headerImageDataUrl && <div className={styles.cover}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={appearance.headerImageDataUrl} alt="Form header" />
                        </div>}
                        <div className={styles.basics}><label><span>Form title <span aria-hidden="true">*</span></span><input placeholder="Untitled form" required maxLength={200} value={draft.title} onChange={(e) => onChange({ ...draft, title: e.target.value })} /></label><label>Introduction<textarea placeholder="Form description — tell people what to expect" maxLength={2000} value={draft.description} onChange={(e) => onChange({ ...draft, description: e.target.value })} /></label></div>
                    </div>
                    <BuilderFields fields={draft.fields} onChange={(fields) => onChange({ ...draft, fields })} disabled={busy} />
                    <button className={styles.addField} type="button" disabled={busy || draft.fields.length >= 40} onClick={() => addField()}>＋ Add a question</button>
                    <p className={styles.hint}>Save your changes, then publish from your form workspace. No approval is required.</p>
                </>}
                {section === 'theme' && <div className={styles.editor}><h3>Make it feel like you</h3><p>Set the colors and background your respondents will see.</p><FormThemeEditor settings={draft.settings} onChange={(settings) => onChange({ ...draft, settings })} /></div>}
                {section === 'settings' && <div className={styles.editor}><h3>Access & publishing</h3><p>Choose who can respond and when your form is available.</p><PublicationSettings settings={draft.settings || {}} onChange={(settings) => onChange({ ...draft, settings })} /></div>}
                {section === 'certificate' && <div className={styles.editor}><h3>Certificate after completion</h3><label className={styles.toggleCard}><span><strong>Enable certificate downloads</strong><small>Give each person a private download code after their response is saved.</small></span><input type="checkbox" role="switch" checked={draft.attachCertificate} onChange={(e) => onChange({ ...draft, attachCertificate: e.target.checked })} /></label><p>Prepare the certificate from the response inbox or Certificates. You can prepare, review and issue certificates from this form’s Certificates tab. Existing codes remain valid when this setting changes.</p></div>}
            </div>
            {(preview || section === 'theme') && <aside className={styles.previewColumn}><div className={styles.previewLabel}>LIVE PREVIEW <span>Respondent view</span></div><FormSurface compact settings={draft.settings}><h3>{draft.title || 'Your form title'}</h3><p>{draft.description || 'Your introduction will appear here.'}</p><div className={styles.previewFields}><SectionedFields key={draft.fields.filter((f) => f.type === 'section').map((f) => f.key).join('-')} preview fields={draft.fields} answers={answers} onChange={setAnswers} /></div><small className={styles.previewFoot}>Preview only · No responses are saved</small></FormSurface></aside>}
        </div>
    </form>;
}
