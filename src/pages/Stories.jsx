import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Eye, Calendar, Upload, ChevronRight } from 'lucide-react';
import { StatusBadge } from '../components/common/Badge';
import { stories } from '../data/dummyData';
import toast from 'react-hot-toast';

const tabs = ['All', 'Active', 'Scheduled', 'Expired'];
const storyColors = [
  'from-indigo-400 to-purple-500',
  'from-amber-400 to-orange-500',
  'from-green-400 to-teal-500',
  'from-blue-400 to-indigo-500',
  'from-rose-400 to-pink-500',
  'from-slate-400 to-slate-600',
];

export default function Stories() {
  const [activeTab, setActiveTab] = useState('All');
  const [schedule, setSchedule] = useState('now');

  const filtered = stories.filter(s =>
    activeTab === 'All' ? true : s.status === activeTab
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Stories & News</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage stories, news and announcements</p>
        </div>
        <button onClick={() => toast.success('Create Story form opened!')} className="btn-primary">
          <Plus size={16} /> Create Story
        </button>
      </div>

      {/* Tabs */}
      <div className="card px-5 pt-4 pb-0">
        <div className="flex gap-1 border-b border-slate-100">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all -mb-px ${
                activeTab === tab ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab === 'Active' && '✅'}{tab === 'Scheduled' && '⏰'}{tab === 'Expired' && '❌'} {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Stories grid */}
      <div className="grid grid-cols-3 gap-5">
        {filtered.map((story, i) => (
          <div key={story.id} className="card overflow-hidden hover:shadow-md transition-all duration-200 group">
            <div className={`h-36 bg-gradient-to-br ${storyColors[i % storyColors.length]} relative flex items-center justify-center`}>
              <span className="text-white text-opacity-30 text-5xl">📰</span>
              <div className="absolute top-3 left-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-black/30 text-white backdrop-blur-sm">
                  {story.type}
                </span>
              </div>
              <div className="absolute top-3 right-3">
                <StatusBadge status={story.status} />
              </div>
            </div>
            <div className="p-4">
              <h4 className="font-bold text-slate-800 mb-2">{story.title}</h4>
              <div className="space-y-1 mb-3">
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  📍 {story.city}
                </p>
                <p className="text-xs text-slate-500">Posted: {story.posted}</p>
                <p className={`text-xs ${story.expiry ? 'text-amber-600' : 'text-slate-400'}`}>
                  {story.expiry ? `Expires ${story.expiry}` : 'No Expiry'}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Eye size={11} /> {story.views.toLocaleString()} views
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => toast.success('Edit story')} className="w-7 h-7 rounded-lg hover:bg-amber-100 flex items-center justify-center text-slate-400 hover:text-amber-600 transition-colors">
                    <Pencil size={13} />
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

      {/* Create Story Form */}
      <div className="card p-6">
        <h3 className="font-bold text-slate-800 text-lg mb-5 pb-3 border-b border-slate-100">Create New Story</h3>
        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Story Title *</label>
              <input type="text" placeholder="Enter story title" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Story Type</label>
              <select className="input-field">
                {['News', 'Offer', 'Event', 'Update'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Content *</label>
              <textarea rows={4} placeholder="Enter story content..." className="input-field resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Target City</label>
                <select className="input-field">
                  {['All Cities', 'Mumbai', 'Pune', 'Nashik', 'Aurangabad'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Action Link</label>
                <input type="url" placeholder="https://..." className="input-field" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Story Image</label>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-colors cursor-pointer">
                <Upload size={28} className="text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Click to upload or drag & drop</p>
                <p className="text-xs text-slate-400 mt-1">PNG, JPG, GIF up to 5MB</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Schedule</label>
              <div className="flex gap-4">
                {[['now', 'Post Now'], ['later', 'Schedule for Later']].map(([val, label]) => (
                  <label key={val} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="schedule" checked={schedule === val} onChange={() => setSchedule(val)} className="text-indigo-600" />
                    <span className="text-sm text-slate-700">{label}</span>
                  </label>
                ))}
              </div>
              {schedule === 'later' && (
                <input type="datetime-local" className="input-field mt-2" />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Expiry</label>
              <input type="date" className="input-field" />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => toast('Draft saved!')}
                className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Save Draft
              </button>
              <button
                onClick={() => toast.success('Story published successfully!')}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/30"
              >
                Publish Story
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
