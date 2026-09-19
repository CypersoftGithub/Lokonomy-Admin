import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Search, RefreshCw, Banknote, CheckCircle2, Clock,
  Sparkles, ChevronLeft, ChevronRight, Loader2, ChevronDown,
  Download, Building2, User, Phone, Mail, MapPin, HandCoins, Check, Calendar,
  ArrowUpDown, ArrowUp, ArrowDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  GetBusinessData,
  GetPlans,
  UpdateBusinessStatus,
  SavePaymentData,
} from '../services/cashCollection';

// Parse date object from business record
const getCreatedDateObj = (business) => {
  if (business.created_at_timestamp) {
    const num = Number(business.created_at_timestamp);
    const ms = num < 10000000000 ? num * 1000 : num;
    const d = new Date(ms);
    if (!isNaN(d.getTime())) return d;
  }
  if (business.created_at) {
    const d = new Date(business.created_at);
    if (!isNaN(d.getTime())) return d;
  }
  if (business.createdAt) {
    const d = new Date(business.createdAt);
    if (!isNaN(d.getTime())) return d;
  }
  if (business.date) {
    const d = new Date(business.date);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
};

// Format date string for table display
const formatCreatedDate = (business) => {
  const dateObj = getCreatedDateObj(business);
  if (!dateObj) return 'N/A';
  return dateObj.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

function StatusDropdown({ status, disabled, onSelect }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isCollected = status === 'Collected';

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-200 shadow-sm ${
          isCollected
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300'
            : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100 hover:border-rose-300'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              isCollected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
            }`}
          />
          {status}
        </span>
        {disabled ? (
          <Loader2 size={13} className="animate-spin text-slate-400" />
        ) : (
          <ChevronDown
            size={13}
            className={`transition-transform duration-200 ${
              open ? 'rotate-180' : ''
            } ${isCollected ? 'text-emerald-600' : 'text-rose-500'}`}
          />
        )}
      </button>

      {open && !disabled && (
        <div className="absolute right-0 mt-1.5 w-36 rounded-xl bg-white shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <button
            type="button"
            onClick={() => {
              onSelect('Pending');
              setOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold transition-colors ${
              !isCollected
                ? 'bg-rose-50 text-rose-700 font-bold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Pending
            </span>
            {!isCollected && <Check size={14} className="text-rose-600" />}
          </button>

          <button
            type="button"
            onClick={() => {
              onSelect('Collected');
              setOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold transition-colors ${
              isCollected
                ? 'bg-emerald-50 text-emerald-700 font-bold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Collected
            </span>
            {isCollected && <Check size={14} className="text-emerald-600" />}
          </button>
        </div>
      )}
    </div>
  );
}

export default function CashCollection() {
  const [data, setData] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Pending' | 'Collected'
  const [upgradeFilter, setUpgradeFilter] = useState('All'); // 'All' | 'Upgraded'
  const [dateSortOrder, setDateSortOrder] = useState('desc'); // 'desc' (newest first) | 'asc' (oldest first)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [businessData, plansData] = await Promise.all([
        GetBusinessData(),
        GetPlans(),
      ]);

      const formattedPlans = (plansData || []).map((plan) => ({
        id: plan.id,
        amount: plan.amount,
        validity: plan.validity,
      }));
      setPlans(formattedPlans);

      const formattedBusiness = (businessData || []).map((b) => ({
        ...b,
        cashCollectionStatus: false, // Initial status: Pending
      }));
      setData(formattedBusiness);
    } catch (error) {
      console.error('Error loading Cash Collection data:', error);
      toast.error('Failed to load cash collection data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Statistics calculation
  const stats = useMemo(() => {
    let pendingCount = 0;
    let collectedCount = 0;
    let upgradedCount = 0;
    let totalCashAmount = 0;

    data.forEach((b) => {
      if (b.cashCollectionStatus) {
        collectedCount++;
      } else {
        pendingCount++;
      }
      if (b.is_upgrade_plan) {
        upgradedCount++;
      }
      const amt = Number(b.cash_amount) || 0;
      totalCashAmount += amt;
    });

    return {
      total: data.length,
      pending: pendingCount,
      collected: collectedCount,
      upgraded: upgradedCount,
      totalCash: totalCashAmount,
    };
  }, [data]);

  // Filtered and sorted data based on search, status, upgrade, and date sort order
  const filteredData = useMemo(() => {
    const list = data.filter((b) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        (b.business_name || '').toLowerCase().includes(query) ||
        (b.username || '').toLowerCase().includes(query) ||
        (b.business_email_address || '').toLowerCase().includes(query) ||
        (b.business_contact || '').toLowerCase().includes(query) ||
        (b.city || '').toLowerCase().includes(query) ||
        (b.taluka || '').toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Collected' && b.cashCollectionStatus) ||
        (statusFilter === 'Pending' && !b.cashCollectionStatus);

      const matchesUpgrade =
        upgradeFilter === 'All' ||
        (upgradeFilter === 'Upgraded' && Boolean(b.is_upgrade_plan));

      return matchesSearch && matchesStatus && matchesUpgrade;
    });

    list.sort((a, b) => {
      const timeA = getCreatedDateObj(a)?.getTime() || 0;
      const timeB = getCreatedDateObj(b)?.getTime() || 0;
      if (dateSortOrder === 'asc') {
        return timeA - timeB;
      }
      return timeB - timeA;
    });

    return list;
  }, [data, searchQuery, statusFilter, upgradeFilter, dateSortOrder]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Handle status update change
  const handleStatusChange = async (business, newStatusVal) => {
    const isCollected = newStatusVal === 'Collected';
    
    // If status is unchanged, skip API call
    if (business.cashCollectionStatus === isCollected) return;

    setSavingId(business.business_id);

    try {
      // 1. Update business status flag
      await UpdateBusinessStatus(business.business_id);

      // Find plan validity matching the cash amount
      const planMatch = plans.find(
        (p) => String(p.amount) === String(business.cash_amount)
      );
      const validity = planMatch ? planMatch.validity : '1 Year';

      // 2. Save payment record
      await SavePaymentData(
        business.user_id,
        business.cash_amount || 0,
        validity,
        Boolean(business.is_upgrade_plan)
      );

      // Update local state cleanly without full reload
      setData((prevData) =>
        prevData.map((item) =>
          item.business_id === business.business_id
            ? { ...item, cashCollectionStatus: isCollected }
            : item
        )
      );

      toast.success(
        `Cash collection updated to ${newStatusVal} for "${business.business_name}"`
      );
    } catch (error) {
      console.error('Error saving cash collection status:', error);
      toast.error(error.message || 'Failed to update status. Please try again.');
    } finally {
      setSavingId(null);
    }
  };

  const exportCSV = () => {
    if (!filteredData.length) {
      toast.error('No data to export');
      return;
    }
    const headers = ['Business ID,Business Name,Type,City,Taluka,Contact Name,Email,Phone,Plan Amount (INR),Upgrade Plan,Created At,Collection Status\n'];
    const rows = filteredData.map(b => [
      `"${b.business_id || ''}"`,
      `"${(b.business_name || '').replace(/"/g, '""')}"`,
      `"${(b.business_type_name || '').replace(/"/g, '""')}"`,
      `"${(b.city || '').replace(/"/g, '""')}"`,
      `"${(b.taluka || '').replace(/"/g, '""')}"`,
      `"${(b.username || '').replace(/"/g, '""')}"`,
      `"${(b.business_email_address || '').replace(/"/g, '""')}"`,
      `"${(b.business_contact || '').replace(/"/g, '""')}"`,
      `"${b.cash_amount || 0}"`,
      `"${b.is_upgrade_plan ? 'YES' : 'NO'}"`,
      `"${formatCreatedDate(b)}"`,
      `"${b.cashCollectionStatus ? 'Collected' : 'Pending'}"`,
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,' + headers.concat(rows).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cash_collections_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV exported successfully!');
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Cash Collection</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Track offline cash payments and manage upgrade status for onboarded businesses
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAllData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button
            onClick={exportCSV}
            className="btn-primary flex items-center gap-1.5"
          >
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Building2 size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Businesses</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{stats.total}</h3>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Collections</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{stats.pending}</h3>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Collected Payments</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{stats.collected}</h3>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <Sparkles size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Upgraded Plans</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{stats.upgraded}</h3>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="card p-4 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Status filter tabs (Left) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1">
            {['All', 'Pending', 'Collected'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setStatusFilter(tab);
                  setCurrentPage(1);
                }}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  statusFilter === tab
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab}
                <span className="ml-1.5 text-[11px] opacity-75 font-normal">
                  ({tab === 'All' ? stats.total : tab === 'Pending' ? stats.pending : stats.collected})
                </span>
              </button>
            ))}
          </div>

          {/* Right Side: Upgraded Button & Search Bar at the far right end */}
          <div className="flex items-center gap-3 flex-1 justify-end max-w-xl">
            {/* Upgrade Filter Toggle */}
            <button
              onClick={() => {
                setUpgradeFilter(prev => prev === 'All' ? 'Upgraded' : 'All');
                setCurrentPage(1);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                upgradeFilter === 'Upgraded'
                  ? 'border-purple-300 bg-purple-50 text-purple-700 font-semibold shadow-sm'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Sparkles size={14} className={upgradeFilter === 'Upgraded' ? 'text-purple-600' : 'text-slate-400'} />
              Upgraded Only
            </button>

            {/* Search Bar at right end */}
            <div className="relative flex-1 max-w-sm">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by Business Name..."
                className="input-field pl-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <Loader2 size={32} className="animate-spin text-primary mb-3" />
            <p className="text-slate-600 font-medium">Loading cash collection records...</p>
            <p className="text-slate-400 text-xs mt-1">Fetching latest business details and plan status</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Business Details
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Contact Details
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Plan Selection (₹)
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Upgrade Plan
                  </th>
                  {/* Created At Column with Click-to-Sort */}
                  <th
                    onClick={() => setDateSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                    className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors select-none"
                    title={`Click to sort date (${dateSortOrder === 'desc' ? 'Newest to Oldest' : 'Oldest to Newest'})`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Created At</span>
                      {dateSortOrder === 'asc' ? (
                        <ArrowUp size={13} className="text-indigo-600 flex-shrink-0" />
                      ) : (
                        <ArrowDown size={13} className="text-indigo-600 flex-shrink-0" />
                      )}
                    </div>
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Cash Collection Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedData.length > 0 ? (
                  paginatedData.map((business) => {
                    const isSaving = savingId === business.business_id;
                    const isUpgraded = Boolean(business.is_upgrade_plan);
                    const isCollected = Boolean(business.cashCollectionStatus);

                    return (
                      <tr
                        key={business.business_id || business.user_id || Math.random()}
                        className={`transition-colors hover:bg-slate-50/80 group ${
                          isUpgraded ? 'bg-amber-50/20' : ''
                        }`}
                      >
                        {/* Business Details */}
                        <td className="px-5 py-4 align-top">
                          <div className="flex items-start gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-xs ${
                              isUpgraded
                                ? 'bg-gradient-to-br from-amber-400 to-purple-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {(business.business_name || 'B')[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800 line-clamp-1">
                                {business.business_name || 'N/A'}
                              </p>
                              <p className="text-xs text-slate-500 font-medium mt-0.5">
                                {business.business_type_name || 'Service Provider'}
                              </p>
                              <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                                <MapPin size={12} className="flex-shrink-0" />
                                <span>
                                  {[business.city, business.taluka].filter(Boolean).join(', ') || 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contact Details */}
                        <td className="px-5 py-4 align-top">
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                              <User size={13} className="text-slate-400" />
                              {business.username || 'N/A'}
                            </p>
                            <p className="text-xs text-slate-500 flex items-center gap-1.5">
                              <Mail size={13} className="text-slate-400" />
                              {business.business_email_address || 'N/A'}
                            </p>
                            <p className="text-xs text-slate-500 flex items-center gap-1.5">
                              <Phone size={13} className="text-slate-400" />
                              {business.business_contact || 'N/A'}
                            </p>
                          </div>
                        </td>

                        {/* Plan Selection (₹) */}
                        <td className="px-5 py-4 align-top">
                          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-100 text-slate-800 font-bold text-sm">
                            <HandCoins size={14} className="text-emerald-600" />
                            <span>₹{business.cash_amount || 0}</span>
                          </div>
                        </td>

                        {/* Upgrade Plan */}
                        <td className="px-5 py-4 align-top">
                          {isUpgraded ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 font-bold text-xs">
                              <Sparkles size={12} /> YES
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 font-medium text-xs">
                              NO
                            </span>
                          )}
                        </td>

                        {/* Created At Date */}
                        <td className="px-5 py-4 align-top">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                            <Calendar size={13} className="text-slate-400 flex-shrink-0" />
                            <span>{formatCreatedDate(business)}</span>
                          </div>
                        </td>

                        {/* Cash Collection Status Dropdown */}
                        <td className="px-5 py-4 align-top">
                          <StatusDropdown
                            status={isCollected ? 'Collected' : 'Pending'}
                            disabled={isSaving}
                            onSelect={(newVal) => handleStatusChange(business, newVal)}
                          />
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                        <Search size={22} />
                      </div>
                      <h3 className="text-slate-700 font-semibold text-sm">No businesses found</h3>
                      <p className="text-slate-400 text-xs mt-1">
                        Try adjusting search terms or status filters
                      </p>
                      {(searchQuery || statusFilter !== 'All' || upgradeFilter !== 'All') && (
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setStatusFilter('All');
                            setUpgradeFilter('All');
                          }}
                          className="mt-3 px-3 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-lg hover:bg-indigo-100 transition-colors"
                        >
                          Reset Filters
                        </button>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!loading && filteredData.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-4 border-t border-slate-100 gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>
                Showing {Math.min((currentPage - 1) * pageSize + 1, filteredData.length)} to{' '}
                {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} entries
              </span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-slate-200 rounded-lg text-xs px-2 py-1 text-slate-600 focus:outline-none focus:border-indigo-500"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:border-indigo-400 hover:text-indigo-600 disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-500 transition-colors"
              >
                <ChevronLeft size={15} />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5 && currentPage > 3) {
                  pageNum = currentPage - 3 + i;
                  if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                      currentPage === pageNum
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'border border-slate-200 text-slate-600 hover:border-indigo-400'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:border-indigo-400 hover:text-indigo-600 disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-500 transition-colors"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
