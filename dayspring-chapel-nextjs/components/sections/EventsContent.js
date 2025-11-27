'use client';

import Image from 'next/image';
import Link from 'next/link';

const events = [
    {
        id: 1,
        title: 'Sunday Service',
        date: 'Every Sunday',
        time: '9:00 AM - 11:00 AM',
        location: 'Main Auditorium',
        description: 'Join us for worship, praise, and powerful teaching from the Word of God.',
        image: '/upcoming-events-1.png',
        link: '#',
    },
    {
        id: 2,
        title: 'Midweek Service',
        date: 'Every Wednesday',
        time: '6:00 PM - 8:00 PM',
        location: 'Main Auditorium',
        description: 'A time of prayer, Bible study, and fellowship in the middle of the week.',
        image: '/upcoming-events-2.png',
        link: '#',
    },
    {
        id: 3,
        title: 'Youth Fellowship',
        date: 'Every Friday',
        time: '5:00 PM - 7:00 PM',
        location: 'Youth Center',
        description: 'Dynamic gathering for young people to connect, grow, and be empowered.',
        image: '/upcoming-events-3.png',
        link: '#',
    },
];

export default function EventsContent() {
    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4 uppercase">
                        Upcoming Events
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Join us for these upcoming events and experience the presence of God with us.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {events.map((event) => (
                        <div key={event.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 flex flex-col">
                            <div className="relative h-64 w-full">
                                <Image
                                    src={event.image}
                                    alt={event.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="p-6 flex flex-col flex-grow">
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">{event.title}</h3>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-sm font-medium">{event.date}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-sm font-medium">{event.time}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span className="text-sm font-medium">{event.location}</span>
                                    </div>
                                </div>

                                <p className="text-gray-600 text-sm mb-6 flex-grow">{event.description}</p>

                                <Link
                                    href={event.link}
                                    className="w-full py-3 px-6 bg-primary text-white text-center rounded-lg hover:bg-primary-dark transition-colors font-semibold"
                                >
                                    Learn More
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
