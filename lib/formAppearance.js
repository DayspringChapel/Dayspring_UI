export const FORM_THEMES = [
    { name: 'Lavender', backgroundColor: '#f3effa', accentColor: '#7c3aed' },
    { name: 'Dayspring', backgroundColor: '#fff4eb', accentColor: '#b95b1d' },
    { name: 'Ocean', backgroundColor: '#edf5ff', accentColor: '#1d4ed8' },
    { name: 'Garden', backgroundColor: '#edf7f0', accentColor: '#166534' },
    { name: 'Rose', backgroundColor: '#fff0f4', accentColor: '#be185d' },
    { name: 'Slate', backgroundColor: '#f1f5f9', accentColor: '#334155' },
];
export function formAppearance(settings = {}) {
    const value = settings.appearance || {};
    const color = (input, fallback) => /^#[0-9a-f]{6}$/i.test(input || '') ? input : fallback;
    return {
        backgroundColor: color(value.backgroundColor, FORM_THEMES[0].backgroundColor),
        accentColor: color(value.accentColor, FORM_THEMES[0].accentColor),
        backgroundPattern: ['Plain', 'Dots', 'Grid'].includes(value.backgroundPattern) ? value.backgroundPattern : 'Plain',
        headerImageDataUrl: /^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=\s]+$/.test(value.headerImageDataUrl || '') ? value.headerImageDataUrl : null,
    };
}
export function appearanceStyle(settings) {
    const appearance = formAppearance(settings);
    const rgb = appearance.accentColor.slice(1).match(/../g).map((hex) => parseInt(hex, 16) / 255).map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    const luminance = rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
    return { '--form-background': appearance.backgroundColor, '--form-accent': appearance.accentColor, '--form-on-accent': luminance > 0.179 ? '#14263b' : '#ffffff' };
}
