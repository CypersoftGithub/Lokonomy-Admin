import React, { useState } from 'react';
import { Search, Download, Eye, Ban, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { StatusBadge } from '../components/common/Badge';
import { users } from '../data/dummyData';
import toast from 'react-hot-toast';

export default function Users() {
  const [search, setSearch] = useState('');

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.phone.includes(search)
  );

  const toggleBlock = (user) => {
    const action = user.status === 'Blocked' ? 'Unblocked' : 'Blocked';
    toast.success(`${user.name} has been ${action.toLowerCase()}!`);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">App Users</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage all registered app users</p>
        </div>
        <button
          onClick={() => toast.success('CSV exported!')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <Download size={15} /> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: '12,847', color: 'text-slate-800', bg: 'bg-slate-100' },
          { label: 'Active', value: '12,100', color: 'text-emerald-700', bg: 'bg-emerald-100' },
          { label: 'New This Week', value: '+247', color: 'text-blue-700', bg: 'bg-blue-100' },
          { label: 'Blocked', value: '47', color: 'text-red-600', bg: 'bg-red-100' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-xl p-4`}>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-sm text-slate-600 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="card p-4 flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or phone..."
            className="input-field pl-10"
          />
        </div>
        {['City', 'Status', 'Date Range'].map(f => (
          <button key={f} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors whitespace-nowrap">
            {f} <ChevronRight size={12} className="rotate-90" />
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-3 w-8"><input type="checkbox" className="rounded border-slate-300" /></th>
                {['ID', 'Name', 'Phone', 'City', 'Joined Date', 'Last Active', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(filtered.length > 0 ? filtered : users).map((user) => (
                <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                  <td className="px-4 py-3"><input type="checkbox" className="rounded border-slate-300" /></td>
                  <td className="px-4 py-3 text-xs font-mono text-indigo-600 font-semibold">{user.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">{user.name.split(' ').map(n=>n[0]).join('')}</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-800">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{user.phone}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{user.city}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{user.joined}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{user.lastActive}</td>
                  <td className="px-4 py-3"><StatusBadge status={user.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => toast.success(`Viewing ${user.name}'s profile`)}
                        className="w-7 h-7 rounded-lg hover:bg-indigo-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors"
                        title="View"
                      >
                        <Eye size={14} />
                      </button>
                      {user.status === 'Active' ? (
                        <button
                          onClick={() => toggleBlock(user)}
                          className="w-7 h-7 rounded-lg hover:bg-red-100 flex items-center justify-center text-slate-400 hover:text-red-600 transition-colors"
                          title="Block"
                        >
                          <Ban size={14} />
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleBlock(user)}
                          className="w-7 h-7 rounded-lg hover:bg-green-100 flex items-center justify-center text-slate-400 hover:text-green-600 transition-colors"
                          title="Unblock"
                        >
                          <CheckCircle size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
          <span className="text-sm text-slate-500">Showing 1 to 8 of 12,847 results</span>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:border-indigo-400 transition-colors">
              <ChevronLeft size={15} />
            </button>
            {[1,2,3].map(p => (
              <button key={p} className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${p === 1 ? 'bg-indigo-600 text-white' : 'border border-slate-200 text-slate-600 hover:border-indigo-400'}`}>
                {p}
              </button>
            ))}
            <span className="px-1 text-slate-400">...</span>
            <button className="w-8 h-8 rounded-lg border border-slate-200 text-sm text-slate-600 hover:border-indigo-400 transition-colors">642</button>
            <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:border-indigo-400 transition-colors">
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
