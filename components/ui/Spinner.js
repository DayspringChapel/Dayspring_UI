export default function Spinner({ size = 'md', color = 'primary' }) {
    const sizes = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4',
    };

    const colors = {
        primary: 'border-primary border-t-transparent',
        white: 'border-white border-t-transparent',
        dark: 'border-dark border-t-transparent',
    };

    return (
        <div
            className={`
        ${sizes[size]}
        ${colors[color]}
        rounded-full
        animate-spin
      `}
            role="status"
            aria-label="Loading"
        >
            <span className="sr-only">Loading...</span>
        </div>
    );
}
