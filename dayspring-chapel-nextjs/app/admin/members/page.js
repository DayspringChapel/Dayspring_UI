'use client';

export default function MembersPage() {
    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#1a202c', margin: '0 0 0.5rem 0' }}>
                    Members & Birthdays
                </h1>
                <p style={{ color: '#718096', fontSize: '1.05rem', margin: 0 }}>
                    Manage member profiles and birthday information
                </p>
            </div>

            <div
                style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '4rem 2rem',
                    textAlign: 'center',
                    border: '1px solid #e2e8f0',
                }}
            >
                <p style={{ color: '#718096', fontSize: '1.1rem' }}>
                    Members and birthdays management coming soon...
                </p>
                <p style={{ color: '#a0aec0', fontSize: '0.95rem', marginTop: '1rem' }}>
                    This feature will allow you to manage member biodata and track birthdays.
                </p>
            </div>
        </div>
    );
}
