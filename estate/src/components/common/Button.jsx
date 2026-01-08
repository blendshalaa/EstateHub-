import React from 'react';
import { cn } from '../../utils/helpers';
import { Loader2 } from 'lucide-react';

const Button = React.forwardRef(({
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    children,
    disabled,
    ...props
}, ref) => {
    const variants = {
        primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-sm',
        secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500 shadow-sm',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm',
        ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
        link: 'text-primary-600 hover:text-primary-700 underline-offset-4 hover:underline p-0 h-auto',
    };

    const sizes = {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 py-2',
        lg: 'h-12 px-6 text-lg',
        icon: 'h-10 w-10 p-2',
    };

    return (
        <button
            ref={ref}
            className={cn(
                'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
                variants[variant],
                sizes[size],
                className
            )}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </button>
    );
});

Button.displayName = 'Button';

export default Button;
