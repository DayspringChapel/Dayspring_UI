import LiveWatch from '@/components/sections/LiveWatch';
import { LIVE_PAGE_URL } from '@/lib/livePlayer';

export const metadata = {
    title: 'Watch live | DaySpring Chapel',
    description: 'Watch DaySpring Chapel live. Join our worship service online and share the livestream with family and friends.',
    alternates: { canonical: LIVE_PAGE_URL },
    openGraph: { title: 'Watch live | DaySpring Chapel', description: 'Join DaySpring Chapel for worship, wherever you are.', url: LIVE_PAGE_URL, type: 'website', images: [{ url: 'https://www.dayspring-vlbc.org/logo.png', alt: 'DaySpring Chapel' }] },
    twitter: { card: 'summary', title: 'Watch live | DaySpring Chapel', description: 'Join our worship service online.', images: ['https://www.dayspring-vlbc.org/logo.png'] },
};

export default function LivePage() { return <LiveWatch />; }
