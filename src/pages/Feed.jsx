import React, { useState } from 'react';
import { Search, List, Grid, Pencil, Trash2, EyeOff, ChevronRight } from 'lucide-react';
import { StatusBadge } from '../components/common/Badge';
import { feedPosts } from '../data/dummyData';
import toast from 'react-hot-toast';

const postColors = [
  'from-indigo-400 to-purple-400',
  'from-blue-400 to-cyan-400',
  'from-green-400 to-emerald-400',
  'from-amber-400 to-orange-400',
  'from-pink-400 to-rose-400',
  'from-purple-400 to-indigo-400',
  'from-teal-400 to-green-400',
  'from-orange-400 to-red-400',
  'from-cyan-400 to-blue-400',
];

export default function Feed() {
  const [viewMode, setViewMode] = useState('grid');
  const [search, setSearch] = useState('');

  const filtered = feedPosts.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Feed Posts</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage all business feed posts</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Posts', value: '8,432', bg: 'bg-indigo-100', color: 'text-indigo-700' },
          { label: 'Today', value: '47', bg: 'bg-emerald-100', color: 'text-emerald-700' },
          { label: 'This Week', value: '312', bg: 'bg-purple-100', color: 'text-purple-700' },
        ].map(({ label, value, bg, color }) => (
          <div key={label} className={`${bg} rounded-xl p-4`}>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-sm text-slate-600 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4 flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search posts..."
            className="input-field pl-10"
          />
        </div>
        {['City', 'Category', 'Date', 'Status'].map(f => (
          <button key={f} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:border-indigo-400 transition-colors whitespace-nowrap">
            {f} <ChevronRight size={12} className="rotate-90" />
          </button>
        ))}
        <div className="ml-auto flex gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('list')}
            className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${viewMode === 'list' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}
          >
            <List size={16} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${viewMode === 'grid' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}
          >
            <Grid size={16} />
          </button>
        </div>
      </div>

      {/* Grid view */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((post, i) => (
            <div key={post.id} className="card overflow-hidden hover:shadow-md transition-all duration-200 group">
              <div className={`h-40 bg-gradient-to-br ${postColors[i % postColors.length]} relative flex items-center justify-center`}>
                <span className="text-white text-opacity-30 text-6xl select-none">📸</span>
                <div className="absolute top-3 left-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full text-white bg-black/30 backdrop-blur-sm`}>
                    {post.type}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-slate-800 text-sm mb-1.5 line-clamp-2">{post.title}</h4>
                <a href="#" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">{post.business}</a>
                <div className="flex items-center gap-2 mt-1.5 mb-3">
                  <span className="text-xs text-slate-400">📍 {post.city}</span>
                  <span className="text-xs text-slate-400">• {post.date}</span>
                </div>
                <div className="flex items-center justify-between">
                  <StatusBadge status={post.status} />
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toast.success(`Edit post: ${post.title}`)}
                      className="w-7 h-7 rounded-lg hover:bg-amber-100 flex items-center justify-center text-slate-400 hover:text-amber-600 transition-colors"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => toast(`Post ${post.status === 'Active' ? 'hidden' : 'shown'}!`)}
                      className="w-7 h-7 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <EyeOff size={13} />
                    </button>
                    <button className="w-7 h-7 rounded-lg hover:bg-red-100 flex items-center justify-center text-slate-400 hover:text-red-600 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List view */}
      {viewMode === 'list' && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['ID', 'Title', 'Business', 'City', 'Type', 'Date', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((post) => (
                <tr key={post.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                  <td className="px-4 py-3 text-xs font-mono text-indigo-600 font-semibold">{post.id}</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-800">{post.title}</td>
                  <td className="px-4 py-3 text-sm text-indigo-600">{post.business}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{post.city}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">{post.type}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">{post.date}</td>
                  <td className="px-4 py-3"><StatusBadge status={post.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="w-7 h-7 rounded-lg hover:bg-amber-100 flex items-center justify-center text-slate-400 hover:text-amber-600 transition-colors"><Pencil size={13} /></button>
                      <button className="w-7 h-7 rounded-lg hover:bg-red-100 flex items-center justify-center text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
