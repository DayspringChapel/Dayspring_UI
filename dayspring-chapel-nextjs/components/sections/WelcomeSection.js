import Link from 'next/link';
import Image from 'next/image';

export default function WelcomeSection() {
    return (
        <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold italic text-[#F58634] mb-8">
                WELCOME TO DAYSPRING CHAPEL
            </h2>
            <p className="max-w-5xl mx-auto mb-6 text-gray-700 text-lg leading-relaxed">
                As the Victory Life Bible Church grew, there came the need to establish
                modern-day centers where young Elites and Students can worship under a
                contemporary and supernatural atmosphere. This led to the establishment
                of DaySpring Chapel in August 2012. DaySpring Chapel was born out of a
                sincere desire to produce a new generation of Victory Life Bible Church
                (VLBC) that
            </p>

            <Link
                href="/about"
                className="inline-flex items-center gap-3 mt-4 text-primary hover:text-primary-dark transition-colors font-semibold"
            >
                <span className="underline">Read More</span>
                <Image
                    src="/arrow-icon.png"
                    alt="Arrow"
                    width={7}
                    height={12}
                    className="w-[7px] h-3"
                />
            </Link>
        </div>
    );
}
