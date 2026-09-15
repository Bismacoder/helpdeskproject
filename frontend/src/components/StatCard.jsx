import React from 'react';

export const StatCard = ({ title, count, icon: Icon, color = '#4f46e5', bgLight = '#eef2ff' }) => {
  return (
    <div className="stat-card">
      <div
        className="stat-icon-wrapper"
        style={{ backgroundColor: bgLight, color: color }}
      >
        {Icon && <Icon size={24} />}
      </div>
      <div className="stat-info">
        <h3>{count !== undefined ? count : 0}</h3>
        <p>{title}</p>
      </div>
    </div>
  );
};
