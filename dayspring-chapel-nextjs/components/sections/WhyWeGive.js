'use client';

import Image from 'next/image';

export default function WhyWeGive() {
    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center gap-12">
                    {/* Image Side */}
                    <div className="w-full md:w-1/2">
                        <div className="relative h-[400px] w-full rounded-3xl overflow-hidden shadow-xl">
                            <Image
                                src="/donate-hero.jfif" // Placeholder - User to update with specific image
                                alt="Why We Give"
                                fill
                                className="object-cover grayscale" // Adding grayscale to match the black and white vibe of the screenshot
                            />
                        </div>
                    </div>

                    {/* Text Side */}
                    <div className="w-full md:w-1/2 text-center md:text-left">
                        <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6 uppercase">
                            Why We Give
                        </h2>
                        <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                            Welcome to DaySpringChapel. a place where purpose is discovered, potentials are built. and dreams are fulfilled.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
