import PageHero from '@/components/sections/PageHero';
import WhoWeAreSection from '@/components/sections/WhoWeAreSection';
import OurCreedSection from '@/components/sections/OurCreedSection';
import MissionStatementSection from '@/components/sections/MissionStatementSection';
import GoalsAimObjective from '@/components/sections/GoalsAimObjective';
import OurCoreValues from '@/components/sections/OurCoreValues';
import OurCulture from '@/components/sections/Ourculture';
import LeadershipStructure from '@/components/sections/LeadershipStructure';
import GeneralOverSeer from '@/components/sections/GeneralOverSeer';
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
                <WhoWeAreSection className="" />
            </ScrollReveal>

            <ScrollReveal>
                <MissionStatementSection className="" />
            </ScrollReveal>

            <ScrollReveal>
                <OurCreedSection className="" />
            </ScrollReveal>

            <ScrollReveal>
                <GoalsAimObjective className="" />
            </ScrollReveal>

            <ScrollReveal>
                <OurCoreValues className="" />
            </ScrollReveal>

            <ScrollReveal>
                <OurCulture className="" />
            </ScrollReveal>

            <ScrollReveal>
                <LeadershipStructure className="" />
            </ScrollReveal>

            <ScrollReveal>
                <GeneralOverSeer className="" />
            </ScrollReveal>

            <ScrollReveal>
                <OrganizationalStructureSection className="" />
            </ScrollReveal>

            <ScrollReveal>
                <OurCentralObjectivesSection className="" />
            </ScrollReveal>

            <ScrollReveal>
                <OurArmourSection className="" />
            </ScrollReveal>

            <NewsletterSection />
        </main>
    );
}

