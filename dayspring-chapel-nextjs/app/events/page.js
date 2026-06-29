import { fetchEventsServer } from '@/lib/serverApi';
import { EventProvider } from '@/context/EventContext';
import EventsSlideshowHero from '@/components/sections/EventsSlideshowHero';
import EventsContent from '@/components/sections/EventsContent';
import NewsletterSection from '@/components/sections/NewsletterSection';

export const metadata = {
    title: 'Events | DaySpring Chapel',
    description: 'Join us for upcoming events and experience the presence of God.',
};

export default async function EventsPage() {
    const events = await fetchEventsServer();

    return (
        <main>
            <EventProvider initialEvents={events}>
                <EventsSlideshowHero />
                <EventsContent />
            </EventProvider>

            <NewsletterSection />
        </main>
    );
}
