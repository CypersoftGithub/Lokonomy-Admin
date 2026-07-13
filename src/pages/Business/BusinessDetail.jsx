import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Pencil, Trash2, ExternalLink, CheckCircle2 } from 'lucide-react';
import { StatusBadge, PlanBadge } from '../../components/common/Badge';
import DeleteModal from '../../components/common/DeleteModal';
import { businesses, paymentHistory, businessActivityLog } from '../../data/dummyData';
import toast from 'react-hot-toast';

const tabs = ['Overview', 'Business Details', 'Plan & Payment', 'Posts/Feed', 'Activity Log'];

const postColors = ['#6366F1', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4'];
const posts = [
  { id: 1, title: '50% Off on LED TVs', date: '2 Jan 2025', status: 'Active' },
  { id: 2, title: 'New Arrival: iPhone 15', date: '15 Dec 2024', status: 'Active' },
  { id: 3, title: 'Samsung Washing Machine Sale', date: '10 Dec 2024', status: 'Hidden' },
  { id: 4, title: 'Diwali Special Offer', date: '1 Nov 2024', status: 'Active' },
  { id: 5, title: 'New Air Conditioner Stock', date: '20 Oct 2024', status: 'Active' },
  { id: 6, title: 'Refrigerator at Best Price', date: '5 Oct 2024', status: 'Active' },
];

const activityIcons = { edit: '✏️', plan: '💳', post: '📝' };

export default function BusinessDetail() {
  const navigate = useNavigate();
  const biz = businesses[0]; // Always show Sharma Electronics as demo
  const [activeTab, setActiveTab] = useState('Overview');
  const [deleteModal, setDeleteModal] = useState(false);

  return (
    <div className="space-y-5">
      {/* Back */}
      <button
        onClick={() => navigate('/business')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Business List
      </button>

      {/* Business header card */}
      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0 border-2 border-indigo-200">
              <span className="text-3xl font-bold text-indigo-600">SE</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{biz.name}</h1>
              <p className="text-slate-500 mt-1">{biz.category} • {biz.subcategory}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="flex items-center gap-1.5 text-sm text-slate-600">
                  <MapPin size={14} className="text-indigo-500" /> {biz.taluka}, {biz.city}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-slate-600">
                  <Phone size={14} className="text-indigo-500" /> {biz.phone}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="text-right space-y-2">
              <div className="flex gap-2 justify-end">
                <StatusBadge status={biz.status} />
                <PlanBadge plan={biz.plan} />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => toast.success('Edit form opened!')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
              >
                <Pencil size={14} /> Edit Business
              </button>
              <button
                onClick={() => setDeleteModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium transition-colors"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card px-5 pt-4 pb-0">
        <div className="flex gap-1 border-b border-slate-100">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all -mb-px ${
                activeTab === tab
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'Overview' && (
        <div className="grid grid-cols-2 gap-5">
          <div className="card p-6">
            <h3 className="font-bold text-slate-700 mb-4 pb-2 border-b border-slate-100">Basic Information</h3>
            {[
              ['Business ID', '#BUS1001'],
              ['Business Name', biz.name],
              ['Owner Name', biz.owner],
              ['Mobile Number', biz.phone],
              ['Email', biz.email],
              ['Member Since', biz.memberSince],
            ].map(([label, value]) => (
              <div key={label} className="flex py-2.5 border-b border-slate-50">
                <span className="text-sm text-slate-500 w-36 flex-shrink-0">{label}</span>
                <span className="text-sm font-medium text-slate-800">{value}</span>
              </div>
            ))}
          </div>

          <div className="card p-6">
            <h3 className="font-bold text-slate-700 mb-4 pb-2 border-b border-slate-100">Location</h3>
            {[
              ['City', biz.city],
              ['Taluka', biz.taluka],
              ['Full Address', biz.address],
              ['PIN Code', biz.pin],
            ].map(([label, value]) => (
              <div key={label} className="flex py-2.5 border-b border-slate-50">
                <span className="text-sm text-slate-500 w-36 flex-shrink-0">{label}</span>
                <span className="text-sm font-medium text-slate-800">{value}</span>
              </div>
            ))}
            <div className="flex py-2.5">
              <span className="text-sm text-slate-500 w-36 flex-shrink-0">Google Maps</span>
              <a href="#" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                View on Map <ExternalLink size={12} />
              </a>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-bold text-slate-700 mb-4 pb-2 border-b border-slate-100">Category & Type</h3>
            {[
              ['Category ID', 'CAT_045'],
              ['Category', biz.category],
              ['Subcategory ID', 'SUB_234'],
              ['Subcategory', biz.subcategory],
              ['Business Type', 'Retail Shop'],
            ].map(([label, value]) => (
              <div key={label} className="flex py-2.5 border-b border-slate-50">
                <span className="text-sm text-slate-500 w-36 flex-shrink-0">{label}</span>
                <span className="text-sm font-medium text-slate-800 font-mono">{value}</span>
              </div>
            ))}
          </div>

          <div className="card p-6">
            <h3 className="font-bold text-slate-700 mb-4 pb-2 border-b border-slate-100">Plan Status</h3>
            {[
              ['Current Plan', null, <PlanBadge plan="Premium" />],
              ['Plan Price', biz.planPrice],
              ['Start Date', biz.planStart],
              ['Expiry Date', biz.planExpiry],
            ].map(([label, value, node]) => (
              <div key={label} className="flex items-center py-2.5 border-b border-slate-50">
                <span className="text-sm text-slate-500 w-36 flex-shrink-0">{label}</span>
                {node || <span className="text-sm font-medium text-slate-800">{value}</span>}
              </div>
            ))}
            <div className="flex py-2.5">
              <span className="text-sm text-slate-500 w-36 flex-shrink-0">Days Remaining</span>
              <span className="text-sm font-bold text-emerald-600">{biz.daysRemaining} days</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Business Details' && (
        <div className="card p-6 space-y-5">
          <div>
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">About Business</h4>
            <p className="text-sm text-slate-700 leading-relaxed">{biz.about}</p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Working Hours</h4>
              <p className="text-sm text-slate-700">{biz.hours}</p>
              <p className="text-sm text-slate-500 mt-1">Closed On: <span className="text-slate-700 font-medium">{biz.closedOn}</span></p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Contact</h4>
              <div className="space-y-1.5">
                <p className="text-sm text-slate-700">📞 {biz.phone}</p>
                <p className="text-sm text-slate-700">💬 WhatsApp: {biz.whatsapp}</p>
                <p className="text-sm text-blue-600 hover:underline cursor-pointer">🌐 {biz.website}</p>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Social Media</h4>
            <div className="flex gap-4">
              <span className="text-sm text-blue-600">📘 {biz.facebook}</span>
              <span className="text-sm text-pink-600">📸 {biz.instagram}</span>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Business Images</h4>
            <div className="flex gap-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-32 h-24 bg-slate-100 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-slate-200 text-slate-400 hover:border-indigo-400 transition-colors cursor-pointer">
                  <span className="text-xs font-medium">Image {i}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Plan & Payment' && (
        <div className="space-y-5">
          <div className="card p-6 border-2 border-indigo-200">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-2xl">🏆</div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">Premium Plan</h3>
                  <p className="text-amber-600 font-semibold">{biz.planPrice}</p>
                </div>
              </div>
              <StatusBadge status="Active" />
            </div>
            <div className="grid grid-cols-3 gap-4 mb-5 p-4 bg-slate-50 rounded-xl">
              {[
                ['Start Date', biz.planStart],
                ['End Date', biz.planExpiry],
                ['Remaining', `${biz.daysRemaining} days`],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-slate-500 mb-1">{label}</p>
                  <p className="text-sm font-bold text-slate-800">{value}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                'Unlimited product posts',
                'Priority listing in search results',
                'Full analytics dashboard',
                'WhatsApp direct button',
                '10 photos in gallery',
                'Featured business badge',
              ].map(f => (
                <div key={f} className="flex items-center gap-2 text-sm text-slate-700">
                  <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0" /> {f}
                </div>
              ))}
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Payment History</h3>
            </div>
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>{['Date', 'Plan', 'Amount', 'Payment Mode', 'Status'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {paymentHistory.map((row, i) => (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 text-sm text-slate-700">{row.date}</td>
                    <td className="px-5 py-3.5"><PlanBadge plan={row.plan} /></td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-slate-800">{row.amount}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{row.mode}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={row.status === 'Paid' ? 'Active' : 'Expired'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'Posts/Feed' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {['All Posts', 'Offers', 'Products', 'Events'].map((t, i) => (
                <button key={t} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${i === 0 ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-400'}`}>
                  {t}
                </button>
              ))}
            </div>
            <span className="text-sm text-slate-500 font-medium">24 total posts</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {posts.map((post, i) => (
              <div key={post.id} className="card overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-36 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${postColors[i]}22, ${postColors[i]}44)` }}>
                  <span className="text-4xl">🖼️</span>
                </div>
                <div className="p-4">
                  <p className="font-semibold text-slate-800 text-sm mb-1">{post.title}</p>
                  <p className="text-xs text-slate-400 mb-3">{post.date}</p>
                  <div className="flex items-center justify-between">
                    <StatusBadge status={post.status === 'Active' ? 'Active' : 'Inactive'} />
                    <div className="flex gap-1">
                      <button className="w-6 h-6 rounded hover:bg-amber-100 flex items-center justify-center text-slate-400 hover:text-amber-600 transition-colors">
                        <Pencil size={12} />
                      </button>
                      <button className="w-6 h-6 rounded hover:bg-red-100 flex items-center justify-center text-slate-400 hover:text-red-600 transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Activity Log' && (
        <div className="card p-6">
          <h3 className="font-bold text-slate-800 mb-6">Activity Timeline</h3>
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-100" />
            <div className="space-y-6">
              {businessActivityLog.map((log, i) => (
                <div key={i} className="flex gap-4 relative">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 z-10 ${
                    log.type === 'plan' ? 'bg-indigo-100' :
                    log.type === 'edit' ? 'bg-amber-100' : 'bg-green-100'
                  }`}>
                    {activityIcons[log.type]}
                  </div>
                  <div className="flex-1 pb-2">
                    <p className="text-sm font-semibold text-slate-800">{log.action}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {log.date} • Changed by: <span className="text-indigo-600 font-medium">{log.changedBy}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <DeleteModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        itemName={biz.name}
      />
    </div>
  );
}
