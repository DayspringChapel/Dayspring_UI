'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import apiClient from '@/lib/apiClient';

export default function GalleryContent() {
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAlbum, setSelectedAlbum] = useState(null);

    useEffect(() => {
        fetchAlbums();
    }, []);

    const fetchAlbums = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await apiClient.getAlbums();
            setAlbums(data || []);
            if (data && data.length > 0) {
                setSelectedAlbum(data[0].id);
            }
        } catch (err) {
            console.error('Failed to fetch albums:', err);
            setError('Failed to load gallery. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const currentAlbum = albums.find(album => album.id === selectedAlbum);
    const images = currentAlbum?.images || [];

    if (loading) {
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
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="aspect-square rounded-xl bg-gray-200 animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Gallery</h3>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button
                            onClick={fetchAlbums}
                            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </section>
        );
    }

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

                    {/* Album Filter */}
                    {albums.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-4">
                            {albums.map((album) => (
                                <button
                                    key={album.id}
                                    onClick={() => setSelectedAlbum(album.id)}
                                    className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${selectedAlbum === album.id
                                            ? 'bg-primary text-white shadow-lg'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {album.title}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Gallery Grid */}
                {albums.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Albums Yet</h3>
                        <p className="text-gray-600">Check back soon for photos from our events and services!</p>
                    </div>
                ) : images.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No images in this album yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {images.map((image, index) => (
                            <div
                                key={index}
                                className="relative aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-shadow duration-300 group cursor-pointer"
                            >
                                <Image
                                    src={image.url || image}
                                    alt={`${currentAlbum.title} - Image ${index + 1}`}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                                    <span className="text-white font-semibold text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        View
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
