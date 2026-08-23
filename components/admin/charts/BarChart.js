'use client';

export default function BarChart({ bars = [], height = 160, label = '' }) {
    const max = Math.max(...bars.map((b) => b.value || 0), 1);
    const barAreaH = height - 40; // reserve 40px for labels + value text

    return (
        <div>
            {label && (
                <p style={{
                    margin: '0 0 0.85rem',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: '#5b667a',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                }}>
                    {label}
                </p>
            )}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: `${height}px` }}>
                {bars.map((bar, i) => {
                    const barH = bar.value > 0 ? Math.max(Math.round((bar.value / max) * barAreaH), 6) : 0;
                    return (
                        <div
                            key={i}
                            style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                gap: '0.3rem',
                                height: '100%',
                            }}
                        >
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#172033' }}>
                                {bar.value}
                            </span>
                            <div
                                style={{
                                    width: '100%',
                                    height: `${barH}px`,
                                    background: bar.color || '#d9752c',
                                    borderRadius: '0.45rem 0.45rem 0.15rem 0.15rem',
                                    boxShadow: `0 4px 14px ${bar.color || '#d9752c'}44`,
                                    transition: 'height 0.65s cubic-bezier(0.16,1,0.3,1)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                            >
                                <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 60%)',
                                }} />
                            </div>
                            <span style={{
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                color: '#5b667a',
                                textAlign: 'center',
                                lineHeight: 1.2,
                                maxWidth: '100%',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}>
                                {bar.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
