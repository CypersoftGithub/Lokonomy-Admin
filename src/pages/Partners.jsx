import React, { useState } from 'react';
import { Plus, Eye, Pencil, Trash2, Info, X, Eye as EyeIcon, EyeOff } from 'lucide-react';
import { StatusBadge } from '../components/common/Badge';
import { partners } from '../data/dummyData';
import DeleteModal from '../components/common/DeleteModal';
import toast from 'react-hot-toast';

const permissions = [
  { key: 'view', label: 'View Businesses' },
  { key: 'edit', label: 'Edit Businesses' },
  { key: 'add', label: 'Add New Business' },
  { key: 'notify', label: 'Send Notifications' },
  { key: 'banners', label: 'Manage Banners' },
  { key: 'revenue', label: 'View Revenue Data' },
];

export default function Partners() {
  const [showModal, setShowModal] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [perms, setPerms] = useState({ view: true, edit: true, add: false, notify: false, banners: false, revenue: false });
  const [deleteModal, setDeleteModal] = useState({ open: false, name: '' });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Partner Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage field partners with restricted access</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          <Plus size={16} /> Create Partner
        </button>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700">
          Partners are onboarded at taluka level and have restricted access based on permissions set by Super Admin.
        </p>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['ID', 'Name', 'Email', 'Phone', 'City', 'Taluka', 'Role', 'Status', 'Last Login', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {partners.map((p) => (
                <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                  <td className="px-4 py-3 text-xs font-mono text-indigo-600 font-semibold">{p.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">{p.name.split(' ').map(n=>n[0]).join('')}</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-800">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{p.email}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{p.phone}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{p.city}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{p.taluka}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full">{p.role}</span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3 text-sm text-slate-500">{p.lastLogin}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="w-7 h-7 rounded-lg hover:bg-indigo-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors">
                        <Eye size={14} />
                      </button>
                      <button className="w-7 h-7 rounded-lg hover:bg-amber-100 flex items-center justify-center text-slate-400 hover:text-amber-600 transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteModal({ open: true, name: p.name })}
                        className="w-7 h-7 rounded-lg hover:bg-red-100 flex items-center justify-center text-slate-400 hover:text-red-600 transition-colors"
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
      </div>

      {/* Create Partner Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Create New Partner</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[['Full Name', 'text', 'Enter full name'], ['Email', 'email', 'email@example.com'], ['Phone', 'tel', '9876543210']].map(([label, type, placeholder]) => (
                  <div key={label} className={label === 'Full Name' ? 'col-span-2' : ''}>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
                    <input type={type} placeholder={placeholder} className="input-field" />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} placeholder="Set password" className="input-field pr-10" />
                    <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOff size={16} /> : <EyeIcon size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[['Assign City', ['Mumbai', 'Pune', 'Nashik', 'Aurangabad']], ['Assign Taluka', ['Andheri', 'Borivali', 'Dadar', 'Thane']]].map(([label, options]) => (
                  <div key={label}>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
                    <select className="input-field">
                      {options.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-100">Permissions</h3>
                <div className="space-y-3">
                  {permissions.map(perm => (
                    <div key={perm.key} className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">{perm.label}</span>
                      <button
                        onClick={() => setPerms(prev => ({ ...prev, [perm.key]: !prev[perm.key] }))}
                        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${perms[perm.key] ? 'bg-emerald-500' : 'bg-slate-200'}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${perms[perm.key] ? 'translate-x-5' : ''}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-100">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={() => { setShowModal(false); toast.success('Partner created successfully!'); }}
                className="btn-primary"
              >
                Create Partner
              </button>
            </div>
          </div>
        </div>
      )}

      <DeleteModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, name: '' })}
        itemName={deleteModal.name}
        itemType="partner"
      />
    </div>
  );
}
