'use client';

export default function OurCentralObjectivesSection() {
    const objectives = [
        'Worship',
        'Discipleship',
        'Fellowship',
        'Ministry',
        'Evangelism',
        'Stewardship',
    ];

    return (
        <section className="py-16 md:py-24 bg-white">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#14142f] mb-8 uppercase">
                        Our Central Objectives
                    </h2>
                    <ul className="space-y-3 text-gray-700 text-base md:text-lg">
                        {objectives.map((objective, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-[#F58634] mr-3 text-xl">•</span>
                                <span>{objective}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}
