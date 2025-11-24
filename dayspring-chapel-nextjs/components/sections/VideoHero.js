'use client';

import Button from '@/components/ui/Button';

export default function VideoHero() {
    return (
        <div className="relative w-full h-screen overflow-hidden">
            {/* Desktop Video */}
            <video
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover hidden md:block"
            >
                <source src="/home-hero-vid.mp4" type="video/mp4" />
            </video>

            {/* Mobile Video */}
            <video
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover md:hidden"
            >
                <source src="/home-hero-vid-portrait.mp4" type="video/mp4" />
            </video>

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Content */}
            <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-4 z-10">
                <h1 className="text-4xl md:text-6xl font-bold mb-6 max-w-4xl">
                    A HOME AWAY FROM HOME
                </h1>
                <p className="text-lg md:text-xl mb-8 max-w-2xl hidden md:block">
                    Welcome to DaySpringChapel, a place where purpose is discovered,
                    potentials are built, and dreams are fulfilled
                </p>
                <div className="flex flex-col md:flex-row gap-4">
                    <button className="bg-primary hover:bg-primary-dark text-white font-semibold px-8 py-3 rounded-full transition-colors">
                        WATCH ONLINE
                    </button>
                    <button className="bg-transparent border-2 border-primary hover:bg-primary hover:border-primary text-white font-semibold px-8 py-3 rounded-full transition-all">
                        LISTEN ONLINE
                    </button>
                </div>
            </div>
        </div>
    );
}
