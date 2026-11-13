import test from 'node:test';
import assert from 'node:assert/strict';
import { activeLiveStreams, liveEmbedUrl, safeLiveUrl, liveYouTubeVideoId, LIVE_PAGE_URL } from '../lib/livePlayer.js';

test('the share link is the permanent public watch page', () => {
    assert.equal(LIVE_PAGE_URL, 'https://www.dayspring-vlbc.org/live');
});
test('only enabled, visible streams with trusted HTTPS links can be watched', () => {
    const settings = { youTube: { active: true, url: 'https://youtu.be/abcdefghijk' }, facebook: { active: false, url: 'https://facebook.com/live' } };
    assert.equal(activeLiveStreams(settings)[0].platform, 'youtube');
    assert.equal(activeLiveStreams({ ...settings, hideWatchOnline: true }).length, 0);
    assert.equal(activeLiveStreams({ youtube: { active: true, url: 'javascript:alert(1)' } }).length, 0);
    for (const url of ['https://youtube.com.evil.test/watch?v=abcdefghijk', 'https://evil.test/?youtube.com/watch?v=abcdefghijk', 'https://user:password@youtube.com/watch?v=abcdefghijk', 'http://youtube.com/watch?v=abcdefghijk']) assert.equal(safeLiveUrl('youtube', url), null);
});
test('YouTube playback includes the actual site origin and handles common shared video URLs', () => {
    for (const url of ['https://youtu.be/abcdefghijk', 'https://www.youtube.com/live/abcdefghijk', 'https://www.youtube.com/watch?feature=shared&v=abcdefghijk']) {
        const embed = new URL(liveEmbedUrl({ platform: 'youtube', url }, 'https://www.dayspring-vlbc.org'));
        assert.equal(embed.pathname, '/embed/abcdefghijk'); assert.equal(embed.searchParams.get('origin'), 'https://www.dayspring-vlbc.org');
    }
});
test('restricted embeds and Instagram use a direct provider link', () => {
    assert.equal(liveEmbedUrl({ platform: 'youtube', url: 'https://youtu.be/abcdefghijk', embedAllowed: false }), null);
    assert.equal(liveEmbedUrl({ platform: 'instagram', url: 'https://instagram.com/church/live' }), null);
    assert.equal(liveEmbedUrl({ platform: 'youtube', url: 'https://youtube.com/@church' }), null);
    assert.match(liveEmbedUrl({ platform: 'facebook', url: 'https://facebook.com/church/videos/123' }), /^https:\/\/www.facebook.com\/plugins\/video.php\?/);
});
test('community interactions bind to an exact YouTube video even when playback embedding is restricted', () => {
    assert.equal(liveYouTubeVideoId({ platform: 'youtube', url: 'https://youtu.be/abcdefghijk', embedAllowed: false }), 'abcdefghijk');
    assert.equal(liveYouTubeVideoId({ platform: 'youtube', url: 'https://youtube.com/@church' }), null);
    assert.equal(liveYouTubeVideoId({ platform: 'facebook', url: 'https://facebook.com/live' }), null);
    assert.equal(liveYouTubeVideoId({ platform: 'youtube', url: 'https://youtu.be/short' }), null);
});
