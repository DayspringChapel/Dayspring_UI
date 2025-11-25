'use client';

import Image from 'next/image';

export default function WhoWeAreSection() {
    const points = [
        'Service to God is made interesting and simplified',
        'People\'s spiritual and physical needs are met',
        'Love to everyone is visible',
        'Salvation of souls is paramount',
        'Members are faithful and fruitful',
        'Message is biblical and mission is balanced',
        'Unbelievers are comfortable to attend',
    ];

    return (
        <section className="py-16 md:py-24 bg-white">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                    {/* Image Collage - Left Side */}
                    <div className="w-full lg:w-1/2 order-2 lg:order-1">
                        <div className="relative h-[500px] md:h-[600px]">
                            {/* Main large image - bottom left */}
                            <div className="absolute right-5 bottom-20 w-[55%] h-[65%] rounded-2xl overflow-hidden shadow-xl z-10">
                                <Image
                                    src="/about-us1.png"
                                    alt="Church worship service"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="absolute right-20 bottom-30 w-[55%] h-[65%] rounded-2xl overflow-hidden shadow-xl z-1">
                                <Image
                                    src="/about-us1.png"
                                    alt="Church worship service"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Text Content - Right Side */}
                    <div className="w-full lg:w-1/2 order-1 lg:order-2">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#14142f] mb-6 uppercase">
                            Who We Are
                        </h2>
                        <p className="text-gray-700 text-base md:text-lg mb-6">
                            We are a Church where:
                        </p>
                        <ul className="space-y-4">
                            {points.map((point, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <Image
                                        src="/light-bulb.png"
                                        alt="bullet"
                                        width={20}
                                        height={20}
                                        className="mt-1 flex-shrink-0"
                                    />
                                    <span className="text-gray-700 text-base md:text-lg">{point}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
