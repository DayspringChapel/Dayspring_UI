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
