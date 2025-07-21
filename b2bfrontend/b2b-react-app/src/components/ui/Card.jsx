import React from 'react';
import { t } from '../../utils/translator';

export default function Card({
  title,
  description,
  className = '',
  children,
  ...props
}) {
  return (
    <div className={`bg-white rounded-lg shadow p-6 mb-4 ${className}`} {...props}>
      {title && <h3 className="text-lg font-bold mb-2">{t(title)}</h3>}
      {description && <p className="text-gray-600 mb-4">{t(description)}</p>}
      {children}
    </div>
  );
} 