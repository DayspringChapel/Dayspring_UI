import PageHero from '@/components/sections/PageHero';
import LibraryContent from '@/components/sections/LibraryContent';
import SermonSection from '@/components/sections/SermonSection';
import NewsletterSection from '@/components/sections/NewsletterSection';

export const metadata = {
    title: 'Library | DaySpring Chapel',
    description: 'Explore our collection of books and resources to aid your spiritual growth.',
};

export default function LibraryPage() {
    return (
        <main>
            <PageHero
                title="LIBRARY"
                subtitle="Equipping the saints for the work of ministry through knowledge."
                bgImage="/library-hero.png"
            />

            <LibraryContent />

            <SermonSection />

            <NewsletterSection />
        </main>
    );
}
