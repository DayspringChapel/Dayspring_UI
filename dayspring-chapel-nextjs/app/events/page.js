import { EventProvider } from '@/context/EventContext';
import EventsSlideshowHero from '@/components/sections/EventsSlideshowHero';
import EventsContent from '@/components/sections/EventsContent';
import NewsletterSection from '@/components/sections/NewsletterSection';

export const metadata = {
    title: 'Events | DaySpring Chapel',
    description: 'Join us for upcoming events and experience the presence of God.',
};

export default function EventsPage() {
    return (
        <main>
            <EventProvider>
                <EventsSlideshowHero />
                <EventsContent />
            </EventProvider>

            <NewsletterSection />
        </main>
    );
}
