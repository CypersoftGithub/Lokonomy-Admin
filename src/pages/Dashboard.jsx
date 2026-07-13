import React, { useState, useEffect } from 'react';
import {
  Users, Building2, DollarSign, TrendingUp, AlertTriangle, RefreshCw,
  Download, Bell, ArrowRight, Calendar,
} from 'lucide-react';
import {
  AreaChart, Area, LineChart, Line, PieChart, Pie, Cell, Tooltip,
  XAxis, YAxis, ResponsiveContainer, Legend,
} from 'recharts';
import StatsCard from '../components/common/StatsCard';
import { StatusBadge, PlanBadge } from '../components/common/Badge';
import {
  revenueChartData, planDistributionData, cityData,
  expiringBusinesses, recentlyRenewed, newRegistrations,
} from '../data/dummyData';
import toast from 'react-hot-toast';

/* ─── Skeleton loaders ─── */
function SkeletonCard() {
  return (
    <div className="card p-5">
      <div className="w-10 h-10 rounded-xl shimmer mb-4" />
      <div className="h-3 w-20 rounded shimmer mb-2" />
      <div className="h-6 w-28 rounded shimmer mb-2" />
      <div className="h-3 w-32 rounded shimmer" />
    </div>
  );
}

function SkeletonChart() {
  return (
    <div className="card p-6">
      <div className="h-5 w-40 rounded shimmer mb-6" />
      <div className="h-52 rounded-lg shimmer" />
    </div>
  );
}

/* ─── Revenue chart data (extended) ─── */
const revenueOrdersData = [
  { date: 'Jul 01', revenue: 2800, orders: 120 },
  { date: 'Jul 03', revenue: 2650, orders: 110 },
  { date: 'Jul 05', revenue: 2900, orders: 115 },
  { date: 'Jul 07', revenue: 3100, orders: 135 },
  { date: 'Jul 09', revenue: 3400, orders: 150 },
  { date: 'Jul 11', revenue: 3200, orders: 140 },
  { date: 'Jul 13', revenue: 3600, orders: 155 },
  { date: 'Jul 15', revenue: 3900, orders: 165 },
  { date: 'Jul 17', revenue: 4100, orders: 170 },
  { date: 'Jul 19', revenue: 3800, orders: 160 },
  { date: 'Jul 21', revenue: 4300, orders: 180 },
  { date: 'Jul 23', revenue: 4500, orders: 190 },
  { date: 'Jul 25', revenue: 4800, orders: 195 },
  { date: 'Jul 27', revenue: 5100, orders: 210 },
  { date: 'Jul 29', revenue: 4900, orders: 200 },
  { date: 'Jul 31', revenue: 5300, orders: 220 },
];

const topCategories = [
  { name: 'Electronics', sales: 1225, revenue: '₹3,92,000', color: '#6366F1' },
  { name: 'Food & Dining', sales: 965, revenue: '₹96,500', color: '#26af61' },
  { name: 'Healthcare', sales: 830, revenue: '₹53,950', color: '#f68e4c' },
  { name: 'Others', sales: 532, revenue: '₹78,800', color: '#06B6D4' },
];

