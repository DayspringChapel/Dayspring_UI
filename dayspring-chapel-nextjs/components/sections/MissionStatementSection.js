'use client';

export default function MissionStatementSection() {
    return (
        <section className="py-16 md:py-24 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto">
                    {/* Mission Statement Card */}
                    <div className="bg-white p-10 md:p-12 rounded-2xl shadow-xl border-t-4 border-[#F58634]">
                        <div className="w-16 h-16 bg-[#F58634]/10 rounded-full flex items-center justify-center mb-6 text-[#F58634] mx-auto">
                            <span className="text-4xl">🎯</span>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900 uppercase text-center">
                            Our Mission Statement
                        </h3>
                        <p className="text-gray-600 leading-relaxed text-base md:text-lg text-center">
                            To raise a people of purpose, power, and passion who will impact their
                            generation for Christ through the preaching of the Word and the
                            demonstration of the Spirit. We are committed to creating an atmosphere
                            where divinity meets humanity and lives are forever changed.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
