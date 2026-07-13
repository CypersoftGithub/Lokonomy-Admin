import React from 'react';
import { Pencil, Check, X } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { plans, revenueByPlanData } from '../data/dummyData';
import toast from 'react-hot-toast';

const planIcons = { basic: '🔵', standard: '🟣', premium: '🏆', enterprise: '⭐' };

const features = [
  { label: 'Business Listing', basic: true, standard: true, premium: true, enterprise: true },
  { label: 'Feed Posts/Month', basic: '5/month', standard: '15/month', premium: 'Unlimited', enterprise: 'Unlimited' },
  { label: 'Gallery Photos', basic: '3 photos', standard: '6 photos', premium: '10 photos', enterprise: 'Unlimited' },
  { label: 'Priority in Search', basic: false, standard: true, premium: true, enterprise: true },
  { label: 'WhatsApp Button', basic: false, standard: true, premium: true, enterprise: true },
  { label: 'Analytics', basic: false, standard: 'Basic', premium: 'Full', enterprise: 'Advanced' },
  { label: 'Featured Badge', basic: false, standard: false, premium: true, enterprise: true },
  { label: 'Dedicated Support', basic: false, standard: false, premium: false, enterprise: true },
  { label: 'Price', basic: '₹499', standard: '₹1,499', premium: '₹2,999', enterprise: 'Custom' },
];

const planBarColors = { Basic: '#3B82F6', Standard: '#8B5CF6', Premium: '#F59E0B', Enterprise: '#1E293B' };

function FeatureCell({ value, planId }) {
  if (typeof value === 'boolean') {
    return value ? (
      <div className="flex justify-center"><Check size={18} className="text-emerald-500" /></div>
    ) : (
      <div className="flex justify-center"><X size={15} className="text-slate-300" /></div>
    );
  }
  return <div className="text-center text-sm font-medium text-slate-700">{value}</div>;
}

export default function Plans() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Subscription Plans</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage plan pricing, features and revenue</p>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-4 gap-5">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="card p-5 hover:shadow-md transition-all duration-200 relative overflow-hidden"
            style={{ borderTop: `4px solid ${plan.color}` }}
          >
            <div className="text-3xl mb-3">{planIcons[plan.id]}</div>
            <h3 className="font-bold text-slate-800 text-lg mb-1">{plan.name}</h3>
            <p className="text-2xl font-bold mb-1" style={{ color: plan.color }}>{plan.price}</p>
            <div className="space-y-1 mb-4">
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-700">{plan.businesses.toLocaleString()}</span> Businesses
              </p>
              <p className="text-sm text-slate-500">
                Revenue: <span className="font-semibold text-slate-700">{plan.revenue}</span>
              </p>
            </div>
            <button
              onClick={() => toast.success(`Edit ${plan.name} form opened!`)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all hover:opacity-80"
              style={{ borderColor: plan.color, color: plan.color }}
            >
              <Pencil size={14} /> Edit Plan
            </button>
            {/* Background decoration */}
            <div
              className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full opacity-10"
              style={{ background: plan.color }}
            />
          </div>
        ))}
      </div>

      {/* Feature comparison table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">Plan Features Comparison</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/3">Feature</th>
                {plans.map(plan => (
                  <th key={plan.id} className="px-5 py-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-lg">{planIcons[plan.id]}</span>
                      <span className="text-xs font-bold" style={{ color: plan.color }}>{plan.name.replace(' Plan', '')}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feature, i) => (
                <tr key={feature.label} className={`border-b border-slate-50 ${i % 2 === 0 ? '' : 'bg-slate-50/50'} hover:bg-indigo-50/30 transition-colors`}>
                  <td className="px-5 py-3.5 text-sm font-medium text-slate-700">{feature.label}</td>
                  <td className="px-5 py-3.5"><FeatureCell value={feature.basic} planId="basic" /></td>
                  <td className="px-5 py-3.5"><FeatureCell value={feature.standard} planId="standard" /></td>
                  <td className="px-5 py-3.5"><FeatureCell value={feature.premium} planId="premium" /></td>
                  <td className="px-5 py-3.5"><FeatureCell value={feature.enterprise} planId="enterprise" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Revenue by plan chart */}
      <div className="card p-6">
        <div className="mb-5">
          <h3 className="font-bold text-slate-800">Revenue by Plan</h3>
          <p className="text-xs text-slate-400 mt-0.5">Monthly revenue breakdown per plan type</p>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={revenueByPlanData} barSize={18} barGap={4}>
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}K`} />
            <Tooltip
              formatter={(v, name) => [`₹${v.toLocaleString('en-IN')}`, name]}
              contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
            />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 16 }} />
            <Bar dataKey="Basic" fill={planBarColors.Basic} radius={[4, 4, 0, 0]} />
            <Bar dataKey="Standard" fill={planBarColors.Standard} radius={[4, 4, 0, 0]} />
            <Bar dataKey="Premium" fill={planBarColors.Premium} radius={[4, 4, 0, 0]} />
            <Bar dataKey="Enterprise" fill={planBarColors.Enterprise} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
