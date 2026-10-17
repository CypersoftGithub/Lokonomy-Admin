import React, { useEffect, useState } from 'react';
import { Pencil, Check, X, Zap, Crown, Award, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config';

const planConfigs = [
  {
    badgeText: 'Starter Plan',
    badgeClass: 'text-emerald-700 bg-emerald-50 border-emerald-100',
    pulseClass: 'bg-emerald-500',
    cardBg: 'bg-gradient-to-br from-emerald-900/5 via-white to-emerald-50/40 border border-emerald-100/80 hover:shadow-emerald-500/10',
    glowBg: 'bg-emerald-500/10 group-hover:bg-emerald-500/20',
    iconGradient: 'from-emerald-500 to-teal-600',
    iconShadow: 'shadow-emerald-500/30',
    checkColor: 'text-emerald-600',
    icon: <Zap size={22} />,
    isPopular: false,
    validityDesc: '1 Month platform validity',
    highlights: ['1 Feed Post / Month', 'Business Directory Listing', 'Standard Member Access']
  },
  {
    badgeText: 'Growth Plan',
    badgeClass: 'text-purple-700 bg-purple-50 border-purple-100',
    pulseClass: 'bg-purple-500',
    cardBg: 'bg-gradient-to-br from-purple-900/5 via-white to-purple-50/40 border border-purple-200/90 hover:shadow-purple-500/15 ring-1 ring-purple-400/20',
    glowBg: 'bg-purple-500/10 group-hover:bg-purple-500/20',
    iconGradient: 'from-purple-600 to-indigo-600',
    iconShadow: 'shadow-purple-500/30',
    checkColor: 'text-purple-600',
    icon: <Crown size={22} />,
    isPopular: true,
    validityDesc: '12 Months (1 Year) platform validity',
    highlights: ['5 Feed Posts / Month', '2 Job Openings / Month', '1 Month Search Priority']
  },
  {
    badgeText: 'Enterprise Value',
    badgeClass: 'text-amber-700 bg-amber-50 border-amber-100',
    pulseClass: 'bg-amber-500',
    cardBg: 'bg-gradient-to-br from-amber-900/5 via-white to-amber-50/40 border border-amber-100/80 hover:shadow-amber-500/10',
    glowBg: 'bg-amber-500/10 group-hover:bg-amber-500/20',
    iconGradient: 'from-amber-500 to-orange-600',
    iconShadow: 'shadow-amber-500/30',
    checkColor: 'text-amber-600',
    icon: <Award size={22} />,
    isPopular: false,
    validityDesc: '36 Months (3 Years) maximum validity',
    highlights: ['6 Feed Posts / Month', '2 Jobs + Sell/Demand Posts', '12 Months Search Priority']
  }
];

function FeatureCell({ value }) {
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
  const [plansList, setPlansList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/global/plans`);
        const resJson = await response.json();
        if (resJson.status) {
          const colors = ['#3abe40ff', '#8B5CF6', '#F59E0B'];
          const names = ['Basic Plan', 'Standard Plan', 'Premium Plan'];

          const mapped = resJson.data.map((plan, index) => {
            const validityText = plan.validity === '1' ? 'month' : (plan.validity === '12' ? 'year' : `${plan.validity} months`);
            return {
              id: plan.id,
              name: names[index] || `Plan ${plan.id}`,
              price: `₹${plan.amount}/${validityText}`,
              amount: plan.amount,
              validity: plan.validity,
              color: colors[index] || '#1E293B',
              raw: plan
            };
          });
          setPlansList(mapped);
        } else {
          const errMsg = typeof resJson.error === 'object' ? (resJson.error.message || JSON.stringify(resJson.error)) : resJson.error;
          toast.error(errMsg || 'Failed to fetch plans');
        }
      } catch (err) {
        console.error(err);
        toast.error('Error fetching plans');
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const tableFeatures = [
    { label: 'Business Listing', getValue: (p) => true },
    { label: 'Feed Posts/Month', getValue: (p) => p.raw.dofeed ? `${p.raw.feedpermonth}/month` : 'Disabled' },
    { label: 'Job Openings/Month', getValue: (p) => p.raw.dojobopening ? `${p.raw.jobopeningpermonth}/month` : 'Disabled' },
    { label: 'Sell Posts/Month', getValue: (p) => p.raw.dosellpost ? `${p.raw.sellpostpermonth}/month` : 'Disabled' },
    { label: 'Demand Posts/Month', getValue: (p) => p.raw.dodemandpost ? `${p.raw.demandpostpermonth}/month` : 'Disabled' },
    { label: 'Priority in Search', getValue: (p) => p.raw.doadvertise },
    { label: 'Price', getValue: (p) => `₹${p.raw.amount}` },
  ];

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Subscription Plans</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage plan pricing, features and business offerings</p>
      </div>

      {/* Plan Cards - High Aesthetic Modern Gradient Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plansList.map((plan, index) => {
          const config = planConfigs[index] || planConfigs[0];
          const validityLabel = plan.validity === '1' ? 'month' : (plan.validity === '12' ? 'year' : `${plan.validity} months`);

          return (
            <div
              key={plan.id}
              className={`${config.cardBg} rounded-2xl p-5 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group flex flex-col justify-between`}
            >
              {/* Radial glow background effect */}
              <div className={`absolute -right-6 -bottom-6 w-28 h-28 ${config.glowBg} rounded-full blur-xl transition-all`} />

              <div>
                {/* Header: Badge & 3D Glowing Icon */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${config.badgeClass}`}>
                        {config.badgeText}
                      </span>
                      {config.isPopular ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
                          Popular
                        </span>
                      ) : (
                        <span className={`w-2 h-2 rounded-full ${config.pulseClass} animate-pulse`} />
                      )}
                    </div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight mt-1">
                      {plan.name}
                    </h3>
                  </div>

                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${config.iconGradient} text-white shadow-lg ${config.iconShadow} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    {config.icon}
                  </div>
                </div>

                {/* Pricing section */}
                <div className="mt-4 pt-3 border-t border-slate-100/80">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-slate-900 tracking-tight">
                      ₹{Number(plan.amount).toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      / {validityLabel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    {config.validityDesc}
                  </p>
                </div>

                {/* Key Quick Feature Highlights */}
                <div className="mt-4 pt-3 border-t border-slate-100/60 space-y-2">
                  {config.highlights.map((h, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                      <CheckCircle2 size={14} className={`${config.checkColor} flex-shrink-0`} />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
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
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/3">Feature</th>
                {plansList.map((plan, index) => {
                  const config = planConfigs[index] || planConfigs[0];
                  return (
                    <th key={plan.id} className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${config.pulseClass}`} />
                        <span className="text-xs font-bold text-slate-800">{plan.name}</span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {tableFeatures.map((feature, i) => (
                <tr key={feature.label} className={`border-b border-slate-50 ${i % 2 === 0 ? '' : 'bg-slate-50/50'} hover:bg-indigo-50/30 transition-colors`}>
                  <td className="px-5 py-3.5 text-sm font-medium text-slate-700">{feature.label}</td>
                  {plansList.map(plan => (
                    <td key={plan.id} className="px-5 py-3.5">
                      <FeatureCell value={feature.getValue(plan)} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
