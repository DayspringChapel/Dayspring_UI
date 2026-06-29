import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { fetchSermonByIdServer } from '@/lib/serverApi';
import SermonPlayer from '@/components/SermonPlayer';
import NewsletterSection from '@/components/sections/NewsletterSection';

export async function generateMetadata({ params }) {
    const sermon = await fetchSermonByIdServer(params.id);
    if (!sermon) return { title: 'Sermon Not Found | DaySpring Chapel' };
    return {
        title: `${sermon.title || 'Sermon'} | DaySpring Chapel`,
        description: sermon.preacherName
            ? `Listen to "${sermon.title}" by ${sermon.preacherName}`
            : `Listen to this message from DaySpring Chapel.`,
    };
}

export default async function SermonDetailPage({ params }) {
    const sermon = await fetchSermonByIdServer(params.id);
    if (!sermon) notFound();

    const formattedDate = sermon.sermonDate
        ? new Date(sermon.sermonDate).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric',
          })
        : null;

    return (
        <main className="min-h-screen" style={{ background: '#f8f9fa' }}>
            {/* ── Top bar ───────────────────────────────────────────── */}
            <div style={{ background: '#1a1a2e', padding: '1rem 1.5rem' }}>
                <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
                    <Link href="/library"
                        style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.82rem', fontWeight: 600,
                            display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        ← Back to Library
                    </Link>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 md:px-6 py-10">

                {/* ── Sermon card ─────────────────────────────────────── */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
                    {/* Orange header band */}
                    <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d5e 100%)', padding: '2rem 2rem 3.5rem' }}>
                        <div className="flex items-start gap-5">
                            <div className="relative flex-shrink-0"
                                style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden',
                                    border: '3px solid rgba(245,134,52,0.5)', background: '#fff' }}>
                                <Image
                                    src={sermon.imageUrl || '/headset.png'}
                                    alt={sermon.title || 'Sermon'}
                                    fill
                                    className="object-cover p-1"
                                    unoptimized
                                />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                                    background: 'rgba(245,134,52,0.18)', border: '1px solid rgba(245,134,52,0.4)',
                                    borderRadius: '999px', padding: '0.2rem 0.7rem',
                                    color: '#f58634', fontSize: '0.65rem', fontWeight: 800,
                                    textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.6rem',
                                }}>
                                    🎤 Sermon
                                </div>
                                <h1 className="font-black text-white leading-tight text-xl mb-1">{sermon.title}</h1>
                                {sermon.preacherName && (
                                    <p style={{ color: '#f58634', fontWeight: 700, fontSize: '0.9rem' }}>{sermon.preacherName}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Meta strip */}
                    <div style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb', padding: '0.75rem 2rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                        {formattedDate && (
                            <span style={{ fontSize: '0.8rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                📅 {formattedDate}
                            </span>
                        )}
                        {sermon.seriesTitle && (
                            <span style={{ fontSize: '0.8rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                📚 Series: <strong style={{ color: '#374151' }}>{sermon.seriesTitle}</strong>
                            </span>
                        )}
                    </div>
                </div>

                {/* ── Player ──────────────────────────────────────────── */}
                <SermonPlayer audioUrl={sermon.audioLink} title={sermon.title} />
            </div>

            <NewsletterSection />
        </main>
    );
}
