'use client';
import { useState } from 'react';
import { FORM_THEMES, formAppearance } from '@/lib/formAppearance';
import styles from './FormComposer.module.css';

export default function FormThemeEditor({ settings = {}, onChange }) {
    const [error, setError] = useState('');
    const appearance = formAppearance(settings);
    const update = (patch) => onChange({ ...settings, appearance: { ...appearance, ...patch } });
    async function imageChanged(event) {
        const file = event.target.files?.[0]; if (!file) return;
        setError('');
        if (!['image/png', 'image/jpeg'].includes(file.type) || file.size > 307200) { setError('Choose a PNG or JPEG image of up to 300 KB.'); event.target.value = ''; return; }
        try {
            const data = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });
            const image = new Image(); image.src = data; await image.decode();
            if (image.naturalWidth < 32 || image.naturalHeight < 32 || image.naturalWidth * image.naturalHeight > 8000000) throw new Error('Choose an image between 32 pixels and 8 megapixels.');
            update({ headerImageDataUrl: data });
        } catch (e) { setError(e.message || 'This image could not be read.'); }
    }
    return <div className={styles.themeEditor}>
        <div><h4>Choose a theme</h4><p>Start with a palette, then make it your own.</p></div>
        <div className={styles.palettes}>{FORM_THEMES.map((theme) => <button key={theme.name} type="button" aria-label={`${theme.name} theme`} aria-pressed={theme.accentColor === appearance.accentColor && theme.backgroundColor === appearance.backgroundColor} onClick={() => update(theme)} style={{ background: theme.backgroundColor, borderColor: theme.accentColor }}><span style={{ background: theme.accentColor }} /><strong>{theme.name}</strong></button>)}</div>
        <div className={styles.colorRow}><label>Accent color<input type="color" value={appearance.accentColor} onChange={(e) => update({ accentColor: e.target.value })} /></label><label>Background color<input type="color" value={appearance.backgroundColor} onChange={(e) => update({ backgroundColor: e.target.value })} /></label></div>
        <label>Background pattern<select value={appearance.backgroundPattern} onChange={(e) => update({ backgroundPattern: e.target.value })}>{['Plain', 'Dots', 'Grid'].map((value) => <option key={value}>{value}</option>)}</select></label>
        <label>Header image<input type="file" accept="image/png,image/jpeg" onChange={imageChanged} /></label><p>PNG or JPEG, up to 300 KB. A wide image works best. Your image and colors also appear on the published form.</p>
        {appearance.headerImageDataUrl && <button type="button" className={styles.secondary} onClick={() => update({ headerImageDataUrl: null })}>Remove header image</button>}
        {error && <p role="alert" className={styles.error}>{error}</p>}
    </div>;
}
