'use client';

import Image from 'next/image';

export default function OutreachSection() {
    return (
        <section className="py-16 md:py-24 bg-white">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                    {/* Text Content */}
                    <div className="w-full lg:w-1/2">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#14142f] mb-6 uppercase">
                            Outreach
                        </h2>
                        <div className="space-y-4 text-gray-700 text-base md:text-lg leading-relaxed">
                            <p>
                                At DaySpring Chapel, we believe in taking the gospel beyond the four
                                walls of the church. Our outreach programs are designed to touch
                                lives in local communities, rural areas, and urban centers.
                            </p>
                            <p>
                                Through our local outreach initiatives, we partner with communities
                                to provide spiritual guidance, humanitarian aid, and practical
                                support to those in need. We organize regular evangelism programs,
                                feeding initiatives, and community development projects.
                            </p>
                            <p>
                                Our rural outreach extends the love of Christ to underserved areas,
                                bringing hope, education, and resources to remote communities. In
                                urban centers, we engage with diverse populations, addressing the
                                unique challenges of city life while sharing the transforming power
                                of the gospel.
                            </p>
                        </div>
                    </div>

                    {/* Image */}
                    <div className="w-full lg:w-1/2 relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-xl">
                        <Image
                            src="/about-us5.png"
                            alt="Church outreach activities"
                            fill
                            className="object-cover"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
