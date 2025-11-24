export default function Hero({ title, subtitle, variant = 'default', children }) {
    const variants = {
        default: 'w-[90%] mx-auto my-4 mb-8 h-[calc(100vh-118px)] rounded-lg',
        full: 'w-full m-0 rounded-none h-[calc(100vh-54px)]',
        home: 'w-full m-0 rounded-none h-[calc(100vh-54px)] relative',
    };

    return (
        <div
            className={`
        ${variants[variant]}
        bg-cover bg-center bg-no-repeat
        text-white
        flex flex-col items-center justify-center
        text-center
        p-12 md:p-12
      `}
            style={{
                backgroundImage: variant === 'home' ? 'none' : 'url(/hero.png)',
            }}
        >
            {children || (
                <>
                    <h1 className="text-2xl md:text-4xl font-bold mb-4">{title}</h1>
                    {subtitle && <p className="text-base md:text-lg mb-8">{subtitle}</p>}
                </>
            )}
        </div>
    );
}
