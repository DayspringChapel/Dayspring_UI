'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSocialLinks, whatsAppLink } from '@/lib/useSocialLinks';
import { FacebookIcon, InstagramIcon, YouTubeIcon, WhatsAppIcon } from '@/components/icons/SocialIcons';

export default function MobileNav({ isOpen, onClose }) {
    const social = useSocialLinks();
    const wa = whatsAppLink(social.whatsAppNumber, "Hi DaySpring Chapel, I'd like to chat.");
    const socialItems = [
        { href: social.facebookPageUrl, label: 'Facebook', icon: <FacebookIcon width={24} height={24} /> },
        { href: social.instagramPageUrl, label: 'Instagram', icon: <InstagramIcon width={24} height={24} /> },
        { href: social.youTubeChannelId ? `https://www.youtube.com/channel/${social.youTubeChannelId}` : '', label: 'YouTube', icon: <YouTubeIcon width={24} height={24} /> },
        { href: wa, label: 'WhatsApp', icon: <WhatsAppIcon width={24} height={24} /> },
    ].filter((item) => item.href);

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
                {socialItems.length > 0 && (
                    <div className="w-full flex flex-col items-start">
                        <p className="text-white text-xl font-semibold mb-4">Join Us</p>
                        <ul className="flex items-center gap-4">
                            {socialItems.map((item) => (
                                <li key={item.label}>
                                    <a
                                        href={item.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={`Follow us on ${item.label}`}
                                        className="text-white hover:text-dark/70 transition-colors"
                                    >
                                        {item.icon}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </nav>
        </>
    );
}
