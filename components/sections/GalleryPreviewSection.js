'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import apiClient from '@/lib/apiClient';

export default function GalleryPreviewSection() {
    const [images, setImages] = useState([]);

    useEffect(() => {
        apiClient.getAlbums()
            .then((albums) => {
                const latestImages = (Array.isArray(albums) ? albums : [])
                    .flatMap((album) => (album.images || []).map((image) => ({
                        ...image,
                        albumTitle: album.title,
                    })))
                    .filter((image) => image.url)
                    .slice(0, 3);
                setImages(latestImages);
            })
            .catch(() => setImages([]));
    }, []);

    if (images.length === 0) return null;

    return (
        <section className="py-16" aria-labelledby="gallery-preview-heading">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between gap-4 mb-8">
                    <h2 id="gallery-preview-heading" className="text-3xl md:text-4xl font-bold">
                        Latest Photos
                    </h2>
                    <Link href="/gallery" className="text-primary font-semibold hover:underline">
                        View Gallery
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {images.map((image, index) => (
                        <div key={image.id || image.url} className="relative h-[400px] rounded-2xl overflow-hidden shadow-lg">
                            <Image
                                src={image.url}
                                alt={`${image.albumTitle || 'DaySpring Chapel gallery'} photo ${index + 1}`}
                                fill
                                className="object-cover"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
