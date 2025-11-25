import PageHero from '@/components/sections/PageHero';
import WhoWeAreSection from '@/components/sections/WhoWeAreSection';
import MissionStatementSection from '@/components/sections/MissionStatementSection';
import HistorySection from '@/components/sections/HistorySection';
import OutreachSection from '@/components/sections/OutreachSection';
import CoreValuesSection from '@/components/sections/CoreValuesSection';
import OurCultureSection from '@/components/sections/OurCultureSection';
import OrganizationalStructureSection from '@/components/sections/OrganizationalStructureSection';
import OurCentralObjectivesSection from '@/components/sections/OurCentralObjectivesSection';
import OurArmourSection from '@/components/sections/OurArmourSection';
import NewsletterSection from '@/components/sections/NewsletterSection';
import ScrollReveal from '@/components/ui/ScrollReveal';

export const metadata = {
    title: 'About Us | DaySpring Chapel',
    description: 'Learn about the history, mission, and leadership of DaySpring Chapel.',
};

export default function AboutPage() {
    return (
        <main >
            <PageHero
                title="ABOUT US"
                subtitle="Discover our history, our mission, and the people who serve."
                bgImage="/about-cover.png"
            />

            <ScrollReveal>
                <WhoWeAreSection />
            </ScrollReveal>

            <ScrollReveal>
                <MissionStatementSection />
            </ScrollReveal>

            <ScrollReveal>
                <HistorySection />
            </ScrollReveal>

            <ScrollReveal>
                <OutreachSection />
            </ScrollReveal>

            <ScrollReveal>
                <CoreValuesSection />
            </ScrollReveal>

            <ScrollReveal>
                <OurCultureSection />
            </ScrollReveal>

            <ScrollReveal>
                <OrganizationalStructureSection />
            </ScrollReveal>

            <ScrollReveal>
                <OurCentralObjectivesSection />
            </ScrollReveal>

            <ScrollReveal>
                <OurArmourSection />
            </ScrollReveal>

            <NewsletterSection />
        </main>
    );
}

