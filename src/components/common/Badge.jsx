import React from 'react';

const statusMap = {
  Active: 'badge-active',
  Expiring: 'badge-expiring',
  Expired: 'badge-expired',
  Blocked: 'badge-blocked',
  Scheduled: 'badge-scheduled',
  Inactive: 'badge-inactive',
  Sold: 'badge-sold',
  Filled: 'badge-filled',
  Hidden: 'badge-inactive',
  News: 'bg-blue-100 text-blue-700',
  Offer: 'bg-green-100 text-green-700',
  Event: 'bg-purple-100 text-purple-700',
  Update: 'bg-slate-100 text-slate-700',
  Service: 'bg-cyan-100 text-cyan-700',
  Product: 'bg-indigo-100 text-indigo-700',
  Job: 'bg-amber-100 text-amber-700',
  Sent: 'badge-active',
};

const planMap = {
  Basic: 'plan-basic',
  Standard: 'plan-standard',
  Premium: 'plan-premium',
  Enterprise: 'plan-enterprise',
};

const planIcons = {
  Basic: '🔵',
  Standard: '🟣',
  Premium: '🏆',
  Enterprise: '⭐',
};

export function StatusBadge({ status }) {
  const cls = statusMap[status] || 'badge-inactive';
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}>
      {status === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-green-500 pulse-dot" />}
      {status === 'Expiring' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
      {status === 'Expired' && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
      {status === 'Blocked' && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
      {status === 'Scheduled' && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
      {status}
    </span>
  );
}

export function PlanBadge({ plan }) {
  const cls = planMap[plan] || 'plan-basic';
  const icon = planIcons[plan] || '';
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}>
      {icon} {plan}
    </span>
  );
}

export default function Badge({ type, value }) {
  if (type === 'plan') return <PlanBadge plan={value} />;
  return <StatusBadge status={value} />;
}
