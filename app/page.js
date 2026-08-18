import VideoHero from '@/components/sections/VideoHero';
import WelcomeSection from '@/components/sections/WelcomeSection';
import EventsSection from '@/components/sections/EventsSection';
import LibrarySection from '@/components/sections/LibrarySection';
import SermonSection from '@/components/sections/SermonSection';
import GalleryPreviewSection from '@/components/sections/GalleryPreviewSection';
import NewsletterSection from '@/components/sections/NewsletterSection';
import ScrollReveal from '@/components/ui/ScrollReveal';

export default function Home() {
  return (
    <div>
      {/* Hero Section with Video Background */}
      <VideoHero />

      {/* Welcome Section */}
      <ScrollReveal>
        <section className="py-16">
          <WelcomeSection />
        </section>
      </ScrollReveal>

      {/* Upcoming Events Section */}
      <ScrollReveal>
        <section className="py-16">
          <EventsSection />
        </section>
      </ScrollReveal>

      {/* Library Section */}
      <ScrollReveal>
        <LibrarySection />
      </ScrollReveal>

      {/* Sermon Section */}
      <ScrollReveal>
        <SermonSection limit={4} />
      </ScrollReveal>

      {/* Gallery Preview Section */}
      <ScrollReveal>
        <GalleryPreviewSection />
      </ScrollReveal>

      {/* Newsletter Section */}
      <NewsletterSection />
    </div>
  );
}
