'use client';

import Image from 'next/image';
import { useState } from 'react';

const galleryImages = [
    { id: 1, src: '/carousel-img-1.png', alt: 'Church Service', category: 'Services' },
    { id: 2, src: '/carousel-img-2.png', alt: 'Worship', category: 'Services' },
    { id: 3, src: '/carousel-img-3.png', alt: 'Fellowship', category: 'Services' },
    { id: 4, src: '/about-us1.png', alt: 'Community', category: 'Events' },
    { id: 5, src: '/about-us2.png', alt: 'Gathering', category: 'Events' },
    { id: 6, src: '/about-us3.png', alt: 'Ministry', category: 'Events' },
    { id: 7, src: '/about-us4.png', alt: 'Outreach', category: 'Outreach' },
    { id: 8, src: '/about-us5.png', alt: 'Service', category: 'Outreach' },
    { id: 9, src: '/upcoming-events-1.png', alt: 'Event 1', category: 'Events' },
    { id: 10, src: '/upcoming-events-2.png', alt: 'Event 2', category: 'Events' },
    { id: 11, src: '/upcoming-events-3.png', alt: 'Event 3', category: 'Events' },
];

const categories = ['All', 'Services', 'Events', 'Outreach'];

export default function GalleryContent() {
    const [activeCategory, setActiveCategory] = useState('All');

    const filteredImages = activeCategory === 'All'
        ? galleryImages
        : galleryImages.filter(img => img.category === activeCategory);

    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4 uppercase">
                        Photo Gallery
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto mb-8">
                        Moments captured from our services, events, and community activities.
                    </p>

                    {/* Category Filter */}
                    <div className="flex flex-wrap justify-center gap-4">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${activeCategory === category
                                        ? 'bg-primary text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Gallery Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredImages.map((image) => (
                        <div
                            key={image.id}
                            className="relative aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-shadow duration-300 group cursor-pointer"
                        >
                            <Image
                                src={image.src}
                                alt={image.alt}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                                <span className="text-white font-semibold text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    {image.alt}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredImages.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No images found in this category.</p>
                    </div>
                )}
            </div>
        </section>
    );
}
