import React from 'react';

/**
 * Priority Badge Component
 */
export const PriorityBadge = ({ priority }) => {
  const p = priority || 'Medium';
  const className = `badge badge-priority-${p.toLowerCase()}`;
  return <span className={className}>{p}</span>;
};

/**
 * Status Badge Component
 */
export const StatusBadge = ({ status }) => {
  const s = status || 'Open';
  const normalized = s.toLowerCase().replace(/\s+/g, '-');
  const className = `badge badge-status-${normalized}`;
  return <span className={className}>{s}</span>;
};

/**
 * Role Badge Component
 */
export const RoleBadge = ({ role }) => {
  const r = role || 'requester';
  const className = `badge badge-role-${r.toLowerCase()}`;
  return <span className={className}>{r}</span>;
};
