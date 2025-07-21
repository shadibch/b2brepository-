import React from 'react';
import { t } from '../../utils/translator';

const variants = {
  success: 'bg-green-100 text-green-800 border-green-300',
  error: 'bg-red-100 text-red-800 border-red-300',
  info: 'bg-blue-100 text-blue-800 border-blue-300',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
};

const defaultLabels = {
  success: 'Success',
  error: 'Error',
  info: 'Info',
  warning: 'Warning',
};

export default function Alert({
  variant = 'info',
  label,
  children,
  className = '',
  ...props
}) {
  return (
    <div
      className={`border-l-4 p-4 mb-4 rounded ${variants[variant] || variants.info} ${className}`}
      role="alert"
      {...props}
    >
      <div className="font-bold mb-1">
        {t(label || defaultLabels[variant] || 'Info')}
      </div>
      <div>{children}</div>
    </div>
  );
} 