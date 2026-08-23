'use client';

import { useState } from 'react';
import Navbar from './Navbar';
import MobileNav from './MobileNav';
import HamburgerButton from './HamburgerButton';

export default function Navigation() {
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

    const openMobileNav = () => setIsMobileNavOpen(true);
    const closeMobileNav = () => setIsMobileNavOpen(false);

    return (
        <>
            <div className="relative">
                <Navbar />
                <div className="absolute top-2 right-4 md:hidden">
                    <HamburgerButton onClick={openMobileNav} />
                </div>
            </div>
            <MobileNav isOpen={isMobileNavOpen} onClose={closeMobileNav} />
        </>
    );
}
