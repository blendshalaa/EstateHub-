import React from 'react';
import { cn } from '../../utils/helpers';

const Input = React.forwardRef(({ className, label, error, ...props }, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}
            <input
                className={cn(
                    'block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm',
                    error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
                    className
                )}
                ref={ref}
                {...props}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
