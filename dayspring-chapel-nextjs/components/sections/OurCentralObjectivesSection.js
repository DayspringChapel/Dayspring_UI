'use client';

export default function OurCentralObjectivesSection() {
    const objectives = [
        {
            id: 1,
            title: 'Worship',
            description: 'To create an atmosphere of genuine worship where God\'s presence is experienced.',
            icon: '🙌',
        },
        {
            id: 2,
            title: 'Discipleship',
            description: 'To raise mature believers who are grounded in the Word and Spirit.',
            icon: '📚',
        },
        {
            id: 3,
            title: 'Fellowship',
            description: 'To build a community of believers who love and support one another.',
            icon: '🤝',
        },
        {
            id: 4,
            title: 'Ministry',
            description: 'To equip saints for the work of ministry and service to humanity.',
            icon: '⚡',
        },
        {
            id: 5,
            title: 'Evangelism',
            description: 'To reach the lost and bring them into the kingdom of God.',
            icon: '📢',
        },
        {
            id: 6,
            title: 'Stewardship',
            description: 'To manage God\'s resources with wisdom, integrity, and accountability.',
            icon: '💎',
        },
    ];

    return (
        <section className="py-16 md:py-24 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-5xl font-bold text-[#14142f] mb-4 uppercase">
                        Our Central Objectives
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                        These are the key objectives that drive our ministry and guide our activities.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {objectives.map((objective) => (
                        <div
                            key={objective.id}
                            className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-[#F58634]"
                        >
                            <div className="text-5xl mb-4">{objective.icon}</div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">{objective.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{objective.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
