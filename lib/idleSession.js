export const IDLE_SESSION_MS = 30 * 60 * 1000;
// Activity is shared across tabs, contains no credentials, and does not replace the
// server's independent idle-expiry check. Background session polling is not activity.
export function monitorIdleSession({ target = window, userId, onIdle, onActivity, now = Date.now, timeout = IDLE_SESSION_MS }) {
    const key = `dayspring:last-activity:${userId}`;
    let last = now(), lastWrite = 0, lastPing = 0, ended = false;
    const read = () => { try { const value = Number(target.localStorage.getItem(key)); if (Number.isFinite(value) && value > 0 && value <= now()) last = Math.max(last, value); } catch { /* Private browsing. */ } };
    // Preserve an older timestamp on mount so a reload cannot reset inactivity.
    try { const value = Number(target.localStorage.getItem(key)); if (Number.isFinite(value) && value > 0 && value <= now()) last = value; else target.localStorage.setItem(key, String(last)); } catch { /* unavailable */ }
    const check = () => { read(); if (!ended && now() - last >= timeout) { ended = true; onIdle(); } return ended; };
    const activity = () => {
        if (check()) return;
        last = now();
        if (last - lastWrite >= 1000) { lastWrite = last; try { target.localStorage.setItem(key, String(last)); } catch { /* unavailable */ } }
        if (last - lastPing >= 60000) { lastPing = last; onActivity(); }
    };
    const events = ['pointerdown', 'pointermove', 'keydown', 'touchstart', 'scroll'];
    for (const name of events) target.addEventListener(name, activity, { passive:true });
    target.addEventListener('focus', check);
    target.addEventListener('storage', check);
    target.document.addEventListener('visibilitychange', check);
    const timer = target.setInterval(check, 1000);
    check();
    return () => { ended = true; target.clearInterval(timer); for (const name of events) target.removeEventListener(name, activity); target.removeEventListener('focus', check); target.removeEventListener('storage', check); target.document.removeEventListener('visibilitychange', check); };
}
