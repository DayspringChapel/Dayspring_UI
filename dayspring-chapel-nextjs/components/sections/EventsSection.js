import Image from 'next/image';
import Link from 'next/link';

const events = [
    {
        id: 1,
        title: 'SERVICE OF HYMNS',
        date: 'MARCH 2025',
        image: '/upcoming-events-3.png',
    },
    {
        id: 2,
        title: "GLS'2025",
        date: 'MARCH 2025',
        image: '/upcoming-events-1.png',
    },
    {
        id: 3,
        title: 'YOUTH FEAST',
        date: 'MARCH 2025',
        image: '/upcoming-events-2.png',
    },
    {
        id: 4,
        title: 'SERVICE OF HYMNS',
        date: 'MARCH 2025',
        image: '/upcoming-events-3.png',
    },
    {
        id: 5,
        title: "GLS'2025",
        date: 'MARCH 2025',
        image: '/upcoming-events-1.png',
    },
    {
        id: 6,
        title: 'YOUTH FEAST',
        date: 'MARCH 2025',
        image: '/upcoming-events-2.png',
    },
];

export default function EventsSection() {
    return (
        <div className="container mx-auto px-4">
            {/* Mobile Heading */}
            <h2 className="text-2xl md:hidden text-center mb-8 font-bold">
                UPCOMING EVENTS
            </h2>

            <div className="text-center md:text-left">
                <h2 className="text-3xl md:text-4xl font-bold italic mb-6 hidden md:block text-center">
                    GET A GLIMPSE OF OUR UPCOMING EVENTS
                </h2>
                <p className="text-lg mb-12 max-w-4xl mx-auto text-center leading-relaxed text-gray-600">
                    Explore our upcoming programs and get ready for a life-transforming
                    encounter in God's presence. These God-ordained gatherings are
                    designed to uplift, inspire, and renew your spirit.
                </p>

                {/* Events Grid - 2 rows x 3 columns */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 mb-8">
                    {events.map((event) => (
                        <div
                            key={event.id}
                            className="relative h-[300px] rounded-lg overflow-hidden cursor-pointer group shadow-lg"
                        >
                            <Image
                                src={event.image}
                                alt={event.title}
                                fill
                                className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                            />
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300" />
                            {/* Event Description */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-center w-full px-4">
                                <p className="font-bold text-xl mb-2">{event.title}</p>
                                <p className="text-lg">{event.date}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Learn More Link */}
                <Link
                    href="/events"
                    className="inline-flex items-center gap-3 text-primary hover:text-primary-dark transition-colors font-semibold"
                >
                    <span className="underline">Learn More</span>
                    <Image
                        src="/arrow-icon.png"
                        alt="Arrow"
                        width={7}
                        height={12}
                        className="w-[7px] h-3"
                    />
                </Link>
            </div>
        </div>
    );
}
