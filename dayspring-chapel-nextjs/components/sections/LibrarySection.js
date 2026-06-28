'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import apiClient from '@/lib/apiClient';

export default function LibrarySection() {
    const [bookCount, setBookCount] = useState(null);
    const [sermonCount, setSermonCount] = useState(null);

    useEffect(() => {
        apiClient.getBooks().then((data) => setBookCount((data || []).length)).catch(() => setBookCount(0));
        apiClient.getSermons().then((data) => setSermonCount((data || []).length)).catch(() => setSermonCount(0));
    }, []);

    const libraryItems = [
        {
            id: 1,
            title: 'Christian Books',
            count: bookCount,
            label: 'books available',
            image: '/library.png',
            href: '/library',
        },
        {
            id: 2,
            title: 'Audio Sermons',
            count: sermonCount,
            label: 'messages',
            image: '/library.png',
            href: '/library',
        },
        {
            id: 3,
            title: 'Video Sermons',
            count: sermonCount,
            label: 'teachings',
            image: '/library.png',
            href: '/library',
        },
    ];

    return (
        <section className="text-center py-16 bg-gray-50">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">OUR LIBRARY</h2>
                <p className="mb-12 max-w-3xl mx-auto text-lg leading-relaxed">
                    Get access to transformational resources like books, sermons, and other materials necessary for
                    your growth and development
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-12">
                    {libraryItems.map((item) => (
                        <div key={item.id} className="flex flex-col items-center gap-4 text-dark group">
                            <div className="relative w-64 h-64 overflow-hidden rounded-full shadow-xl transition-transform duration-300 group-hover:scale-105">
                                <Image src={item.image} alt={item.title} fill className="object-cover" />
                            </div>
                            <p className="font-bold text-xl mt-4">{item.title}</p>
                            {item.count !== null && (
                                <p className="text-sm text-gray-500 -mt-2">
                                    <span className="font-bold text-primary">{item.count}</span> {item.label}
                                </p>
                            )}
                            <Link
                                href={item.href}
                                className="flex items-center gap-2 text-dark hover:text-primary transition-colors font-semibold"
                            >
                                <span className="underline">View</span>
                                <Image
                                    src="/arrow-icon-dark.png"
                                    alt="Arrow"
                                    width={7}
                                    height={12}
                                    className="w-[7px] h-3"
                                />
                            </Link>
                        </div>
                    ))}
                </div>

                <Link
                    href="/library"
                    className="inline-flex items-center gap-3 mt-12 text-primary hover:text-primary-dark transition-colors font-semibold"
                >
                    <span className="underline">View All</span>
                    <Image src="/arrow-icon.png" alt="Arrow" width={7} height={12} className="w-[7px] h-3" />
                </Link>
            </div>
        </section>
    );
}
