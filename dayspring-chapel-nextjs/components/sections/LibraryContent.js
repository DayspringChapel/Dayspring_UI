'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import apiClient from '@/lib/apiClient';

export default function LibraryContent() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await apiClient.getBooks();
            // Show only first 6 books on the main library page
            setBooks((data || []).slice(0, 6));
        } catch (err) {
            console.error('Failed to fetch books:', err);
            setError('Failed to load books. Please try again later.');
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
                            Books Section
                        </h2>
                        <p className="text-gray-700 max-w-5xl mx-auto text-base md:text-lg">
                            Explore our collection of books to aid your spiritual growth and development.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="flex flex-col items-center text-center animate-pulse">
                                <div className="w-full aspect-square mb-6 rounded-3xl bg-gray-200"></div>
                                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Books</h3>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button
                            onClick={fetchBooks}
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
                        Books Section
                    </h2>
                    <p className="text-gray-700 max-w-5xl mx-auto text-base md:text-lg">
                        Explore our collection of books to aid your spiritual growth and development.
                    </p>
                </div>

                {books.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Books Available</h3>
                        <p className="text-gray-600">Check back soon for new additions to our library!</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 mb-12">
                            {books.map((book) => (
                                <div key={book.id} className="flex flex-col items-center text-center group">
                                    <div className="relative w-full aspect-square mb-6 rounded-3xl overflow-hidden shadow-lg">
                                        <Image
                                            src={book.imageUrl || '/library.jpg'}
                                            alt={book.title}
                                            fill
                                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">{book.title}</h3>
                                    <p className="text-gray-900 font-medium mb-4">{book.author}</p>
                                    <Link
                                        href={`/library/${book.id}`}
                                        className="text-primary font-semibold hover:text-primary-dark transition-colors inline-flex items-center gap-1"
                                    >
                                        View <span className="text-sm">›</span>
                                    </Link>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end">
                            <Link
                                href="/library/all"
                                className="text-primary font-semibold hover:text-primary-dark transition-colors inline-flex items-center gap-1"
                            >
                                View All <span className="text-sm">›</span>
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}
