let pending;
export function loadYouTubePlayerApi() {
    if (window.YT?.Player) return Promise.resolve(window.YT);
    if (!pending) pending = new Promise((resolve,reject) => {
        const previous = window.onYouTubeIframeAPIReady;
        const timeout = setTimeout(() => { pending = null; reject(new Error('Player telemetry unavailable.')); },15000);
        window.onYouTubeIframeAPIReady = () => { clearTimeout(timeout); previous?.(); resolve(window.YT); };
        const script = document.createElement('script'); script.src='https://www.youtube.com/iframe_api'; script.async=true;
        script.onerror = () => { clearTimeout(timeout); pending=null; script.remove(); reject(new Error('Player telemetry unavailable.')); };
        document.head.appendChild(script);
    });
    return pending;
}
