"use client";

import React, { useCallback, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    Search,
    Filter,
    Mail,
    Eye,
    Edit2,
    ShieldAlert,
    ShieldCheck,
    ChevronRight,
    Calendar,
    Loader2,
    Trash2,
    Download
} from 'lucide-react';
import { useAlert } from "@/src/app/components/context/AlertContext";
import EditAdmin from "@/src/app/components/modules/admin/components/EditAdmin";
import type { Admin as AdminType, AdminListResponse } from "@/src/app/components/modules/admin/core/models/adminModel";
import { useAdminData } from "@/src/app/components/modules/admin/core/hook/useAdminData";
import { adminService } from "@/src/app/components/modules/admin/core/services/adminService";
import Pagination from "@/src/app/components/modules/admin/components/Pagination";


const Admin = () => {
    const router = useRouter();
    const { showToast, showConfirm } = useAlert();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Status");

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<AdminType | null>(null);
    const [statusLoadingId, setStatusLoadingId] = useState<number | null>(null);
    const [statusOverrides, setStatusOverrides] = useState<Record<number, string>>({});

    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isBulkLoading, setIsBulkLoading] = useState(false);

    const [brokenImages, setBrokenImages] = useState<Record<number, boolean>>({});

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchAdminData = useCallback((signal?: AbortSignal) =>
            adminService.getAdmins(signal),
        []);

    const { data, loading, refetchData } = useAdminData<AdminListResponse>(
        fetchAdminData,
        { message: "", users: [] },
        true
    );

    //--- SECURITY ROLE ARCHITECTURE SETUP ---//
    const currentUserRole = (() => {
        if (typeof window === 'undefined') return null;
        try {
            const raw = localStorage.getItem('auth_user');
            return raw ? JSON.parse(raw)?.role ?? null : null;
        } catch {
            return null;
        }
    })();

    const isSuperAdmin = currentUserRole === 'super-admin';
    const isAdmin = currentUserRole === 'admin';

    // Base permission flags based on logged-in user role
    const canChangeStatus = isSuperAdmin;
    const canEdit = isSuperAdmin || isAdmin;
    const canDelete = isSuperAdmin;

    const getUserStatus = (user: AdminType) => statusOverrides[user.id] ?? user.status;

    const filteredCustomers = useMemo(() => {
        const users = data?.users || [];
        return users.filter((user) => {
            const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
            const matchesSearch =
                fullName.includes(searchTerm.toLowerCase()) ||
                (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesStatus =
                statusFilter === "All Status" ||
                (statusOverrides[user.id] ?? user.status).toLowerCase() === statusFilter.toLowerCase();

            return matchesSearch && matchesStatus;
        });
    }, [data, searchTerm, statusFilter, statusOverrides]);

    // Paginated Dataset Calculations
    const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / itemsPerPage));
    const safePage = Math.min(currentPage, totalPages || 1);
    const startIndex = (safePage - 1) * itemsPerPage;
    const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage);

    const selectionInfo = useMemo(() => {
        if (selectedIds.length === 0) return { showActive: false, showInactive: false };

        const selectedUsers = filteredCustomers.filter(u => selectedIds.includes(u.id));
        const hasActive = selectedUsers.some(u => getUserStatus(u) === 'active');
        const hasInactive = selectedUsers.some(u => getUserStatus(u) === 'inactive');

        return {
            showActive: hasInactive && canChangeStatus,
            showInactive: hasActive && canChangeStatus
        };
    }, [selectedIds, filteredCustomers, statusOverrides, canChangeStatus]);

    const handleExport = async (type: 'excel' | 'pdf') => {
        try {
            const fileData = type === 'excel'
                ? await adminService.exportToExcel()
                : await adminService.exportToPdf();

            if (fileData) {
                const blobType = type === 'excel'
                    ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    : 'application/pdf';

                const blob = new Blob([fileData], { type: blobType });
                const filename = `admin_report_${new Date().getTime()}.${type === 'excel' ? 'xlsx' : 'pdf'}`;

                adminService.triggerDownload(blob, filename);
                showToast(`Admin exported to ${type.toUpperCase()} successfully`, "success");
            } else {
                showToast("Data payload layout unavailable or broken.", "error");
            }
        } catch (err: any) {
            console.error("Export error:", err);
            showToast("Failed to export file", "error");
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(paginatedCustomers.map(u => u.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleBulkStatusUpdate = async (newStatus: 'active' | 'inactive') => {
        if (!canChangeStatus) {
            showToast("Only super-admin can perform bulk status modifications.", "error");
            return;
        }
        if (!data?.users) return;

        const confirmed = await showConfirm({
            title: `Bulk ${newStatus === 'active' ? 'Activation' : 'Deactivation'}`,
            message: `Are you sure you want to set ${selectedIds.length} admin members to ${newStatus}?`,
            confirmLabel: "Confirm",
            variant: newStatus === 'active' ? "info" : "danger"
        });

        if (confirmed) {
            setIsBulkLoading(true);
            try {
                await Promise.all(selectedIds.map(id => {
                    const user = data.users.find(u => u.id === id);
                    return adminService.updateStatus(id, newStatus, user as any);
                }));

                const updates = selectedIds.reduce((acc, id) => ({ ...acc, [id]: newStatus }), {});
                setStatusOverrides(prev => ({ ...prev, ...updates }));
                showToast(`Updated ${selectedIds.length} admin members`, "success");
                setSelectedIds([]);
                refetchData();
            } catch (err: any) {
                showToast("Failed to update some users", "error");
            } finally {
                setIsBulkLoading(false);
            }
        }
    };

    const handleViewDetails = (userId: number) => {
        router.push(`/admin/admin/${userId}`);
    };

    const handleEditClick = (user: AdminType) => {
        // Fix 3: Regular admins cannot touch super-admin records
        if (isAdmin && user.role === 'super-admin') {
            showToast("Admins do not have clearance to modify super-admin accounts.", "error");
            return;
        }
        if (!canEdit) {
            showToast("You do not have permission to update records.", "error");
            return;
        }
        setSelectedUser(user);
        setIsEditOpen(true);
    };

    const handleEditSuccess = () => {
        refetchData();
        showToast("Admin updated successfully", "success");
    };

    const handleDeleteClick = async (user: AdminType) => {
        // Fix 3: Regular admins cannot touch super-admin records
        if (isAdmin && user.role === 'super-admin') {
            showToast("Admins cannot delete super-admin accounts.", "error");
            return;
        }
        if (!canDelete) {
            showToast("Only super-admin can delete administrator records.", "error");
            return;
        }

        const confirmed = await showConfirm({
            title: "Remove Admin Member",
            message: `Are you sure you want to remove ${user.first_name}? This action will permanently delete their record.`,
            confirmLabel: "Delete Now",
            variant: "danger"
        });

        if (confirmed) {
            try {
                await adminService.deleteAdmin(user.id);
                showToast("Admin member deleted successfully", "success");
                refetchData();
            } catch (err: any) {
                showToast(err?.response?.data?.message || "Failed to delete admin", "error");
            }
        }
    };

    const handleToggleStatus = async (user: AdminType) => {
        // Fix 3: Regular admins cannot touch super-admin records
        if (isAdmin && user.role === 'super-admin') {
            showToast("Admins cannot toggle status for super-admin accounts.", "error");
            return;
        }
        if (!canChangeStatus) {
            showToast("Only super-admin can alter account status configurations.", "error");
            return;
        }

        const isActive = getUserStatus(user) === 'active';
        const newStatus = isActive ? 'inactive' : 'active';

        const confirmed = await showConfirm({
            title: isActive ? "Inactive Admin" : "Activate Admin",
            message: `Are you sure you want to ${isActive ? 'inactive' : 'activate'} ${user.first_name}?`,
            confirmLabel: isActive ? "Inactive" : "Activate",
            variant: isActive ? "danger" : "info"
        });

        if (confirmed) {
            setStatusLoadingId(user.id);
            try {
                await adminService.updateStatus(user.id, newStatus, user);
                setStatusOverrides(prev => ({ ...prev, [user.id]: newStatus }));
                showToast(`Admin ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`, "success");
                refetchData();
            } catch (err: any) {
                showToast(err?.response?.data?.message || "Failed to update status", "error");
            } finally {
                setStatusLoadingId(null);
            }
        }
    };

    return (
        <div className="min-h-screen sm:p-4 py-4 md:p-8">
            <EditAdmin
                isOpen={isEditOpen}
                onClose={() => {
                    setIsEditOpen(false);
                    setSelectedUser(null);
                }}
                user={selectedUser}
                onSuccess={handleEditSuccess}
            />
            {/* Header Section */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 custom-main-color-card rounded-full flex items-center justify-center custom-main-color-icon shrink-0">
                        <ShieldCheck size={24}/>
                    </div>
                    <div>
                        <h1 className="text-[24px] md:text-[30px] font-bold text-[var(--header-text)]">Administrator Accounts</h1>
                        <p className="text-gray-500 text-[12px] md:text-sm mt-1">Manage and monitor administrative access and roles.</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    {selectedIds.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-right-4">
                            <span className="text-xs font-bold text-gray-400 mr-2">{selectedIds.length} Selected</span>

                            {selectionInfo.showActive && (
                                <button
                                    onClick={() => handleBulkStatusUpdate('active')}
                                    disabled={isBulkLoading}
                                    className={`flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full text-xs font-bold transition-all ${
                                        !canChangeStatus ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                    }`}
                                >
                                    {isBulkLoading ? <Loader2 size={14} className="animate-spin"/> :
                                        <ShieldCheck size={14}/>} Active All
                                </button>
                            )}

                            {selectionInfo.showInactive && (
                                <button
                                    onClick={() => handleBulkStatusUpdate('inactive')}
                                    disabled={isBulkLoading}
                                    className={`flex items-center gap-2 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full text-xs font-bold transition-all ${
                                        !canChangeStatus ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                    }`}
                                >
                                    {isBulkLoading ? <Loader2 size={14} className="animate-spin"/> :
                                        <ShieldAlert size={14}/>} Inactive All
                                </button>
                            )}
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleExport('excel')}
                            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full sm:text-[14px] text-[12px] font-bold transition-all shadow-sm whitespace-nowrap cursor-pointer"
                        >
                            <Download size={16}/>
                            Export Excel
                        </button>
                        <button
                            onClick={() => handleExport('pdf')}
                            className="flex items-center gap-2 card-theme text-[var(--header-text)] px-4 py-2.5 rounded-full sm:text-[14px] text-[12px] font-bold hover:bg-gray-50 transition whitespace-nowrap cursor-pointer disabled:opacity-50"
                        >
                            <Download size={16}/>
                            Export PDF
                        </button>
                    </div>
                </div>
            </div>

            <div
                className="mb-6 card-theme rounded-[20px] p-3 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        placeholder="Search by name or email..."
                        className="w-full pl-12 pr-4 py-3 input-theme rounded-[20px] focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-base shadow-sm"
                    />
                </div>
                <div className="relative">
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full md:w-44 appearance-none pl-11 pr-10 py-3 card-theme rounded-[20px] text-base font-bold text-slate-500 outline-none cursor-pointer shadow-sm"
                    >
                        <option value="All Status">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                    <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 rotate-90" />
                </div>
            </div>

            <div className="card-theme rounded-[24px] overflow-hidden shadow-sm relative min-h-[400px]">
                {loading && (
                    <div className="absolute inset-0 z-[20] flex flex-col items-center justify-center">
                        <div className="p-4 flex flex-col items-center gap-3">
                            <Loader2 className="animate-spin custom-main-color-icon" size={32} />
                        </div>
                    </div>
                )}

                <div className="overflow-x-auto w-full" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <table className="w-full text-left border-separate border-spacing-0 min-w-[1000px]">
                        <thead>
                        <tr className="bg-gray-50/50 text-[14px]">
                            <th className="w-16 pl-8 py-5">
                                <input
                                    type="checkbox"
                                    onChange={handleSelectAll}
                                    checked={paginatedCustomers.length > 0 && selectedIds.length === paginatedCustomers.length}
                                    className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                                />
                            </th>
                            <th className="px-6 py-5 font-bold">Admins</th>
                            <th className="px-6 py-5 font-bold">Email</th>
                            <th className="px-6 py-5 font-bold">Role</th>
                            <th className="px-6 py-5 font-bold">Joined Date</th>
                            <th className="px-6 py-5 font-bold">Status</th>
                            <th className="px-6 py-5 font-bold text-right pr-8">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                        {paginatedCustomers.map((user: AdminType, idx: number) => {
                            // Compute dynamic contextual rules for this specific row entry
                            const isRowSuperAdmin = user.role === 'super-admin';

                            // Edit conditions
                            const isEditDisabled = !canEdit || (isAdmin && isRowSuperAdmin);
                            // Delete conditions
                            const isDeleteDisabled = !canDelete || (isAdmin && isRowSuperAdmin);
                            // Status change conditions
                            const isStatusDisabled = !canChangeStatus || (isAdmin && isRowSuperAdmin);

                            return (
                                <tr key={user.id || idx} className={`hover:bg-gray-50/50 transition-all group ${selectedIds.includes(user.id) ? 'bg-emerald-50/30' : ''}`}>
                                    <td className="pl-8 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(user.id)}
                                            onChange={() => handleSelectOne(user.id)}
                                            className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-gray-100 border border-gray-200 shrink-0 flex items-center justify-center">
                                                {user.image && !brokenImages[user.id || idx] ? (
                                                    <img
                                                        src={user.image}
                                                        alt={user.first_name || 'avatar'}
                                                        className="w-full h-full object-contain"
                                                        onError={() => setBrokenImages(prev => ({ ...prev, [user.id || idx]: true }))}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full custom-main-color-bg flex items-center justify-center text-[12px] font-black text-white">
                                                        {user.first_name ? user.first_name.charAt(0).toUpperCase() : '?'}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-bold text-[var(--header-text)] truncate">
                                                    {user.first_name || ''} {user.last_name || ''}
                                                </span>
                                                <span className="text-[11px] text-[var(--header-text)] font-medium lowercase truncate">@{user.first_name || 'staff'}{user.id || idx}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                                            <Mail size={12} className="text-[var(--header-text)] shrink-0"/>
                                            <span className="text-[12px] font-medium text-[var(--header-text)]">{user.email || ''}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-[20px] text-[12px] font-black whitespace-nowrap ${
                                            isRowSuperAdmin
                                                ? 'bg-emerald-50 text-emerald-500'
                                                : 'bg-purple-50 text-red-400'
                                        }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                                            <Calendar size={12} className="text-[var(--header-text)] shrink-0"/>
                                            <span className="text-[12px] font-medium text-[var(--header-text)]">{user.created_at || user.created_by?.created_at || ''}</span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 whitespace-nowrap">
                                            <div className={`w-2 h-2 rounded-full ${getUserStatus(user) === 'active' ? 'bg-emerald-500' : 'bg-rose-400'}`}></div>
                                            <span className="text-sm font-bold text-[var(--header-text)] capitalize">{getUserStatus(user)}</span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-right pr-8">
                                        <div className="flex items-center justify-end gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                            {/* View Details */}
                                            <button
                                                onClick={() => handleViewDetails(user.id)}
                                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                                                title="View Details"
                                            >
                                                <Eye size={16}/>
                                            </button>

                                            {/* Edit Button */}
                                            <div
                                                onClick={() => handleEditClick(user)}
                                                className={isEditDisabled ? 'cursor-not-allowed' : ''}
                                            >
                                                <button
                                                    onClick={(e) => {
                                                        if (isEditDisabled) return;
                                                        e.stopPropagation();
                                                        handleEditClick(user);
                                                    }}
                                                    className={`p-2 rounded-full transition-colors ${
                                                        isEditDisabled
                                                            ? 'text-slate-300 opacity-50 pointer-events-none'
                                                            : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 cursor-pointer'
                                                    }`}
                                                    title="Edit User"
                                                >
                                                    <Edit2 size={16}/>
                                                </button>
                                            </div>

                                            {/* Delete Button */}
                                            <div
                                                onClick={() => handleDeleteClick(user)}
                                                className={isDeleteDisabled ? 'cursor-not-allowed' : ''}
                                            >
                                                <button
                                                    onClick={(e) => {
                                                        if (isDeleteDisabled) return;
                                                        e.stopPropagation();
                                                        handleDeleteClick(user);
                                                    }}
                                                    className={`p-2 rounded-full transition-colors ${
                                                        isDeleteDisabled
                                                            ? 'text-slate-300 opacity-50 pointer-events-none'
                                                            : 'text-slate-400 hover:text-red-500 hover:bg-red-50 cursor-pointer'
                                                    }`}
                                                    title="Delete User"
                                                >
                                                    <Trash2 size={16}/>
                                                </button>
                                            </div>

                                            {/* Status Toggle Button */}
                                            <div
                                                onClick={() => handleToggleStatus(user)}
                                                className={isStatusDisabled ? 'cursor-not-allowed' : ''}
                                            >
                                                <button
                                                    onClick={(e) => {
                                                        if (isStatusDisabled) return;
                                                        e.stopPropagation();
                                                        handleToggleStatus(user);
                                                    }}
                                                    disabled={statusLoadingId === user.id}
                                                    className={`p-2 rounded-full transition-colors ${
                                                        isStatusDisabled
                                                            ? 'text-slate-300 opacity-50 pointer-events-none'
                                                            : getUserStatus(user) === 'active'
                                                                ? 'text-orange-400 hover:text-orange-600 hover:bg-orange-50 cursor-pointer'
                                                                : 'text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 cursor-pointer'
                                                    }`}
                                                    title={getUserStatus(user) === 'active' ? 'Deactivate' : 'Activate'}
                                                >
                                                    {statusLoadingId === user.id ? (
                                                        <Loader2 size={16} className="animate-spin" />
                                                    ) : getUserStatus(user) === 'active' ? (
                                                        <ShieldCheck size={16} />
                                                    ) : (
                                                        <ShieldAlert size={16} />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>

                    {!loading && filteredCustomers.length === 0 && (
                        <div className="flex flex-col py-20 text-center text-gray-400 items-center gap-3">
                            <ShieldCheck className="w-12 h-12 text-gray-300" />
                            <span className="text-[14px] italic">
                              {searchTerm || statusFilter !== "All Status"
                                  ? "No matches found for your filters."
                                  : "No admins found."}
                            </span>
                        </div>
                    )}
                </div>

                {/* BOTTOM PACK (Total items always shows, Pagination displays conditionally if total items > 10) */}
                {!loading && filteredCustomers.length > 0 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center py-4 px-6 gap-4 border-t border-gray-50/50">
                        <div className="text-sm text-gray-500 font-medium">
                            Total items: <span className="font-bold text-emerald-500">{filteredCustomers.length}</span><span className="px-1">Admins & Super Admins</span>
                        </div>
                        {filteredCustomers.length > itemsPerPage && (
                            <Pagination
                                currentPage={safePage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Admin;