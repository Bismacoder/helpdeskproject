import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export const Alert = ({ type = 'error', message, onClose }) => {
  if (!message) return null;

  const icons = {
    error: <AlertCircle size={18} />,
    success: <CheckCircle2 size={18} />,
    info: <Info size={18} />,
  };

  return (
    <div className={`alert-banner alert-${type}`}>
      <span style={{ display: 'flex', alignItems: 'center' }}>{icons[type] || icons.info}</span>
      <span style={{ flex: 1 }}>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            color: 'inherit',
            display: 'flex',
            alignItems: 'center',
            opacity: 0.7,
          }}
          aria-label="Dismiss alert"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};
