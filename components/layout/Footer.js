import Link from 'next/link';
import Image from 'next/image';

const links = [
    { href: '/about', label: 'About' },
    { href: '/library', label: 'Library' },
    { href: '/events', label: 'Events' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/donate', label: 'Giving' },
    { href: '/appointment', label: 'Appointment' },
];

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-dark px-6 pt-16 pb-6 text-white md:px-12">
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 md:grid-cols-3">
                <div className="space-y-5">
                    <Image src="/logo.png" alt="DaySpring Chapel" width={210} height={110} className="h-[110px] w-[210px] object-contain" />
                    <p className="text-sm leading-relaxed text-white/80">
                        DaySpring Chapel Obantoko,<br />
                        Conoil, Abeokuta, Ogun State, Nigeria
                    </p>
                    <a href="https://www.google.com/maps/search/Dayspring+Chapel+Obantoko+Conoil+Abeokuta+Ogun+State+Nigeria" target="_blank" rel="noopener noreferrer" className="inline-flex text-sm font-semibold text-primary hover:underline">
                        Get Directions <span aria-hidden="true">→</span>
                    </a>
                </div>

                <nav aria-label="Footer navigation">
                    <h2 className="mb-4 font-semibold text-primary">Navigate</h2>
                    <ul className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                        {links.map((item) => <li key={item.href}><Link href={item.href} className="hover:text-primary">{item.label}</Link></li>)}
                    </ul>
                </nav>

                <div>
                    <h2 className="mb-4 font-semibold text-primary">Location</h2>
                    <div className="h-[190px] overflow-hidden rounded-xl border border-white/10">
                        <iframe
                            src="https://www.google.com/maps?q=Dayspring+Chapel+Obantoko+Conoil+Abeokuta+Ogun+State+Nigeria&output=embed"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="DaySpring Chapel location"
                        />
                    </div>
                </div>
            </div>

            <p className="mt-12 text-center text-xs text-white/70">© {currentYear} DaySpring Chapel. All rights reserved.</p>
        </footer>
    );
}
