'use client';

export default function PageHero({ title, subtitle, bgImage }) {
    return (
        <div
            className="relative w-full h-[50vh] md:h-[60vh] flex items-center justify-center text-white text-center bg-cover bg-center bg-no-repeat"
            style={{
                backgroundImage: `url(${bgImage || '/about-bg.jpg'})`,
            }}
        >
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/60" />

            {/* Content */}
            <div className="relative z-10 px-4">
                <h1 className="text-5xl md:text-7xl font-bold mb-6 uppercase tracking-widest">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-xl md:text-2xl max-w-3xl mx-auto font-light">
                        {subtitle}
                    </p>
                )}
            </div>
        </div>
    );
}
