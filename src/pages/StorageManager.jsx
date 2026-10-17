import React, { useState, useEffect } from 'react';
import {
  HardDrive,
  RefreshCw,
  Search,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Grid,
  List as ListIcon,
  ImageIcon,
  FileText,
  AlertTriangle,
  X,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
  Folder,
  FolderOpen,
  Upload,
  FolderPlus,
  Cloud,
  Layers,
  Database
} from 'lucide-react';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config';

export default function StorageManager() {
  const [filesList, setFilesList] = useState([]);
  const [foldersList, setFoldersList] = useState([]);
  const [subfoldersList, setSubfoldersList] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalAllFiles, setTotalAllFiles] = useState(0);
  const [totalSizeBytes, setTotalSizeBytes] = useState(0);
  const [imageCount, setImageCount] = useState(0);
  const [docCount, setDocCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Folder & Prefix Navigation
  const [currentFolder, setCurrentFolder] = useState('all'); // 'all', 'Banner', 'Stories', '[root]', etc.
  const [currentPrefix, setCurrentPrefix] = useState(''); // e.g. 'Banner/2026/'

  // Search & Filters
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'images', 'documents'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [copiedKey, setCopiedKey] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(24);

  // Modals
  const [previewFile, setPreviewFile] = useState(null);
  const [deleteModalFile, setDeleteModalFile] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Upload Modal
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [uploadTargetFolder, setUploadTargetFolder] = useState('Stories');
  const [uploading, setUploading] = useState(false);

  const fetchStorageFiles = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    const token = localStorage.getItem('lokonomy_admin_token');
    const queryParams = new URLSearchParams({
      page: currentPage,
      limit: itemsPerPage,
      search: search.trim(),
      type: filterType,
      folder: currentFolder,
      order: 'desc',
      ...(currentPrefix ? { prefix: currentPrefix } : {}),
      ...(isManualRefresh ? { refresh: 'true' } : {})
    });

    try {
      const response = await fetch(`${API_BASE_URL}/api/storage/all?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'accept': '*/*',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'x-user-type': 'admin'
        }
      });
      const resJson = await response.json();
      if (resJson.status) {
        // Ensure descending order (newest first by timestamp, then key)
        const sortedFiles = (resJson.data || []).slice().sort((a, b) => {
          const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
          const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
          if (timeB !== timeA) return timeB - timeA;
          return (b.file_key || '').localeCompare(a.file_key || '');
        });
        setFilesList(sortedFiles);
        setTotalItems(resJson.total !== undefined ? resJson.total : (resJson.data || []).length);
        setTotalAllFiles(resJson.totalAll || resJson.total || 0);
        if (resJson.totalSizeBytes !== undefined) setTotalSizeBytes(resJson.totalSizeBytes);
        if (resJson.imageCount !== undefined) setImageCount(resJson.imageCount);
        if (resJson.docCount !== undefined) setDocCount(resJson.docCount);
        if (resJson.folders) setFoldersList(resJson.folders);
        if (resJson.subfolders) setSubfoldersList(resJson.subfolders);
      } else {
        const errMsg = typeof resJson.error === 'object' ? (resJson.error.message || JSON.stringify(resJson.error)) : resJson.error;
        toast.error(errMsg || 'Failed to fetch storage files');
      }
    } catch (err) {
      console.error('Error fetching storage files:', err);
      toast.error('Error fetching S3 bucket files');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Re-fetch when folder, prefix, page, limit, or filterType changes
  useEffect(() => {
    fetchStorageFiles();
  }, [currentFolder, currentPrefix, currentPage, itemsPerPage, filterType]);

  // Handle Search debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchStorageFiles();
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [search]);

  // Update target upload folder when active folder changes
  useEffect(() => {
    if (currentFolder && currentFolder !== 'all' && currentFolder !== '[root]') {
      setUploadTargetFolder(currentFolder);
    }
  }, [currentFolder]);

  const formatFileSize = (bytes) => {
    if (!bytes || isNaN(bytes)) return '0 B';
    const num = Number(bytes);
    if (num < 1024) return `${num} B`;
    if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
    return `${(num / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleCopyUrl = (url, key) => {
    navigator.clipboard.writeText(url);
    setCopiedKey(key);
    toast.success('S3 URL copied to clipboard! 📋');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // S3-First Deletion handler
  const handleDeleteFile = async () => {
    if (!deleteModalFile) return;
    setDeleting(true);
    const token = localStorage.getItem('lokonomy_admin_token');

    const params = new URLSearchParams();
    if (deleteModalFile.file_key) {
      params.append('file_key', deleteModalFile.file_key);
    }
    if (deleteModalFile.s3_storage_id) {
      params.append('file_id', deleteModalFile.s3_storage_id);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/storage/delete-admin?${params.toString()}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-user-type': 'admin'
        }
      });
      const resJson = await response.json();
      if (resJson.status) {
        if (resJson.warning) {
          toast(resJson.warning, { icon: '⚠️' });
        } else {
          toast.success('File permanently deleted from S3! 🗑️');
        }
        setDeleteModalFile(null);
        if (previewFile?.file_key === deleteModalFile.file_key) {
          setPreviewFile(null);
        }
        fetchStorageFiles(true);
      } else {
        const errMsg = typeof resJson.error === 'object' ? (resJson.error.message || JSON.stringify(resJson.error)) : resJson.error;
        toast.error(errMsg || 'Failed to delete file from S3');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error deleting file');
    } finally {
      setDeleting(false);
    }
  };

  // Handle direct file upload to S3 folder
  const handleUploadFiles = async (e) => {
    e.preventDefault();
    if (!uploadFiles || uploadFiles.length === 0) {
      toast.error('Please select at least one file to upload');
      return;
    }
    setUploading(true);
    const token = localStorage.getItem('lokonomy_admin_token');

    const targetFolder = uploadTargetFolder || 'assets';
    const formData = new FormData();
    for (let i = 0; i < uploadFiles.length; i++) {
      formData.append('file', uploadFiles[i]);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/storage/upload?folder=${encodeURIComponent(targetFolder)}`, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'x-user-type': 'admin'
        },
        body: formData
      });
      const resJson = await response.json();
      if (resJson.status) {
        toast.success(`Successfully uploaded to S3 /${targetFolder}! 🚀`);
        setUploadModalOpen(false);
        setUploadFiles([]);
        fetchStorageFiles(true);
      } else {
        const errMsg = typeof resJson.error === 'object' ? (resJson.error.message || JSON.stringify(resJson.error)) : resJson.error;
        toast.error(errMsg || 'Upload to S3 failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error uploading file to S3');
    } finally {
      setUploading(false);
    }
  };

  // Folder navigation helpers
  const handleSelectFolder = (folderName) => {
    setCurrentFolder(folderName);
    setCurrentPrefix('');
    setCurrentPage(1);
  };

  const handleSelectSubfolder = (prefix) => {
    setCurrentPrefix(prefix);
    setCurrentPage(1);
  };

  const handleNavigateUp = () => {
    if (currentPrefix) {
      const trimmed = currentPrefix.replace(/\/+$/, '');
      const parts = trimmed.split('/');
      parts.pop();
      if (parts.length > 0) {
        setCurrentPrefix(parts.join('/') + '/');
      } else {
        setCurrentPrefix('');
      }
      setCurrentPage(1);
    } else if (currentFolder !== 'all') {
      setCurrentFolder('all');
      setCurrentPage(1);
    }
  };

  // Breadcrumbs generator
  const getBreadcrumbs = () => {
    const crumbs = [
      { label: 'Bucket Root', isRoot: true, onClick: () => { setCurrentFolder('all'); setCurrentPrefix(''); setCurrentPage(1); } }
    ];

    if (currentFolder === 'all') {
      crumbs.push({ label: 'All Files', active: true });
    } else if (currentFolder === '[root]') {
      crumbs.push({ label: 'Root Files (No Folder)', active: true });
    } else {
      crumbs.push({
        label: currentFolder,
        active: !currentPrefix,
        onClick: () => { setCurrentPrefix(''); setCurrentPage(1); }
      });

      if (currentPrefix) {
        const relative = currentPrefix.startsWith(currentFolder + '/')
          ? currentPrefix.slice((currentFolder + '/').length)
          : currentPrefix;
        const subParts = relative.replace(/\/+$/, '').split('/').filter(Boolean);
        let accumulated = currentFolder + '/';
        subParts.forEach((part, idx) => {
          accumulated += part + '/';
          const isLast = idx === subParts.length - 1;
          const targetPrefix = accumulated;
          crumbs.push({
            label: part,
            active: isLast,
            onClick: isLast ? null : () => { setCurrentPrefix(targetPrefix); setCurrentPage(1); }
          });
        });
      }
    }
    return crumbs;
  };

  // Pagination calculation
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2.5">
            <HardDrive className="text-orange-600" size={26} />
            <span>S3 Storage & Media Manager</span>
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Direct Amazon S3 bucket integration with real-time folder hierarchy, metadata synchronization, and file management
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setUploadModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2"
          >
            <Upload size={15} />
            <span>Upload to S3</span>
          </button>
          <button
            onClick={() => fetchStorageFiles(true)}
            disabled={refreshing || loading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2 text-xs font-semibold disabled:opacity-50"
            title="Force Refresh S3 Bucket"
          >
            <RefreshCw size={15} className={refreshing || loading ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Scanning S3...' : 'Refresh S3'}</span>
          </button>
        </div>
      </div>

      {/* Stats Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Total S3 Files */}
        <div className="bg-gradient-to-br from-indigo-900/5 via-white to-indigo-50/40 border border-indigo-100/80 rounded-2xl p-5 shadow-xs hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-all" />
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                  Total S3 Files
                </span>
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                {totalAllFiles ? totalAllFiles.toLocaleString() : '0'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Live objects fetched directly from S3 bucket
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <HardDrive size={22} />
            </div>
          </div>
        </div>

        {/* Card 2: Bucket Storage Used */}
        <div className="bg-gradient-to-br from-rose-900/5 via-white to-rose-50/40 border border-rose-100/80 rounded-2xl p-5 shadow-xs hover:shadow-xl hover:shadow-rose-500/10 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-rose-500/10 rounded-full blur-xl group-hover:bg-rose-500/20 transition-all" />
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100">
                  Bucket Storage Used
                </span>
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                {formatFileSize(totalSizeBytes)}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Cumulative size across all AWS bucket objects
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-red-600 text-white shadow-lg shadow-rose-500/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <Download size={22} />
            </div>
          </div>
        </div>

        {/* Card 3: Media Breakdown */}
        <div className="bg-gradient-to-br from-emerald-900/5 via-white to-emerald-50/40 border border-emerald-100/80 rounded-2xl p-5 shadow-xs hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all" />
          <div className="flex items-start justify-between">
            <div className="space-y-1.5 flex-1 pr-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                  Media Breakdown
                </span>
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                {imageCount ? imageCount.toLocaleString() : '0'} <span className="text-lg font-bold text-slate-500">Images</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                <strong className="text-slate-700">{docCount ? docCount.toLocaleString() : '0'}</strong> Documents / PDFs
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <ImageIcon size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* S3 Bucket Folder Explorer Section */}
      <div className="card p-5 space-y-4 border border-slate-200">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
              <Folder size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">S3 Bucket Folders</h2>
              <p className="text-[11px] text-slate-400">Select a folder to view and manage its contents directly from S3</p>
            </div>
          </div>

          {/* Current Location Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl flex-wrap">
            {getBreadcrumbs().map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-slate-300 font-bold">/</span>}
                {crumb.active ? (
                  <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {crumb.label}
                  </span>
                ) : (
                  <button
                    onClick={crumb.onClick}
                    className="hover:text-indigo-600 hover:underline font-medium transition-colors"
                  >
                    {crumb.label}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Top-Level Folder Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {/* All Files Tab */}
          <button
            onClick={() => handleSelectFolder('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${currentFolder === 'all'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/30'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
          >
            <Layers size={14} />
            <span>All Folders</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${currentFolder === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
              {totalAllFiles.toLocaleString()}
            </span>
          </button>

          {/* Dynamically Discovered S3 Folders */}
          {foldersList.map((f) => {
            const isSelected = currentFolder === f.name;
            return (
              <button
                key={f.name}
                onClick={() => handleSelectFolder(f.name)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/30'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
              >
                {isSelected ? <FolderOpen size={14} /> : <Folder size={14} />}
                <span>{f.name === '[root]' ? 'Root Files' : f.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {f.count.toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Control Toolbar */}
      <div className="card p-4 flex flex-wrap items-center justify-between gap-4 border border-slate-200">
        {/* Left Filter Tabs & Sort Indicator */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => { setFilterType('all'); setCurrentPage(1); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'all'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              All Files
            </button>
            <button
              onClick={() => { setFilterType('images'); setCurrentPage(1); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'images'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Images
            </button>
            <button
              onClick={() => { setFilterType('documents'); setCurrentPage(1); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'documents'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Docs / PDFs
            </button>
          </div>

          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100/80 text-[11px] font-bold text-indigo-700" title="Files sorted by upload date: newest first">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <span>Newest First</span>
          </div>
        </div>

        {/* Right Search, Items-per-page & Layout Buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="relative flex-1 sm:w-60 min-w-[170px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search in ${currentFolder === 'all' ? 'entire bucket' : currentFolder}...`}
              className="input-field pl-9 py-1.5 text-xs w-full"
            />
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <select
              value={itemsPerPage}
              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-2.5 py-1.5 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              title="Items per page"
            >
              <option value={12}>12 / page</option>
              <option value={24}>24 / page</option>
              <option value={48}>48 / page</option>
              <option value={96}>96 / page</option>
            </select>

            <div className="flex items-center border border-slate-200 rounded-xl p-1 bg-slate-50">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-400 hover:text-slate-600'
                  }`}
                title="Grid View"
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-400 hover:text-slate-600'
                  }`}
                title="Table View"
              >
                <ListIcon size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content View */}
      {loading ? (
        <div className="card p-16 text-center text-slate-400 text-sm border border-slate-200">
          <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
          Fetching live files from S3 bucket...
        </div>
      ) : filesList.length === 0 ? (
        <div className="card p-16 text-center text-slate-400 text-sm border border-slate-200 space-y-2">
          <HardDrive size={36} className="mx-auto text-slate-300" />
          <p className="font-semibold text-slate-600">No objects found</p>
          <p className="text-xs text-slate-400">
            {search ? 'No files match your search query.' : `No files stored in folder "${currentFolder}".`}
          </p>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="mt-2 px-3.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 font-semibold text-xs hover:bg-indigo-100 transition-colors inline-flex items-center gap-1.5"
          >
            <Upload size={14} />
            <span>Upload file to this folder</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 w-full">
          {filesList.map((file) => {
            const isImg = file.file_type?.toLowerCase().includes('png') ||
              file.file_type?.toLowerCase().includes('jpg') ||
              file.file_type?.toLowerCase().includes('jpeg') ||
              file.file_type?.toLowerCase().includes('webp') ||
              file.file_type?.toLowerCase().includes('gif') ||
              file.file_url?.match(/\.(jpeg|jpg|gif|png|webp|svg)/i);

            const fileFolder = file.folder || file.file_key?.split('/')?.[0] || 'root';

            return (
              <div key={file.file_key} className="card overflow-hidden group hover:shadow-md transition-all flex flex-col justify-between border border-slate-200 bg-white min-w-0">
                {/* Thumbnail Header */}
                <div className="relative h-40 bg-slate-100 flex items-center justify-center overflow-hidden border-b border-slate-100">
                  {isImg && file.file_url ? (
                    <img
                      src={file.file_url}
                      alt={file.original_file_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <FileText size={36} />
                      <span className="text-[11px] font-bold uppercase mt-1 text-slate-500">{file.file_type || 'FILE'}</span>
                    </div>
                  )}

                  {/* Size Badge */}
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-slate-900/70 backdrop-blur-xs text-white text-[10px] font-semibold">
                    {formatFileSize(file.file_size)}
                  </div>

                  {/* Folder Badge */}
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-indigo-600/90 backdrop-blur-xs text-white text-[10px] font-bold font-mono flex items-center gap-1 max-w-[70%] truncate">
                    <Folder size={10} className="flex-shrink-0" />
                    <span className="truncate">{fileFolder}</span>
                  </div>

                  {/* Quick Action Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-10">
                    <button
                      onClick={() => setPreviewFile(file)}
                      className="p-2 rounded-lg bg-white/90 text-slate-800 hover:bg-white transition-all shadow-sm"
                      title="Preview File"
                    >
                      <Eye size={16} />
                    </button>
                    <a
                      href={file.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg bg-white/90 text-slate-800 hover:bg-white transition-all shadow-sm"
                      title="Open Original Link"
                    >
                      <ExternalLink size={16} />
                    </a>
                    <button
                      onClick={() => setDeleteModalFile(file)}
                      className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all shadow-sm"
                      title="Delete Permanently from S3"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-3.5 space-y-2 min-w-0">
                  <div className="flex items-start justify-between gap-2 min-w-0">
                    <p className="font-bold text-xs text-slate-800 truncate w-full" title={file.original_file_name}>
                      {file.original_file_name || 'Unnamed File'}
                    </p>
                  </div>
                  <p className="text-[11px] font-mono text-slate-400 truncate w-full" title={file.file_key}>
                    {file.file_key || '—'}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1.5 text-[11px]">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-slate-400">
                        {file.timestamp ? new Date(file.timestamp).toLocaleDateString() : '—'}
                      </span>
                      {file.in_database ? (
                        <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100 font-semibold" title="Synced in PostgreSQL database">
                          DB
                        </span>
                      ) : (
                        <span className="text-[10px] text-sky-600 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-100 font-semibold" title="Direct S3 Object">
                          S3
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleCopyUrl(file.file_url, file.file_key)}
                      className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 flex-shrink-0"
                    >
                      {copiedKey === file.file_key ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                      <span>{copiedKey === file.file_key ? 'Copied' : 'Copy URL'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="card overflow-hidden border border-slate-200">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-3.5 py-3">Folder</th>
                  <th className="px-3 py-3">Preview</th>
                  <th className="px-3.5 py-3">Original File Name</th>
                  <th className="px-3.5 py-3 hidden xl:table-cell">S3 Object Key</th>
                  <th className="px-3 py-3">Size</th>
                  <th className="px-3 py-3 hidden sm:table-cell">Status</th>
                  <th className="px-3.5 py-3 hidden md:table-cell">Upload Date</th>
                  <th className="px-3.5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filesList.map((file) => {
                  const isImg = file.file_type?.toLowerCase().includes('png') ||
                    file.file_type?.toLowerCase().includes('jpg') ||
                    file.file_type?.toLowerCase().includes('jpeg') ||
                    file.file_type?.toLowerCase().includes('webp') ||
                    file.file_type?.toLowerCase().includes('gif') ||
                    file.file_url?.match(/\.(jpeg|jpg|gif|png|webp|svg)/i);

                  const fileFolder = file.folder || file.file_key?.split('/')?.[0] || 'root';

                  return (
                    <tr key={file.file_key} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md inline-block max-w-[120px] truncate" title={fileFolder}>
                          {fileFolder}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="w-9 h-9 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center flex-shrink-0">
                          {isImg && file.file_url ? (
                            <img
                              src={file.file_url}
                              alt={file.original_file_name}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <FileText size={17} className="text-slate-400" />
                          )}
                        </div>
                      </td>
                      <td className="px-3.5 py-3 min-w-0 max-w-[200px] lg:max-w-xs">
                        <p className="font-bold text-slate-800 text-xs truncate" title={file.original_file_name}>
                          {file.original_file_name || 'Unnamed File'}
                        </p>
                        <p className="text-[10px] font-mono text-slate-400 truncate mt-0.5" title={file.file_key}>
                          {file.file_key || '—'}
                        </p>
                      </td>
                      <td className="px-3.5 py-3 max-w-xs font-mono text-slate-500 hidden xl:table-cell">
                        <p className="truncate text-xs">{file.file_key || '—'}</p>
                      </td>
                      <td className="px-3 py-3 font-semibold text-slate-700 whitespace-nowrap">
                        {formatFileSize(file.file_size)}
                      </td>
                      <td className="px-3 py-3 hidden sm:table-cell whitespace-nowrap">
                        {file.in_database ? (
                          <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
                            DB Synced
                          </span>
                        ) : (
                          <span className="text-[10px] text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200 font-bold">
                            S3 Direct
                          </span>
                        )}
                      </td>
                      <td className="px-3.5 py-3 text-slate-500 hidden md:table-cell whitespace-nowrap">
                        {file.timestamp ? new Date(file.timestamp).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-3.5 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setPreviewFile(file)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Preview File"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => handleCopyUrl(file.file_url, file.file_key)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Copy S3 URL"
                          >
                            <Copy size={15} />
                          </button>
                          <a
                            href={file.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Open Link"
                          >
                            <ExternalLink size={15} />
                          </a>
                          <button
                            onClick={() => setDeleteModalFile(file)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Permanently from S3"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {totalItems > 0 && (
        <div className="card px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs font-medium text-slate-600 border border-slate-200">
          <div className="min-w-0">
            Showing <strong className="text-slate-800">{startIndex}</strong> to{' '}
            <strong className="text-slate-800">{endIndex}</strong> of <strong className="text-slate-800">{totalItems.toLocaleString()}</strong> objects in {currentFolder === 'all' ? 'bucket' : `folder "${currentFolder}"`}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 sm:p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex flex-wrap items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                .reduce((acc, page, idx, array) => {
                  if (idx > 0 && page - array[idx - 1] > 1) {
                    acc.push('...');
                  }
                  acc.push(page);
                  return acc;
                }, [])
                .map((item, index) =>
                  item === '...' ? (
                    <span key={`ellipsis-${index}`} className="px-1.5 text-slate-400">...</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setCurrentPage(item)}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-bold transition-all ${currentPage === item
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                    >
                      {item}
                    </button>
                  )
                )}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 sm:p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Lightbox / Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-sm truncate max-w-md">{previewFile.original_file_name}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{previewFile.file_key}</p>
              </div>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex flex-col items-center justify-center bg-slate-50 min-h-[250px]">
              {previewFile.file_url?.match(/\.(jpeg|jpg|gif|png|webp|svg)/i) ? (
                <img
                  src={previewFile.file_url}
                  alt={previewFile.original_file_name}
                  className="max-h-[50vh] object-contain rounded-lg border border-slate-200 shadow-sm"
                />
              ) : (
                <div className="text-center p-8">
                  <FileText size={54} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-700">{previewFile.original_file_name}</p>
                  <p className="text-xs text-slate-400 mt-1">Direct preview not available for this file format.</p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-white flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">
                  Size: {formatFileSize(previewFile.file_size)}
                </span>
                {previewFile.in_database ? (
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
                    Database Synced #{previewFile.s3_storage_id}
                  </span>
                ) : (
                  <span className="text-[10px] text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200 font-bold">
                    Direct S3 Object
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyUrl(previewFile.file_url, previewFile.file_key)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5 transition-all"
                >
                  <Copy size={14} />
                  <span>Copy Link</span>
                </button>

                <a
                  href={previewFile.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <ExternalLink size={14} />
                  <span>Open Full Link</span>
                </a>

                <button
                  onClick={() => {
                    const f = previewFile;
                    setPreviewFile(null);
                    setDeleteModalFile(f);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (S3-First) */}
      {deleteModalFile && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setDeleteModalFile(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4 mx-auto">
              <AlertTriangle size={24} />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-800">Delete S3 Object</h3>
              <p className="text-sm text-slate-500 mt-2">
                Are you sure you want to permanently delete <strong className="text-slate-800">"{deleteModalFile.original_file_name || deleteModalFile.file_key}"</strong> from Amazon S3?
              </p>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-left mt-3 font-mono text-[11px] text-slate-600 truncate">
                Key: {deleteModalFile.file_key}
              </div>
              <p className="text-xs text-red-500 font-medium mt-2">
                This operation will delete the file from Amazon S3 first, and synchronize changes in the database.
              </p>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeleteModalFile(null)}
                disabled={deleting}
                className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteFile}
                disabled={deleting}
                className="w-1/2 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Deleting from S3...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    <span>Delete File</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal (Direct to S3 Folder) */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setUploadModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Upload size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Upload to Amazon S3</h3>
                <p className="text-xs text-slate-400">Files will be stored directly into the selected S3 prefix</p>
              </div>
            </div>

            <form onSubmit={handleUploadFiles} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Target S3 Folder
                </label>
                <select
                  value={uploadTargetFolder}
                  onChange={(e) => setUploadTargetFolder(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  {foldersList.filter(f => f.name !== '[root]').map(f => (
                    <option key={f.name} value={f.name}>
                      /{f.name} ({f.count} objects)
                    </option>
                  ))}
                  <option value="assets">/assets (Default Media)</option>
                  <option value="Stories">/Stories</option>
                  <option value="Banner">/Banner</option>
                  <option value="Notification Image">/Notification Image</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Files (Images / Documents)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*,application/pdf"
                  onChange={(e) => setUploadFiles(Array.from(e.target.files || []))}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 border border-slate-200 rounded-xl p-2 bg-slate-50"
                />
              </div>

              {uploadFiles.length > 0 && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 max-h-36 overflow-y-auto space-y-1">
                  <span className="text-[11px] font-bold text-slate-600">Selected files ({uploadFiles.length}):</span>
                  {uploadFiles.map((file, i) => (
                    <p key={i} className="text-[11px] text-slate-500 truncate flex items-center justify-between">
                      <span>{file.name}</span>
                      <span className="font-mono text-[10px] text-slate-400">{formatFileSize(file.size)}</span>
                    </p>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  disabled={uploading}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || uploadFiles.length === 0}
                  className="w-1/2 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Uploading to S3...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={14} />
                      <span>Upload Now</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
