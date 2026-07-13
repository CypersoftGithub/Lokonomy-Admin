import React, { useState } from 'react';
import { Bell, Users, Building2, UserCircle, Send, Image, ChevronRight, Search, X } from 'lucide-react';
import { StatusBadge } from '../components/common/Badge';
import { notificationHistory } from '../data/dummyData';
import toast from 'react-hot-toast';

const tabs = [
  { id: 'all', label: '👥 All Users', icon: Users },
  { id: 'business', label: '🏢 Businesses', icon: Building2 },
  { id: 'specific', label: '🎯 Specific User/Business', icon: UserCircle },
];

const searchResults = [
  { name: 'Rahul Sharma', phone: '9876543210', city: 'Mumbai' },
  { name: 'Raj Sharma', phone: '9812345678', city: 'Pune' },
];

function NotificationForm({ recipientLabel, onSend }) {
  const [schedule, setSchedule] = useState('now');
  return (
    <div className="space-y-4">
      <div className="p-3 bg-indigo-50 rounded-xl text-sm text-indigo-700 font-medium">
        📊 Estimated: {recipientLabel}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Title *</label>
        <input type="text" placeholder="Notification title..." className="input-field" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Message *</label>
        <textarea rows={4} placeholder="Write your notification message..." className="input-field resize-none" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Image (Optional)</label>
        <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center hover:border-indigo-400 transition-colors cursor-pointer">
          <Image size={22} className="text-slate-300 mx-auto mb-1.5" />
          <p className="text-sm text-slate-500">Upload notification image</p>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Action Link</label>
        <input type="url" placeholder="https://..." className="input-field" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Schedule</label>
        <div className="flex gap-4">
          {[['now', 'Send Now'], ['later', 'Schedule for Later']].map(([v, l]) => (
            <label key={v} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="scheduleNotif" checked={schedule === v} onChange={() => setSchedule(v)} className="text-indigo-600" />
              <span className="text-sm text-slate-700">{l}</span>
            </label>
          ))}
        </div>
        {schedule === 'later' && <input type="datetime-local" className="input-field mt-2" />}
      </div>
      <button
        onClick={onSend}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2"
      >
        <Bell size={16} /> Send Notification
      </button>
    </div>
  );
}

function PhonePreview() {
  return (
    <div className="flex flex-col items-center">
      <p className="text-sm font-semibold text-slate-700 mb-4">Preview</p>
      <div className="w-56 h-96 border-4 border-slate-700 rounded-3xl bg-slate-100 shadow-xl flex flex-col overflow-hidden relative">
        {/* Phone notch */}
        <div className="h-6 bg-slate-700 flex items-center justify-center">
          <div className="w-16 h-2 bg-slate-600 rounded-full" />
        </div>
        <div className="flex-1 p-3 space-y-2">
          {/* Notification card */}
          <div className="bg-white rounded-xl shadow p-3 border-l-4 border-indigo-500">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
                <Bell size={12} className="text-white" />
              </div>
              <span className="text-xs font-bold text-slate-700">BizPanel App</span>
              <span className="text-xs text-slate-400 ml-auto">Now</span>
            </div>
            <p className="text-xs font-semibold text-slate-800">Notification Title</p>
            <p className="text-xs text-slate-500 mt-0.5">Your message preview will appear here...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Notifications() {
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [userType, setUserType] = useState('user');

  const handleSend = () => {
    toast.success('Notification sent successfully! 🎉');
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Notification Center</h1>
        <p className="text-slate-500 text-sm mt-0.5">Send push notifications to users and businesses</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Sent', value: '1,284', bg: 'bg-indigo-100', color: 'text-indigo-700' },
          { label: 'This Week', value: '47', bg: 'bg-emerald-100', color: 'text-emerald-700' },
          { label: 'This Month', value: '312', bg: 'bg-purple-100', color: 'text-purple-700' },
        ].map(({ label, value, bg, color }) => (
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
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-t-lg transition-all -mb-px ${
                activeTab === tab.id ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-6">
        {activeTab === 'all' && (
          <div className="grid grid-cols-5 gap-8">
            <div className="col-span-3 space-y-5">
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Target Audience</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">City</label>
                    <select className="input-field text-sm">
                      {['All Cities', 'Mumbai', 'Pune', 'Nashik'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-2">User Type</label>
                    <div className="space-y-1.5">
                      {['All Users', 'Only Regular Users', 'Only Business Users'].map((opt, i) => (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="userType" defaultChecked={i === 0} className="text-indigo-600" />
                          <span className="text-xs text-slate-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <NotificationForm recipientLabel="12,847 users" onSend={handleSend} />
            </div>
            <div className="col-span-2">
              <PhonePreview />
            </div>
          </div>
        )}

        {activeTab === 'business' && (
          <div className="grid grid-cols-5 gap-8">
            <div className="col-span-3 space-y-5">
              <div className="p-4 bg-slate-50 rounded-xl">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Filter Businesses</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[['City', ['All Cities', 'Mumbai', 'Pune']], ['Plan', ['All Plans', 'Basic', 'Standard', 'Premium']], ['Category', ['All Categories', 'Electronics', 'Food']], ['Status', ['All', 'Active', 'Expiring']]].map(([label, options]) => (
                    <div key={label}>
                      <label className="block text-xs text-slate-500 mb-1">{label}</label>
                      <select className="input-field text-sm">
                        {options.map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
                <p className="text-sm font-semibold text-indigo-600 mt-3">Matching: 3,241 businesses</p>
              </div>
              <NotificationForm recipientLabel="3,241 businesses" onSend={handleSend} />
            </div>
            <div className="col-span-2">
              <PhonePreview />
            </div>
          </div>
        )}

        {activeTab === 'specific' && (
          <div className="grid grid-cols-5 gap-8">
            <div className="col-span-3 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Target Type</label>
                <div className="flex gap-4">
                  {[['user', 'User'], ['business', 'Business']].map(([val, label]) => (
                    <label key={val} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="targetType" checked={userType === val} onChange={() => setUserType(val)} className="text-indigo-600" />
                      <span className="text-sm text-slate-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Search</label>
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name or phone number..."
                    className="input-field pl-10"
                  />
                </div>
                {search && (
                  <div className="mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                    {searchResults.map(r => (
                      <button
                        key={r.name}
                        onClick={() => { setSelected(r); setSearch(''); }}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-3 border-b border-slate-50 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                          <UserCircle size={18} className="text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{r.name}</p>
                          <p className="text-xs text-slate-500">{r.phone} • {r.city}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {selected && (
                  <div className="mt-2 inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-sm font-medium">
                    <UserCircle size={14} /> {selected.name}
                    <button onClick={() => setSelected(null)} className="hover:text-indigo-900"><X size={14} /></button>
                  </div>
                )}
              </div>
              <NotificationForm recipientLabel={selected ? `1 ${userType}` : 'Select a recipient first'} onSend={handleSend} />
            </div>
            <div className="col-span-2">
              <PhonePreview />
            </div>
          </div>
        )}
      </div>

      {/* History */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">Recent Notifications</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50">
              {['Date', 'Title', 'Sent To', 'Recipients', 'Status'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {notificationHistory.map((row, i) => (
              <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3.5 text-sm text-slate-500">{row.date}</td>
                <td className="px-5 py-3.5 text-sm font-semibold text-slate-800">{row.title}</td>
                <td className="px-5 py-3.5 text-sm text-slate-600">{row.sentTo}</td>
                <td className="px-5 py-3.5 text-sm font-medium text-slate-700">{row.recipients}</td>
                <td className="px-5 py-3.5"><StatusBadge status="Active" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
