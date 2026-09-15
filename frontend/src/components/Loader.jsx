import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loader = ({ message = 'Loading...' }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        color: '#64748b',
      }}
    >
      <Loader2
        size={36}
        style={{
          animation: 'spin 1s linear infinite',
          color: '#4f46e5',
          marginBottom: '12px',
        }}
      />
      <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>{message}</p>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
