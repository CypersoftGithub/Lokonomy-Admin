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
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config';

export default function StorageManager() {
  const [filesList, setFilesList] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalAllFiles, setTotalAllFiles] = useState(0);
  const [totalSizeBytes, setTotalSizeBytes] = useState(0);
  const [imageCount, setImageCount] = useState(0);
  const [docCount, setDocCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'images', 'documents'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [copiedId, setCopiedId] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Modals
  const [previewFile, setPreviewFile] = useState(null);
  const [deleteModalFile, setDeleteModalFile] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchStorageFiles = async () => {
    setLoading(true);
    const token = localStorage.getItem('lokonomy_admin_token');
    const queryParams = new URLSearchParams({
      page: currentPage,
      limit: itemsPerPage,
      search: search.trim(),
      type: filterType
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
        const rawData = resJson.data || [];
        setFilesList(rawData);
        setTotalItems(resJson.total || resJson.count || rawData.length);
        setTotalAllFiles(resJson.totalAll || resJson.total || resJson.count || rawData.length);
        if (resJson.totalSizeBytes !== undefined) {
          setTotalSizeBytes(resJson.totalSizeBytes);
        }
        if (resJson.imageCount !== undefined) setImageCount(resJson.imageCount);
        if (resJson.docCount !== undefined) setDocCount(resJson.docCount);
      } else {
        const errMsg = typeof resJson.error === 'object' ? (resJson.error.message || JSON.stringify(resJson.error)) : resJson.error;
        toast.error(errMsg || 'Failed to fetch storage files');
      }
    } catch (err) {
      console.error('Error fetching storage files:', err);
      toast.error('Error fetching S3 bucket files');
    } finally {
      setLoading(false);
    }
  };

  // Fetch when page, limit, or filterType changes
  useEffect(() => {
    fetchStorageFiles();
  }, [currentPage, itemsPerPage, filterType]);

  // Handle Search submit / debounce
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

  const formatFileSize = (bytes) => {
    if (!bytes || isNaN(bytes)) return '0 B';
    const num = Number(bytes);
    if (num < 1024) return `${num} B`;
    if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
    return `${(num / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleCopyUrl = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success('File URL copied to clipboard! 📋');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteFile = async () => {
    if (!deleteModalFile) return;
    setDeleting(true);
    const token = localStorage.getItem('lokonomy_admin_token');

    try {
      const response = await fetch(`${API_BASE_URL}/api/storage/delete-admin?file_id=${deleteModalFile.s3_storage_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-user-type': 'admin'
        }
      });
      const resJson = await response.json();
      if (resJson.status) {
        toast.success('File permanently deleted from S3! 🗑️');
        setDeleteModalFile(null);
        if (previewFile?.s3_storage_id === deleteModalFile.s3_storage_id) {
          setPreviewFile(null);
        }
        fetchStorageFiles();
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

  // Client-side filtering fallback if backend returned full unpaginated list
  const filteredFiles = filesList.filter((f) => {
    const isImg = f.file_type?.toLowerCase().includes('png') ||
      f.file_type?.toLowerCase().includes('jpg') ||
      f.file_type?.toLowerCase().includes('jpeg') ||
      f.file_type?.toLowerCase().includes('webp') ||
      f.file_type?.toLowerCase().includes('gif') ||
      f.file_url?.match(/\.(jpeg|jpg|gif|png|webp)/i);

    if (filterType === 'images' && !isImg) return false;
    if (filterType === 'documents' && isImg) return false;

    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return (
      (f.original_file_name && f.original_file_name.toLowerCase().includes(query)) ||
      (f.file_key && f.file_key.toLowerCase().includes(query)) ||
      String(f.s3_storage_id).includes(query)
    );
  });

  // Determine actual items count for pagination
  const effectiveTotal = filesList.length > itemsPerPage ? filteredFiles.length : (totalItems || filteredFiles.length);
  const totalPages = Math.ceil(effectiveTotal / itemsPerPage) || 1;

  // STRICT SLICE GUARD: Never render more than itemsPerPage cards in the DOM!
  const displayFiles = filesList.length > itemsPerPage
    ? filteredFiles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : filesList;

  const startIndex = effectiveTotal === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, effectiveTotal);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2.5">
            <HardDrive className="text-orange-600" size={26} />
            <span>S3 Storage & Media Manager</span>
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Manage Amazon S3 bucket media assets, check storage usage, and manually clear unwanted files
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchStorageFiles}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2 text-xs font-semibold"
            title="Refresh S3 Bucket Files"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
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
                Active objects in AWS S3 storage
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
                Cumulative size across all objects
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

      {/* Filter and Control Toolbar */}
      <div className="card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
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

        {/* Right Search, Items-per-page & Layout Buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="relative flex-1 sm:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search file name, key, ID..."
              className="input-field pl-9 py-1.5 text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
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
        <div className="card p-16 text-center text-slate-400 text-sm">
          <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
          Loading S3 bucket files...
        </div>
      ) : displayFiles.length === 0 ? (
        <div className="card p-16 text-center text-slate-400 text-sm">
          <HardDrive size={36} className="mx-auto text-slate-300 mb-2" />
          No files match your search criteria.
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW - STRICTLY RENDERS displayFiles (MAX 12 OR itemsPerPage) */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayFiles.map((file) => {
            const isImg = file.file_type?.toLowerCase().includes('png') ||
              file.file_type?.toLowerCase().includes('jpg') ||
              file.file_type?.toLowerCase().includes('jpeg') ||
              file.file_type?.toLowerCase().includes('webp') ||
              file.file_url?.match(/\.(jpeg|jpg|gif|png|webp)/i);

            return (
              <div key={file.s3_storage_id} className="card overflow-hidden group hover:shadow-md transition-all flex flex-col justify-between border border-slate-200">
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

                  {/* ID Badge */}
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold font-mono">
                    #{file.s3_storage_id}
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
                      title="Open Original"
                    >
                      <ExternalLink size={16} />
                    </a>
                    <button
                      onClick={() => setDeleteModalFile(file)}
                      className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all shadow-sm"
                      title="Delete from S3"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-3.5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-xs text-slate-800 truncate" title={file.original_file_name}>
                      {file.original_file_name || 'Unnamed File'}
                    </p>
                  </div>
                  <p className="text-[11px] font-mono text-slate-400 truncate" title={file.file_key}>
                    {file.file_key || '—'}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">
                      {file.timestamp ? new Date(file.timestamp).toLocaleDateString() : '—'}
                    </span>
                    <button
                      onClick={() => handleCopyUrl(file.file_url, file.s3_storage_id)}
                      className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                    >
                      {copiedId === file.s3_storage_id ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                      <span>{copiedId === file.s3_storage_id ? 'Copied' : 'Copy URL'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW - STRICTLY RENDERS displayFiles (MAX 12 OR itemsPerPage) */
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3.5">ID</th>
                  <th className="px-6 py-3.5">Preview</th>
                  <th className="px-6 py-3.5">Original File Name</th>
                  <th className="px-6 py-3.5">S3 Object Key</th>
                  <th className="px-6 py-3.5">Size</th>
                  <th className="px-6 py-3.5">Upload Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {displayFiles.map((file) => {
                  const isImg = file.file_type?.toLowerCase().includes('png') ||
                    file.file_type?.toLowerCase().includes('jpg') ||
                    file.file_type?.toLowerCase().includes('jpeg') ||
                    file.file_type?.toLowerCase().includes('webp') ||
                    file.file_url?.match(/\.(jpeg|jpg|gif|png|webp)/i);

                  return (
                    <tr key={file.s3_storage_id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-indigo-600">
                        #{file.s3_storage_id}
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center flex-shrink-0">
                          {isImg && file.file_url ? (
                            <img
                              src={file.file_url}
                              alt={file.original_file_name}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <FileText size={18} className="text-slate-400" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <p className="font-bold text-slate-800 text-xs truncate">{file.original_file_name || 'Unnamed File'}</p>
                      </td>
                      <td className="px-6 py-4 max-w-xs font-mono text-slate-500">
                        <p className="truncate text-xs">{file.file_key || '—'}</p>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-700">
                        {formatFileSize(file.file_size)}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {file.timestamp ? new Date(file.timestamp).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPreviewFile(file)}
                            className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Preview File"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => handleCopyUrl(file.file_url, file.s3_storage_id)}
                            className="p-2 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Copy S3 URL"
                          >
                            <Copy size={15} />
                          </button>
                          <a
                            href={file.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Open Link"
                          >
                            <ExternalLink size={15} />
                          </a>
                          <button
                            onClick={() => setDeleteModalFile(file)}
                            className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete from S3"
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
      {effectiveTotal > 0 && (
        <div className="card px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-600">
          <div>
            Showing <strong className="text-slate-800">{startIndex}</strong> to{' '}
            <strong className="text-slate-800">{endIndex}</strong> of <strong className="text-slate-800">{effectiveTotal}</strong> files
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex items-center gap-1">
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
                    <span key={`ellipsis-${index}`} className="px-2 text-slate-400">...</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setCurrentPage(item)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === item
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
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
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
              {previewFile.file_url?.match(/\.(jpeg|jpg|gif|png|webp)/i) ? (
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

            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-white">
              <span className="text-xs font-bold text-slate-500">
                Size: {formatFileSize(previewFile.file_size)}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyUrl(previewFile.file_url, previewFile.s3_storage_id)}
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
                  <span>Open Full Screen</span>
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
                  <span>Delete File</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
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
              <h3 className="text-lg font-bold text-slate-800">Delete S3 File</h3>
              <p className="text-sm text-slate-500 mt-2">
                Are you sure you want to permanently delete <strong className="text-slate-800">"{deleteModalFile.original_file_name || deleteModalFile.file_key}"</strong> from Amazon S3?
              </p>
              <p className="text-xs text-red-500 font-medium mt-1">This file will be permanently erased from S3 storage and cannot be recovered.</p>
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
                    <span>Deleting...</span>
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
    </div>
  );
}
