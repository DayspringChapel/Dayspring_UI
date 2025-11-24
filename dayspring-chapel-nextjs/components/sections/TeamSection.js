'use client';

import Image from 'next/image';

const teamMembers = [
    {
        id: 1,
        name: 'Rev. John Doe',
        role: 'Senior Pastor',
        image: '/team-1.jpg', // Placeholder
    },
    {
        id: 2,
        name: 'Pastor Jane Doe',
        role: 'Associate Pastor',
        image: '/team-2.jpg', // Placeholder
    },
    {
        id: 3,
        name: 'Minister Mike Smith',
        role: 'Music Director',
        image: '/team-3.jpg', // Placeholder
    },
    {
        id: 4,
        name: 'Deaconess Sarah Jones',
        role: 'Children\'s Church',
        image: '/team-4.jpg', // Placeholder
    },
];

export default function TeamSection() {
    return (
        <section className="py-16 md:py-24 bg-white">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl md:text-4xl font-bold italic text-[#F58634] mb-4">
                    LEADERSHIP TEAM
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto mb-16 text-lg">
                    Meet the anointed men and women God is using to lead and shepherd this
                    flock.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {teamMembers.map((member) => (
                        <div key={member.id} className="group">
                            <div className="relative h-[350px] w-full rounded-xl overflow-hidden mb-6 shadow-lg">
                                <Image
                                    src={member.image}
                                    alt={member.name}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                {/* Overlay on hover */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                                    <span className="text-white font-medium tracking-wide">
                                        View Profile
                                    </span>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                            <p className="text-[#F58634] font-medium">{member.role}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
