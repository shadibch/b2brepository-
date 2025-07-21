import React from 'react';
import { t } from '../../utils/translator';

export default function Input({
  label,
  type = 'text',
  value,
  onChange,
  error,
  className = '',
  ...props
}) {
  return (
    <div className={`mb-4 ${className}`}>
      {label && <label className="block font-semibold text-gray-700 mb-1">{t(label)}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand text-gray-800"
        {...props}
      />
      {error && <div className="text-red-600 text-sm mt-1">{t(error)}</div>}
    </div>
  );
} 