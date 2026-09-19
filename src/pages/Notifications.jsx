import React, { useState, useEffect, useRef } from 'react';
import { Bell, Users, Building2, Send, Upload, BellRing, Calendar, Radio } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config';

const tabs = [
  { id: 'all_users', label: '👥 All Users', targetInfo: 'Broadcasts to topic "all_user" (All App Users)' },
  { id: 'all_businesses', label: '🏢 All Businesses', targetInfo: 'Multicasts to All Registered Businesses' },
  { id: 'specific_token', label: '🎯 Specific Device Token', targetInfo: 'Sends to a specific FCM device token' },
];

function LivePhonePreview({ title, body, imageUrl }) {
  return (
    <div className="flex flex-col items-center">
      <p className="text-sm font-semibold text-slate-700 mb-4">Live Device Preview</p>
      <div className="w-64 h-[420px] border-[6px] border-slate-800 rounded-[36px] bg-slate-900 shadow-2xl flex flex-col overflow-hidden relative">
        {/* Notch */}
        <div className="h-6 bg-slate-800 flex items-center justify-center">
          <div className="w-20 h-3 bg-slate-900 rounded-full" />
        </div>
        {/* Wallpaper area */}
        <div className="flex-1 bg-gradient-to-b from-indigo-900/40 via-purple-900/30 to-slate-900 p-3 flex flex-col justify-start pt-6 space-y-3 relative">
          <div className="text-center text-white/60 text-[11px] mb-2 font-medium">
            Lock Screen
          </div>
          {/* Notification Banner */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-3.5 border border-white/20 transition-all transform hover:scale-[1.02]">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-sm">
                <Bell size={11} />
              </div>
              <span className="text-[11px] font-bold text-slate-800 tracking-tight">Lokonomy</span>
              <span className="text-[10px] text-slate-400 ml-auto">Now</span>
            </div>
            <p className="text-xs font-bold text-slate-900 leading-tight">
              {title.trim() || 'Notification Title'}
            </p>
            <p className="text-[11px] text-slate-600 mt-1 leading-snug break-words">
              {body.trim() || 'Write your notification message to see a live preview here...'}
            </p>
            {imageUrl && (
              <div className="mt-2 rounded-lg overflow-hidden h-28 border border-slate-100 bg-slate-50">
                <img src={imageUrl} alt="Notification media" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Notifications() {
  const [activeTab, setActiveTab] = useState('all_users');
  const [notificationType, setNotificationType] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targetId, setTargetId] = useState('');
  const [deviceToken, setDeviceToken] = useState('');
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);

  // Image Upload states
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const fileInputRef = useRef(null);

  const fetchHistory = async () => {
    const token = localStorage.getItem('lokonomy_admin_token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/global/notifications`, {
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-user-type': 'admin'
        }
      });
      const resJson = await response.json();
      if (resJson.status) {
        setHistory(resJson.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch notifications history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
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
        toast.success('Notification image uploaded!');
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

  const handleSendNotification = async (e) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter notification title');
      return;
    }
    if (!body.trim()) {
      toast.error('Please enter notification message');
      return;
    }
    if (activeTab === 'specific_token' && !deviceToken.trim()) {
      toast.error('Please enter recipient Device Token');
      return;
    }

    setSending(true);
    const token = localStorage.getItem('lokonomy_admin_token');

    const dataPayload = {};
    if (notificationType) {
      dataPayload.type = notificationType;
    }
    if (targetId.trim()) {
      dataPayload.id = targetId.trim();
    }

    const payload = {
      title: title.trim(),
      body: body.trim(),
      image: uploadedImageUrl || null,
      data: dataPayload
    };

    if (activeTab === 'all_users') {
      payload.topic = 'all_user';
    } else if (activeTab === 'all_businesses') {
      payload.all_registered_businesses = true;
    } else if (activeTab === 'specific_token') {
      payload.token = deviceToken.trim();
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/global/send-notification`, {
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
        toast.success('Notification sent successfully! 🚀');
        setTitle('');
        setBody('');
        setTargetId('');
        setDeviceToken('');
        setNotificationType('');
        handleRemoveImage();
        fetchHistory();
      } else {
        const errMsg = typeof resJson.error === 'object' ? (resJson.error.message || JSON.stringify(resJson.error)) : resJson.error;
        toast.error(errMsg || 'Failed to send notification');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error sending notification');
    } finally {
      setSending(false);
    }
  };

  const activeTabObj = tabs.find(t => t.id === activeTab);

  // Compute stats
  const totalSent = history.length;
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thisWeekCount = history.filter(h => new Date(h.created_at) >= weekAgo).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Notification Center</h1>
        <p className="text-slate-500 text-sm mt-0.5">Send push notifications to app users and businesses</p>
      </div>

      {/* Stats Bar - High Aesthetic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Total Recorded Notifications */}
        <div className="bg-gradient-to-br from-orange-900/5 via-white to-orange-50/40 border border-orange-100/80 rounded-2xl p-5 shadow-xs hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-orange-500/10 rounded-full blur-xl group-hover:bg-orange-500/20 transition-all" />
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-100">
                  Total Sent
                </span>
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                {totalSent ? totalSent.toLocaleString() : '0'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Push notification history logs
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-600 to-yellow-600 text-white shadow-lg shadow-orange-500/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <BellRing size={22} />
            </div>
          </div>
        </div>

        {/* Card 2: Sent This Week */}
        <div className="bg-gradient-to-br from-emerald-900/5 via-white to-emerald-50/40 border border-emerald-100/80 rounded-2xl p-5 shadow-xs hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all" />
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                  Past 7 Days
                </span>
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                {thisWeekCount ? thisWeekCount.toLocaleString() : '0'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Recent broadcast activity
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <Calendar size={22} />
            </div>
          </div>
        </div>

        {/* Card 3: FCM Gateway Status */}
        <div className="bg-gradient-to-br from-purple-900/5 via-white to-purple-50/40 border border-purple-100/80 rounded-2xl p-5 shadow-xs hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-500/20 transition-all" />
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
                  FCM Gateway
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="flex items-center gap-2">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                  Active
                </h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Online
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Firebase Cloud Messaging ready
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <Radio size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Audience Tabs */}
      <div className="card px-5 pt-4 pb-0">
        <div className="flex gap-1 border-b border-slate-100">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-t-lg transition-all -mb-px ${activeTab === tab.id
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Form & Live Preview */}
      <div className="card p-6">
        <div className="grid grid-cols-5 gap-8">
          <div className="col-span-3 space-y-4">
            <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-700 font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              <span>Target: {activeTabObj?.targetInfo}</span>
            </div>

            {activeTab === 'specific_token' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Device Token *</label>
                <input
                  type="text"
                  value={deviceToken}
                  onChange={e => setDeviceToken(e.target.value)}
                  placeholder="Paste recipient FCM device token..."
                  className="input-field font-mono text-xs"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Title *</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Enter notification title..."
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Message *</label>
              <textarea
                rows={4}
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Write notification message body..."
                className="input-field resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Notification Image (Optional)</label>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
              />
              {imagePreview ? (
                <div className="relative border border-slate-200 rounded-xl overflow-hidden group h-32 flex items-center justify-center bg-slate-50">
                  <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                  {uploadingImage ? (
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white z-10">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mb-1" />
                      <span className="text-xs">Uploading...</span>
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-10">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="py-1 px-2.5 rounded-lg bg-white text-slate-800 text-xs font-semibold hover:bg-slate-100 transition-all"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="py-1 px-2.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-all"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-colors cursor-pointer"
                >
                  <Upload size={22} className="text-slate-300 mx-auto mb-1.5" />
                  <p className="text-xs text-slate-500 font-medium">Click to upload image media</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, WebP up to 5MB</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Notification Type (Optional)</label>
              <select
                value={notificationType}
                onChange={e => setNotificationType(e.target.value)}
                className="input-field cursor-pointer font-medium text-slate-800"
              >
                <option value="">Select Type</option>
                <option value="feed">feed</option>
                <option value="business">business</option>
                <option value="story">story</option>
                <option value="market-sell">market-sell</option>
                <option value="market-demand">market-demand</option>
                <option value="job-opening">job-opening</option>
                <option value="resume">resume</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Target ID (Optional)</label>
              <input
                type="text"
                value={targetId}
                onChange={e => setTargetId(e.target.value)}
                placeholder="Enter target ID (e.g. dafkbu21gi321328)..."
                className="input-field font-mono text-xs"
              />
            </div>

            <button
              type="button"
              disabled={sending}
              onClick={handleSendNotification}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Sending Notification...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Send Notification</span>
                </>
              )}
            </button>
          </div>

          <div className="col-span-2 flex items-center justify-center border-l border-slate-100 pl-8">
            <LivePhonePreview title={title} body={body} imageUrl={imagePreview || uploadedImageUrl} />
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">Recent Notifications</h3>
        </div>
        {loadingHistory ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            <div className="w-6 h-6 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mx-auto mb-2" />
            Loading history...
          </div>
        ) : history.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No notifications sent yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Title & Body</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Target Audience</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {history.map((row) => {
                  const dateStr = row.created_at ? new Date(row.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A';
                  const targetLabel = row.target_group === 'registered_businesses'
                    ? 'Registered Businesses'
                    : row.target_group === 'all'
                      ? 'All Users (all_user)'
                      : row.user_id ? `User #${row.user_id}` : 'Broadcast';

                  const typeLabel = (typeof row.data === 'object' && row.data?.type) ? row.data.type : (row.type || 'feed');

                  return (
                    <tr key={row.id || row.created_at} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5 whitespace-nowrap text-slate-500">{dateStr}</td>
                      <td className="px-5 py-3.5 max-w-xs">
                        <p className="font-bold text-slate-800 truncate">{row.title}</p>
                        <p className="text-slate-500 truncate mt-0.5">{row.body}</p>
                      </td>
                      <td className="px-5 py-3.5 font-medium">
                        <span className="px-2 py-0.5 rounded-md font-mono text-[11px] bg-slate-100 text-slate-700 border border-slate-200">
                          {typeLabel}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-600">{targetLabel}</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${row.is_sent !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                          }`}>
                          {row.is_sent !== false ? 'Sent' : 'Failed'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
