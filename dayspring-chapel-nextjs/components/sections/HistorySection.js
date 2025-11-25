'use client';

import Image from 'next/image';

export default function HistorySection() {
    return (
        <section className="py-16 md:py-24 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                    {/* Image Content */}
                    <div className="w-full lg:w-1/2 relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-xl">
                        <Image
                            src="/about-us4.png"
                            alt="Church History"
                            fill
                            className="object-cover"
                        />
                    </div>

                    {/* Text Content */}
                    <div className="w-full lg:w-1/2">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#14142f] mb-6 uppercase">
                            Our History
                        </h2>
                        <div className="space-y-4 text-gray-700 text-base md:text-lg leading-relaxed">
                            <p>
                                DaySpring Chapel was established with a divine mandate to raise a
                                generation of purposeful people. It began as a vision to create a
                                place where people can discover their God-given potential and
                                fulfill their destiny.
                            </p>
                            <p>
                                Over the years, we have grown from a small gathering into a vibrant
                                community of believers, dedicated to worship, the Word, and service
                                to humanity. Our journey has been marked by the faithfulness of God
                                and the transformation of countless lives.
                            </p>
                            <p>
                                Today, we continue to stand as a beacon of hope, equipping saints
                                for the work of ministry and impacting our society with the love of
                                Christ.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
