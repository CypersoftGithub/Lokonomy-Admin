import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatsCard({ icon: Icon, iconColor = '#f68e4c', iconBg = '#fff5ee', value, label, trend, trendUp = true, trendText = 'vs last period' }) {
  return (
    <div className="card p-5 transition-all duration-200">
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
        style={{ backgroundColor: iconBg }}
      >
        <Icon size={20} style={{ color: iconColor }} />
      </div>

      {/* Label */}
      <p className="text-xs text-gray-400 font-medium mb-1">{label}</p>

      {/* Value */}
      <p className="text-2xl font-bold text-gray-800 tracking-tight">{value}</p>

      {/* Trend */}
      {trend && (
        <div className="flex items-center gap-1.5 mt-2">
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
              trendUp ? 'text-emerald-500' : 'text-red-500'
            }`}
          >
            {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend}
          </span>
          <span className="text-xs text-gray-400">{trendText}</span>
        </div>
      )}
    </div>
  );
}
