'use client';

export default function DonutChart({ segments = [], size = 180, thickness = 30, centerLabel = '', centerValue = '' }) {
    const r = (size - thickness) / 2;
    const cx = size / 2;
    const cy = size / 2;
    const circumference = 2 * Math.PI * r;
    const total = segments.reduce((s, seg) => s + (seg.value || 0), 0) || 1;

    let cumulative = 0;
    const arcs = segments.map((seg) => {
        const fraction = seg.value / total;
        const dash = fraction * circumference;
        const arc = { ...seg, dash, gap: circumference - dash, offset: cumulative };
        cumulative += dash;
        return arc;
    });

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', flexWrap: 'wrap' }}>
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                style={{ flexShrink: 0 }}
                aria-hidden="true"
            >
                {/* Track ring */}
                <circle
                    cx={cx} cy={cy} r={r}
                    fill="none"
                    stroke="rgba(23,32,51,0.07)"
                    strokeWidth={thickness}
                />
                {/* Segments — rotated so first segment starts at top */}
                <g transform={`rotate(-90 ${cx} ${cy})`}>
                    {arcs.map((arc, i) =>
                        arc.value > 0 ? (
                            <circle
                                key={i}
                                cx={cx} cy={cy} r={r}
                                fill="none"
                                stroke={arc.color}
                                strokeWidth={thickness - 2}
                                strokeDasharray={`${arc.dash} ${circumference - arc.dash}`}
                                strokeDashoffset={-arc.offset}
                                strokeLinecap="butt"
                                style={{ transition: 'stroke-dasharray 0.6s cubic-bezier(0.16,1,0.3,1)' }}
                            />
                        ) : null
                    )}
                </g>
                {/* Center text */}
                {centerValue !== '' && (
                    <text x={cx} y={cy - 10} textAnchor="middle" fill="#172033" fontSize="26" fontWeight="800">
                        {centerValue}
                    </text>
                )}
                {centerLabel && (
                    <text x={cx} y={cy + 14} textAnchor="middle" fill="#5b667a" fontSize="10" fontWeight="700" letterSpacing="0.08em">
                        {centerLabel.toUpperCase()}
                    </text>
                )}
            </svg>

            {/* Legend */}
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                {segments.map((seg, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                        <span style={{
                            width: 10, height: 10,
                            borderRadius: '50%',
                            background: seg.color,
                            flexShrink: 0,
                            boxShadow: `0 2px 6px ${seg.color}66`,
                        }} />
                        <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#172033', lineHeight: 1 }}>
                            {seg.value}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#5b667a', fontWeight: 600 }}>
                            {seg.label}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
