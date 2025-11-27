'use client';

import Image from 'next/image';
import Link from 'next/link';

const books = [
    {
        title: 'A Man Helped By God',
        author: 'Apostle Lawrence Achudume',
        image: '/library.jpg', // Using available placeholder
        link: '#',
    },
    {
        title: 'The Beauty In Your Scars',
        author: 'Tim James',
        image: '/library.jpg', // Standardizing to library.jpg
        link: '#',
    },
    {
        title: 'The Beauty In Your Scars',
        author: 'Tim James',
        image: '/library.jpg', // Standardizing to library.jpg
        link: '#',
    },
    {
        title: 'A Man Helped By God',
        author: 'Apostle Lawrence Achudume',
        image: '/library.jpg', // Standardizing to library.jpg
        link: '#',
    },
    {
        title: 'The Beauty In Your Scars',
        author: 'Tim James',
        image: '/library.jpg', // Standardizing to library.jpg
        link: '#',
    },
    {
        title: 'The Beauty In Your Scars',
        author: 'Tim James',
        image: '/library.jpg', // Standardizing to library.jpg
        link: '#',
    },
];

export default function LibraryContent() {
    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4 uppercase">
                        Books Section
                    </h2>
                    <p className="text-gray-700 max-w-5xl mx-auto text-base md:text-lg">
                        Welcome to DaySpringChapel. a place where purpose is discovered, potentials are built. and dreams are fulfilled. Welcome to DaySpringChapel. a place wySpringChapel. a place where purpose is discovered, potentials are built. and dreams are fulfilled
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 mb-12">
                    {books.map((book, index) => (
                        <div key={index} className="flex flex-col items-center text-center group">
                            <div className="relative w-full aspect-square mb-6 rounded-3xl overflow-hidden shadow-lg">
                                <Image
                                    src={book.image}
                                    alt={book.title}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{book.title}</h3>
                            <p className="text-gray-900 font-medium mb-4">{book.author}</p>
                            <Link
                                href={book.link}
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
            </div>
        </section>
    );
}
