import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeLivestreamSettings } from '../lib/livestreamSettings.js';

test('backend YouTube settings remain visible to public and admin platform pickers', () => {
    const result = normalizeLivestreamSettings({ youTube: { active: true, url: 'https://youtube.com/watch?v=local', description: 'Live' } });
    assert.equal(result.youtube.active, true);
    assert.equal(result.youtube.url, 'https://youtube.com/watch?v=local');
    assert.equal('youTube' in result, false);
});

test('cleared platform settings keep stable defaults and exclude unrelated server fields', () => {
    const result = normalizeLivestreamSettings({ youtube: { active: false }, hideWatchOnline: true, unrelated: 'private' });
    assert.equal(result.youtube.url, '');
    assert.equal(result.hideWatchOnline, true);
    assert.equal(result.social.youTubeChannelId, '');
    assert.equal('unrelated' in result, false);
});

test('automatic/manual choice and provider playback restrictions survive normalization', () => {
    const result = normalizeLivestreamSettings({ youTube: { active: true, embedAllowed: false }, youTubeAutoDetect: false, youTubeDetectionState: 'Manual' });
    assert.equal(result.youTubeAutoDetect, false);
    assert.equal(result.youTubeDetectionState, 'Manual');
    assert.equal(result.youtube.embedAllowed, false);
});
