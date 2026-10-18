'use client';

import { useRouter } from 'next/navigation';

// Shown in place of an admin page the signed-in user's role doesn't include.
export default function NoAccess() {
    const router = useRouter();

    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 1rem' }}>
            <div
                role="alert"
                style={{
                    maxWidth: '28rem', width: '100%', textAlign: 'center', background: '#ffffff',
                    border: '1px solid #e5e7eb', borderRadius: '1.25rem', padding: '2.25rem 1.75rem',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
                }}
            >
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }} aria-hidden="true">🔒</div>
                <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.3rem', fontWeight: 900, color: '#111827' }}>
                    You don&apos;t have access to this page
                </h1>
                <p style={{ margin: '0 0 1.5rem', color: '#4b5563', fontSize: '0.92rem', lineHeight: 1.55 }}>
                    Your role doesn&apos;t include the permission this page needs. If you think you should have it,
                    ask a Super Admin to update your role.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', justifyContent: 'center' }}>
                    <button
                        type="button"
                        onClick={() => router.push('/admin/dashboard')}
                        style={{
                            background: '#c2410c', color: '#ffffff', border: '2px solid #c2410c', borderRadius: '0.6rem',
                            padding: '0.65rem 1.25rem', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer',
                        }}
                    >
                        Back to dashboard
                    </button>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        style={{
                            background: '#ffffff', color: '#0f172a', border: '2px solid #475569', borderRadius: '0.6rem',
                            padding: '0.65rem 1.25rem', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer',
                        }}
                    >
                        Go back
                    </button>
                </div>
            </div>
        </div>
    );
}
