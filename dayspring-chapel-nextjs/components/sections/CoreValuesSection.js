'use client';

import Image from 'next/image';

export default function CoreValuesSection() {
    const coreValues = [
        {
            id: 1,
            title: 'The Word',
            description: 'We are committed to the unadulterated preaching and teaching of God\'s Word.',
            icon: '📖',
        },
        {
            id: 2,
            title: 'Prayer',
            description: 'We believe in the power of prayer and maintain a culture of intercession.',
            icon: '🙏',
        },
        {
            id: 3,
            title: 'Excellence',
            description: 'We pursue excellence in all we do, giving our best to God and His people.',
            icon: '⭐',
        },
        {
            id: 4,
            title: 'Integrity',
            description: 'We uphold the highest standards of honesty, transparency, and moral uprightness.',
            icon: '✨',
        },
        {
            id: 5,
            title: 'Love',
            description: 'We demonstrate the love of Christ in our relationships and service to others.',
            icon: '❤️',
        },
        {
            id: 6,
            title: 'Empowerment',
            description: 'We equip and empower believers to discover and fulfill their God-given purpose.',
            icon: '💪',
        },
    ];

    return (
        <section className="py-16 md:py-24 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-5xl font-bold text-[#F58634] mb-4 uppercase italic">
                        Our Core Values
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                        These are the foundational principles that guide everything we do at DaySpring Chapel.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {coreValues.map((value) => (
                        <div
                            key={value.id}
                            className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border-t-4 border-[#F58634]"
                        >
                            <div className="text-5xl mb-4">{value.icon}</div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">{value.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{value.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
