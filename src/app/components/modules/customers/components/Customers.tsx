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
    Download,
    Users
} from 'lucide-react';
import EditCustomers from "./EditCustomers";
import { useAlert } from "@/src/app/components/context/AlertContext";
import { User, UserListResponse } from "@/src/app/components/modules/customers/core/models/customerModel";
import { useCustomerData } from "@/src/app/components/modules/customers/core/hook/useCustomerData";
import { customerService } from "@/src/app/components/modules/customers/core/services/customerService";
import Pagination from "@/src/app/components/modules/customers/components/Pagination";


const Customers = () => {
    const router = useRouter();
    const { showToast, showConfirm } = useAlert();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Status");

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [statusLoadingId, setStatusLoadingId] = useState<number | null>(null);
    const [statusOverrides, setStatusOverrides] = useState<Record<number, string>>({});

    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isBulkLoading, setIsBulkLoading] = useState(false);

    const [brokenImages, setBrokenImages] = useState<Record<number, boolean>>({});

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchUsers = useCallback((signal?: AbortSignal) =>
            customerService.getCustomers(signal),
        []);

    const { data, loading, refetchData } = useCustomerData<UserListResponse>(
        fetchUsers,
        { message: "", users: [] },
        true
    );

    //--- ROLE PROTECTION SETUP ---//
    const userRole = (() => {
        if (typeof window === 'undefined') return null;
        try {
            const raw = localStorage.getItem('auth_user');
            return raw ? JSON.parse(raw)?.role ?? null : null;
        } catch {
            return null;
        }
    })();

    // Authorization Flags
    const isSuperAdmin = userRole === 'super-admin';
    const isAdmin = userRole === 'admin';
    const isStaff = userRole === 'staff';

    // Combined feature flags based on business rule requirements
    const canEdit = isSuperAdmin || isAdmin;
    const canDelete = isSuperAdmin;
    const canChangeStatus = isSuperAdmin;

    const getUserStatus = (user: User) => statusOverrides[user.id] ?? user.status;

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
        const allActive = selectedUsers.every(u => getUserStatus(u) === 'active');
        const allInactive = selectedUsers.every(u => getUserStatus(u) === 'inactive');

        return {
            showActive: allInactive || (!allActive && !allInactive),
            showInactive: allActive || (!allActive && !allInactive)
        };
    }, [selectedIds, filteredCustomers, statusOverrides]);

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
            showToast("Only super-admin can manage customer records status.", "error");
            return;
        }
        if (!data?.users) return;

        const usersList = data.users;

        const confirmed = await showConfirm({
            title: `Bulk ${newStatus === 'active' ? 'Activation' : 'Deactivation'}`,
            message: `Are you sure you want to set ${selectedIds.length} selected customers to ${newStatus}?`,
            confirmLabel: "Confirm",
            variant: newStatus === 'active' ? "info" : "danger"
        });

        if (confirmed) {
            setIsBulkLoading(true);
            try {
                await Promise.all(selectedIds.map(id => {
                    const user = usersList.find(u => u.id === id);
                    return customerService.updateStatus(id, newStatus, user);
                }));

                const updates = selectedIds.reduce((acc, id) => ({ ...acc, [id]: newStatus }), {});
                setStatusOverrides(prev => ({ ...prev, ...updates }));
                showToast(`Successfully updated ${selectedIds.length} customers`, "success");
                setSelectedIds([]);
                refetchData();
            } catch (err: any) {
                showToast("Failed to update some customers", "error");
            } finally {
                setIsBulkLoading(false);
            }
        }
    };

    const handleViewDetails = (userId: number) => {
        router.push(`/admin/customers/${userId}`);
    };

    const handleEditClick = (user: User) => {
        if (!canEdit) {
            showToast("Only super-admin and admin can edit customers.", "error");
            return;
        }
        setSelectedUser(user);
        setIsEditOpen(true);
    };

    const handleEditSuccess = () => {
        refetchData();
        showToast("Customer updated successfully", "success");
    };

    const handleDeleteClick = async (user: User) => {
        if (!canDelete) {
            showToast("Only super-admin can manage customer records status.", "error");
            return;
        }

        const confirmed = await showConfirm({
            title: "Remove Customer",
            message: `Are you sure you want to remove ${user.first_name}? This action will permanently delete their record.`,
            confirmLabel: "Delete Now",
            variant: "danger"
        });

        if (confirmed) {
            try {
                await customerService.deleteCustomer(user.id);
                showToast("Customer deleted successfully", "success");
                refetchData();
            } catch (err: any) {
                showToast(err?.response?.data?.message || "Failed to delete customer", "error");
            }
        }
    };

    const handleExport = async (type: 'excel' | 'pdf') => {
        try {
            const response = type === 'excel'
                ? await customerService.exportToExcel()
                : await customerService.exportToPdf();

            if (response?.data) {
                const blob = new Blob([response.data], {
                    type: type === 'excel'
                        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                        : 'application/pdf'
                });

                const filename = `customers_report_${new Date().getTime()}.${type === 'excel' ? 'xlsx' : 'pdf'}`;
                customerService.triggerDownload(blob, filename);
                showToast(`Customers exported to ${type.toUpperCase()} successfully`, "success");
            }
        } catch (error: any) {
            console.error("Export error:", error);
            showToast("Failed to export file", "error");
        }
    };

    const handleToggleStatus = async (user: User) => {
        if (!canChangeStatus) {
            showToast("Only super-admin can manage customer records status.", "error");
            return;
        }

        const isActive = getUserStatus(user) === 'active';
        const newStatus = isActive ? 'inactive' : 'active';

        const confirmed = await showConfirm({
            title: isActive ? "Inactive Customer" : "Activate Customer",
            message: `Are you sure you want to ${isActive ? 'inactive' : 'activate'} ${user.first_name}?`,
            confirmLabel: isActive ? "Inactive" : "Activate",
            variant: isActive ? "danger" : "info"
        });

        if (confirmed) {
            setStatusLoadingId(user.id);
            try {
                await customerService.updateStatus(user.id, newStatus, user);
                setStatusOverrides(prev => ({ ...prev, [user.id]: newStatus }));
                showToast(`Customer ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`, "success");
                refetchData();
            } catch (err: any) {
                showToast(err?.response?.data?.message || "Failed to update status", "error");
            } finally {
                setStatusLoadingId(null);
            }
        }
    };

    return (
        <div className="min-h-screen sm:p-6 py-4 md:p-8">
            <EditCustomers
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
                        <Users size={24} />
                    </div>
                    <div>
                        <h1 className="text-[24px] md:text-[30px] font-bold text-[var(--header-text)]">Customer Directory</h1>
                        <p className="text-gray-500 text-[12px] md:text-sm mt-1">Manage and view your registered customer base.</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    {selectedIds.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-gray-400 mr-2">{selectedIds.length} Selected</span>
                            {selectionInfo.showActive && (
                                <button
                                    onClick={() => handleBulkStatusUpdate('active')}
                                    disabled={isBulkLoading}
                                    className={`flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full text-xs font-bold transition-all ${
                                        !canChangeStatus ? 'opacity-50 cursor-not-allowed disabled:cursor-not-allowed' : 'cursor-pointer'
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
                                    className={`flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full text-xs font-bold transition-all ${
                                        !canChangeStatus ? 'opacity-50 cursor-not-allowed disabled:cursor-not-allowed' : 'cursor-pointer'
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

            {/* Filter Section */}
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
                        placeholder="Search customers by name or email..."
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

            {/* Table Container */}
            <div className="card-theme rounded-[24px] overflow-hidden shadow-sm relative min-h-[400px]">
                {loading && (
                    <div className="absolute inset-0 z-[20] flex items-center justify-center">
                        <Loader2 className="animate-spin custom-main-color-icon" size={32} />
                    </div>
                )}

                <div className="overflow-x-auto w-full" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <style jsx>{`
                        div::-webkit-scrollbar {
                            display: none;
                        }
                    `}</style>

                    <table className="w-full text-left border-separate border-spacing-0 min-w-[1000px]">
                        <thead>
                        <tr className="bg-gray-50/30 text-[14px] text-[var(--header-text)]">
                            <th className="w-16 pl-8 py-5">
                                <input
                                    type="checkbox"
                                    onChange={handleSelectAll}
                                    checked={paginatedCustomers.length > 0 && selectedIds.length === paginatedCustomers.length}
                                    className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                                />
                            </th>
                            <th className="px-6 py-5 font-bold">User</th>
                            <th className="px-6 py-5 font-bold">Email</th>
                            <th className="px-6 py-5 font-bold">Role</th>
                            <th className="px-6 py-5 font-bold">Joined Date</th>
                            <th className="px-6 py-5 font-bold">Status</th>
                            <th className="px-6 py-5 font-bold text-right pr-8">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                        {paginatedCustomers.map((user: User, idx: number) => (
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
                                            <span className="text-[11px] text-[var(--header-text)] font-medium lowercase truncate">@{user.first_name || 'user'}{user.id || idx}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1.5">
                                        <Mail size={12} className="text-[var(--header-text)] shrink-0" />
                                        <span className="text-[12px] font-medium text-[var(--header-text)] whitespace-nowrap">{user.email || ''}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-[20px] text-[12px] font-black tracking-tight whitespace-nowrap ${
                                            user.role === 'admin' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-500'
                                        }`}>
                                            {user.role}
                                        </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar size={12} className="text-[var(--header-text)] shrink-0" />
                                        <span className="text-[12px] font-medium text-[var(--header-text)] whitespace-nowrap">
                                            {(user as any).created_at || (user as any).created_by?.created_at || ''}
                                        </span>
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
                                        <button onClick={() => handleViewDetails(user.id)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full cursor-pointer">
                                            <Eye size={16}/>
                                        </button>

                                        {/* Edit Button Configuration */}
                                        <div onClick={!canEdit ? () => handleEditClick(user) : undefined} className={!canEdit ? 'cursor-not-allowed' : ''}>
                                            <button
                                                onClick={canEdit ? () => handleEditClick(user) : undefined}
                                                className={`p-2 rounded-full transition-colors ${
                                                    !canEdit ? 'text-gray-300 opacity-50 cursor-not-allowed disabled:cursor-not-allowed pointer-events-none' : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 cursor-pointer'
                                                }`}
                                            >
                                                <Edit2 size={16}/>
                                            </button>
                                        </div>

                                        {/* Delete Button Configuration */}
                                        <div onClick={!canDelete ? () => handleDeleteClick(user) : undefined} className={!canDelete ? 'cursor-not-allowed' : ''}>
                                            <button
                                                onClick={canDelete ? () => handleDeleteClick(user) : undefined}
                                                className={`p-2 rounded-full transition-colors ${
                                                    !canDelete ? 'text-gray-300 opacity-50 cursor-not-allowed disabled:cursor-not-allowed pointer-events-none' : 'text-slate-400 hover:text-red-500 hover:bg-red-50 cursor-pointer'
                                                }`}
                                            >
                                                <Trash2 size={16}/>
                                            </button>
                                        </div>

                                        {/* Toggle Active/Inactive Status Button Configuration */}
                                        <div onClick={!canChangeStatus ? () => handleToggleStatus(user) : undefined} className={!canChangeStatus ? 'cursor-not-allowed' : ''}>
                                            <button
                                                onClick={canChangeStatus ? () => handleToggleStatus(user) : undefined}
                                                disabled={statusLoadingId === user.id}
                                                className={`p-2 rounded-full transition-colors ${
                                                    !canChangeStatus ? 'text-gray-300 opacity-50 cursor-not-allowed disabled:cursor-not-allowed pointer-events-none' : getUserStatus(user) === 'active' ? 'text-orange-400 hover:text-orange-600 hover:bg-orange-50 cursor-pointer' : 'text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 cursor-pointer'
                                                }`}
                                            >
                                                {statusLoadingId === user.id ? <Loader2 size={16} className="animate-spin" /> : getUserStatus(user) === 'active' ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {!loading && filteredCustomers.length === 0 && (
                        <div className="flex flex-col py-20 text-center text-gray-400 items-center gap-3">
                            <Users className="w-12 h-12 text-gray-300" />
                            <span className="text-[14px] italic">
                                {searchTerm || statusFilter !== "All Status" ? "No matches found for your filters." : "No customers found."}
                            </span>
                        </div>
                    )}
                </div>

                {/* BOTTOM PACK (Total items always shows, Pagination displays conditionally if total items > 10) */}
                {!loading && filteredCustomers.length > 0 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center py-4 px-6 gap-4 border-t border-gray-50/50">
                        <div className="text-sm text-gray-500 font-medium">
                            Total items: <span className="font-bold text-emerald-500">{filteredCustomers.length}</span><span className="px-1">Customers</span>
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

export default Customers;