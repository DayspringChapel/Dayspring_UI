'use client';

import Image from 'next/image';

export default function WhoWeAreSection() {
    return (
        <section className="py-16 md:py-24 bg-white">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center gap-12">
                    {/* Text Content */}
                    <div className="w-full lg:w-1/2">
                        <h2 className="text-3xl md:text-5xl font-bold text-[#14142f] mb-6 uppercase">
                            Who We Are
                        </h2>
                        <div className="space-y-4 text-gray-700 text-base md:text-lg leading-relaxed">
                            <p>
                                DaySpring Chapel is a vibrant, Spirit-filled community of believers
                                committed to raising a generation of purposeful people. We are a
                                place where divinity meets humanity, where potentials are built,
                                and where dreams are fulfilled.
                            </p>
                            <p>
                                Our church is founded on the unchanging Word of God and empowered
                                by the Holy Spirit. We believe in creating an atmosphere where
                                people can encounter God's presence, discover their purpose, and
                                walk in their divine destiny.
                            </p>
                            <p>
                                We are a family of passionate worshippers, dedicated intercessors,
                                and committed servants who are impacting our world one life at a
                                time. Through the preaching of the Word and the demonstration of
                                the Spirit, we are raising champions who will transform their
                                generation.
                            </p>
                        </div>
                    </div>

                    {/* Image Collage */}
                    <div className="w-full lg:w-1/2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative h-[250px] md:h-[300px] rounded-xl overflow-hidden shadow-lg">
                                <Image
                                    src="/about-us1.png"
                                    alt="Church worship service"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="relative h-[250px] md:h-[300px] rounded-xl overflow-hidden shadow-lg">
                                <Image
                                    src="/about-us2.png"
                                    alt="Church community"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="relative h-[250px] md:h-[300px] rounded-xl overflow-hidden shadow-lg col-span-2">
                                <Image
                                    src="/about-us3.png"
                                    alt="Church activities"
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
