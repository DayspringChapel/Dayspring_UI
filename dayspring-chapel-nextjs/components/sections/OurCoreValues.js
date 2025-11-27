'use client';

import Image from 'next/image';

export default function OurCoreValues({ className = '' }) {
    const point = [
        'Love.',
        'Intergrity and Trust.',
        'Honor and Respect.',
        'Discipline.',

    ];

    return (
        <section className={`pt-16 md:pt-24 bg-white ${className}`}>
            <div className="px-4 max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                    {/* Image Collage - Left Side */}
                    <div className="w-full lg:w-1/2 order-2 lg:order-1">
                        <div className="relative h-[500px] md:h-[600px] max-w-[600px] mx-auto">
                            {/* Main large image - bottom left */}
                            <div className="absolute left-1/2 -translate-x-[35%] lg:left-auto lg:right-5 lg:translate-x-0 bottom-20 w-[65%] h-[65%] rounded-2xl overflow-hidden shadow-xl z-10">
                                <Image
                                    src="/about-us5.png"
                                    alt="Worship with us"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="absolute left-1/2 -translate-x-[65%] lg:left-auto lg:right-25 lg:translate-x-0 bottom-30 w-[65%] h-[65%] rounded-2xl overflow-hidden shadow-xl z-1">
                                <Image
                                    src="/about-us5.png"
                                    alt="Worship with us"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Text Content - Right Side */}
                    <div className="w-full lg:w-1/2 order-1 lg:order-2 text-center lg:text-left">
                        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900 uppercase">
                            Our Core Values
                        </h2>

                        <ul className="space-y-4 inline-block text-left">
                            {point.map((point, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <Image
                                        src="/light-bulb.png"
                                        alt="bullet"
                                        width={20}
                                        height={20}
                                        className="mt-1 flex-shrink-0"
                                    />
                                    <span className="text-gray-700 text-base font-semibold md:text-normal">{point}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
