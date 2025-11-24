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
                <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-wide">
                    DISCOVER PURPOSE
                </h1>
                <p className="text-lg md:text-xl mb-10 max-w-3xl font-medium">
                    Welcome to DaySpring Chapel, a place where purpose is discovered,
                    potentials are built, and dreams are fulfilled
                </p>
                <div className="flex flex-col md:flex-row gap-6">
                    <button className="bg-[#F58634] hover:bg-[#d9752c] text-white font-bold px-10 py-3 rounded-full transition-colors uppercase text-sm tracking-wider">
                        WATCH ONLINE
                    </button>
                    <button className="bg-transparent border-2 border-white hover:bg-white hover:text-black text-white font-bold px-10 py-3 rounded-full transition-all uppercase text-sm tracking-wider">
                        LISTEN ONLINE
                    </button>
                </div>
            </div>
        </div>
    );
}
