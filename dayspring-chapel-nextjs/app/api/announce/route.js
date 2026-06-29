// Posts a live-stream announcement to configured social media platforms.
// Required env vars:
//   FB_PAGE_ID                   — Facebook Page ID
//   FB_PAGE_ACCESS_TOKEN         — Facebook Page Access Token (long-lived)
//   TWITTER_API_KEY              — Twitter/X API Key (OAuth 1.0a consumer key)
//   TWITTER_API_SECRET           — Twitter/X API Secret
//   TWITTER_ACCESS_TOKEN         — Twitter/X Access Token
//   TWITTER_ACCESS_TOKEN_SECRET  — Twitter/X Access Token Secret
//   WHATSAPP_PHONE_NUMBER_ID     — WhatsApp Business phone number ID (Meta Cloud API)
//   WHATSAPP_ACCESS_TOKEN        — Meta system user access token
//   WHATSAPP_RECIPIENT_NUMBERS   — Comma-separated E.164 numbers, e.g. 2348012345678
//   IG_USER_ID                   — Instagram Business Account User ID
//   IG_ACCESS_TOKEN              — Instagram Graph API access token

import crypto from 'crypto';

// ── Facebook ──────────────────────────────────────────────────────────────────

async function postToFacebook(description, imageUrl) {
    const pageId = process.env.FB_PAGE_ID;
    const token  = process.env.FB_PAGE_ACCESS_TOKEN;
    if (!pageId || !token) return { skipped: true, reason: 'Facebook credentials not set' };

    try {
        const endpoint = imageUrl
            ? `https://graph.facebook.com/v18.0/${pageId}/photos`
            : `https://graph.facebook.com/v18.0/${pageId}/feed`;

        const body = imageUrl
            ? { url: imageUrl, caption: description, access_token: token }
            : { message: description, access_token: token };

        const res  = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) return { error: data.error?.message || 'Facebook post failed' };
        return { success: true, id: data.id };
    } catch (err) {
        return { error: err.message };
    }
}

// ── Twitter / X (OAuth 1.0a) ─────────────────────────────────────────────────

function oauthSign(method, url, params, consumerKey, consumerSecret, accessToken, accessSecret) {
    const oauthParams = {
        oauth_consumer_key:     consumerKey,
        oauth_nonce:            crypto.randomBytes(16).toString('hex'),
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp:        Math.floor(Date.now() / 1000).toString(),
        oauth_token:            accessToken,
        oauth_version:          '1.0',
    };

    const allParams = { ...params, ...oauthParams };
    const sortedParams = Object.keys(allParams)
        .sort()
        .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(allParams[k])}`)
        .join('&');

    const baseString = [
        method.toUpperCase(),
        encodeURIComponent(url),
        encodeURIComponent(sortedParams),
    ].join('&');

    const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(accessSecret)}`;
    const signature  = crypto.createHmac('sha1', signingKey).update(baseString).digest('base64');

    return 'OAuth ' + Object.entries({ ...oauthParams, oauth_signature: signature })
        .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
        .join(', ');
}

async function postToTwitter(text) {
    const apiKey    = process.env.TWITTER_API_KEY;
    const apiSecret = process.env.TWITTER_API_SECRET;
    const accToken  = process.env.TWITTER_ACCESS_TOKEN;
    const accSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;

    if (!apiKey || !apiSecret || !accToken || !accSecret) {
        return { skipped: true, reason: 'Twitter/X credentials not set' };
    }

    const url        = 'https://api.twitter.com/2/tweets';
    const body       = { text: text.slice(0, 280) };
    const authHeader = oauthSign('POST', url, {}, apiKey, apiSecret, accToken, accSecret);

    try {
        const res  = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) return { error: data.detail || data.title || 'Twitter post failed' };
        return { success: true, id: data.data?.id };
    } catch (err) {
        return { error: err.message };
    }
}

// ── WhatsApp Business Cloud API ───────────────────────────────────────────────

