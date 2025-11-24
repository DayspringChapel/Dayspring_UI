'use client';

export default function PageHero({ title, subtitle, bgImage }) {
    return (
        <div
            className="relative w-full h-[40vh] md:h-[50vh] flex items-center justify-center text-white text-center bg-cover bg-center bg-no-repeat"
            style={{
                backgroundImage: `url(${bgImage || '/about-bg.jpg'})`, // Fallback image
            }}
        >
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/50" />

            {/* Content */}
            <div className="relative z-10 px-4">
                <h1 className="text-4xl md:text-6xl font-bold mb-4 uppercase tracking-wider">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-lg md:text-xl max-w-2xl mx-auto font-medium">
                        {subtitle}
                    </p>
                )}
            </div>
        </div>
    );
}