const DONUT_COLORS = ['#6366F1', '#26af61', '#f68e4c', '#06B6D4'];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('This Month');

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  if (loading) {
    return (
      <div className="fade-in">
        <div className="mb-6 h-8 w-64 shimmer rounded" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-5 mb-6">
          <div className="xl:col-span-3"><SkeletonChart /></div>
          <div className="xl:col-span-2"><SkeletonChart /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Hey, Admin 👋</h1>
          <p className="text-sm text-gray-400 mt-0.5">{today}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Time Range:</span>
            <div className="relative">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-1.5 pr-8 text-sm font-medium text-gray-700 focus:outline-none focus:border-primary cursor-pointer"
              >
                <option>This Month</option>
                <option>Last Month</option>
                <option>This Quarter</option>
                <option>This Year</option>
              </select>
              <ChevronIcon className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Stat cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={Users}
          iconColor="#6366F1"
          iconBg="#EEF2FF"
          label="Total Users"
          value="12,847"
          trend="↑ 8.5%"
          trendUp={true}
        />
        <StatsCard
          icon={Building2}
          iconColor="#f68e4c"
          iconBg="#fff5ee"
          label="Active Businesses"
          value="3,241"
          trend="↓ 12.3%"
          trendUp={false}
        />
        <StatsCard
          icon={DollarSign}
          iconColor="#26af61"
          iconBg="#edfbf2"
          label="Total Revenue"
          value="₹4,82,000"
          trend="↑ 3.2%"
          trendUp={true}
        />
        <StatsCard
          icon={AlertTriangle}
          iconColor="#f59e0b"
          iconBg="#fffbeb"
          label="Expiring Soon"
          value="143"
          trend="↑ 5.8%"
          trendUp={true}
          trendText="vs last period"
        />
      </div>

      {/* ─── Revenue & Top Categories ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        {/* Revenue & Orders chart */}
        <div className="xl:col-span-3 card p-6">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-gray-800">Revenue & Orders</h3>
          </div>
          <div className="flex items-center gap-6 mb-5">
            <div>
              <p className="text-xs text-gray-400">Total Revenue</p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold text-gray-800">₹1,29,440</p>
                <span className="text-xs font-semibold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded">↑ 47.6%</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400">Total Orders</p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold text-gray-800">1.81K</p>
                <span className="text-xs font-semibold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded">↑ 47%</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenueOrdersData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ordGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(1)}K`}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '10px',
                  border: 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  fontSize: '13px',
                }}
                formatter={(v, name) => [
                  name === 'revenue' ? `₹${v.toLocaleString('en-IN')}` : v,
                  name === 'revenue' ? 'Revenue' : 'Orders',
                ]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#6366F1"
                strokeWidth={2}
                fill="url(#revGrad)"
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="orders"
                stroke="#06B6D4"
                strokeWidth={2}
                fill="url(#ordGrad)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top Selling Categories */}
        <div className="xl:col-span-2 card p-6">
          <h3 className="font-bold text-gray-800 mb-5">Top Selling Categories</h3>
          <div className="flex items-center justify-center mb-5">
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie
                  data={topCategories}
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  innerRadius={50}
                  dataKey="sales"
                  stroke="none"
                >
                  {topCategories.map((entry, index) => (
                    <Cell key={index} fill={DONUT_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => [v, 'Sales']}
                  contentStyle={{
                    borderRadius: '10px',
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend table */}
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-400 uppercase pb-2">Category</th>
                <th className="text-right text-xs font-semibold text-gray-400 uppercase pb-2">Sales</th>
                <th className="text-right text-xs font-semibold text-gray-400 uppercase pb-2">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topCategories.map((cat) => (
                <tr key={cat.name} className="border-b border-gray-50">
                  <td className="py-2.5 text-sm text-gray-700 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                    {cat.name}
                  </td>
                  <td className="py-2.5 text-sm text-gray-600 text-right font-medium">{cat.sales.toLocaleString()}</td>
                  <td className="py-2.5 text-sm text-gray-600 text-right font-medium">{cat.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Expiring Soon + Plan Distribution ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        {/* Expiring soon */}
        <div className="xl:col-span-3 card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" />
              Expiring Soon
            </h3>
            <button className="text-primary text-sm font-medium hover:text-primary-dark flex items-center gap-1 transition-colors">
              View All <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-2.5">
            {expiringBusinesses.map((biz) => (
              <div key={biz.name} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100/80 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{biz.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{biz.city} • <PlanBadge plan={biz.plan} /></p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    biz.daysLeft <= 7 ? 'bg-red-50 text-red-500' :
                    biz.daysLeft <= 15 ? 'bg-amber-50 text-amber-500' :
                    'bg-blue-50 text-blue-500'
                  }`}>
                    {biz.daysLeft}d left
                  </span>
                  <button
                    onClick={() => toast.success(`Notification sent to ${biz.name}!`)}
                    className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs rounded-lg font-medium transition-colors flex items-center gap-1"
                  >
                    <Bell size={11} /> Notify
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Plan distribution */}
        <div className="xl:col-span-2 card p-6">
          <h3 className="font-bold text-gray-800 mb-5">Plan Distribution</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie
                  data={planDistributionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={40}
                  dataKey="value"
                  stroke="none"
                >
                  {planDistributionData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => [`${v}%`, 'Share']}
                  contentStyle={{ borderRadius: '10px', border: 'none' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3 flex-1">
              {planDistributionData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                  <span className="text-xs text-gray-500 font-medium flex-1">{item.name}</span>
                  <span className="text-xs font-bold text-gray-800">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── City-wise table ─── */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-800">City-wise Business Overview</h3>
          <button
            onClick={() => toast.success('CSV exported successfully!')}
            className="btn-outline text-xs"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['City', 'Total Business', 'Active', 'Expired', 'Revenue'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cityData.map((row, i) => (
                <tr key={row.city} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-800 font-medium">{row.city}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{row.total}</td>
                  <td className="px-4 py-3 text-sm text-emerald-600 font-medium">{row.active}</td>
                  <td className="px-4 py-3 text-sm text-red-500">{row.expired}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 font-medium">{row.revenue}</td>
                </tr>
              ))}
              <tr className="bg-primary/5 font-bold">
                <td className="px-4 py-3 text-sm text-gray-800">Total</td>
                <td className="px-4 py-3 text-sm text-gray-800">3,241</td>
                <td className="px-4 py-3 text-sm text-emerald-700">2,986</td>
                <td className="px-4 py-3 text-sm text-red-600">255</td>
                <td className="px-4 py-3 text-sm text-gray-800">₹4,82,000</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Bottom tables ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recently renewed */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">Recently Renewed</h3>
            <span className="text-xs text-gray-400">Last 30 days</span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Business', 'Plan', 'Renewed On'].map(h => (
                  <th key={h} className="text-left pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentlyRenewed.map((row) => (
                <tr key={row.business} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 text-sm text-gray-800 font-medium">{row.business}</td>
                  <td className="py-3"><PlanBadge plan={row.plan} /></td>
                  <td className="py-3 text-sm text-gray-400">{row.renewedOn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* New registrations */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">New Registrations</h3>
            <span className="text-xs text-gray-400">Recent additions</span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Business', 'City', 'Joined'].map(h => (
                  <th key={h} className="text-left pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {newRegistrations.map((row) => (
                <tr key={row.business} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 text-sm text-gray-800 font-medium">{row.business}</td>
                  <td className="py-3 text-sm text-gray-500">{row.city}</td>
                  <td className="py-3 text-sm text-gray-400">{row.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* Small chevron icon for select */
function ChevronIcon({ className }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
