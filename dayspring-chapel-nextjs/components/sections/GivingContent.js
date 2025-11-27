'use client';

import { useState } from 'react';
import Image from 'next/image';

const givingOptions = [
    {
        id: 'offering',
        label: 'Offering',
        description: 'Support the day-to-day operations and ministry of the church.',
        accountName: 'DaySpring Chapel Offering',
        accountNumber: '1234567890',
        bankName: 'Access Bank',
    },
    {
        id: 'tithe',
        label: 'Tithe',
        description: 'Bring the whole tithe into the storehouse, that there may be food in my house.',
        accountName: 'DaySpring Chapel Tithe',
        accountNumber: '0987654321',
        bankName: 'Access Bank',
    },
    {
        id: 'partnership',
        label: 'Partnership',
        description: 'Partner with us to take the gospel to the ends of the earth.',
        accountName: 'DaySpring Chapel Partnership',
        accountNumber: '1122334455',
        bankName: 'GTBank',
    },
    {
        id: 'project',
        label: 'Project',
        description: 'Support our building projects and infrastructure development.',
        accountName: 'DaySpring Chapel Projects',
        accountNumber: '5544332211',
        bankName: 'Zenith Bank',
    },
];

export default function GivingContent() {
    const [activeTab, setActiveTab] = useState(givingOptions[0].id);
    const [isRevealed, setIsRevealed] = useState(false);
    const [copied, setCopied] = useState(false);

    const activeOption = givingOptions.find(option => option.id === activeTab);

    // Reset reveal state when tab changes
    const handleTabChange = (id) => {
        setActiveTab(id);
        setIsRevealed(false);
        setCopied(false);
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <section className="py-16 bg-gray-50">
            <div className="max-w-4xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4 uppercase">
                        Ways to Give
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver." - 2 Corinthians 9:7
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Tabs */}
                    <div className="flex flex-wrap border-b">
                        {givingOptions.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => handleTabChange(option.id)}
                                className={`flex-1 py-4 px-6 text-sm md:text-base font-semibold transition-colors duration-300 ${activeTab === option.id
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="p-8 md:p-12 text-center">
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{activeOption.label}</h3>
                            <p className="text-gray-600">{activeOption.description}</p>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-6 md:p-8 max-w-md mx-auto border border-gray-200 min-h-[300px] flex flex-col justify-center">
                            {!isRevealed ? (
                                <div className="flex flex-col items-center gap-6">
                                    <div className="space-y-4 w-full opacity-50 blur-sm select-none">
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1 uppercase tracking-wider">Bank Name</p>
                                            <p className="text-xl font-bold text-gray-800">****************</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1 uppercase tracking-wider">Account Name</p>
                                            <p className="text-xl font-bold text-gray-800">****************</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1 uppercase tracking-wider">Account Number</p>
                                            <p className="text-3xl font-mono font-bold text-gray-400 tracking-widest">**********</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setIsRevealed(true)}
                                        className="absolute py-3 px-8 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-semibold shadow-lg transform hover:scale-105"
                                    >
                                        Reveal Account Details
                                    </button>
                                </div>
                            ) : (
                                <div className="animate-fade-in">
                                    <p className="text-sm text-gray-500 mb-1 uppercase tracking-wider">Bank Name</p>
                                    <p className="text-xl font-bold text-gray-800 mb-6">{activeOption.bankName}</p>

                                    <p className="text-sm text-gray-500 mb-1 uppercase tracking-wider">Account Name</p>
                                    <p className="text-xl font-bold text-gray-800 mb-6">{activeOption.accountName}</p>

                                    <p className="text-sm text-gray-500 mb-1 uppercase tracking-wider">Account Number</p>
                                    <div className="flex items-center justify-center gap-3 mb-2">
                                        <p className="text-3xl font-mono font-bold text-primary">{activeOption.accountNumber}</p>
                                        <button
                                            onClick={() => handleCopy(activeOption.accountNumber)}
                                            className="p-2 text-gray-400 hover:text-primary transition-colors"
                                            title="Copy to clipboard"
                                        >
                                            {copied ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    {copied && <span className="text-xs text-green-500 font-medium">Copied!</span>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
