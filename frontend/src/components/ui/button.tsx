import * as React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:pointer-events-none disabled:opacity-50 transition-all duration-200 active:scale-95';
    
    const variants = {
      default: 'bg-[#4DB4D7] hover:bg-[#3ba0c2] text-white shadow-md shadow-[#4DB4D7]/30',
      outline: 'border border-sky-200 bg-transparent hover:bg-sky-50 text-sky-700',
      ghost: 'hover:bg-sky-50 hover:text-sky-900 text-sky-600',
    };

    const sizes = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 rounded-md px-3',
      lg: 'h-11 rounded-md px-8',
    };

    const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

    return (
      <button className={classes} ref={ref} {...props} />
    );
  }
);
Button.displayName = 'Button';

export { Button };
