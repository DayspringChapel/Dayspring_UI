'use client';
import Image from 'next/image';

export default function MissionStatementSection({ className = '' }) {
    return (
        <section className={` bg-white  ${className}`}>
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center gap-2 lg:gap-4">
                    {/* Left Content */}
                    <div className="flex-1 max-w-xl text-center lg:text-right">
                        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900 uppercase">
                            Our Mission Statement
                        </h2>


                        <div className="flex gap-4 justify-center lg:justify-end">
                            <div className="flex-shrink-0 mt-1">

                            </div>
                            <p className="text-gray-700 text-base md:text-lg leading-relaxed flex items-center gap-2">
                                <Image
                                    src="/light-bulb.png"
                                    alt="bullet"
                                    width={20}
                                    height={20}
                                    className="flex-shrink-0"
                                />
                                Discover Purpose, Build Potentials, and Fulfill Dreams
                            </p>
                        </div>
                    </div>

                    {/* Right Images - Overlapping Stack */}
                    <div className="w-full lg:w-1/2 order-2 lg:order-1">
                        <div className="relative h-[400px] md:h-[400px] max-w-[400px] lg:ml-auto mx-auto lg:mx-0">
                            {/* Main large image - bottom left */}
                            <div className="absolute right-5 bottom-20 w-[95%] h-[65%] rounded-2xl overflow-hidden shadow-xl z-10">
                                <Image
                                    src="/about-us2.png"
                                    alt="Church worship service"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="absolute right-20 bottom-30 w-[95%] h-[65%] rounded-2xl overflow-hidden shadow-xl z-1">
                                <Image
                                    src="/about-us2.png"
                                    alt="Church worship service"
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
