'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

const BRAND = '#F58634';
const BRAND_DARK = '#d9752c';

const WELCOME = {
    role: 'assistant',
    content: "Hi! I'm the Dayspring Assistant 👋 How can I help you today? You can ask me about our services, events, how to book an appointment, or anything else about the church.",
};

function SendIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
    );
}

function ChatIcon() {
    return (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
    );
}

function CloseIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    );
}

function TypingDots() {
    return (
        <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '4px 0' }}>
            {[0, 1, 2].map((i) => (
                <span
                    key={i}
                    style={{
                        width: 7, height: 7, borderRadius: '50%',
                        background: '#94a3b8',
                        animation: 'dotBounce 1.2s ease-in-out infinite',
                        animationDelay: `${i * 0.2}s`,
                        display: 'inline-block',
                    }}
                />
            ))}
        </div>
    );
}

export default function ChatWidget() {
    const [open, setOpen]           = useState(false);
    const [messages, setMessages]   = useState([WELCOME]);
    const [input, setInput]         = useState('');
    const [streaming, setStreaming] = useState(false);
    const bottomRef  = useRef(null);
    const inputRef   = useRef(null);
    const abortRef   = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 120);
    }, [open]);

    const send = useCallback(async () => {
        const text = input.trim();
        if (!text || streaming) return;

        const userMsg = { role: 'user', content: text };
        const history = [...messages, userMsg];
        setMessages(history);
        setInput('');
        setStreaming(true);

        // placeholder for the streaming reply
        setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

        try {
            const controller = new AbortController();
            abortRef.current = controller;

            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: history.map((m) => ({ role: m.role, content: m.content })),
                }),
                signal: controller.signal,
            });

            if (!res.ok) throw new Error('Request failed');

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let reply = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                reply += decoder.decode(value, { stream: true });
                setMessages((prev) => [
                    ...prev.slice(0, -1),
                    { role: 'assistant', content: reply },
                ]);
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                setMessages((prev) => [
                    ...prev.slice(0, -1),
                    { role: 'assistant', content: "Sorry, I couldn't reach the server right now. Please try again in a moment." },
                ]);
            }
        } finally {
            setStreaming(false);
            abortRef.current = null;
        }
    }, [input, messages, streaming]);

    const onKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
    };

    return (
        <>
            <style>{`
                @keyframes dotBounce {
                    0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
                    40%           { transform: translateY(-6px); opacity: 1; }
                }
                @keyframes widgetPop {
                    from { opacity: 0; transform: scale(0.88) translateY(12px); }
                    to   { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>

            {/* Chat panel */}
            {open && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: 88,
                        right: 24,
                        width: 360,
                        maxWidth: 'calc(100vw - 32px)',
                        height: 500,
                        maxHeight: 'calc(100vh - 120px)',
                        borderRadius: '1.25rem',
                        background: '#fff',
                        boxShadow: '0 24px 64px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.06)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        zIndex: 9998,
                        animation: 'widgetPop 0.22s cubic-bezier(0.22,1,0.36,1) both',
                    }}
                >
                    {/* Header */}
                    <div style={{
                        padding: '0.95rem 1.1rem',
                        background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_DARK} 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        flexShrink: 0,
                    }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: 'rgba(255,255,255,0.22)',
                            border: '2px solid rgba(255,255,255,0.45)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.1rem', flexShrink: 0,
                        }}>
                            ✝️
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, color: '#fff', fontWeight: 800, fontSize: '0.9rem', lineHeight: 1.2 }}>
                                Dayspring Assistant
                            </p>
                            <p style={{ margin: 0, color: 'rgba(255,255,255,0.72)', fontSize: '0.72rem' }}>
                                {streaming ? 'Typing…' : 'Online · Ask me anything'}
                            </p>
                        </div>
                        <button
                            onClick={() => setOpen(false)}
                            style={{
                                background: 'rgba(255,255,255,0.18)', border: 'none',
                                borderRadius: '50%', width: 30, height: 30,
                                cursor: 'pointer', color: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                            }}
                            aria-label="Close chat"
                        >
                            <CloseIcon />
                        </button>
                    </div>

                    {/* Messages */}
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        background: '#f8fafc',
                    }}>
                        {messages.map((m, i) => (
                            <div
                                key={i}
                                style={{
                                    display: 'flex',
                                    justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
                                }}
                            >
                                <div style={{
                                    maxWidth: '82%',
                                    padding: '0.6rem 0.85rem',
                                    borderRadius: m.role === 'user'
                                        ? '1rem 1rem 0.25rem 1rem'
                                        : '1rem 1rem 1rem 0.25rem',
                                    background: m.role === 'user'
                                        ? `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})`
                                        : '#fff',
                                    color: m.role === 'user' ? '#fff' : '#1e293b',
                                    fontSize: '0.84rem',
                                    lineHeight: 1.55,
                                    boxShadow: m.role === 'user'
                                        ? `0 4px 14px rgba(245,134,52,0.30)`
                                        : '0 2px 8px rgba(0,0,0,0.08)',
                                    border: m.role === 'assistant' ? '1px solid #e2e8f0' : 'none',
                                    fontWeight: 450,
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                }}>
                                    {m.content === '' && m.role === 'assistant'
                                        ? <TypingDots />
                                        : m.content
                                    }
                                </div>
                            </div>
                        ))}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <div style={{
                        padding: '0.75rem',
                        borderTop: '1px solid #e2e8f0',
                        display: 'flex',
                        gap: '0.5rem',
                        background: '#fff',
                        flexShrink: 0,
                    }}>
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={onKey}
                            placeholder="Type a message…"
                            rows={1}
                            disabled={streaming}
                            style={{
                                flex: 1,
                                resize: 'none',
                                border: '1.5px solid #e2e8f0',
                                borderRadius: '0.75rem',
                                padding: '0.55rem 0.75rem',
                                fontSize: '0.84rem',
                                fontFamily: 'inherit',
                                outline: 'none',
                                lineHeight: 1.5,
                                background: streaming ? '#f1f5f9' : '#fff',
                                color: '#1e293b',
                                transition: 'border-color 0.18s',
                                maxHeight: 96,
                                overflowY: 'auto',
                            }}
                            onFocus={(e) => { e.target.style.borderColor = BRAND; }}
                            onBlur={(e)  => { e.target.style.borderColor = '#e2e8f0'; }}
                        />
                        <button
                            onClick={send}
                            disabled={!input.trim() || streaming}
                            style={{
                                width: 40, height: 40,
                                borderRadius: '0.75rem',
                                border: 'none',
                                background: !input.trim() || streaming
                                    ? '#e2e8f0'
                                    : `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})`,
                                color: !input.trim() || streaming ? '#94a3b8' : '#fff',
                                cursor: !input.trim() || streaming ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                                transition: 'background 0.18s',
                                boxShadow: input.trim() && !streaming
                                    ? `0 4px 12px rgba(245,134,52,0.35)` : 'none',
                                alignSelf: 'flex-end',
                            }}
                            aria-label="Send message"
                        >
                            <SendIcon />
                        </button>
                    </div>
                </div>
            )}

            {/* Floating toggle button */}
            <button
                onClick={() => setOpen((v) => !v)}
                style={{
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    border: 'none',
                    background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_DARK} 100%)`,
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 28px rgba(245,134,52,0.50), 0 2px 8px rgba(0,0,0,0.18)',
                    zIndex: 9999,
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                aria-label={open ? 'Close chat' : 'Open chat'}
            >
                {open ? <CloseIcon /> : <ChatIcon />}
            </button>
        </>
    );
}
