'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            className={`
        flex items-center justify-around
        bg-dark text-white
        transition-all duration-300
        ${isScrolled ? 'fixed top-0 left-0 right-0 z-50 shadow-lg' : ''}
        text-xs
      `}
        >
            {/* Logo */}
            <div>
                <Link href="/" className="block">
                    <Image
                        src="/logo.png"
                        alt="Dayspring Chapel Logo"
                        width={92}
                        height={50}
                        className="w-[92px] h-[50px]"
                        priority
                    />
                </Link>
            </div>

            {/* Desktop Navigation Links */}
            <ul className="hidden md:flex items-center gap-8">
                <li>
                    <Link href="/" className="hover:text-primary transition-colors">
                        Home
                    </Link>
                </li>
                <li>
                    <Link href="/about" className="hover:text-primary transition-colors">
                        About
                    </Link>
                </li>
                <li>
                    <Link
                        href="/library"
                        className="hover:text-primary transition-colors"
                    >
                        Library
                    </Link>
                </li>
                <li>
                    <Link href="/donate" className="hover:text-primary transition-colors">
                        Giving
                    </Link>
                </li>
                <li>
                    <Link href="/events" className="hover:text-primary transition-colors">
                        Events
                    </Link>
                </li>
                <li>
                    <Link
                        href="/gallery"
                        className="hover:text-primary transition-colors"
                    >
                        Gallery
                    </Link>
                </li>
                <li>
                    <Link
                        href="/appointment"
                        className="hover:text-primary transition-colors"
                    >
                        Appointment
                    </Link>
                </li>
            </ul>
        </nav>
    );
}
