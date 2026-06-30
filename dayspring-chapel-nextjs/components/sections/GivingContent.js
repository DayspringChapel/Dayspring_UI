'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';

export default function GivingContent() {
    const [givings, setGivings]     = useState([]);
    const [loading, setLoading]     = useState(true);
    const [activeId, setActiveId]   = useState(null);
    const [isRevealed, setIsRevealed] = useState(false);
    const [copied, setCopied]       = useState(false);

    useEffect(() => {
        apiClient.getGivings()
            .then((data) => {
                const list = Array.isArray(data) ? data : [];
                setGivings(list);
                if (list.length > 0) setActiveId(list[0].id);
            })
            .catch(() => setGivings([]))
            .finally(() => setLoading(false));
    }, []);

    const active = givings.find((g) => g.id === activeId);

    const handleTabChange = (id) => {
        setActiveId(id);
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
                        &ldquo;Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver.&rdquo; &mdash; 2 Corinthians 9:7
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-24 text-gray-400">
                            <svg className="animate-spin h-8 w-8 mr-3 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                            Loading giving accounts…
                        </div>
                    ) : givings.length === 0 ? (
                        <div className="text-center py-24 text-gray-400">
                            No giving accounts available at this time.
                        </div>
                    ) : (
                        <>
                            {/* Tabs */}
                            <div className="flex flex-wrap border-b">
                                {givings.map((g) => (
                                    <button
                                        key={g.id}
                                        onClick={() => handleTabChange(g.id)}
                                        className={`flex-1 py-4 px-6 text-sm md:text-base font-semibold transition-colors duration-300 ${
                                            activeId === g.id
                                                ? 'bg-primary text-white'
                                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                        }`}
                                    >
                                        {g.name}
                                    </button>
                                ))}
                            </div>

                            {/* Content */}
                            {active && (
                                <div className="p-8 md:p-12 text-center">
                                    <div className="mb-8">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{active.name}</h3>
                                        <p className="text-gray-600">{active.purposeOfGiving}</p>
                                        {active.description && (
                                            <p className="text-sm text-gray-400 mt-2 italic">{active.description}</p>
                                        )}
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
                                                <p className="text-xl font-bold text-gray-800 mb-6">{active.bankName}</p>

                                                <p className="text-sm text-gray-500 mb-1 uppercase tracking-wider">Account Name</p>
                                                <p className="text-xl font-bold text-gray-800 mb-6">{active.accountName}</p>

                                                <p className="text-sm text-gray-500 mb-1 uppercase tracking-wider">Account Number</p>
                                                <div className="flex items-center justify-center gap-3 mb-2">
                                                    <p className="text-3xl font-mono font-bold text-primary">{active.accountNumber}</p>
                                                    <button
                                                        onClick={() => handleCopy(active.accountNumber)}
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
                            )}
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}
