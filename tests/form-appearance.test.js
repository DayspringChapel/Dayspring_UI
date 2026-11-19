import test from 'node:test';
import assert from 'node:assert/strict';
import { formSettings, formSavePayload } from '../lib/formCertificates.js';
import { formAppearance, appearanceStyle } from '../lib/formAppearance.js';

test('editing legacy stored settings preserves access policy and nested appearance', () => {
    const settings = formSettings({ settingsJson: JSON.stringify({ AccessMode: 'Restricted', AllowedUsers: ['user-id'], RequireApproval: true, Appearance: { BackgroundColor: '#edf5ff', AccentColor: '#1d4ed8', BackgroundPattern: 'Dots' } }) });
    const payload = formSavePayload({ title: 'Welcome', fields: [], settings });
    assert.equal(payload.settings.accessMode, 'Restricted');
    assert.deepEqual(payload.settings.allowedUsers, ['user-id']);
    assert.equal(payload.settings.requireApproval, true);
    assert.equal(formAppearance(payload.settings).backgroundColor, '#edf5ff');
});

test('appearance excludes external or active image URLs and invalid CSS values', () => {
    const value = formAppearance({ appearance: { accentColor: 'red; background:url(x)', backgroundPattern: 'url(x)', headerImageDataUrl: 'javascript:alert(1)' } });
    assert.equal(value.accentColor, '#7c3aed');
    assert.equal(value.backgroundPattern, 'Plain');
    assert.equal(value.headerImageDataUrl, null);
});

test('button text contrast follows light and dark accent colors', () => {
    assert.equal(appearanceStyle({ appearance: { accentColor: '#ffffff' } })['--form-on-accent'], '#14263b');
    assert.equal(appearanceStyle({ appearance: { accentColor: '#000000' } })['--form-on-accent'], '#ffffff');
});

test('mid-tone custom accents retain readable button text',()=>{
    const luminance=hex=>{const rgb=hex.slice(1).match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;};
    for(const accentColor of ['#777777','#808080','#d9752c','#7c3aed','#ffffff','#000000']){
        const foreground=appearanceStyle({appearance:{accentColor}})['--form-on-accent'];const a=luminance(accentColor),b=luminance(foreground);
        assert.ok((Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5,accentColor);
    }
});
