import PageHero from '@/components/sections/PageHero';
import AppointmentForm from '@/components/sections/AppointmentForm';
import NewsletterSection from '@/components/sections/NewsletterSection';

export const metadata = {
    title: 'Appointment | DaySpring Chapel',
    description: 'Request an appointment with our pastoral team.',
};

export default function AppointmentPage() {
    return (
        <main>
            <PageHero
                title="APPOINTMENT"
                subtitle="Schedule a time to meet with our pastoral team."
                bgImage="/about-cover.png"
            />

            <AppointmentForm />

            <NewsletterSection />
        </main>
    );
}
