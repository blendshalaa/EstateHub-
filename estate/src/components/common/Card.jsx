import React from 'react';
import { cn } from '../../utils/helpers';

const Card = React.forwardRef(({ className, children, ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={cn('card', className)}
            {...props}
        >
            {children}
        </div>
    );
});

Card.displayName = 'Card';

export const CardHeader = ({ className, children, ...props }) => (
    <div className={cn('px-6 py-4 border-b border-gray-200', className)} {...props}>
        {children}
    </div>
);

export const CardTitle = ({ className, children, ...props }) => (
    <h3 className={cn('text-lg font-semibold text-gray-900', className)} {...props}>
        {children}
    </h3>
);

export const CardContent = ({ className, children, ...props }) => (
    <div className={cn('p-6', className)} {...props}>
        {children}
    </div>
);

export default Card;
