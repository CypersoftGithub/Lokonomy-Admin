import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Download,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Award,
  CheckCircle2,
  Copy,
  Check,
  Grid,
  List as ListIcon,
  RefreshCw,
  User,
  Filter,
  DollarSign,
  FileText,
  X,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config';

// Professional candidate avatar palette
const avatarProStyles = [
  'bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 text-white shadow-slate-900/20',
  'bg-gradient-to-tr from-indigo-600 to-blue-700 text-white shadow-indigo-600/20',
  'bg-gradient-to-tr from-slate-800 to-zinc-900 text-white shadow-slate-800/20',
  'bg-gradient-to-tr from-blue-600 to-indigo-800 text-white shadow-blue-600/20',
  'bg-gradient-to-tr from-zinc-800 to-slate-950 text-white shadow-zinc-800/20',
  'bg-gradient-to-tr from-indigo-700 to-violet-800 text-white shadow-indigo-700/20'
];

export default function Resumes() {
  const [resumesList, setResumesList] = useState([]);
  const [stats, setStats] = useState({
    totalResumes: 0,
    experiencedCount: 0,
    fresherCount: 0,
    withPdfCount: 0,
    thisWeekCount: 0,
    thisMonthCount: 0,
    citiesList: [],
    educationList: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search & Filter states
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedEducation, setSelectedEducation] = useState('All');
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' (Newest first), 'asc' (Oldest first), 'name'

  // Layout & Pagination
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);

  // Interactive states
  const [copiedId, setCopiedId] = useState(null);
  const [previewResume, setPreviewResume] = useState(null);
  const [previewViewerMode, setPreviewViewerMode] = useState('native'); // 'native' | 'gdocs'
  const [iframeLoading, setIframeLoading] = useState(true);
  const [deleteModalResume, setDeleteModalResume] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (previewResume) {
      setIframeLoading(true);
    }
  }, [previewResume, previewViewerMode]);

  const getPreviewUrl = (url, mode) => {
    if (!url) return '';
    if (mode === 'gdocs') {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    }
    // Stream endpoint with Content-Type: application/pdf and Content-Disposition: inline
    return `${API_BASE_URL}/api/admin/resumes/stream?url=${encodeURIComponent(url)}`;
  };

  const fetchResumes = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    const token = localStorage.getItem('lokonomy_admin_token');
    const queryParams = new URLSearchParams({
      search: search.trim(),
      city: selectedCity === 'All' ? '' : selectedCity,
      role: selectedRole === 'All' ? '' : selectedRole,
      education: selectedEducation === 'All' ? '' : selectedEducation,
      order: sortOrder === 'asc' ? 'asc' : 'desc'
    });

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/resumes?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'x-user-type': 'admin'
        }
      });
      const resJson = await response.json();
      if (resJson.status) {
        let list = resJson.data || [];

        // Apply client-side alphabetical sort if chosen
        if (sortOrder === 'name') {
          list = list.slice().sort((a, b) => a.name.localeCompare(b.name));
        }

        setResumesList(list);
        if (resJson.stats) {
          setStats(resJson.stats);
        }
      } else {
        const errMsg = typeof resJson.error === 'object' ? (resJson.error.message || JSON.stringify(resJson.error)) : resJson.error;
        toast.error(errMsg || 'Failed to fetch candidate resumes');
      }
    } catch (err) {
      console.error('Error fetching resumes:', err);
      toast.error('Error connecting to resumes service');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Trigger fetch on filter or sort change
  useEffect(() => {
    fetchResumes();
  }, [selectedCity, selectedRole, selectedEducation, sortOrder]);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (currentPage !== 1) setCurrentPage(1);
      fetchResumes();
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // Reset pagination when page size or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage, selectedCity, selectedRole, selectedEducation]);

  const handleCopy = (text, type, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(`${type}-${id}`);
    toast.success(`Copied ${type}: ${text} 📋`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteResume = async () => {
    if (!deleteModalResume) return;
    setDeleting(true);
    const token = localStorage.getItem('lokonomy_admin_token');

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/resumes/${deleteModalResume.id}`, {
        method: 'DELETE',
        headers: {
          'accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'x-user-type': 'admin'
        }
      });
      const resJson = await response.json();
      if (resJson.status) {
        toast.success(`Resume of "${deleteModalResume.name}" deleted successfully`);
        setDeleteModalResume(null);
        fetchResumes(true);
      } else {
        const errMsg = typeof resJson.error === 'object' ? (resJson.error.message || JSON.stringify(resJson.error)) : resJson.error;
        toast.error(errMsg || 'Failed to delete resume');
      }
    } catch (err) {
      console.error('Error deleting resume:', err);
      toast.error('Error deleting resume record');
    } finally {
      setDeleting(false);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCity('All');
    setSelectedRole('All');
    setSelectedEducation('All');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  // Pagination calculations
  const totalItems = resumesList.length;
  const effectivePerPage = itemsPerPage === -1 ? totalItems : itemsPerPage;
  const totalPages = Math.ceil(totalItems / effectivePerPage) || 1;
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * effectivePerPage + 1;
  const endIndex = Math.min(currentPage * effectivePerPage, totalItems);
  const paginatedResumes = itemsPerPage === -1
    ? resumesList
    : resumesList.slice((currentPage - 1) * effectivePerPage, currentPage * effectivePerPage);

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2.5">
            <Briefcase className="text-indigo-600" size={26} />
            <span>Resumes</span>
            <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-100">
              {stats.totalResumes || resumesList.length} Candidates
            </span>
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            View, filter, and inspect candidate profiles, and career experience
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchResumes(true)}
            disabled={refreshing || loading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2 text-xs font-semibold disabled:opacity-50 bg-white"
            title="Refresh Resumes"
          >
            <RefreshCw size={15} className={refreshing || loading ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Top Stats Metric Cards - High Aesthetic Matching Plans / Storage Manager */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Total Resumes */}
        <div className="bg-gradient-to-br from-indigo-900/5 via-white to-indigo-50/40 border border-indigo-100/80 rounded-2xl p-5 shadow-xs hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-all" />
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                  Total Resumes
                </span>
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                {stats.totalResumes || resumesList.length}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Active job seeker profiles in Lokonomy
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <FileText size={22} />
            </div>
          </div>
        </div>

        {/* Card 2: Experienced Professionals */}
        <div className="bg-gradient-to-br from-emerald-900/5 via-white to-emerald-50/40 border border-emerald-100/80 rounded-2xl p-5 shadow-xs hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all" />
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                  Experienced
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                {stats.experiencedCount || 0}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Candidates with proven industry work history
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <Award size={22} />
            </div>
          </div>
        </div>

        {/* Card 3: Freshers & Entry-Level */}
        <div className="bg-gradient-to-br from-orange-900/5 via-white to-orange-50/40 border border-orange-200/90 rounded-2xl p-5 shadow-xs hover:shadow-xl hover:shadow-orange-500/15 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-orange-500/10 rounded-full blur-xl group-hover:bg-orange-500/20 transition-all" />
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-100">
                  Freshers
                </span>
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                {stats.fresherCount || 0}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Fresh graduates seeking entry-level roles
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-600 to-orange-600 text-white shadow-lg shadow-orange-500/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <GraduationCap size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Control Toolbar */}
      <div className="card p-4 flex flex-wrap items-center justify-between gap-4 border border-slate-200">
        {/* Left: Search input */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidate, degree, skills, city, phone..."
            className="input-field pl-10 pr-8 py-2 text-xs w-full"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Middle: Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* City Filter */}
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            title="Filter by City"
          >
            <option value="All">All Cities</option>
            {(stats.citiesList || []).map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>

          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            title="Filter by Experience Level"
          >
            <option value="All">All Roles</option>
            <option value="Experienced">Experienced</option>
            <option value="Fresher">Fresher</option>
          </select>

          {/* Education Filter */}
          <select
            value={selectedEducation}
            onChange={(e) => setSelectedEducation(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            title="Filter by Education Level"
          >
            <option value="All">All Education</option>
            {(stats.educationList || []).map(edu => (
              <option key={edu} value={edu}>{edu}</option>
            ))}
          </select>
        </div>

        {/* Right: Items per page & Grid/Table Switcher */}
        <div className="flex items-center gap-2">
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-2.5 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            title="Items per page"
          >
            <option value={9}>9 / page</option>
            <option value={18}>18 / page</option>
            <option value={36}>36 / page</option>
            <option value={-1}>All ({resumesList.length})</option>
          </select>

          <div className="flex items-center border border-slate-200 rounded-xl p-1 bg-slate-50">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
              title="Card Grid View"
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
              title="Table View"
            >
              <ListIcon size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="card p-16 text-center text-slate-400 text-sm border border-slate-200">
          <div className="w-9 h-9 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
          Loading candidate resumes from database...
        </div>
      ) : resumesList.length === 0 ? (
        <div className="card p-16 text-center text-slate-400 text-sm border border-slate-200 space-y-3">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
            <Briefcase size={26} />
          </div>
          <p className="font-bold text-slate-700 text-base">No candidate resumes found</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search || selectedCity !== 'All' || selectedRole !== 'All' || selectedEducation !== 'All'
              ? 'No candidates match your current search or filter criteria. Try resetting filters.'
              : 'There are currently no active candidate resumes uploaded.'}
          </p>
          {(search || selectedCity !== 'All' || selectedRole !== 'All' || selectedEducation !== 'All') && (
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all"
            >
              Reset All Filters
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW: Professional Candidate Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedResumes.map((resume, idx) => {
            const isExp = (resume.role || '').toLowerCase().includes('experience');
            const avatarStyle = avatarProStyles[idx % avatarProStyles.length];

            return (
              <div
                key={resume.id}
                className="bg-white border border-slate-200/90 hover:border-indigo-300/80 rounded-2xl p-5 shadow-xs hover:shadow-xl hover:shadow-indigo-500/8 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group"
              >
                {/* Decorative Subtle Indigo Ambient Glow */}
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition-all pointer-events-none" />

                <div>
                  {/* Top Bar: Avatar, Name, Degree, and Role Chip */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div
                        className={`w-12 h-12 rounded-2xl ${avatarStyle} font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300`}
                      >
                        {resume.initials}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-black text-slate-900 text-[15px] tracking-tight truncate capitalize" title={resume.name}>
                          {resume.name}
                        </h3>
                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide truncate mt-0.5">
                          {resume.degree}
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium truncate">
                          {resume.education} {resume.age && resume.age !== '—' ? `• ${resume.age} yrs` : ''}
                        </p>
                      </div>
                    </div>

                    {/* Role Pill (Experienced / Fresher) */}
                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border flex-shrink-0 flex items-center gap-1.5 ${isExp
                          ? 'text-slate-800 bg-slate-100 border-slate-300/80'
                          : 'text-indigo-700 bg-indigo-50 border-indigo-200/80'
                        }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isExp ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                      {resume.role}
                    </span>
                  </div>

                  {/* Highlights Grid */}
                  <div className="space-y-2.5 py-3 border-y border-slate-100 text-xs">
                    {/* Experience Info */}
                    <div className="flex items-start gap-2 text-slate-700">
                      <Briefcase size={14} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="text-[11px] text-slate-400 font-medium block">Experience</span>
                        <p className="font-medium text-slate-800 line-clamp-2 leading-relaxed">
                          {resume.experience}
                        </p>
                      </div>
                    </div>

                    {/* Cities / Preferred Locations */}
                    <div className="flex items-start gap-2 text-slate-700">
                      <MapPin size={14} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="text-[11px] text-slate-400 font-medium block">Preferred Cities</span>
                        <p className="font-medium text-slate-800 truncate">
                          {resume.cities}
                        </p>
                      </div>
                    </div>

                    {/* Expected Salary & Submission Date */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5">
                        <DollarSign size={13} className="text-indigo-500" />
                        <span className="text-slate-400 text-[11px]">Expected:</span>
                        <strong className="text-slate-900 font-extrabold text-xs">{resume.expected_salary}</strong>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Calendar size={12} />
                        <span>{resume.formatted_date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Strip */}
                  <div className="pt-3 pb-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                    {resume.phone && (
                      <div className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100/70 px-2.5 py-1 rounded-lg border border-slate-200/80 font-mono text-[11px] text-slate-700 transition-colors">
                        <Phone size={12} className="text-slate-400" />
                        <span>{resume.phone}</span>
                        <button
                          onClick={() => handleCopy(resume.phone_full, 'Phone', resume.id)}
                          className="text-slate-400 hover:text-slate-700 ml-0.5"
                          title="Copy phone number"
                        >
                          {copiedId === `Phone-${resume.id}` ? <Check size={12} className="text-indigo-600" /> : <Copy size={12} />}
                        </button>
                      </div>
                    )}

                    {resume.email && resume.email !== '—' && (
                      <div className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100/70 px-2.5 py-1 rounded-lg border border-slate-200/80 font-mono text-[11px] text-slate-700 max-w-[180px] truncate transition-colors">
                        <Mail size={12} className="text-slate-400 flex-shrink-0" />
                        <span className="truncate">{resume.email}</span>
                        <button
                          onClick={() => handleCopy(resume.email, 'Email', resume.id)}
                          className="text-slate-400 hover:text-slate-700 ml-0.5 flex-shrink-0"
                          title="Copy email address"
                        >
                          {copiedId === `Email-${resume.id}` ? <Check size={12} className="text-indigo-600" /> : <Copy size={12} />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setPreviewResume(resume)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-slate-200/90 hover:border-indigo-200 shadow-2xs"
                  >
                    <Eye size={14} className="text-slate-500 group-hover:text-indigo-600" />
                    <span>Quick View</span>
                  </button>

                  {resume.resume_url ? (
                    <a
                      href={resume.resume_url}
                      target="_blank"
                      rel="noreferrer"
                      className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5"
                      title="Open Original Resume PDF on S3"
                    >
                      <Download size={14} />
                      <span>PDF</span>
                    </a>
                  ) : (
                    <span className="py-2 px-2.5 rounded-xl bg-slate-100 text-slate-400 text-[11px] font-semibold">
                      No File
                    </span>
                  )}

                  <button
                    onClick={() => setDeleteModalResume(resume)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Candidate Record"
                  >
                    <Trash2 size={15} />
                  </button>
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
                  <th className="px-4 py-3.5">Candidate</th>
                  <th className="px-4 py-3.5">Education / Degree</th>
                  <th className="px-4 py-3.5">Role</th>
                  <th className="px-4 py-3.5">Experience</th>
                  <th className="px-4 py-3.5">Locations</th>
                  <th className="px-4 py-3.5">Expected Salary</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {paginatedResumes.map((resume, idx) => {
                  const isExp = (resume.role || '').toLowerCase().includes('experience');
                  const avatarStyle = avatarProStyles[idx % avatarProStyles.length];

                  return (
                    <tr key={resume.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl ${avatarStyle} font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-xs`}
                          >
                            {resume.initials}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 text-xs capitalize truncate">{resume.name}</p>
                            <p className="text-[11px] text-slate-400 font-mono mt-0.5">{resume.phone || resume.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <p className="font-bold text-indigo-600 uppercase">{resume.degree}</p>
                        <p className="text-[11px] text-slate-400">{resume.education}</p>
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 ${isExp
                            ? 'text-slate-800 bg-slate-100 border-slate-300/80'
                            : 'text-indigo-700 bg-indigo-50 border-indigo-200/80'
                            }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isExp ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                          {resume.role}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 max-w-[200px]">
                        <p className="text-gray-700 truncate font-medium" title={resume.experience}>
                          {resume.experience}
                        </p>
                      </td>

                      <td className="px-4 py-3.5 max-w-[150px]">
                        <p className="text-gray-700 truncate" title={resume.cities}>
                          {resume.cities}
                        </p>
                      </td>

                      <td className="px-4 py-3.5 font-bold text-gray-900 whitespace-nowrap">
                        {resume.expected_salary}
                      </td>

                      <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                        {resume.formatted_date}
                      </td>

                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPreviewResume(resume)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                            title="Quick View Details"
                          >
                            <Eye size={15} />
                          </button>

                          {resume.resume_url && (
                            <a
                              href={resume.resume_url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                              title="Download / View S3 PDF"
                            >
                              <ExternalLink size={15} />
                            </a>
                          )}

                          <button
                            onClick={() => setDeleteModalResume(resume)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-rose-600 hover:bg-gray-100 transition-colors"
                            title="Delete"
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

      {/* Pagination Bar */}
      {totalItems > 0 && itemsPerPage !== -1 && (
        <div className="card px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs font-medium text-slate-600 border border-slate-200">
          <div>
            Showing <strong className="text-slate-800">{startIndex}</strong> to{' '}
            <strong className="text-slate-800">{endIndex}</strong> of{' '}
            <strong className="text-slate-800">{totalItems}</strong> candidates
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="Previous Page"
            >
              <ChevronLeft size={15} />
            </button>

            <span className="px-3 py-1 font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="Next Page"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Quick View / In-App PDF Preview Modal (Portaled to document.body to fully cover viewport and top header) */}
      {previewResume && createPortal(
        <div
          onClick={() => setPreviewResume(null)}
          className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-start justify-between gap-4 bg-gray-50/80">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-950 text-white font-extrabold text-lg flex items-center justify-center shadow-md shadow-gray-900/20">
                  {previewResume.initials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-gray-900 capitalize">
                      {previewResume.name}
                    </h2>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 border border-gray-300">
                      {previewResume.role}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    {previewResume.degree} • {previewResume.education} {previewResume.age && previewResume.age !== '—' ? `• ${previewResume.age} years old` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {previewResume.resume_url && (
                  <a
                    href={previewResume.resume_url}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="px-3.5 py-2 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <Download size={14} />
                    <span>Download PDF</span>
                  </a>
                )}
                <button
                  onClick={() => setPreviewResume(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Profile Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-100 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">Expected Salary</span>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">{previewResume.expected_salary}</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">Preferred Cities</span>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">{previewResume.cities}</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">Phone Contact</span>
                  <p className="font-mono font-bold text-slate-800 text-xs mt-1">{previewResume.phone_full || '—'}</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">Email Address</span>
                  <p className="font-mono font-bold text-slate-800 text-xs mt-1 truncate" title={previewResume.email}>
                    {previewResume.email || '—'}
                  </p>
                </div>
              </div>

              {/* Experience Details */}
              <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-1.5">
                <span className="text-[11px] text-gray-700 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase size={13} className="text-gray-500" />
                  <span>Work & Practical Experience</span>
                </span>
                <p className="text-sm font-medium text-gray-700 leading-relaxed">
                  {previewResume.experience}
                </p>
              </div>

              {/* PDF Viewer Section */}
              {previewResume.resume_url ? (
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-gray-700">
                    <span className="flex items-center gap-1.5 text-gray-800">
                      <FileText size={14} className="text-gray-500" />
                      <span>Attached Resume Document</span>
                    </span>

                    {/* Viewer Controls */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200 text-[11px]">
                        <button
                          type="button"
                          onClick={() => {
                            setIframeLoading(true);
                            setPreviewViewerMode('native');
                          }}
                          className={`px-2.5 py-1 rounded-md font-semibold transition-all ${previewViewerMode === 'native'
                              ? 'bg-white text-gray-900 shadow-xs'
                              : 'text-gray-500 hover:text-gray-800'
                            }`}
                        >
                          Native PDF
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIframeLoading(true);
                            setPreviewViewerMode('gdocs');
                          }}
                          className={`px-2.5 py-1 rounded-md font-semibold transition-all ${previewViewerMode === 'gdocs'
                              ? 'bg-white text-gray-900 shadow-xs'
                              : 'text-gray-500 hover:text-gray-800'
                            }`}
                        >
                          Google Docs
                        </button>
                      </div>

                      <a
                        href={previewResume.resume_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-gray-600 hover:text-black hover:underline flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <ExternalLink size={12} /> Open in Tab
                      </a>
                    </div>
                  </div>

                  <div className="relative w-full h-[520px] border border-gray-200 rounded-2xl overflow-hidden bg-slate-100 shadow-inner">
                    {iframeLoading && (
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-50/90 gap-2 text-slate-500 text-xs">
                        <RefreshCw size={22} className="animate-spin text-gray-700" />
                        <span className="font-medium">Loading document preview...</span>
                      </div>
                    )}
                    <iframe
                      key={`${previewResume.id}-${previewViewerMode}`}
                      src={getPreviewUrl(previewResume.resume_url, previewViewerMode)}
                      title={`Resume: ${previewResume.name}`}
                      className="w-full h-full border-0"
                      onLoad={() => setIframeLoading(false)}
                    />
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 text-xs">
                  No resume document file attached to this candidate profile.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
              <span>Submitted on: <strong className="text-slate-700">{previewResume.formatted_date}</strong></span>
              <button
                onClick={() => setPreviewResume(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal (Portaled to document.body) */}
      {deleteModalResume && createPortal(
        <div
          onClick={() => !deleting && setDeleteModalResume(null)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-800">Delete Candidate Resume</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to delete the resume profile for{' '}
                <strong className="text-slate-800">"{deleteModalResume.name}"</strong>? This will remove the candidate record from the active listing.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
              <p><strong className="text-slate-700">Role:</strong> {deleteModalResume.role} ({deleteModalResume.degree})</p>
              <p><strong className="text-slate-700">Cities:</strong> {deleteModalResume.cities}</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteModalResume(null)}
                disabled={deleting}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteResume}
                disabled={deleting}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20 flex items-center gap-2"
              >
                {deleting && <RefreshCw size={13} className="animate-spin" />}
                <span>{deleting ? 'Deleting...' : 'Delete Resume'}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
