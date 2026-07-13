import React, { useState } from 'react';
import { X, Trash2, Eye, EyeOff, AlertTriangle } from 'lucide-react';

export default function DeleteModal({ isOpen, onClose, itemName, itemType = 'business' }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [tried, setTried] = useState(false);

  if (!isOpen) return null;

  const handleDelete = () => {
    setTried(true);
    if (password === '') {
      setError(true);
      return;
    }
    setError(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle size={20} className="text-red-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Delete Confirmation</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Warning box */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-700 text-sm font-semibold flex items-center gap-2 mb-2">
              <span>⛔</span> WARNING: This action cannot be undone!
            </p>
            <p className="text-red-600 text-sm">You are about to permanently delete:</p>
            <p className="text-red-800 font-bold text-base mt-1">"{itemName}"</p>
            <p className="text-red-600 text-sm mt-1">
              This will also delete all their posts and data associated with this {itemType}.
            </p>
          </div>

          {/* Password field */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Enter your admin password to confirm:
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                🔒
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                placeholder="Enter admin password..."
                className={`w-full border rounded-lg pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${
                  error
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && (
              <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                ❌ Incorrect password. Please try again.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 pt-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={!password}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              password
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/30'
                : 'bg-red-200 text-red-400 cursor-not-allowed'
            }`}
          >
            <Trash2 size={15} />
            Delete Permanently
          </button>
        </div>
      </div>
    </div>
  );
}
