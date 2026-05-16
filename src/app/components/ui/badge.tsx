import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant: 'success' | 'danger' | 'warning' | 'info' | 'neutral';
  className?: string;
}

export function Badge({ children, variant, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        {
          'bg-[#388E3C] text-white': variant === 'success',
          'bg-[#D32F2F] text-white': variant === 'danger',
          'bg-[#E8A020] text-white': variant === 'warning',
          'bg-[#1A3A5C] text-white': variant === 'info',
          'bg-gray-200 text-gray-800': variant === 'neutral',
        },
        className
      )}
    >
      {children}
    </span>
  );
}
