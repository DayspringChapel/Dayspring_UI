'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';

export default function SermonSection() {
    const [sermons, setSermons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSermons();
    }, []);

    const fetchSermons = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await apiClient.getSermons();
            // Show only first 8 sermons
            setSermons((data || []).slice(0, 8));
        } catch (err) {
            console.error('Failed to fetch sermons:', err);
            setError('Failed to load sermons. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4 uppercase">
                            Sermon Section
                        </h2>
                        <p className="text-gray-700 max-w-4xl mx-auto text-base md:text-lg">
                            Listen to life-transforming messages from God's word.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-gray-100 rounded-2xl p-4 flex items-center shadow-lg animate-pulse">
                                <div className="w-24 h-24 rounded-full bg-gray-200 -ml-8"></div>
                                <div className="flex-grow ml-8 h-12 bg-gray-200 rounded"></div>
                            </div>
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
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Sermons</h3>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button
                            onClick={fetchSermons}
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
                        Sermon Section
                    </h2>
                    <p className="text-gray-700 max-w-4xl mx-auto text-base md:text-lg">
                        Welcome to DaySpringChapel. a place where purpose is discovered, potentials are built. and dreams are fulfilled.
                    </p>
                </div>

                {sermons.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Sermons Available</h3>
                        <p className="text-gray-600">Check back soon for new messages!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                        {sermons.map((sermon, index) => (
                            <div key={index} className="bg-primary rounded-2xl p-4 flex items-center shadow-lg">
                                {/* Circular Image Container */}
                                <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full bg-white overflow-hidden flex-shrink-0 border-4 border-white -ml-8 md:-ml-12 shadow-md z-10">
                                    <Image
                                        src={sermon.imageUrl || "/headset.png"}
                                        alt="Sermon Headset"
                                        fill
                                        className="object-cover p-2"
                                    />
                                </div>

                                {/* Button/Dropdown Area */}
                                <div className="flex-grow ml-4 md:ml-8">
                                    <Link
                                        href={sermon.link || '#'}
                                        className="w-full bg-white text-black font-bold py-3 px-6 rounded-lg flex items-center justify-between shadow-sm hover:bg-gray-50 transition-colors"
                                    >
                                        <span className="text-base md:text-lg truncate mr-2">{sermon.title}</span>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={2}
                                            stroke="currentColor"
                                            className="w-5 h-5 flex-shrink-0"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex justify-end">
                    <Link
                        href="/library"
                        className="text-primary font-semibold hover:text-primary-dark transition-colors inline-flex items-center gap-1"
                    >
                        View All <span className="text-sm">›</span>
                    </Link>
                </div>
            </div>
        </section>
    );
}
