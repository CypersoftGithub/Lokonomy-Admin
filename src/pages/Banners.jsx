import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink, ImageIcon, RefreshCw, Upload, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config';

export default function Banners() {
  const [bannersList, setBannersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Form states
  const [bannerName, setBannerName] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Image upload states
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const fileInputRef = useRef(null);

  const fetchBanners = async () => {
    setLoading(true);
    const token = localStorage.getItem('lokonomy_admin_token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/global/banner`, {
        method: 'GET',
        headers: {
          'accept': '*/*',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'x-user-type': 'admin'
        }
      });
      const resJson = await response.json();
      if (resJson.status) {
        setBannersList(resJson.data || []);
      } else {
        const errMsg = typeof resJson.error === 'object' ? (resJson.error.message || JSON.stringify(resJson.error)) : resJson.error;
        toast.error(errMsg || 'Failed to fetch banners');
      }
    } catch (err) {
      console.error('Error fetching banners:', err);
      toast.error('Error fetching banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      uploadImageFile(file);
    }
  };

  const uploadImageFile = async (file) => {
    setUploadingImage(true);
    const token = localStorage.getItem('lokonomy_admin_token');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/storage/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-user-type': 'admin'
        },
        body: formData
      });
      const resJson = await response.json();
      if (resJson.status && resJson.data?.[0]?.file_url) {
        setUploadedImageUrl(resJson.data[0].file_url);
        toast.success('Banner image uploaded!');
      } else {
        const errMsg = typeof resJson.error === 'object' ? (resJson.error.message || JSON.stringify(resJson.error)) : resJson.error;
        toast.error(errMsg || 'Image upload failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error uploading image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setUploadedImageUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCreateBanner = async (e) => {
    if (e) e.preventDefault();
    if (!bannerName.trim()) {
      toast.error('Please enter banner name');
      return;
    }
    if (!uploadedImageUrl) {
      toast.error('Please upload a banner image');
      return;
    }

    setSubmitting(true);
    const token = localStorage.getItem('lokonomy_admin_token');

    const payload = {
      banner_name: bannerName.trim(),
      banner_image: uploadedImageUrl,
      banner_url: bannerUrl.trim() || null
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/global/banner`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-user-type': 'admin'
        },
        body: JSON.stringify(payload)
      });
      const resJson = await response.json();
      if (resJson.status) {
        toast.success('Banner added successfully! 🎉');
        setBannerName('');
        setBannerUrl('');
        handleRemoveImage();
        fetchBanners();
      } else {
        const errMsg = typeof resJson.error === 'object' ? (resJson.error.message || JSON.stringify(resJson.error)) : resJson.error;
        toast.error(errMsg || 'Failed to add banner');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error adding banner');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredBanners = bannersList.filter(b => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return (
      (b.banner_name && b.banner_name.toLowerCase().includes(query)) ||
      (b.banner_url && b.banner_url.toLowerCase().includes(query)) ||
      String(b.banner_id).includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">App Banner Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage live promotional and featured banners in the app</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchBanners}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
            title="Refresh Banners"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* All Banners Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-slate-800 text-base">Banner Directory</h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">
              {bannersList.length} Total
            </span>
          </div>
          <div className="w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search banners..."
              className="input-field text-xs py-1.5"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mx-auto mb-2" />
            Loading banners...
          </div>
        ) : filteredBanners.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No matching banners found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3.5">ID</th>
                  <th className="px-6 py-3.5">Preview</th>
                  <th className="px-6 py-3.5">Banner Name</th>
                  <th className="px-6 py-3.5">Action URL</th>
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredBanners.map((banner) => (
                  <tr key={banner.banner_id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-indigo-600">
                      #{banner.banner_id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-28 h-12 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center flex-shrink-0">
                        {banner.banner_image ? (
                          <img
                            src={banner.banner_image}
                            alt={banner.banner_name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <ImageIcon size={18} className="text-slate-300" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="font-bold text-slate-800 text-sm truncate">{banner.banner_name || 'Untitled Banner'}</p>
                    </td>
                    <td className="px-6 py-4 max-w-sm">
                      {banner.banner_url ? (
                        <a
                          href={banner.banner_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 font-medium truncate"
                        >
                          <span className="truncate">{banner.banner_url}</span>
                          <ExternalLink size={11} className="flex-shrink-0" />
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full font-bold text-[11px] bg-emerald-50 text-emerald-600 border border-emerald-100">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add New Banner Form */}
      <div className="card p-6">
        <h3 className="font-bold text-slate-800 text-lg mb-5 pb-3 border-b border-slate-100 flex items-center gap-2">
          <Plus size={18} className="text-indigo-600" />
          <span>Add New Banner</span>
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Banner Name / Title *</label>
              <input
                type="text"
                value={bannerName}
                onChange={(e) => setBannerName(e.target.value)}
                placeholder="Enter banner name or promotional title"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Action URL / Link (Optional)</label>
              <input
                type="url"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                placeholder="https://..."
                className="input-field"
              />
              <p className="text-xs text-slate-400 mt-1">Optional redirection URL when user taps the banner</p>
            </div>
          </div>

          {/* Right Column: Image Upload */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Banner Image *</label>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
              />
              {imagePreview ? (
                <div className="relative border border-slate-200 rounded-xl overflow-hidden group h-36 flex items-center justify-center bg-slate-50">
                  <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                  {uploadingImage ? (
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white z-10">
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mb-1" />
                      <span className="text-xs">Uploading...</span>
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-10">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="py-1.5 px-3 rounded-lg bg-white text-slate-800 text-xs font-semibold hover:bg-slate-100 transition-all shadow-sm"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="py-1.5 px-3 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-all shadow-sm"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-colors cursor-pointer"
                >
                  <Upload size={28} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500 font-medium">Click to upload banner image</p>
                  <p className="text-xs text-slate-400 mt-1">PNG, JPG, WebP up to 5MB (Recommended: 1200 × 400px)</p>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                disabled={submitting || uploadingImage}
                onClick={handleCreateBanner}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Adding Banner...</span>
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    <span>Add Banner</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
