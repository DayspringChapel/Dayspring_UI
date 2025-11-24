'use client';

export default function OurArmourSection() {
    const armourItems = [
        {
            id: 1,
            title: 'The Belt of Truth',
            description: 'We stand firm in the truth of God\'s Word, rejecting all forms of deception.',
            icon: '🛡️',
        },
        {
            id: 2,
            title: 'The Breastplate of Righteousness',
            description: 'We live righteous lives, protected by the righteousness of Christ.',
            icon: '⚔️',
        },
        {
            id: 3,
            title: 'The Gospel of Peace',
            description: 'We are ambassadors of peace, sharing the good news of Jesus Christ.',
            icon: '🕊️',
        },
        {
            id: 4,
            title: 'The Shield of Faith',
            description: 'Our faith in God shields us from the attacks of the enemy.',
            icon: '🛡️',
        },
        {
            id: 5,
            title: 'The Helmet of Salvation',
            description: 'We are secure in our salvation and the hope we have in Christ.',
            icon: '👑',
        },
        {
            id: 6,
            title: 'The Sword of the Spirit',
            description: 'The Word of God is our offensive weapon against spiritual darkness.',
            icon: '⚔️',
        },
    ];

    return (
        <section className="py-16 md:py-24 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-5xl font-bold text-[#14142f] mb-4 uppercase">
                        Our Armour
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                        We are equipped with the full armour of God to stand against spiritual opposition.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {armourItems.map((item) => (
                        <div
                            key={item.id}
                            className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-[#14142f]"
                        >
                            <div className="text-4xl mb-3">{item.icon}</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
