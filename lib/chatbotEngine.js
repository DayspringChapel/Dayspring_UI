import { TOPICS, FALLBACK_ANSWER } from './chatbotKnowledge';

const STOP_WORDS = new Set([
    'what', 'when', 'where', 'which', 'who', 'whom', 'whose', 'why', 'how',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'am',
    'do', 'does', 'did', 'doing', 'done',
    'can', 'could', 'will', 'would', 'shall', 'should', 'may', 'might', 'must',
    'the', 'a', 'an', 'and', 'or', 'but', 'if', 'so', 'to', 'of', 'in', 'on',
    'at', 'for', 'with', 'about', 'your', 'you', 'yours', 'me', 'my', 'i',
    'it', 'its', 'this', 'that', 'there', 'have', 'has', 'had', 'please',
]);

function normalize(text) {
    return (text || '').toLowerCase().trim();
}

function keywordsOf(text) {
    return normalize(text)
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length >= 4 && !STOP_WORDS.has(w));
}

// Looks for a line in the admin-provided "additional info" text that shares
// meaningful keywords with the user's question, so admin-added facts (e.g. a
// changed service time or a new phone number) can surface without needing
// their own hardcoded topic.
function matchAdminInfo(userMsg, adminInfo) {
    if (!adminInfo || !adminInfo.trim()) return null;

    const userKeywords = keywordsOf(userMsg);
    if (userKeywords.length === 0) return null;

    const lines = adminInfo.split('\n').map((l) => l.trim()).filter(Boolean);
    const matches = lines.filter((line) => {
        const lineKeywords = new Set(keywordsOf(line));
        return userKeywords.some((k) => lineKeywords.has(k));
    });

    return matches.length ? matches.join('\n') : null;
}

/**
 * Rule-based reply for the DaySpring Assistant. No external AI call —
 * matches the user's message against a fixed set of church-related topics.
 *
 * @param {string} userMessage
 * @param {{ adminInfo?: string }} [opts]
 * @returns {string}
 */
export function getReply(userMessage, opts = {}) {
    const msg = normalize(userMessage);
    if (!msg) {
        return "I didn't quite catch that — could you type your question again?";
    }

    for (const topic of TOPICS) {
        if (topic.test(msg)) return topic.answer;
    }

    const adminMatch = matchAdminInfo(msg, opts.adminInfo);
    if (adminMatch) return adminMatch;

    return FALLBACK_ANSWER;
}
