import Image from 'next/image';

const galleryImages = [
    {
        id: 1,
        src: '/upcoming-events-1.png', // Using existing images as placeholders
        alt: 'Worship Service',
    },
    {
        id: 2,
        src: '/upcoming-events-2.png',
        alt: 'Preaching',
    },
    {
        id: 3,
        src: '/upcoming-events-3.png',
        alt: 'Community',
    },
];

export default function GalleryPreviewSection() {
    return (
        <section className="py-16">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {galleryImages.map((image) => (
                        <div
                            key={image.id}
                            className="relative h-[400px] rounded-2xl overflow-hidden shadow-lg"
                        >
                            <Image
                                src={image.src}
                                alt={image.alt}
                                fill
                                className="object-cover"
                            />
                            {/* Optional overlay or text can go here */}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
