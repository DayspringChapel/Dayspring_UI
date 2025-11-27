import PageHero from '@/components/sections/PageHero';
import GivingContent from '@/components/sections/GivingContent';
import WhyWeGive from '@/components/sections/WhyWeGive';
import NewsletterSection from '@/components/sections/NewsletterSection';

export const metadata = {
    title: 'Giving | DaySpring Chapel',
    description: 'Support the mission and vision of DaySpring Chapel through your giving.',
};

export default function DonatePage() {
    return (
        <main>
            <PageHero
                title="GIVING"
                subtitle="Honoring God with our substance and the first fruits of our increase."
                bgImage="/donate-hero.jfif"
            />

            <WhyWeGive />

            <GivingContent />

            <NewsletterSection />
        </main>
    );
}
