import React from 'react';
import { t } from '../../utils/translator';

export default function Modal({
  open,
  onClose,
  title,
  children,
  className = '',
  ...props
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className={`bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative ${className}`} {...props}>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl leading-none focus:outline-none"
          aria-label={t('close')}
        >
          &times;
        </button>
        {title && <h4 className="text-lg font-semibold mb-4">{t(title)}</h4>}
        {children}
      </div>
    </div>
  );
} 