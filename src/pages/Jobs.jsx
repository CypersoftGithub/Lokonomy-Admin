import React, { useState } from 'react';
import { Search, Eye, Trash2, ChevronRight, Users } from 'lucide-react';
import { StatusBadge } from '../components/common/Badge';
import { jobPostings } from '../data/dummyData';
import toast from 'react-hot-toast';

export default function Jobs() {
  const [search, setSearch] = useState('');

  const filtered = jobPostings.filter(j =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.business.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Job Postings</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage all job listings across the platform</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Jobs', value: '1,247', bg: 'bg-indigo-100', color: 'text-indigo-700' },
          { label: 'Active', value: '986', bg: 'bg-emerald-100', color: 'text-emerald-700' },
          { label: 'Filled', value: '261', bg: 'bg-slate-100', color: 'text-slate-700' },
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
            placeholder="Search jobs by title or business..."
            className="input-field pl-10"
          />
        </div>
        {['City', 'Category', 'Job Type', 'Status'].map(f => (
          <button key={f} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:border-indigo-400 transition-colors whitespace-nowrap">
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
                {['ID', 'Job Title', 'Business', 'City', 'Type', 'Salary', 'Posted', 'Applicants', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((job) => (
                <tr key={job.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                  <td className="px-4 py-3 text-xs font-mono text-indigo-600 font-semibold">{job.id}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-800">{job.title}</td>
                  <td className="px-4 py-3 text-sm text-indigo-600">{job.business}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{job.city}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      job.type === 'Full-Time' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {job.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 font-medium">{job.salary}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{job.posted}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-sm text-slate-700">
                      <Users size={13} className="text-indigo-500" />
                      <span className="font-semibold">{job.applicants}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={job.status === 'Filled' ? 'Inactive' : 'Active'} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => toast.success(`Viewing ${job.title}`)} className="w-7 h-7 rounded-lg hover:bg-indigo-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors"><Eye size={13} /></button>
                      <button className="w-7 h-7 rounded-lg hover:bg-red-100 flex items-center justify-center text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
