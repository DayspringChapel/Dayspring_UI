'use client';

export default function OrganizationalStructureSection() {
    return (
        <section className="py-16 md:py-24 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-5xl font-bold text-[#F58634] mb-4 uppercase italic">
                        Organizational Structure
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                        Our church is organized to effectively serve God's people and fulfill our mission.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto">
                    {/* Hierarchical Structure */}
                    <div className="space-y-8">
                        {/* Level 1: Senior Pastor */}
                        <div className="flex flex-col items-center">
                            <div className="bg-[#F58634] text-white px-8 py-4 rounded-xl shadow-lg text-center min-w-[250px]">
                                <h3 className="font-bold text-xl">Senior Pastor</h3>
                                <p className="text-sm mt-1">Spiritual Oversight</p>
                            </div>
                            <div className="w-1 h-12 bg-gray-300"></div>
                        </div>

                        {/* Level 2: Associate Pastors */}
                        <div className="flex flex-col items-center">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
                                <div className="bg-white border-2 border-[#F58634] px-6 py-4 rounded-xl shadow-md text-center">
                                    <h4 className="font-bold text-lg text-gray-900">Associate Pastor</h4>
                                    <p className="text-sm text-gray-600 mt-1">Administration</p>
                                </div>
                                <div className="bg-white border-2 border-[#F58634] px-6 py-4 rounded-xl shadow-md text-center">
                                    <h4 className="font-bold text-lg text-gray-900">Associate Pastor</h4>
                                    <p className="text-sm text-gray-600 mt-1">Pastoral Care</p>
                                </div>
                                <div className="bg-white border-2 border-[#F58634] px-6 py-4 rounded-xl shadow-md text-center">
                                    <h4 className="font-bold text-lg text-gray-900">Associate Pastor</h4>
                                    <p className="text-sm text-gray-600 mt-1">Outreach</p>
                                </div>
                            </div>
                            <div className="w-1 h-12 bg-gray-300"></div>
                        </div>

                        {/* Level 3: Department Heads */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white border border-gray-300 px-4 py-3 rounded-lg shadow-sm text-center">
                                <h5 className="font-semibold text-gray-900">Worship</h5>
                            </div>
                            <div className="bg-white border border-gray-300 px-4 py-3 rounded-lg shadow-sm text-center">
                                <h5 className="font-semibold text-gray-900">Youth Ministry</h5>
                            </div>
                            <div className="bg-white border border-gray-300 px-4 py-3 rounded-lg shadow-sm text-center">
                                <h5 className="font-semibold text-gray-900">Children's Church</h5>
                            </div>
                            <div className="bg-white border border-gray-300 px-4 py-3 rounded-lg shadow-sm text-center">
                                <h5 className="font-semibold text-gray-900">Media</h5>
                            </div>
                            <div className="bg-white border border-gray-300 px-4 py-3 rounded-lg shadow-sm text-center">
                                <h5 className="font-semibold text-gray-900">Ushering</h5>
                            </div>
                            <div className="bg-white border border-gray-300 px-4 py-3 rounded-lg shadow-sm text-center">
                                <h5 className="font-semibold text-gray-900">Protocol</h5>
                            </div>
                            <div className="bg-white border border-gray-300 px-4 py-3 rounded-lg shadow-sm text-center">
                                <h5 className="font-semibold text-gray-900">Welfare</h5>
                            </div>
                            <div className="bg-white border border-gray-300 px-4 py-3 rounded-lg shadow-sm text-center">
                                <h5 className="font-semibold text-gray-900">Evangelism</h5>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
