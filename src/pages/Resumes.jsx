import React, { useState } from 'react';
import { Search, Eye, ChevronRight } from 'lucide-react';
import { resumes } from '../data/dummyData';
import toast from 'react-hot-toast';

export default function Resumes() {
  const [search, setSearch] = useState('');

  const filtered = resumes.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Job Seeker Resumes</h1>
        <p className="text-slate-500 text-sm mt-0.5">View and manage candidate resumes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Total Resumes', value: '3,847', bg: 'bg-indigo-100', color: 'text-indigo-700' },
          { label: 'This Week', value: '+124', bg: 'bg-emerald-100', color: 'text-emerald-700' },
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
            placeholder="Search by name, skill, role..."
            className="input-field pl-10"
          />
        </div>
        {['City', 'Experience', 'Date'].map(f => (
          <button key={f} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:border-indigo-400 transition-colors">
            {f} <ChevronRight size={12} className="rotate-90" />
          </button>
        ))}
      </div>

      {/* Resume cards */}
      <div className="grid grid-cols-3 gap-5">
        {(filtered.length > 0 ? filtered : resumes).map((resume) => (
          <div key={resume.id} className="card p-5 hover:shadow-md transition-all duration-200 group">
            <div className="flex items-start gap-4 mb-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${resume.color}, ${resume.color}99)` }}
              >
                {resume.initials}
              </div>
              <div>
                <h3 className="font-bold text-slate-800">{resume.name}</h3>
                <p className="text-sm text-indigo-600 font-medium">{resume.role}</p>
                <p className="text-xs text-slate-500 mt-0.5">📍 {resume.city}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm mb-3">
              <span className="text-slate-600">Experience:</span>
              <span className="font-semibold text-slate-800">{resume.experience}</span>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-4">
              {resume.skills.map(skill => (
                <span key={skill} className="text-xs font-medium bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full">
                  {skill}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">{resume.posted}</span>
              <button
                onClick={() => toast.success(`Opening resume: ${resume.name}`)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium transition-colors"
              >
                <Eye size={13} /> View Resume
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
