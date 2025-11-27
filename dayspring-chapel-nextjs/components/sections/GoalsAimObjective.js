'use client';

import Image from 'next/image';

export default function GoalsAimObjective({ className = '' }) {
    const point = [
        'Show people the way to God and guide them to the way of peace',
        'Help people to discover God\'s purpose for their life',
        'Lead people to the way of God and guide them to the way of peace',
        'Help people to grow to maturity in Christ',
        'To be a Church where lives are transformed, future is preserved and heaven is secured',
    ];

    return (
        <section className={`py-16 md:py-24 bg-white ${className}`}>
            <div className="px-4 max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">


                    {/* Text Content - Left Side */}
                    <div className="w-full lg:w-1/2 order-1 lg:order-1 text-center lg:text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900 uppercase">
                            Our Goals, Aim and Objectives
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
                                    <span className="text-gray-700 text-base md:text-normal">{point}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Image Collage - Right Side */}
                    <div className="w-full lg:w-1/2 order-2 lg:order-2">
                        <div className="relative h-[500px] md:h-[600px] max-w-[600px] mx-auto">
                            {/* Main large image - bottom left */}
                            <div className="absolute right-5 bottom-20 w-[65%] h-[65%] rounded-2xl overflow-hidden shadow-xl z-10">
                                <Image
                                    src="/about-us4.png"
                                    alt="Church worship service"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="absolute right-25 bottom-30 w-[65%] h-[65%] rounded-2xl overflow-hidden shadow-xl z-1">
                                <Image
                                    src="/about-us4.png"
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
