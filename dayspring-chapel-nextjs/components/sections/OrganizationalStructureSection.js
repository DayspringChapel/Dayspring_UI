'use client';

export default function OrganizationalStructureSection() {
    const structure = [
        'Senior Pastor',
        'Associate Pastor - Administration',
        'Associate Pastor - Pastoral Care',
        'Associate Pastor - Outreach',
        'Worship',
        'Youth Ministry',
        'Children\'s Church',
        'Media',
        'Ushering',
        'Protocol',
        'Welfare',
        'Evangelism',
    ];

    return (
        <section className="py-16 md:py-24 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#14142f] mb-8 uppercase">
                        Organizational Structure
                    </h2>
                    <ul className="space-y-3 text-gray-700 text-base md:text-lg">
                        {structure.map((item, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-[#F58634] mr-3 text-xl">•</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}
