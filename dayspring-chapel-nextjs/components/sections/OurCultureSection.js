'use client';

import Image from 'next/image';

export default function OurCultureSection() {
    return (
        <section className="py-16 md:py-24 bg-white">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                    {/* Image */}
                    <div className="w-full lg:w-1/2 relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-xl">
                        <Image
                            src="/carousel-img-1.png"
                            alt="Church culture and community"
                            fill
                            className="object-cover"
                        />
                    </div>

                    {/* Text Content */}
                    <div className="w-full lg:w-1/2">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#14142f] mb-6 uppercase">
                            Our Culture
                        </h2>
                        <div className="space-y-4 text-gray-700 text-base md:text-lg leading-relaxed">
                            <p>
                                At DaySpring Chapel, our culture is built on the foundation of love,
                                excellence, and the presence of God. We are a community that celebrates
                                diversity while maintaining unity in Christ.
                            </p>
                            <p>
                                We foster an environment where everyone is valued, gifts are developed,
                                and people are empowered to fulfill their divine purpose. Our culture
                                encourages authentic worship, genuine relationships, and passionate
                                service.
                            </p>
                            <p>
                                We believe in creating a family atmosphere where people can grow
                                spiritually, connect meaningfully, and serve wholeheartedly. This is
                                a place where you belong.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
