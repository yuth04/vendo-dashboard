"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ChevronLeft,
    Mail,
    Activity,
    Edit2,
    Trash2,
    ChevronRight,
    Calendar,
    ShieldCheck,
    Clock,
    ShieldAlert, UserCog
} from 'lucide-react';
import { useAlert } from "@/src/app/components/context/AlertContext";
import {StaffService} from "@/src/app/components/modules/staff/core/services/StaffService";
import {useStaffData} from "@/src/app/components/modules/staff/core/hook/UseStaffData";
import {PageLoader} from "@/src/app/components/helpers/components/PageLoader";
import {DataNotFound} from "@/src/app/components/helpers/components/DataNotFound";
import EditStaff from "@/src/app/components/modules/staff/components/EditStaff";
import {StaffListResponse} from "@/src/app/components/modules/staff/core/models/StaffModel";

const DetailsStaff = () => {
    const params = useParams();
    const router = useRouter();
    const userId = params?.id as string;

    const { showToast, showConfirm } = useAlert();

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentStatus, setCurrentStatus] = useState<string>('active');

    const fetchCustomer = useCallback(
        (signal?: AbortSignal) => StaffService.fetchAdminById(userId, signal),
        [userId]
    );

    // Generic model constraint using StaffListResponse
    const { data, loading, error, refetchData } = useStaffData<StaffListResponse>(
        fetchCustomer,
        undefined,
        !!userId
    );

    const customer = data?.user;

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
    const isStaff = currentUserRole === 'staff';

    // Granular Action Condition Flags
    const canChangeStatus = isSuperAdmin;
    const canEdit = isSuperAdmin || isAdmin;
    const canDelete = isSuperAdmin;

    useEffect(() => {
        if (customer?.status) {
            setCurrentStatus(customer.status);
        }
    }, [customer?.status]);

    const handleEditSuccess = () => {
        refetchData();
        showToast("Staff updated successfully", "success");
    };

    const handleOpenEditModal = () => {
        if (!canEdit) {
            if (isStaff) {
                showToast("Only super-admin can update customer records.", "error");
            } else {
                showToast("You do not have permission to update records.", "error");
            }
            return;
        }
        setIsEditModalOpen(true);
    };

    const handleToggleStatus = async () => {
        if (!canChangeStatus) {
            showToast("Only super-admin can activate or deactivate staff status.", "error");
            return;
        }

        const isActive = currentStatus === 'active';
        const newStatus = isActive ? 'inactive' : 'active';

        const confirmed = await showConfirm({
            title: isActive ? "Inactive Staff" : "Activate Staff",
            message: `Are you sure you want to ${isActive ? 'inactive' : 'activate'} ${customer?.first_name}?`,
            confirmLabel: isActive ? "Inactive" : "Activate",
            variant: isActive ? "danger" : "info"
        });

        if (confirmed) {
            try {
                await StaffService.updateStatus(customer!.id, newStatus, customer as any);
                setCurrentStatus(newStatus);
                showToast(`Staff ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`, "success");
                refetchData();
            } catch (err: any) {
                console.log("Status update error:", JSON.stringify(err?.response?.data));
                showToast(err?.response?.data?.message || "Failed to update status", "error");
            }
        }
    };

    const handleDelete = async () => {
        if (!canDelete) {
            showToast("Only super-admin can delete staff records.", "error");
            return;
        }

        const confirmed = await showConfirm({
            title: "Delete staff",
            message: `Are you sure you want to delete ${customer?.first_name}? This action cannot be undone.`,
            confirmLabel: "Delete Staff",
            variant: "danger"
        });

        if (confirmed) {
            try {
                await StaffService.deleteAdmin(userId);
                showToast("Staff deleted successfully", "success");
                router.push('/admin/staff');
            } catch (err: any) {
                showToast(err?.response?.data?.message || "Failed to delete staff", "error");
            }
        }
    };

    if (loading) {
        return <PageLoader />;
    }

    if (error || !customer) {
        return (
            <DataNotFound
                title="Staff Not Found"
                message="The staff ID requested does not exist or has been removed."
                icon={UserCog}
            />
        );
    }

    return (
        <div className="min-h-screen sm:p-4 py-4 md:p-8">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-[12px] sm:text-[14px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 overflow-x-auto whitespace-nowrap pb-2 no-scrollbar">
                <span className="custom-main-color-text-hover cursor-pointer whitespace-nowrap" onClick={() => router.push('/admin/dashboard')}>Dashboard</span>
                <ChevronRight size={12} className="text-gray-300" />
                <span className="custom-main-color-text-hover cursor-pointer whitespace-nowrap" onClick={() => router.push('/admin/staff')}>Admin</span>
                <ChevronRight size={12} className="text-gray-300" />
                <span className="text-[var(--header-text)]">Details</span>
            </nav>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 sm:p-3 card-theme rounded-full shadow-sm hover:bg-gray-50 transition-all text-gray-500 group cursor-pointer"
                    >
                        <ChevronLeft size={26} className="group-hover:-translate-x-0.5 transition-transform text-[var(--header-text)]" />
                    </button>
                    <div>
                        <h1 className="text-[24px] sm:text-[30px] font-black text-[var(--header-text)] tracking-tight">Staff Profile</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold text-gray-400 bg-white border border-gray-100 px-2 py-0.5 rounded-lg uppercase tracking-wider shadow-sm">
                                ID: {customer.id}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Status Management Button */}
                    <button
                        onClick={handleToggleStatus}
                        className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-3 bg-white border rounded-2xl text-[12px] sm:text-[14px] font-black shadow-sm transition-all ${
                            !canChangeStatus
                                ? 'border-emerald-100 text-emerald-600 opacity-50 cursor-not-allowed'
                                : currentStatus === 'active'
                                    ? 'border-emerald-100 text-emerald-600 hover:bg-emerald-50 cursor-pointer'
                                    : 'border-orange-100 text-orange-600 hover:bg-orange-50 cursor-pointer'
                        }`}
                    >
                        {currentStatus === 'active' ? <ShieldCheck size={16}/> : <ShieldAlert size={16}/>}
                        {currentStatus === 'active' ? 'Active' : 'Inactive'}
                    </button>

                    {/* Edit Profile Action Link */}
                    <div
                        onClick={!canEdit ? handleOpenEditModal : undefined}
                        className={`relative ${!canEdit ? 'cursor-not-allowed' : ''}`}
                    >
                        <button
                            onClick={canEdit ? handleOpenEditModal : undefined}
                            className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-3 text-white rounded-2xl text-[12px] sm:text-[14px] font-black transition-all ${
                                !canEdit
                                    ? 'custom-main-color-button border-gray-300 opacity-50 cursor-not-allowed pointer-events-none'
                                    : 'custom-main-color-button custom-main-color-button-hover cursor-pointer'
                            }`}
                        >
                            <Edit2 size={16}/> Edit Profile
                        </button>
                    </div>

                    {/* Delete Profile Button */}
                    <button
                        onClick={handleDelete}
                        className={`px-3 py-2 sm:px-4 sm:py-3 bg-white border rounded-2xl shadow-sm transition-all ${
                            !canDelete
                                ? 'border-red-50 text-red-500 opacity-50 cursor-not-allowed'
                                : 'border-red-50 text-red-500 hover:bg-red-50 cursor-pointer'
                        }`}
                    >
                        <Trash2 size={20}/>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-6">
                    <div
                        className="card-theme border border-gray-100 rounded-[40px] p-8 md:p-12 shadow-sm relative overflow-hidden">
                        <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
                            <div
                                className="w-32 h-32 rounded-[32px] bg-gray-50 p-2 border border-gray-100 shadow-inner shrink-0 relative">
                                <img
                                    src={customer.image || `https://ui-avatars.com/api/?name=${customer.first_name}+${customer.last_name}&background=random`}
                                    alt="Profile"
                                    className="w-full h-full object-cover rounded-[24px]"
                                />
                                <div className={`absolute -bottom-1 -right-1 w-6 h-6 border-4 border-white rounded-full ${currentStatus === 'active' ? 'bg-emerald-500' : 'bg-rose-400'}`} />
                            </div>
                            <div className="text-center md:text-left">
                                <h2 className="text-3xl font-black text-[var(--header-text)] mb-1">{customer.first_name} {customer.last_name}</h2>
                                <p className="text-lg font-bold text-gray-400 mb-3">@{customer.first_name.toLowerCase()}{customer.id}</p>
                                <span className={`px-4 py-1.5 text-[10px] font-black rounded-full uppercase tracking-widest border ${
                                    customer.role === 'admin' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-500 border-blue-100'
                                }`}>
                                    {customer.role}
                                </span>
                            </div>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            <div className="flex items-center gap-4 p-5 card-theme rounded-[24px] transition-all group">
                                <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl group-hover:scale-110 transition-transform">
                                    <Mail size={22} />
                                </div>
                                <div>
                                    <p className="text-[14px] font-black text-[var(--header-text)] mb-0.5">Email Address</p>
                                    <p className="text-[12px] font-bold text-gray-500">{customer.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-5 card-theme rounded-[24px] transition-all group">
                                <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl group-hover:scale-110 transition-transform">
                                    <ShieldCheck size={22} />
                                </div>
                                <div>
                                    <p className="text-[14px] font-black text-[var(--header-text)] mb-0.5">Identity Verification</p>
                                    <p className="text-[12px] font-bold text-gray-500">Verified {customer.role}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-5 card-theme rounded-[20px] transition-all group">
                                <div className="p-3 bg-orange-50 text-orange-500 rounded-2xl group-hover:scale-110 transition-transform">
                                    <Activity size={22} />
                                </div>
                                <div>
                                    <p className="text-[14px] font-black text-[var(--header-text)] mb-0.5">Status</p>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${currentStatus === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-400'}`} />
                                        <p className="text-[12px] font-bold text-gray-500 capitalize">{currentStatus}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-5 card-theme rounded-[20px] transition-all group">
                                <div className="p-3 bg-purple-50 text-purple-500 rounded-2xl group-hover:scale-110 transition-transform">
                                    <Calendar size={22} />
                                </div>
                                <div>
                                    <p className="text-[14px] font-black text-[var(--header-text)] mb-0.5">Member Since</p>
                                    <p className="text-[12px] font-bold text-gray-500">
                                        {customer.created_at || customer.created_by?.created_at || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="xl:col-span-1 space-y-6">
                    <div className="card-theme rounded-[32px] p-8 shadow-sm">
                        <h3 className="text-lg font-black text-[var(--header-text)] mb-6 flex items-center gap-2">
                            <Clock size={20} className="text-gray-400"/> System Logs
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[14px] font-black text-[var(--header-text)] block mb-2">Internal ID</label>
                                <div
                                    className="card-theme rounded-[20px] p-3 text-[10px] font-mono font-bold text-gray-400 break-all">
                                    {customer.image_file_id || "NOT_ASSIGNED"}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-50 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-[14px] font-bold text-[var(--header-text)]">Registered</span>
                                    <span
                                        className="text-[12px] font-black text-[var(--header-text)]">{customer.created_at || customer.created_by?.created_at || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[14px] font-bold text-[var(--header-text)]">Last Updated</span>
                                    <span
                                        className="text-[12px] font-black text-[var(--header-text)]">{customer.updated_at || customer.updated_by?.updated_at || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Audit Info */}
                    <div className="card-theme rounded-[32px] p-8 shadow-sm border border-gray-50">
                        <div className="flex items-center gap-3 mb-8">
                            <Activity size={20} className="text-blue-500"/>
                            <h3 className="text-[18px] font-black text-[var(--header-text)]">Activity History</h3>
                        </div>
                        <div className="space-y-6">
                            {/* Render Created By Block */}
                            {customer.created_by && (
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center border-2 border-white shadow-sm">
                                        {customer.created_by.image ? (
                                            <img src={customer.created_by.image} alt="avatar"
                                                 className="w-full h-full object-cover"/>
                                        ) : (
                                            <span
                                                className="text-slate-400 font-black text-sm">{customer.created_by.first_name?.charAt(0)}</span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-[14px] font-black text-[var(--header-text)]">Created By</p>
                                        <p className="font-black text-[14px] text-slate-400">{customer.created_by.first_name} {customer.created_by.last_name}</p>
                                        <p className="text-[12px] font-bold text-slate-400">{customer.created_by.email}</p>
                                        <p className="text-[12px] font-bold text-[var(--header-text)] mt-1 flex items-center gap-1">
                                            <Calendar size={10}/> {customer.created_by.created_at}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Render Updated By Block */}
                            {customer.updated_by && (
                                <div className="flex items-center gap-4 pt-4 border-t border-gray-50">
                                    <div
                                        className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center border-2 border-white shadow-sm">
                                        {customer.updated_by.image ? (
                                            <img src={customer.updated_by.image} alt="avatar"
                                                 className="w-full h-full object-cover"/>
                                        ) : (
                                            <span
                                                className="text-slate-400 font-black text-sm">{customer.updated_by.first_name?.charAt(0)}</span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-[14px] font-black text-[var(--header-text)]">Last Updated
                                            By</p>
                                        <p className="font-black text-[14px] text-slate-400">{customer.updated_by.first_name} {customer.updated_by.last_name}</p>
                                        <p className="text-[12px] font-bold text-gray-400">{customer.updated_by.email}</p>
                                        <p className="text-[12px] font-bold text-[var(--header-text)] mt-1 flex items-center gap-1">
                                            <Calendar size={10}/> {customer.updated_by.updated_at}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {isEditModalOpen && (
                <EditStaff
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    user={customer}
                    onSuccess={handleEditSuccess}
                />
            )}
        </div>
    );
};

export default DetailsStaff;