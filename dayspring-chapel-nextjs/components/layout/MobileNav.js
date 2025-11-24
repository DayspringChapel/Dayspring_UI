'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function MobileNav({ isOpen, onClose }) {
    return (
        <>
            {/* Mobile Navigation Overlay */}
            <nav
                className={`
          fixed top-0 left-0 w-full h-full z-[100]
          bg-gradient-to-b from-primary to-primary-dark
          flex flex-col items-center justify-between
          p-4 pb-2
          transition-transform duration-500 ease-in-out
          ${isOpen ? 'translate-y-0' : '-translate-y-full'}
          md:hidden
        `}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="self-end bg-transparent w-12 h-12 flex items-center justify-center"
                    aria-label="Close mobile menu"
                >
                    <Image
                        src="/mobile-nav-close.png"
                        alt="Close menu"
                        width={32}
                        height={32}
                        className="w-8 h-8"
                    />
                </button>

                {/* Navigation Links */}
                <ul className="w-full flex flex-col items-center justify-center gap-6 flex-1">
                    <li className="w-full">
                        <Link
                            href="/"
                            onClick={onClose}
                            className="block w-full bg-white text-dark text-center font-semibold text-base rounded-lg p-4"
                        >
                            Home
                        </Link>
                    </li>
                    <li className="w-full">
                        <Link
                            href="/about"
                            onClick={onClose}
                            className="block w-full bg-white text-dark text-center font-semibold text-base rounded-lg p-4"
                        >
                            About
                        </Link>
                    </li>
                    <li className="w-full">
                        <Link
                            href="/library"
                            onClick={onClose}
                            className="block w-full bg-white text-dark text-center font-semibold text-base rounded-lg p-4"
                        >
                            Library
                        </Link>
                    </li>
                    <li className="w-full">
                        <Link
                            href="/donate"
                            onClick={onClose}
                            className="block w-full bg-white text-dark text-center font-semibold text-base rounded-lg p-4"
                        >
                            Giving
                        </Link>
                    </li>
                    <li className="w-full">
                        <Link
                            href="/events"
                            onClick={onClose}
                            className="block w-full bg-white text-dark text-center font-semibold text-base rounded-lg p-4"
                        >
                            Events
                        </Link>
                    </li>
                    <li className="w-full">
                        <Link
                            href="/gallery"
                            onClick={onClose}
                            className="block w-full bg-white text-dark text-center font-semibold text-base rounded-lg p-4"
                        >
                            Gallery
                        </Link>
                    </li>
                    <li className="w-full">
                        <Link
                            href="/appointment"
                            onClick={onClose}
                            className="block w-full bg-white text-dark text-center font-semibold text-base rounded-lg p-4"
                        >
                            Appointment
                        </Link>
                    </li>
                </ul>

                {/* Social Media Section */}
                <div className="w-full flex flex-col items-start">
                    <p className="text-white text-xl font-semibold mb-4">Join Us</p>
                    <ul className="flex items-center gap-4">
                        <li>
                            <Image
                                src="/fb.png"
                                alt="Facebook"
                                width={24}
                                height={24}
                                className="w-6 h-6"
                            />
                        </li>
                        <li>
                            <Image
                                src="/twitter.png"
                                alt="Twitter"
                                width={24}
                                height={24}
                                className="w-6 h-6"
                            />
                        </li>
                        <li>
                            <Image
                                src="/ig.png"
                                alt="Instagram"
                                width={24}
                                height={24}
                                className="w-6 h-6"
                            />
                        </li>
                        <li>
                            <Image
                                src="/yt.png"
                                alt="YouTube"
                                width={24}
                                height={24}
                                className="w-6 h-6"
                            />
                        </li>
                    </ul>
                </div>
            </nav>
        </>
    );
}