async function postToWhatsApp(description, imageUrl) {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken   = process.env.WHATSAPP_ACCESS_TOKEN;
    const rawNumbers    = process.env.WHATSAPP_RECIPIENT_NUMBERS;

    if (!phoneNumberId || !accessToken || !rawNumbers) {
        return { skipped: true, reason: 'WhatsApp credentials not set' };
    }

    const numbers = rawNumbers.split(',').map((n) => n.trim()).filter(Boolean);
    if (numbers.length === 0) return { skipped: true, reason: 'No recipient numbers configured' };

    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

    const results = await Promise.all(
        numbers.map(async (to) => {
            const body = imageUrl
                ? { messaging_product: 'whatsapp', to, type: 'image',
                    image: { link: imageUrl, caption: description } }
                : { messaging_product: 'whatsapp', to, type: 'text',
                    text: { body: description } };
            try {
                const res  = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
                    body: JSON.stringify(body),
                });
                const data = await res.json();
                if (!res.ok) return { to, error: data.error?.message || 'Send failed' };
                return { to, success: true, id: data.messages?.[0]?.id };
            } catch (err) {
                return { to, error: err.message };
            }
        })
    );

    const sent   = results.filter((r) => r.success).length;
    const failed = results.filter((r) => r.error).length;
    if (sent === 0) return { error: `Failed to send to ${failed} number(s)` };
    return { success: true, sent, failed };
}

// ── Instagram (two-step: container → publish) ─────────────────────────────────

async function postToInstagram(description, imageUrl) {
    const userId      = process.env.IG_USER_ID;
    const accessToken = process.env.IG_ACCESS_TOKEN;

    if (!userId || !accessToken) {
        return { skipped: true, reason: 'Instagram credentials not set' };
    }

    // Instagram requires an image for a feed post; use caption-only if no image provided
    // (Stories/Reels need different endpoints — this posts to feed with image)
    if (!imageUrl) {
        return { skipped: true, reason: 'Instagram requires an image URL for a feed post' };
    }

    try {
        // Step 1: Create container
        const containerRes = await fetch(`https://graph.facebook.com/v18.0/${userId}/media`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                image_url:    imageUrl,
                caption:      description,
                access_token: accessToken,
            }),
        });
        const containerData = await containerRes.json();
        if (!containerRes.ok) return { error: containerData.error?.message || 'Instagram container creation failed' };

        const containerId = containerData.id;

        // Step 2: Publish container
        const publishRes = await fetch(`https://graph.facebook.com/v18.0/${userId}/media_publish`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ creation_id: containerId, access_token: accessToken }),
        });
        const publishData = await publishRes.json();
        if (!publishRes.ok) return { error: publishData.error?.message || 'Instagram publish failed' };

        return { success: true, id: publishData.id };
    } catch (err) {
        return { error: err.message };
    }
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(request) {
    try {
        const body = await request.json();

        // Support two calling modes:
        // 1. New: { targets: ['facebook','twitter',...], descriptions: { facebook: '...', twitter: '...' }, imageUrl }
        // 2. Legacy: { description: '...', imageUrl } — posts to all configured platforms
        const { targets, descriptions, description: legacyDescription, imageUrl } = body;

        const isLegacy   = !targets && legacyDescription;
        const targetList = isLegacy ? ['facebook', 'twitter', 'whatsapp'] : (targets || []);

        if (!isLegacy && targetList.length === 0) {
            return Response.json({ error: 'Select at least one platform' }, { status: 400 });
        }

        const getDesc = (platform) => {
            if (isLegacy) return legacyDescription;
            return descriptions?.[platform] || descriptions?.youtube || descriptions?.facebook ||
                   descriptions?.instagram || Object.values(descriptions || {})[0] || '';
        };

        const tasks = {};

        if (targetList.includes('facebook')) {
            tasks.facebook = postToFacebook(getDesc('facebook'), imageUrl);
        }
        if (targetList.includes('twitter')) {
            tasks.twitter = postToTwitter(getDesc('twitter'));
        }
        if (targetList.includes('whatsapp')) {
            tasks.whatsapp = postToWhatsApp(getDesc('whatsapp'), imageUrl);
        }
        if (targetList.includes('instagram')) {
            tasks.instagram = postToInstagram(getDesc('instagram'), imageUrl);
        }

        const results = {};
        const entries = Object.entries(tasks);
        const resolved = await Promise.all(entries.map(([, p]) => p));
        entries.forEach(([key], i) => { results[key] = resolved[i]; });

        return Response.json(results);
    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    }
}
