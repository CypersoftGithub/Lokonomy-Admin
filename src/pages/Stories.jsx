import React, { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, Eye, Calendar, Upload, ChevronRight, ChevronLeft } from 'lucide-react';
import { StatusBadge } from '../components/common/Badge';
import { stories } from '../data/dummyData';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config';

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
  const [cities, setCities] = useState(['All Cities', 'Mumbai', 'Pune', 'Nashik', 'Aurangabad']);
  const [storiesList, setStoriesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Image upload states
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const fileInputRef = useRef(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

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
      if (resJson.status) {
        const url = resJson.data[0].file_url;
        setUploadedImageUrl(url);
        toast.success('Image uploaded successfully!');
      } else {
        const errMsg = typeof resJson.error === 'object' ? (resJson.error.message || JSON.stringify(resJson.error)) : resJson.error;
        toast.error(errMsg || 'Failed to upload image');
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

  // Form states
  const [editingStoryId, setEditingStoryId] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCities, setSelectedCities] = useState([]);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [actionLink, setActionLink] = useState('');
  const [startTime, setStartTime] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef(null);

  const toggleCity = (cityName) => {
    if (selectedCities.includes(cityName)) {
      setSelectedCities(selectedCities.filter(c => c !== cityName));
    } else {
      setSelectedCities([...selectedCities, cityName]);
    }
  };

  const removeCity = (cityName, e) => {
    if (e) e.stopPropagation();
    setSelectedCities(selectedCities.filter(c => c !== cityName));
  };

  const fetchStories = async () => {
    const token = localStorage.getItem('lokonomy_admin_token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/news`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-user-type': 'admin'
        }
      });
      const resJson = await response.json();
      if (resJson.status) {
        const mapped = resJson.data.map(item => {
          const now = new Date();
          const created = new Date(item.created_time);
          const expired = new Date(item.expire_time);

          const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const createdDate = new Date(created.getFullYear(), created.getMonth(), created.getDate());
          const expiredDate = new Date(expired.getFullYear(), expired.getMonth(), expired.getDate());

          let status = 'Active';
          if (expiredDate < nowDate) {
            status = 'Expired';
          } else if (createdDate > nowDate) {
            status = 'Scheduled';
          }

          const formatDate = (dateStr) => {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
          };

          return {
            id: item.daily_news_id,
            title: item.daily_news_headlines,
            content: item.daily_news_description,
            type: 'News',
            city: item.city || 'All Cities',
            posted: formatDate(item.created_time),
            expiry: formatDate(item.expire_time),
            views: item.total_likes || 0,
            status: status,
            image: item.daily_news_image_url || (item.news_image && item.news_image[0] ? item.news_image[0].daily_news_image_url : null),
            rawItem: item
          };
        });
        setStoriesList(mapped);
      } else {
        const errMsg = typeof resJson.error === 'object' ? (resJson.error.message || JSON.stringify(resJson.error)) : resJson.error;
        toast.error(errMsg || 'Failed to fetch stories');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error fetching stories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/global/getCities`);
        const resJson = await response.json();
        if (resJson.status) {
          setCities(['All Cities', ...resJson.data]);
        }
      } catch (err) {
        console.error('Failed to fetch cities:', err);
      }
    };

    fetchCities();
    fetchStories();
  }, []);

  const handleEditClick = (story) => {
    setEditingStoryId(story.id);
    setTitle(story.title || '');
    setContent(story.content || '');
    setActionLink(story.rawItem?.daily_news_url || '');
    setUploadedImageUrl(story.image || '');
    setImagePreview(story.image || null);

    if (story.rawItem?.city && story.rawItem.city !== 'All Cities') {
      const cityList = story.rawItem.city.split(' ').filter(c => c.trim().length > 0);
      setSelectedCities(cityList);
    } else {
      setSelectedCities([]);
    }

    if (story.rawItem?.created_time) {
      const dt = new Date(story.rawItem.created_time);
      const year = dt.getFullYear();
      const month = String(dt.getMonth() + 1).padStart(2, '0');
      const day = String(dt.getDate()).padStart(2, '0');
      const hours = String(dt.getHours()).padStart(2, '0');
      const mins = String(dt.getMinutes()).padStart(2, '0');
      setStartTime(`${year}-${month}-${day}T${hours}:${mins}`);
      setSchedule('later');
    } else {
      setSchedule('now');
      setStartTime('');
    }

    if (story.rawItem?.expire_time) {
      const dt = new Date(story.rawItem.expire_time);
      const year = dt.getFullYear();
      const month = String(dt.getMonth() + 1).padStart(2, '0');
      const day = String(dt.getDate()).padStart(2, '0');
      setExpiryDate(`${year}-${month}-${day}`);
    } else {
      setExpiryDate('');
    }

    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCancelEdit = () => {
    setEditingStoryId(null);
    setTitle('');
    setContent('');
    setSelectedCities([]);
    setCityDropdownOpen(false);
    setActionLink('');
    setStartTime('');
    setExpiryDate('');
    setSchedule('now');
    handleRemoveImage();
  };

  const [deleteModalStory, setDeleteModalStory] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteClick = (story) => {
    setDeleteModalStory(story);
  };

  const confirmDelete = async () => {
    if (!deleteModalStory) return;
    const storyId = deleteModalStory.id;

    setDeleting(true);
    const token = localStorage.getItem('lokonomy_admin_token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/news/delete?news_id=${storyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-user-type': 'admin'
        }
      });
      const resJson = await response.json();
      if (resJson.status) {
        toast.success('Story deleted successfully!');
        if (editingStoryId === storyId) {
          handleCancelEdit();
        }
        setDeleteModalStory(null);
        fetchStories();
      } else {
        const errMsg = typeof resJson.error === 'object' ? (resJson.error.message || JSON.stringify(resJson.error)) : resJson.error;
        toast.error(errMsg || 'Failed to delete story');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error deleting story');
    } finally {
      setDeleting(false);
    }
  };

  const handlePublishStory = async () => {
    if (!title.trim()) {
      toast.error('Please enter story title');
      return;
    }
    if (!content.trim()) {
      toast.error('Please enter story content');
      return;
    }

    setSubmitting(true);
    const token = localStorage.getItem('lokonomy_admin_token');

    let created_time = undefined;
    if (schedule === 'later' && startTime) {
      created_time = new Date(startTime).toISOString();
    }

    let expire_time = undefined;
    if (expiryDate) {
      expire_time = new Date(`${expiryDate}T23:59:59.999Z`).toISOString();
    }

    const cityPayload = selectedCities.length > 0 ? selectedCities.join(' ') : null;

    const payload = {
      daily_news_headlines: title.trim(),
      daily_news_description: content.trim(),
      daily_news_url: actionLink.trim() || "",
      daily_news_image_url: uploadedImageUrl || "",
      city: cityPayload,
    };

    if (created_time) payload.created_time = created_time;
    if (expire_time) payload.expire_time = expire_time;

    const isEdit = !!editingStoryId;
    if (isEdit) {
      payload.daily_news_id = editingStoryId;
    }

    const endpoint = isEdit ? `${API_BASE_URL}/api/news/update` : `${API_BASE_URL}/api/news/add`;
    const httpMethod = isEdit ? 'PUT' : 'POST';

    try {
      const response = await fetch(endpoint, {
        method: httpMethod,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-user-type': 'admin'
        },
        body: JSON.stringify(payload)
      });
      const resJson = await response.json();
      if (resJson.status) {
        toast.success(isEdit ? 'Story updated successfully!' : 'Story published successfully!');
        handleCancelEdit();
        fetchStories();
      } else {
        const errMsg = typeof resJson.error === 'object' ? (resJson.error.message || JSON.stringify(resJson.error)) : resJson.error;
        toast.error(errMsg || (isEdit ? 'Failed to update story' : 'Failed to publish story'));
      }
    } catch (err) {
      console.error(err);
      toast.error(isEdit ? 'Error updating story' : 'Error publishing story');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = storiesList.filter(s =>
    activeTab === 'All' ? true : s.status === activeTab
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStories = filtered.slice(startIndex, endIndex);

  const getPaginationGroup = () => {
    const list = [];
    list.push(1);

    if (currentPage > 3) {
      list.push('...');
    }

    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (!list.includes(i)) {
        list.push(i);
      }
    }

    if (currentPage < totalPages - 2) {
      list.push('...');
    }

    if (totalPages > 1 && !list.includes(totalPages)) {
      list.push(totalPages);
    }

    return list;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Stories & News</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage stories, news and announcements</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="card px-5 pt-4 pb-0">
        <div className="flex gap-1 border-b border-slate-100">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all -mb-px ${activeTab === tab ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              {tab === 'Active' && '✅'}{tab === 'Scheduled' && '⏰'}{tab === 'Expired' && '❌'} {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Stories grid */}
      {loading ? (
        <div className="min-h-[200px] flex items-center justify-center bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
          <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-8 text-center text-slate-500 text-sm">
          No stories found for the selected tab.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 w-full">
          {paginatedStories.map((story, i) => (
            <div key={story.id} className="card overflow-hidden hover:shadow-md transition-all duration-200 group w-full bg-white flex flex-col justify-between">
              <div>
                <div className="h-32 w-full relative flex items-center justify-center overflow-hidden bg-slate-50 flex-shrink-0">
                  {story.image ? (
                    <img src={story.image} alt={story.title} className="w-full h-full object-cover absolute inset-0" />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${storyColors[i % storyColors.length]} absolute inset-0`} />
                  )}
                  <span className="text-white text-opacity-30 text-5xl relative z-10">📰</span>
                  <div className="absolute top-3 left-3 z-10">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-black/30 text-white backdrop-blur-sm">
                      {story.type}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 z-10">
                    <StatusBadge status={story.status} />
                  </div>
                </div>
                <div className="p-4 pb-2">
                  <h4 className="font-bold text-slate-800 mb-2 line-clamp-1" title={story.title}>{story.title}</h4>
                  <div className="space-y-1 mb-3">
                    <p className="text-xs text-slate-500 flex items-center gap-1 truncate">
                      📍 {story.city}
                    </p>
                    <p className="text-xs text-slate-500">Posted: {story.posted}</p>
                    <p className={`text-xs ${story.expiry ? 'text-amber-600' : 'text-slate-400'}`}>
                      {story.expiry ? `Expires ${story.expiry}` : 'No Expiry'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-4 pb-4 pt-0">
                <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Eye size={11} /> {story.views.toLocaleString()} likes
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditClick(story)}
                      title="Edit story"
                      className="w-7 h-7 rounded-lg hover:bg-amber-100 flex items-center justify-center text-slate-400 hover:text-amber-600 transition-colors"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(story)}
                      title="Delete story"
                      className="w-7 h-7 rounded-lg hover:bg-red-100 flex items-center justify-center text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-6 py-4 border border-slate-100 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">
              Showing <span className="font-semibold text-slate-700">{startIndex + 1}</span> to{' '}
              <span className="font-semibold text-slate-700">
                {Math.min(endIndex, filtered.length)}
              </span>{' '}
              of <span className="font-semibold text-slate-700">{filtered.length.toLocaleString()}</span> results
            </span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-slate-200 rounded-lg px-2.5 py-1 text-sm bg-white text-slate-700 outline-none focus:border-indigo-500 transition-colors cursor-pointer"
            >
              <option value={8}>8</option>
              <option value={12}>12</option>
              <option value={16}>16</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
            </select>
          </div>

          <div className="flex gap-1.5 items-center">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="w-10 h-10 rounded-xl border border-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            {getPaginationGroup().map((pageNum, idx) => {
              if (pageNum === '...') {
                return (
                  <span key={`dots-${idx}`} className="w-10 h-10 flex items-center justify-center text-slate-400 text-sm">
                    ...
                  </span>
                );
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${currentPage === pageNum
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'border border-slate-100 text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="w-10 h-10 rounded-xl border border-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Create / Edit Story Form */}
      <div ref={formRef} className="card p-6">
        <h3 className="font-bold text-slate-800 text-lg mb-5 pb-3 border-b border-slate-100">
          {editingStoryId ? 'Edit Story' : 'Create New Story'}
        </h3>
        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Story Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter story title"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Content *</label>
              <textarea
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter story content..."
                className="input-field resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Target Cities</label>
                <div
                  onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                  className="input-field min-h-[42px] h-auto flex flex-wrap items-center gap-1.5 cursor-pointer py-1.5 pr-8 relative"
                >
                  {selectedCities.length === 0 ? (
                    <span className="text-gray-400 text-sm">All Cities (Default)</span>
                  ) : (
                    selectedCities.map(c => (
                      <span
                        key={c}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100"
                      >
                        {c}
                        <button
                          type="button"
                          onClick={(e) => removeCity(c, e)}
                          className="hover:text-indigo-950 font-bold ml-0.5"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">
                    ▼
                  </span>
                </div>

                {cityDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setCityDropdownOpen(false)}
                    />
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-20 max-h-56 overflow-y-auto p-2 space-y-1">
                      <label
                        className="flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer text-xs font-semibold text-slate-600 border-b border-slate-100"
                        onClick={() => setSelectedCities([])}
                      >
                        <input
                          type="checkbox"
                          checked={selectedCities.length === 0}
                          onChange={() => setSelectedCities([])}
                          className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <span>All Cities (Default)</span>
                      </label>
                      {cities.filter(c => c !== 'All Cities').map(cityName => {
                        const isSelected = selectedCities.includes(cityName);
                        return (
                          <label
                            key={cityName}
                            className={`flex items-center gap-2.5 px-3 py-1.5 hover:bg-indigo-50/50 rounded-lg cursor-pointer text-sm font-medium transition-colors ${isSelected ? 'text-indigo-700 bg-indigo-50/30' : 'text-slate-700'
                              }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleCity(cityName)}
                              className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                            <span>{cityName}</span>
                          </label>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Action Link</label>
                <input
                  type="url"
                  value={actionLink}
                  onChange={(e) => setActionLink(e.target.value)}
                  placeholder="https://..."
                  className="input-field"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Story Image</label>
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
                        className="py-1.5 px-3 rounded-lg bg-white text-slate-800 text-xs font-semibold hover:bg-slate-100 transition-all"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="py-1.5 px-3 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-all"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-colors cursor-pointer"
                >
                  <Upload size={28} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Click to upload or drag & drop</p>
                  <p className="text-xs text-slate-400 mt-1">PNG, JPG, GIF up to 5MB</p>
                </div>
              )}
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
                <>
                  <label className="block text-sm font-medium text-slate-700 mt-4">Start Time</label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="input-field mt-2"
                  />
                </>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Expiry</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="flex gap-3 pt-2">
              {editingStoryId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                disabled={submitting}
                onClick={handlePublishStory}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{editingStoryId ? 'Updating...' : 'Publishing...'}</span>
                  </>
                ) : (
                  editingStoryId ? 'Update Story' : 'Publish Story'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 transform transition-all scale-100">
            <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 border border-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={26} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 text-center mb-2">Delete Story</h3>
            <p className="text-sm text-slate-500 text-center mb-6 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-slate-800">"{deleteModalStory.title}"</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteModalStory(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-lg shadow-red-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  'Yes, Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
