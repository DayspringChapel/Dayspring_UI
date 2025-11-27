import PageHero from '@/components/sections/PageHero';
import EventsContent from '@/components/sections/EventsContent';
import NewsletterSection from '@/components/sections/NewsletterSection';

export const metadata = {
    title: 'Events | DaySpring Chapel',
    description: 'Join us for upcoming events and experience the presence of God.',
};

export default function EventsPage() {
    return (
        <main>
            <PageHero
                title="EVENTS"
                subtitle="Join us for these life-changing events and encounters."
                bgImage="/about-cover.png"
            />

            <EventsContent />

            <NewsletterSection />
        </main>
    );
}
