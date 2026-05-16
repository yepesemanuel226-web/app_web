import React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'rounded-lg font-medium transition-colors',
        {
          'bg-[#E8A020] text-white hover:bg-[#d89418] active:bg-[#c68516]': variant === 'primary' && !disabled,
          'bg-[#1A3A5C] text-white hover:bg-[#2a4a6c] active:bg-[#0a2a4c]': variant === 'secondary' && !disabled,
          'bg-[#D32F2F] text-white hover:bg-[#b32727] active:bg-[#931f1f]': variant === 'danger' && !disabled,
          'bg-transparent text-[#1A3A5C] hover:bg-gray-100 active:bg-gray-200': variant === 'ghost' && !disabled,
          'opacity-50 cursor-not-allowed': disabled,
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-4 py-2 text-base': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
        },
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
