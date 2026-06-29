import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-dark text-white px-12 pt-16 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-[2fr_1.5fr] gap-8">
                {/* Left Side - Logo and Address */}
                <div className="flex flex-col items-center md:items-start justify-center">
                    <Image
                        src="/logo.png"
                        alt="Dayspring Chapel Logo"
                        width={210}
                        height={110}
                        className="w-[210px] h-[110px] md:w-[210px] md:h-[110px] mb-12 md:mb-0"
                    />

                    <ul className="hidden md:block mt-4">
                        <li className="text-primary mb-4">Physical Address</li>
                        <li>
                            Dayspring Chapel Obantoko, Conoil, Abeokuta, Ogun State, Nigeria
                        </li>
                    </ul>

                    <ul className="hidden md:block mt-4">
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

                    {/* Mobile Only - Address */}
                    <ul className="md:hidden">
                        <li className="text-primary mb-4">Physical Address</li>
                        <li>
                            Dayspring Chapel Obantoko, Conoil, Abeokuta, Ogun State, Nigeria
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
