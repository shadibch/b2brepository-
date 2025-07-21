import React from 'react';

const base =
  'inline-flex items-center justify-center px-4 py-2 rounded font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2';
const variants = {
  primary: 'bg-brand text-white hover:bg-brand-dark',
  secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  info: 'bg-blue-600 text-white hover:bg-blue-700',
};

export default function Button({
  children,
  variant = 'primary',
  fullWidth = false,
  className = '',
  ...props
}) {
  return (
    <button
      className={[
        base,
        variants[variant] || variants.primary,
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  );
} 