export default function Input({
    type = 'text',
    placeholder,
    value,
    onChange,
    className = '',
    ...props
}) {
    return (
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className={`
        w-full px-4 py-2 rounded
        border border-gray-300
        outline-none
        focus:border-primary focus:ring-1 focus:ring-primary
        transition-all
        ${className}
      `}
            {...props}
        />
    );
}
