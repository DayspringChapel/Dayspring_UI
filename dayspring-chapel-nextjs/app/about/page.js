import PageHero from '@/components/sections/PageHero';
import HistorySection from '@/components/sections/HistorySection';
import MissionVisionSection from '@/components/sections/MissionVisionSection';
import TeamSection from '@/components/sections/TeamSection';
import NewsletterSection from '@/components/sections/NewsletterSection';
import ScrollReveal from '@/components/ui/ScrollReveal';

export const metadata = {
    title: 'About Us | DaySpring Chapel',
    description: 'Learn about the history, mission, and leadership of DaySpring Chapel.',
};

export default function AboutPage() {
    return (
        <main>
            <PageHero
                title="Who We Are"
                subtitle="Discover our history, our mission, and the people who serve."
                bgImage="/about-bg.jpg"
            />

            <ScrollReveal>
                <HistorySection />
            </ScrollReveal>

            <ScrollReveal>
                <MissionVisionSection />
            </ScrollReveal>

            <ScrollReveal>
                <TeamSection />
            </ScrollReveal>

            <NewsletterSection />
        </main>
    );
}
