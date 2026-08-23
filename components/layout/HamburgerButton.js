'use client';

import Image from 'next/image';

export default function HamburgerButton({ onClick }) {
    return (
        <button
            onClick={onClick}
            className="md:hidden bg-transparent p-2"
            aria-label="Open mobile menu"
        >
            <Image
                src="/hamburger-menu.png"
                alt="Menu"
                width={24}
                height={24}
                className="w-6 h-6"
            />
        </button>
    );
}
