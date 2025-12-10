'use client';

import { useState, useEffect, useRef } from 'react';
import { COUNTRIES } from '@/lib/constants';

export default function PhoneNumberInput({ value, onChange, error }) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [localError, setLocalError] = useState('');
    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus search input when dropdown opens
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
        // Reset search when closed
        if (!isOpen) {
            setSearch('');
        }
    }, [isOpen]);

    const selectedCountry = COUNTRIES.find(c => c.dial_code === value.countryCode) || COUNTRIES[0];

    const filteredCountries = COUNTRIES.filter(country =>
        country.name.toLowerCase().includes(search.toLowerCase()) ||
        country.dial_code.includes(search) ||
        country.code.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelectCountry = (dialCode) => {
        onChange({
            ...value,
            countryCode: dialCode
        });
        setIsOpen(false);
    };

    const handleNumberChange = (e) => {
        const input = e.target.value;
        if (input === '' || /^\d+$/.test(input)) {
            onChange({
                ...value,
                number: input
            });
            if (input.length > 0 && input.length < 7) {
                setLocalError('Number is too short');
            } else {
                setLocalError('');
            }
        }
    };

    return (
        <div className="w-full relative" ref={dropdownRef}>
            <div className="flex gap-2">
                {/* Custom Country Selector */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className="w-[140px] px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-black font-medium bg-white flex items-center justify-between transition-all hover:border-orange-500"
                    >
                        <span className="flex items-center gap-2 truncate">
                            <span className="text-xl leading-none">{selectedCountry.flag}</span>
                            <span>{selectedCountry.dial_code}</span>
                        </span>
                        <span className="text-gray-400 text-xs ml-1">▼</span>
                    </button>

                    {/* Searchable Dropdown */}
                    {isOpen && (
                        <div className="absolute top-full left-0 mt-2 w-[300px] max-h-[300px] bg-white border border-gray-200 rounded-xl shadow-xl z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                            {/* Search Header */}
                            <div className="p-3 border-b border-gray-100 bg-gray-50 sticky top-0">
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search country..."
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                />
                            </div>

                            {/* Country List */}
                            <div className="overflow-y-auto flex-1 p-1">
                                {filteredCountries.length > 0 ? (
                                    filteredCountries.map((country) => (
                                        <button
                                            key={`${country.code}-${country.dial_code}`}
                                            type="button"
                                            onClick={() => handleSelectCountry(country.dial_code)}
                                            className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${selectedCountry.dial_code === country.dial_code && selectedCountry.code === country.code
                                                ? 'bg-orange-50 text-orange-700'
                                                : 'hover:bg-gray-50 text-gray-700'
                                                }`}
                                        >
                                            <span className="text-2xl leading-none flex-shrink-0">{country.flag}</span>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-medium truncate">{country.name}</span>
                                                <span className="text-xs text-gray-500">{country.dial_code}</span>
                                            </div>
                                            {selectedCountry.dial_code === country.dial_code && selectedCountry.code === country.code && (
                                                <span className="ml-auto text-orange-500">✓</span>
                                            )}
                                        </button>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-sm text-gray-500">
                                        No countries found
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <input
                    type="tel"
                    value={value.number}
                    onChange={handleNumberChange}
                    placeholder="800 000 0000"
                    className={`flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-black placeholder-gray-500 font-medium ${error || localError ? 'border-red-500' : 'border-gray-300'
                        }`}
                />
            </div>
            {(error || localError) && (
                <p className="text-red-500 text-sm mt-1">{error || localError}</p>
            )}
        </div>
    );
}
