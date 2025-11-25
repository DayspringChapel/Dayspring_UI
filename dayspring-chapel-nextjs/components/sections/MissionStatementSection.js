'use client';
import Image from 'next/image';

export default function MissionStatementSection({ className = '' }) {
    return (
        <section className={`py-16 md:py-24 bg-white  ${className}`}>
            <div className="container mx-auto max-w-7xl ">
                <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-10">
                    {/* Left Content */}
                    <div className="flex-1 max-w-xl">
                        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900 uppercase">
                            Our Mission Statement
                        </h2>


                        <div className="flex gap-4">
                            <div className="flex-shrink-0 mt-1">

                            </div>
                            <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                                Discover Purpose, Build Potentials, and Fulfill Dreams
                            </p>
                        </div>
                    </div>

                    {/* Right Images - Overlapping Stack */}
                    <div className="flex-1 relative w-full max-w-2xl">
                        <div className="relative h-[300px] md:h-[400px]">
                            {/* Back Image */}
                            <div className="absolute top-0 left-0 w-[70%] md:w-[60%] h-full rounded-3xl overflow-hidden shadow-2xl">
                                <Image
                                    src="/about-us2.png"
                                    alt="Worship at Dayspring Chapel"
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            {/* Front Image - Overlapping */}
                            <div className="absolute bottom-0 right-0 w-[70%] md:w-[60%] h-[85%] rounded-3xl overflow-hidden shadow-2xl">
                                <Image
                                    src="/about-us2.png"
                                    alt="Community worship"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
