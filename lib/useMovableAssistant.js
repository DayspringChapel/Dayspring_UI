'use client';
import { useEffect, useRef, useState } from 'react';
const KEY = 'dayspring_assistant_position';
const clamp = (point) => ({ x: Math.max(12, Math.min(point.x, window.innerWidth - 68)), y: Math.max(12, Math.min(point.y, window.innerHeight - 68)) });
export default function useMovableAssistant() {
    const [point, setPoint] = useState(null); const drag = useRef(null); const moved = useRef(false);
    useEffect(() => {
        const restore = () => {
            let saved;
            try { saved = JSON.parse(localStorage.getItem(KEY)); } catch { /* Use the default position. */ }
            setPoint(clamp(saved && Number.isFinite(saved.x) && Number.isFinite(saved.y) ? saved : { x: 20, y: window.innerHeight - 80 }));
        };
        restore(); window.addEventListener('resize', restore);
        return () => window.removeEventListener('resize', restore);
    }, []);
    function save(next) { setPoint(next); try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* Position still lasts for this visit. */ } }
    return {
        position: point ? { left: point.x, top: point.y } : { left: 20, bottom: 24 },
        panelPosition: point ? { left: Math.max(12, Math.min(point.x, window.innerWidth - 372)), top: Math.max(12, Math.min(point.y - 512, window.innerHeight - 512)) } : { left: 20, bottom: 88 },
        handlers: {
            onPointerDown(event) { if (event.button !== 0) return; moved.current = false; drag.current = { x: event.clientX, y: event.clientY, point: point || { x: 20, y: window.innerHeight - 80 } }; event.currentTarget.setPointerCapture(event.pointerId); },
            onPointerMove(event) { if (!drag.current) return; const dx = event.clientX - drag.current.x, dy = event.clientY - drag.current.y; if (Math.hypot(dx,dy) > 5) moved.current = true; if (moved.current) setPoint(clamp({ x: drag.current.point.x + dx, y: drag.current.point.y + dy })); },
            onPointerUp(event) { if (!drag.current) return; if (moved.current) save(clamp({ x: drag.current.point.x + event.clientX - drag.current.x, y: drag.current.point.y + event.clientY - drag.current.y })); drag.current = null; },
            onPointerCancel() { drag.current = null; moved.current = true; },
            onKeyDown(event) { const delta = { ArrowLeft: [-20,0], ArrowRight: [20,0], ArrowUp: [0,-20], ArrowDown: [0,20] }[event.key]; if (delta && point) { event.preventDefault(); save(clamp({ x:point.x+delta[0], y:point.y+delta[1] })); } },
        },
        shouldToggle: () => { if (moved.current) { moved.current = false; return false; } return true; },
    };
}
