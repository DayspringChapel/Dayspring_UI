import Image from 'next/image';
import Link from 'next/link';

const libraryItems = [
    {
        id: 1,
        title: 'Believers Authority Ken Haggin',
        image: '/library.png',
    },
    {
        id: 2,
        title: 'Faith Series Pastor Eniola Fabusoro',
        image: '/library.png',
    },
    {
        id: 3,
        title: 'Believers Authority Ken Haggin',
        image: '/library.png',
    },
];

export default function LibrarySection() {
    return (
        <section className="text-center py-12">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">OUR LIBRARY</h2>
                <p className="mb-12 max-w-3xl mx-auto text-lg leading-relaxed">
                    Get access to transformational resources like books, sermons, and
                    other materials necessary for your growth and development
                </p>

                {/* Library Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-12">
                    {libraryItems.map((item) => (
                        <div
                            key={item.id}
                            className="flex flex-col items-center gap-4 text-dark group"
                        >
                            <div className="relative w-full aspect-[3/4] overflow-hidden rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-105">
                                <Image
                                    src={item.image}
                                    alt={item.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <p className="font-semibold text-lg w-4/5">{item.title}</p>
                            <Link
                                href="/library"
                                className="flex items-center gap-2 text-dark hover:text-primary transition-colors font-semibold"
                            >
                                <span className="underline">View</span>
                                <Image
                                    src="/arrow-icon-dark.png"
                                    alt="Arrow"
                                    width={7}
                                    height={12}
                                    className="w-[7px] h-3"
                                />
                            </Link>
                        </div>
                    ))}
                </div>

                {/* View All Link */}
                <Link
                    href="/library"
                    className="inline-flex items-center gap-3 mt-12 text-primary hover:text-primary-dark transition-colors font-semibold"
                >
                    <span className="underline">View All</span>
                    <Image
                        src="/arrow-icon.png"
                        alt="Arrow"
                        width={7}
                        height={12}
                        className="w-[7px] h-3"
                    />
                </Link>
            </div>
        </section>
    );
}
