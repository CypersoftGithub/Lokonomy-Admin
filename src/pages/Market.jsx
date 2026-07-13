import React, { useState } from 'react';
import { Pencil, Trash2, ChevronRight } from 'lucide-react';
import { StatusBadge } from '../components/common/Badge';
import { marketListings } from '../data/dummyData';
import toast from 'react-hot-toast';

const tabs = ['All', 'Sell', 'Buy/Demand', 'Sold/Fulfilled'];

export default function Market() {
  const [activeTab, setActiveTab] = useState('All');

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Market Listings</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage buy/sell market listings</p>
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
              {tab === 'Sell' && '🟢'}{tab === 'Buy/Demand' && '🔵'}{tab === 'Sold/Fulfilled' && '⚫'} {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['ID', 'Preview', 'Title', 'Type', 'Price', 'Posted By', 'City', 'Date', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {marketListings.map((item) => (
                <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                  <td className="px-4 py-3 text-xs font-mono text-indigo-600 font-semibold">{item.id}</td>
                  <td className="px-4 py-3">
                    <div className="w-14 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center text-xl">
                      {item.type === 'Sell' ? '🛍️' : '🔍'}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      item.type === 'Sell' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {item.type === 'Sell' ? '🟢' : '🔵'} {item.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-800">{item.price}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{item.postedBy}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{item.city}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{item.date}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={item.status === 'Sold' ? 'Inactive' : 'Active'} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => toast.success(`Edit listing: ${item.title}`)} className="w-7 h-7 rounded-lg hover:bg-amber-100 flex items-center justify-center text-slate-400 hover:text-amber-600 transition-colors"><Pencil size={13} /></button>
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
