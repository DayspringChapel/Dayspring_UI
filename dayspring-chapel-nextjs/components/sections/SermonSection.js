'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const sermons = [
    { title: 'Faith-Building Blocks', link: '#' },
    { title: 'Faith-Building Blocks', link: '#' },
    { title: 'Faith-Building Blocks', link: '#' },
    { title: 'Faith-Building Blocks', link: '#' },
    { title: 'Faith-Building Blocks', link: '#' },
    { title: 'Faith-Building Blocks', link: '#' },
    { title: 'Faith-Building Blocks', link: '#' },
    { title: 'Faith-Building Blocks', link: '#' },
];

export default function SermonSection() {
    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4 uppercase">
                        Sermon Section
                    </h2>
                    <p className="text-gray-700 max-w-4xl mx-auto text-base md:text-lg">
                        Welcome to DaySpringChapel. a place where purpose is discovered, potentials are built. and dreams are fulfilled. Welcome to DaySpringChapel. a place wySpringChapel. a place where purpose is discovered, potentials are built. and dreams are fulfilled
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {sermons.map((sermon, index) => (
                        <div key={index} className="bg-primary rounded-2xl p-4 flex items-center shadow-lg">
                            {/* Circular Image Container */}
                            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full bg-white overflow-hidden flex-shrink-0 border-4 border-white -ml-8 md:-ml-12 shadow-md z-10">
                                <Image
                                    src="/headset.png"
                                    alt="Sermon Headset"
                                    fill
                                    className="object-cover p-2"
                                />
                            </div>

                            {/* Button/Dropdown Area */}
                            <div className="flex-grow ml-4 md:ml-8">
                                <button className="w-full bg-white text-black font-bold py-3 px-6 rounded-lg flex items-center justify-between shadow-sm hover:bg-gray-50 transition-colors">
                                    <span className="text-base md:text-lg">{sermon.title}</span>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className="w-5 h-5"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end">
                    <Link
                        href="/library/sermons"
                        className="text-primary font-semibold hover:text-primary-dark transition-colors inline-flex items-center gap-1"
                    >
                        View All <span className="text-sm">›</span>
                    </Link>
                </div>
            </div>
        </section>
    );
}
