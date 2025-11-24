'use client';

import { FaBullseye, FaEye } from 'react-icons/fa'; // You might need to install react-icons

export default function MissionVisionSection() {
    return (
        <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Mission Card */}
                    <div className="bg-white p-10 rounded-2xl shadow-lg border-t-4 border-[#F58634] hover:-translate-y-2 transition-transform duration-300">
                        <div className="w-16 h-16 bg-[#F58634]/10 rounded-full flex items-center justify-center mb-6 text-[#F58634]">
                            {/* Icon placeholder if react-icons not available, using text for now to be safe */}
                            <span className="text-3xl">🎯</span>
                        </div>
                        <h3 className="text-2xl font-bold mb-4 text-gray-900">OUR MISSION</h3>
                        <p className="text-gray-600 leading-relaxed text-lg">
                            To raise a people of purpose, power, and passion who will impact their
                            generation for Christ through the preaching of the Word and the
                            demonstration of the Spirit.
                        </p>
                    </div>

                    {/* Vision Card */}
                    <div className="bg-white p-10 rounded-2xl shadow-lg border-t-4 border-[#14142f] hover:-translate-y-2 transition-transform duration-300">
                        <div className="w-16 h-16 bg-[#14142f]/10 rounded-full flex items-center justify-center mb-6 text-[#14142f]">
                            <span className="text-3xl">👁️</span>
                        </div>
                        <h3 className="text-2xl font-bold mb-4 text-gray-900">OUR VISION</h3>
                        <p className="text-gray-600 leading-relaxed text-lg">
                            To be a global voice of hope and transformation, creating an
                            atmosphere where divinity meets humanity and lives are forever
                            changed.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
