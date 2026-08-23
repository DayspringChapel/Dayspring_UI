'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const navigation = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/library', label: 'Library' },
    { href: '/donate', label: 'Giving' },
    { href: '/events', label: 'Events' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/appointment', label: 'Appointment' },
];

export default function Navbar() {
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        handleScroll();
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            className={`flex items-center justify-around bg-dark text-xs text-white transition-all duration-300 ${isScrolled ? 'fixed top-0 left-0 right-0 z-50 shadow-lg' : ''}`}
            aria-label="Primary navigation"
        >
            <Link href="/" className="block" aria-label="DaySpring Chapel home">
                <Image src="/logo.png" alt="DaySpring Chapel" width={92} height={50} className="h-[50px] w-[92px]" priority />
            </Link>

            <ul className="hidden items-center gap-8 md:flex">
                {navigation.map((item) => (
                    <li key={item.href}>
                        <Link
                            href={item.href}
                            className={`transition-colors hover:text-primary ${pathname === item.href ? 'text-primary' : ''}`}
                            aria-current={pathname === item.href ? 'page' : undefined}
                        >
                            {item.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
