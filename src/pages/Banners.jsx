import React, { useState } from 'react';
import { Plus, Pencil, Trash2, EyeOff, ChevronUp, ChevronDown, Upload, X } from 'lucide-react';
import { StatusBadge } from '../components/common/Badge';
import { banners } from '../data/dummyData';
import toast from 'react-hot-toast';

const tabs = ['All', 'Active', 'Scheduled', 'Expired'];

export default function Banners() {
  const [activeTab, setActiveTab] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [noEndDate, setNoEndDate] = useState(false);
  const [position, setPosition] = useState('top');

  const filtered = banners.filter(b =>
    activeTab === 'All' ? true : b.status === activeTab
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">App Banner Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage promotional banners in the app</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={16} /> Add New Banner
        </button>
      </div>

      {/* Active banners drag section */}
      <div className="card p-5">
        <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
          🔄 Live Banners
          <span className="text-xs text-slate-400 font-normal">(drag to reorder priority)</span>
        </h3>
        <div className="space-y-3">
          {banners.filter(b => b.status === 'Active').map((banner, i) => (
            <div key={banner.id} className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group">
              <div className="text-slate-300 cursor-grab">⠿⠿</div>
              <div className="w-44 h-16 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">{banner.title}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <p className="font-semibold text-slate-800">{banner.title}</p>
                  <StatusBadge status="Active" />
                </div>
                <p className="text-xs text-slate-500">{banner.city} • {banner.position} Position • Ends: {banner.end}</p>
                <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500">
                  <span>👁️ {banner.views} views</span>
                  <span>🖱️ {banner.clicks} clicks</span>
                  <span className="text-emerald-600 font-medium">CTR: {banner.ctr}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <button className="w-7 h-7 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-400 transition-colors"><ChevronUp size={14} /></button>
                <button className="w-7 h-7 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-400 transition-colors"><ChevronDown size={14} /></button>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setShowModal(true)} className="w-8 h-8 rounded-lg hover:bg-amber-100 flex items-center justify-center text-slate-400 hover:text-amber-600 transition-colors"><Pencil size={14} /></button>
                <button onClick={() => toast.success('Banner deactivated!')} className="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-400 transition-colors"><EyeOff size={14} /></button>
                <button className="w-8 h-8 rounded-lg hover:bg-red-100 flex items-center justify-center text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All banners table */}
      <div className="card overflow-hidden">
        <div className="px-5 pt-4 pb-0">
          <div className="flex gap-1 border-b border-slate-100">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all -mb-px ${
                  activeTab === tab ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab === 'Active' && '✅'}{tab === 'Scheduled' && '⏰'}{tab === 'Expired' && '❌'} {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['ID', 'Preview', 'Title', 'City', 'Position', 'Start', 'End', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((banner) => (
                <tr key={banner.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                  <td className="px-4 py-3 text-xs font-mono text-indigo-600 font-semibold">{banner.id}</td>
                  <td className="px-4 py-3">
                    <div className="w-24 h-10 bg-gradient-to-r from-indigo-300 to-purple-400 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs font-bold truncate px-1">Banner</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-800">{banner.title}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{banner.city}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      banner.position === 'Top' ? 'bg-indigo-100 text-indigo-700' :
                      banner.position === 'Middle' ? 'bg-purple-100 text-purple-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>{banner.position}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">{banner.start}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{banner.end}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={banner.status === 'Active' ? 'Active' : banner.status === 'Scheduled' ? 'Scheduled' : 'Expired'} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setShowModal(true)} className="w-7 h-7 rounded-lg hover:bg-amber-100 flex items-center justify-center text-slate-400 hover:text-amber-600 transition-colors"><Pencil size={13} /></button>
                      <button className="w-7 h-7 rounded-lg hover:bg-red-100 flex items-center justify-center text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Banner Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Add New Banner</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Banner Title *</label>
                <input type="text" placeholder="Enter banner title" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Banner Image *</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-colors cursor-pointer">
                  <Upload size={28} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Click to upload or drag & drop</p>
                  <p className="text-xs text-slate-400 mt-1">Recommended: 1200 × 400px</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Action Link</label>
                <input type="url" placeholder="https://..." className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Target City</label>
                  <select className="input-field">
                    {['All Cities', 'Mumbai', 'Pune', 'Nashik', 'Aurangabad'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Position</label>
                  <div className="flex gap-3">
                    {['Top', 'Middle', 'Bottom'].map(p => (
                      <label key={p} className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="pos" checked={position === p.toLowerCase()} onChange={() => setPosition(p.toLowerCase())} className="text-indigo-600" />
                        <span className="text-sm text-slate-700">{p}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Start Date</label>
                  <input type="date" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    End Date
                    <label className="ml-3 text-xs text-slate-500 font-normal cursor-pointer">
                      <input type="checkbox" checked={noEndDate} onChange={e => setNoEndDate(e.target.checked)} className="mr-1" />
                      No End Date
                    </label>
                  </label>
                  <input type="date" disabled={noEndDate} className={`input-field ${noEndDate ? 'opacity-50 cursor-not-allowed' : ''}`} />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-100">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={() => { setShowModal(false); toast.success('Banner saved!'); }} className="btn-primary">Save Banner</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
