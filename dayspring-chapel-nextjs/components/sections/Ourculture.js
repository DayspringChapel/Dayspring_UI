'use client';
import Image from 'next/image';

export default function OurCulture({ className = '' }) {
    const point = [
        'Excellence',
        'Ethical Behaviour',
        'Spiritual Growth',
        'Purity',
    ];
    return (
        <section className={` bg-white  ${className}`}>
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center gap-2 lg:gap-4">
                    {/* Left Content */}
                    <div className="w-full lg:w-1/2 order-1 lg:order-1 text-center lg:text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900 uppercase">
                            Our Culture
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

                    {/* Right Images - Overlapping Stack */}
                    <div className="w-full lg:w-1/2 order-2 lg:order-1">
                        <div className="relative h-[400px] md:h-[400px] max-w-[400px] lg:ml-auto mx-auto lg:mx-0">
                            {/* Main large image - bottom left */}
                            <div className="absolute left-1/2 -translate-x-[35%] lg:left-auto lg:right-5 lg:translate-x-0 bottom-20 w-[95%] h-[65%] rounded-2xl overflow-hidden shadow-xl z-10">
                                <Image
                                    src="/about-us2.png"
                                    alt="Church worship service"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="absolute left-1/2 -translate-x-[65%] lg:left-auto lg:right-20 lg:translate-x-0 bottom-30 w-[95%] h-[65%] rounded-2xl overflow-hidden shadow-xl z-1">
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
