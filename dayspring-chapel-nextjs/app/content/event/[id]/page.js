import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { fetchEventByIdServer } from '@/lib/serverApi';
import { HeroCountdown } from '@/components/CountdownTimer';
import NewsletterSection from '@/components/sections/NewsletterSection';

export async function generateMetadata({ params }) {
    const event = await fetchEventByIdServer(params.id);
    if (!event) return { title: 'Event Not Found | DaySpring Chapel' };
    return {
        title: `${event.heading || 'Event'} | DaySpring Chapel`,
        description: event.description || 'Join us for this event at DaySpring Chapel.',
        openGraph: {
            images: event.eventImage ? [event.eventImage] : [],
        },
    };
}

export default async function EventDetailPage({ params }) {
    const event = await fetchEventByIdServer(params.id);
    if (!event) notFound();

    const title      = (event.heading || 'Event').toUpperCase();
    const dateStr    = event.eventDate;
    const image      = event.eventImage || '/about-cover.png';
    const isUpcoming = dateStr && new Date(dateStr) > new Date();

    const formattedDate = dateStr
        ? new Date(dateStr).toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          })
        : null;

    return (
        <main>
            {/* ── Hero ──────────────────────────────────────────────── */}
            <div className="relative w-full overflow-hidden bg-black" style={{ height: '72vh', minHeight: 420 }}>
                <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover object-center"
                    style={{ opacity: 0.45 }}
                    priority
                    unoptimized
                />
                <div className="absolute inset-0"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.20) 100%)' }} />

                <div className="absolute inset-0 flex flex-col justify-end pb-14 px-6 md:px-16"
                    style={{ maxWidth: '72rem', margin: '0 auto', left: 0, right: 0 }}>

                    <Link href="/events"
                        style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.82rem', fontWeight: 600,
                            marginBottom: '1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                            width: 'fit-content' }}>
                        ← All Events
                    </Link>

                    {isUpcoming && (
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                            background: 'rgba(245,134,52,0.18)', border: '1px solid rgba(245,134,52,0.45)',
                            borderRadius: '999px', padding: '0.28rem 0.9rem',
                            color: '#f58634', fontSize: '0.7rem', fontWeight: 800,
                            textTransform: 'uppercase', letterSpacing: '0.12em',
                            width: 'fit-content', marginBottom: '1rem',
                        }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f58634', display: 'inline-block' }} />
                            Upcoming Event
                        </div>
                    )}

                    <h1 className="font-black text-white leading-none mb-4 uppercase"
                        style={{ fontSize: 'clamp(2rem, 6vw, 4.5rem)', textShadow: '0 2px 20px rgba(0,0,0,0.7)' }}>
                        {title}
                    </h1>

                    {formattedDate && (
                        <div style={{ color: 'rgba(255,255,255,0.72)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f58634" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            {formattedDate}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Body ──────────────────────────────────────────────── */}
            <section className="py-14 bg-white">
                <div className="max-w-3xl mx-auto px-6 md:px-8">

                    {isUpcoming && (
                        <div className="mb-12 p-8 rounded-2xl" style={{ background: '#fafafa', border: '1px solid #f0f0f0' }}>
                            <p style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 700,
                                textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.75rem' }}>
                                Starts In
                            </p>
                            <HeroCountdown targetDate={dateStr} />
                        </div>
                    )}

                    {event.description && (
                        <div className="mb-10">
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-5">
                                About This Event
                            </h2>
                            <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                                {event.description}
                            </p>
                        </div>
                    )}

                    {event.location && (
                        <div className="mb-10 flex items-start gap-3">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f58634" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 3 }}>
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                            </svg>
                            <div>
                                <p style={{ fontWeight: 700, color: '#374151', marginBottom: '0.15rem' }}>Location</p>
                                <p style={{ color: '#6b7280' }}>{event.location}</p>
                            </div>
                        </div>
                    )}

                    <Link href="/events"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                            color: '#f58634', fontWeight: 700, fontSize: '0.9rem' }}>
                        ← Back to All Events
                    </Link>
                </div>
            </section>

            <NewsletterSection />
        </main>
    );
}
