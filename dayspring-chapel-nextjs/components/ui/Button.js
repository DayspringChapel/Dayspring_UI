export default function Button({
    children,
    variant = 'primary',
    onClick,
    type = 'button',
    className = '',
    ...props
}) {
    const baseStyles =
        'px-4 py-2 rounded cursor-pointer border-none outline-none transition-all duration-300';

    const variants = {
        primary: 'bg-primary text-white hover:bg-primary-dark',
        plain:
            'bg-transparent text-white border border-white hover:bg-white hover:text-dark',
        link: 'bg-transparent text-primary underline hover:text-primary-dark',
    };

    return (
        <button
            type={type}
            onClick={onClick}
            className={`${baseStyles} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
