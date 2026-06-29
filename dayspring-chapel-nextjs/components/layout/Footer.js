import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-dark text-white px-12 pt-16 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-[1.6fr_2fr] gap-10">
                {/* Left Side - Logo, Address, Map, Social */}
                <div className="flex flex-col items-center md:items-start gap-6">
                    <Image
                        src="/logo.png"
                        alt="Dayspring Chapel Logo"
                        width={210}
                        height={110}
                        className="w-[210px] h-[110px]"
                    />

                    {/* Address */}
                    <div className="hidden md:block">
                        <p className="text-primary mb-2 text-sm font-semibold tracking-wide">Physical Address</p>
                        <p className="text-sm leading-relaxed opacity-80">
                            Dayspring Chapel Obantoko,<br />
                            Conoil, Abeokuta, Ogun State, Nigeria
                        </p>
                    </div>

                    {/* Map embed */}
                    <div className="hidden md:block w-full rounded-xl overflow-hidden"
                        style={{ height: '190px', border: '1px solid rgba(255,255,255,0.10)' }}>
                        <iframe
                            src="https://www.google.com/maps?q=Dayspring+Chapel+Obantoko+Conoil+Abeokuta+Ogun+State+Nigeria&output=embed"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Dayspring Chapel Location"
                        />
                    </div>

                    {/* Get Directions link */}
                    <a
                        href="https://www.google.com/maps/search/Dayspring+Chapel+Obantoko+Conoil+Abeokuta+Ogun+State+Nigeria"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hidden md:inline-flex items-center gap-1.5 text-primary text-sm font-semibold hover:underline"
                    >
                        Get Directions
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                    </a>

                    {/* Social */}
                    <ul className="hidden md:block">
                        <li className="text-primary mb-4 text-sm font-semibold tracking-wide">Join Us</li>
                        <ul className="flex items-center gap-4">
                            <li>
                                <Image src="/fb.png" alt="Facebook" width={24} height={24} />
                            </li>
                            <li>
                                <Image src="/twitter.png" alt="Twitter" width={24} height={24} />
                            </li>
                            <li>
                                <Image src="/ig.png" alt="Instagram" width={24} height={24} />
                            </li>
                            <li>
                                <Image src="/yt.png" alt="YouTube" width={24} height={24} />
                            </li>
                        </ul>
                    </ul>
                </div>

                {/* Right Side - Navigation Links */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                    {/* Navigate */}
                    <ul>
                        <li className="text-primary mb-4">Navigate</li>
                        <li className="mb-3">
                            <Link href="/about">About</Link>
                        </li>
                        <li className="mb-3">
                            <Link href="/library">Library</Link>
                        </li>
                        <li className="mb-3">
                            <Link href="/appointment">Appointment</Link>
                        </li>
                        <li className="mb-3">
                            <Link href="/admin/login" className="opacity-60 hover:opacity-100 transition-opacity text-sm">
                                Staff Login
                            </Link>
                        </li>
                    </ul>

                    {/* About */}
                    <ul>
                        <li className="text-primary mb-4">About</li>
                        <li className="mb-3">Who we are</li>
                        <li className="mb-3">Our Mission</li>
                        <li className="mb-3">Our General overseer</li>
                    </ul>

                    {/* Gallery */}
                    <ul>
                        <li className="text-primary mb-4">Gallery</li>
                        <li className="mb-3">HCC Pictorial excerpts</li>
                        <li className="mb-3">Love Summit</li>
                        <li className="mb-3">Sunday Pictures</li>
                    </ul>

                    {/* Events */}
                    <ul>
                        <li className="text-primary mb-4">Events</li>
                        <li className="mb-3">HCC</li>
                        <li className="mb-3">Dayspring Festival</li>
                        <li className="mb-3">Love Summit</li>
                        <li className="mb-3">Service of Hymns</li>
                    </ul>

                    {/* Library */}
                    <ul>
                        <li className="text-primary mb-4">Library</li>
                        <li className="mb-3">Book Section</li>
                        <li className="mb-3">Sermon Section</li>
                    </ul>

                    {/* Giving */}
                    <ul>
                        <li className="text-primary mb-4">Giving</li>
                        <li className="mb-3">Why We Give</li>
                        <li className="mb-3">Giving Options</li>
                    </ul>

                    {/* Mobile Only - Join Us */}
                    <ul className="md:hidden">
                        <li className="text-primary mb-4">Join Us</li>
                        <ul className="flex items-center gap-4">
                            <li>
                                <Image src="/fb.png" alt="Facebook" width={24} height={24} />
                            </li>
                            <li>
                                <Image src="/twitter.png" alt="Twitter" width={24} height={24} />
                            </li>
                            <li>
                                <Image
                                    src="/ig.png"
                                    alt="Instagram"
                                    width={24}
                                    height={24}
                                />
                            </li>
                            <li>
                                <Image src="/yt.png" alt="YouTube" width={24} height={24} />
                            </li>
                        </ul>
                    </ul>

                    {/* Mobile Only - Address + map link */}
                    <ul className="md:hidden">
                        <li className="text-primary mb-3">Physical Address</li>
                        <li className="text-sm leading-relaxed opacity-80 mb-3">
                            Dayspring Chapel Obantoko, Conoil, Abeokuta, Ogun State, Nigeria
                        </li>
                        <li>
                            <a
                                href="https://www.google.com/maps/search/Dayspring+Chapel+Obantoko+Conoil+Abeokuta+Ogun+State+Nigeria"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary text-sm font-semibold inline-flex items-center gap-1"
                            >
                                View on Map →
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Copyright */}
            <p className="text-primary text-center text-xs mt-16 md:mt-8">
                DayspringChapel {currentYear}. All rights reserved &copy;.
            </p>
        </footer>
    );
}
