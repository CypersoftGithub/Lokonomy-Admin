import React, { useState } from 'react';
import { Plus, Search, ChevronRight, ChevronDown, Pencil, Trash2, X, Upload } from 'lucide-react';
import { categories } from '../data/dummyData';
import toast from 'react-hot-toast';

export default function Categories() {
  const [expanded, setExpanded] = useState('CAT_002');
  const [showEditModal, setShowEditModal] = useState(true);
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Category Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage business categories and subcategories</p>
        </div>
        <button onClick={() => toast.success('Add Category form opened!')} className="btn-primary">
          <Plus size={16} /> Add Category
        </button>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search categories and subcategories..."
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Category list */}
      <div className="card overflow-hidden divide-y divide-slate-100">
        {/* Table header */}
        <div className="bg-slate-50 px-5 py-3 grid grid-cols-12 gap-4">
          <div className="col-span-1" />
          <div className="col-span-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Image</div>
          <div className="col-span-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</div>
          <div className="col-span-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</div>
          <div className="col-span-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Subcategories</div>
          <div className="col-span-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">Businesses</div>
          <div className="col-span-1" />
        </div>

        {categories.map((cat) => (
          <div key={cat.id}>
            {/* Category row */}
            <div className="px-5 py-4 grid grid-cols-12 gap-4 items-center hover:bg-slate-50 transition-colors group">
              <div className="col-span-1">
                <button
                  onClick={() => setExpanded(expanded === cat.id ? null : cat.id)}
                  className="w-7 h-7 rounded-lg hover:bg-indigo-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  {expanded === cat.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
              </div>
              <div className="col-span-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-xl border border-slate-200">
                  {cat.name === 'Electronics' ? '💻' :
                   cat.name === 'Food & Dining' ? '🍽️' :
                   cat.name === 'Beauty & Salon' ? '💅' :
                   cat.name === 'Healthcare' ? '🏥' : '✈️'}
                </div>
              </div>
              <div className="col-span-2">
                <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg">{cat.id}</span>
              </div>
              <div className="col-span-3">
                <p className="font-semibold text-slate-800">{cat.name}</p>
              </div>
              <div className="col-span-2">
                <span className="text-sm text-slate-600">{cat.subcategoryCount} subcategories</span>
              </div>
              <div className="col-span-1">
                <span className="text-sm font-medium text-slate-700">{cat.businessCount.toLocaleString()}</span>
              </div>
              <div className="col-span-1">
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="w-7 h-7 rounded-lg hover:bg-amber-100 flex items-center justify-center text-slate-400 hover:text-amber-600 transition-colors"
                  >
                    <Pencil size={13} />
                  </button>
                  <button className="w-7 h-7 rounded-lg hover:bg-red-100 flex items-center justify-center text-slate-400 hover:text-red-600 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>

            {/* Subcategories */}
            {expanded === cat.id && (
              <div className="border-t border-slate-100">
                {cat.subcategories.map((sub) => (
                  <div key={sub.id} className="px-5 py-3 pl-16 grid grid-cols-12 gap-4 items-center bg-slate-50/50 hover:bg-slate-50 transition-colors group border-b border-slate-50">
                    <div className="col-span-2 col-start-3">
                      <span className="text-xs font-mono bg-purple-50 text-purple-700 px-2.5 py-1 rounded-lg font-bold">{sub.id}</span>
                    </div>
                    <div className="col-span-3">
                      <span className="text-sm text-slate-700">{sub.name}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm text-slate-500">{sub.businessCount} businesses</span>
                    </div>
                    <div className="col-span-1 col-start-12">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="w-6 h-6 rounded hover:bg-amber-100 flex items-center justify-center text-slate-400 hover:text-amber-600 transition-colors">
                          <Pencil size={12} />
                        </button>
                        <button className="w-6 h-6 rounded hover:bg-red-100 flex items-center justify-center text-slate-400 hover:text-red-600 transition-colors">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="px-5 py-3 pl-16 bg-slate-50/50">
                  <button
                    onClick={() => toast.success('Add subcategory form opened!')}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-indigo-600 border border-dashed border-indigo-300 rounded-lg hover:bg-indigo-50 transition-colors"
                  >
                    <Plus size={14} /> Add Subcategory
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowEditModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Edit Category</h2>
              <button onClick={() => setShowEditModal(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Category ID</label>
                <div className="input-field bg-slate-50 text-slate-500 cursor-not-allowed font-mono font-bold">CAT_002</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Category Name</label>
                <input type="text" defaultValue="Food & Dining" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Current Image</label>
                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 rounded-xl bg-slate-100 flex items-center justify-center text-4xl border-2 border-dashed border-slate-200">
                    🍽️
                  </div>
                  <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                    <Upload size={14} /> Upload New Image
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <textarea rows={3} placeholder="Category description..." className="input-field resize-none" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-100">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={() => { setShowEditModal(false); toast.success('Category updated!'); }}
                className="btn-primary"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
