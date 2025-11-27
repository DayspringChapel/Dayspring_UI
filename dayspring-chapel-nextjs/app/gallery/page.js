import PageHero from '@/components/sections/PageHero';
import GalleryContent from '@/components/sections/GalleryContent';
import NewsletterSection from '@/components/sections/NewsletterSection';

export const metadata = {
    title: 'Gallery | DaySpring Chapel',
    description: 'View photos from our services, events, and community activities.',
};

export default function GalleryPage() {
    return (
        <main>
            <PageHero
                title="GALLERY"
                subtitle="Capturing moments of faith, fellowship, and worship."
                bgImage="/about-cover.png"
            />

            <GalleryContent />

            <NewsletterSection />
        </main>
    );
}
