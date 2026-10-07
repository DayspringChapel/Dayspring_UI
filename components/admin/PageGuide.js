'use client';

import { useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import DashboardTour from '@/components/admin/DashboardTour';
import { guideFor } from '@/lib/pageGuides';

// Route-aware guide for every admin page: auto-plays once per page, and a floating
// "Guide" button replays it any time. Dashboards have their own tour and are skipped.
export default function PageGuide() {
    const pathname = usePathname();
    const { key, steps } = useMemo(() => guideFor(pathname), [pathname]);
    const [signals, setSignals] = useState({});

    if (!key) return null;

    return (
        <>
            <DashboardTour
                key={key}
                steps={steps}
                storageKey={`page_${key}`}
                restartSignal={signals[key] || 0}
            />
            <button
                type="button"
                onClick={() => setSignals((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }))}
                aria-label="Open the guide for this page"
                title="Guide for this page"
                style={{
                    position: 'fixed', right: '1.25rem', bottom: '1.25rem', zIndex: 900,
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                    border: '1px solid rgba(217,117,44,0.6)', background: '#d9752c', color: '#fff',
                    borderRadius: '999px', padding: '0.55rem 1rem', fontSize: '0.8rem', fontWeight: 800,
                    cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.35)', fontFamily: 'inherit',
                }}
            >
                ? Guide
            </button>
        </>
    );
}
