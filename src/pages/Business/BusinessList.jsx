import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Download, RefreshCw, Eye, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { StatusBadge, PlanBadge } from '../../components/common/Badge';
import DeleteModal from '../../components/common/DeleteModal';
import { businesses } from '../../data/dummyData';
import toast from 'react-hot-toast';

const tabs = ['All', 'Active', 'Expiring Soon', 'Expired', 'Newly Added'];
const tabCounts = { All: 3241, Active: 2986, 'Expiring Soon': 143, Expired: 255, 'Newly Added': 47 };

export default function BusinessList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState({ open: false, name: '' });

  const filtered = businesses.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.owner.toLowerCase().includes(search.toLowerCase()) ||
    b.phone.includes(search)
  );

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Business Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage all registered businesses</p>
        </div>
        <button
          onClick={() => toast.success('Add Business form opened!')}
          className="btn-primary"
        >
          <Plus size={16} /> Add Business
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total', value: '3,241', color: 'text-slate-800', bg: 'bg-slate-100' },
          { label: 'Active', value: '2,986', color: 'text-emerald-700', bg: 'bg-emerald-100' },
          { label: 'Expired', value: '255', color: 'text-red-600', bg: 'bg-red-100' },
          { label: 'Expiring Soon', value: '143', color: 'text-amber-700', bg: 'bg-amber-100' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-xl p-4`}>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-sm text-slate-600 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="card px-5 pt-4 pb-0">
        <div className="flex gap-1 border-b border-slate-100">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all relative -mb-px ${
                activeTab === tab
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                activeTab === tab ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {tabCounts[tab].toLocaleString()}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by business name, phone, category..."
            className="input-field pl-10"
          />
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {['City', 'Category', 'Plan Type', 'Status', 'Expiry'].map(f => (
            <button key={f} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors">
              {f} <ChevronRight size={12} className="rotate-90" />
            </button>
          ))}
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => setSearch('')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <RefreshCw size={13} /> Reset
            </button>
            <button
              onClick={() => toast.success('CSV exported!')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Download size={13} /> Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-3 w-8"><input type="checkbox" className="rounded border-slate-300" /></th>
                {['ID', 'Business Name', 'Owner', 'Phone', 'City', 'Category', 'Plan', 'Status', 'Expiry', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(filtered.length > 0 ? filtered : businesses).map((biz) => (
                <tr key={biz.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                  <td className="px-4 py-3"><input type="checkbox" className="rounded border-slate-300" /></td>
                  <td className="px-4 py-3 text-xs font-mono text-indigo-600 font-semibold">{biz.id}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate(`/business/${biz.id.replace('#', '')}`)}
                      className="text-sm font-semibold text-slate-800 hover:text-indigo-600 transition-colors text-left"
                    >
                      {biz.name}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{biz.owner}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{biz.phone}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{biz.city}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{biz.category}</td>
                  <td className="px-4 py-3"><PlanBadge plan={biz.plan} /></td>
                  <td className="px-4 py-3"><StatusBadge status={biz.status} /></td>
                  <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">{biz.expiry}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => navigate(`/business/${biz.id.replace('#', '')}`)}
                        className="w-7 h-7 rounded-lg hover:bg-indigo-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors"
                        title="View"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => toast.success(`Edit ${biz.name}`)}
                        className="w-7 h-7 rounded-lg hover:bg-amber-100 flex items-center justify-center text-slate-400 hover:text-amber-600 transition-colors"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteModal({ open: true, name: biz.name })}
                        className="w-7 h-7 rounded-lg hover:bg-red-100 flex items-center justify-center text-slate-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {filtered.length === 0 && search && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search size={28} className="text-slate-400" />
            </div>
            <h3 className="text-slate-700 font-semibold mb-1">No results found</h3>
            <p className="text-slate-400 text-sm mb-4">Try adjusting your search or filters</p>
            <button onClick={() => setSearch('')} className="px-4 py-2 bg-indigo-50 text-indigo-600 text-sm font-medium rounded-lg hover:bg-indigo-100 transition-colors">
              Clear Filters
            </button>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">Showing 1 to {filtered.length > 0 ? Math.min(filtered.length, 8) : 8} of 3,241 results</span>
            <select className="border border-slate-200 rounded-lg text-sm px-2 py-1.5 text-slate-600 focus:outline-none focus:border-indigo-500">
              <option>20</option><option>50</option><option>100</option>
            </select>
          </div>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors">
              <ChevronLeft size={15} />
            </button>
            {[1,2,3].map(p => (
              <button key={p} className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${p === 1 ? 'bg-indigo-600 text-white' : 'border border-slate-200 text-slate-600 hover:border-indigo-400'}`}>
                {p}
              </button>
            ))}
            <span className="w-8 h-8 flex items-center justify-center text-slate-400 text-sm">...</span>
            <button className="w-8 h-8 rounded-lg border border-slate-200 text-sm text-slate-600 hover:border-indigo-400 transition-colors">162</button>
            <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors">
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      <DeleteModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, name: '' })}
        itemName={deleteModal.name}
      />
    </div>
  );
}
