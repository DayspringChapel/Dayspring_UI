'use client';

import { useState } from 'react';
import Navbar from './Navbar';
import MobileNav from './MobileNav';
import HamburgerButton from './HamburgerButton';
import useUpcomingEvent from '@/lib/useUpcomingEvent';

export default function Navigation() {
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const upcomingEvent = useUpcomingEvent();

    const openMobileNav = () => setIsMobileNavOpen(true);
    const closeMobileNav = () => setIsMobileNavOpen(false);

    return (
        <>
            <div className="relative">
                <Navbar upcomingEvent={upcomingEvent} />
                <div className="absolute top-2 right-4 md:hidden">
                    <HamburgerButton expanded={isMobileNavOpen} onClick={isMobileNavOpen ? closeMobileNav : openMobileNav} />
                </div>
            </div>
            <MobileNav isOpen={isMobileNavOpen} onClose={closeMobileNav} upcomingEvent={upcomingEvent} />
        </>
    );
}
