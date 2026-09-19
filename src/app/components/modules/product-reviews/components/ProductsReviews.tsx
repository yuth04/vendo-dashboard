"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
    Search, ChevronRight, Loader2, Trash2, Send, Pencil, Check, X, MessageSquare, Eye, Calendar
} from 'lucide-react';
import { useAlert } from "@/src/app/components/context/AlertContext";
import { useRouter } from "next/navigation";
import { productsReviewsService } from "@/src/app/components/modules/product-reviews/core/services/productsReviewsService";
import { useProductsReviewsData } from "@/src/app/components/modules/product-reviews/core/hook/useProductsReviewsData";
import Pagination from "@/src/app/components/modules/product-reviews/components/Pagination";

const ProductsReviews = () => {
    const { showToast, showConfirm } = useAlert();

    const [searchQuery, setSearchQuery] = useState('');
    const [expandedReviews, setExpandedReviews] = useState<number[]>([]);
    const [replyInputs, setReplyInputs] = useState<{ [key: number]: string }>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [editingReplyId, setEditingReplyId] = useState<number | null>(null);
    const [editInputs, setEditInputs] = useState<{ [key: number]: string }>({});

    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Tracks broken reviewer and admin user profile images individually
    const [brokenImages, setBrokenImages] = useState<Record<string | number, boolean>>({});
    // Tracks broken product media images individually
    const [brokenProductImages, setBrokenProductImages] = useState<Record<string | number, boolean>>({});

    const router = useRouter();
    const itemsPerPage = 10;

    useEffect(() => {
        const storedUser = localStorage.getItem('auth_user');
        if (storedUser) {
            try {
                setCurrentUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Error parsing auth_user", error);
            }
        }
    }, []);

    const { data, loading, refetchData } = useProductsReviewsData<any>(
        productsReviewsService.fetchReviews,
        [],
        true
    );

    const reviews = Array.isArray(data) ? data : (data?.data || []);

    const toggleExpand = (id: number) => {
        setExpandedReviews(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSendReply = async (reviewId: number) => {
        const comment = replyInputs[reviewId];
        if (!comment?.trim()) return;
        setIsSubmitting(true);
        try {
            await productsReviewsService.replyToReview(reviewId, comment);
            setReplyInputs(prev => ({ ...prev, [reviewId]: '' }));
            showToast("Reply sent successfully", "success");
            refetchData();
        } catch (error) {
            console.error("Error sending reply:", error);
            showToast("Failed to send reply", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStartEdit = (reply: any) => {
        const isSuperAdmin = currentUser?.role === 'super-admin';
        const isOwner = reply?.user?.id === currentUser?.id;

        if (!isSuperAdmin && !isOwner) {
            showToast("Only super-admins or the reply author can edit this reply.", "error");
            return;
        }
        setEditingReplyId(reply.id);
        setEditInputs(prev => ({ ...prev, [reply.id]: reply.comment }));
    };

    const handleCancelEdit = () => setEditingReplyId(null);

    const handleUpdateReply = async (replyId: number) => {
        const comment = editInputs[replyId];
        if (!comment?.trim()) return;
        setIsSubmitting(true);
        try {
            await productsReviewsService.updateReply(replyId, comment);
            setEditingReplyId(null);
            showToast("Reply updated successfully", "success");
            refetchData();
        } catch (error) {
            console.error("Error updating reply:", error);
            showToast("Failed to update reply", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteReply = async (replyId: number) => {
        const confirmed = await showConfirm({
            title: "Delete Reply",
            message: "Are you sure you want to delete this reply? This action cannot be undone.",
            confirmLabel: "Delete",
            cancelLabel: "Cancel",
            variant: "danger",
        });
        if (!confirmed) return;

        setIsSubmitting(true);
        try {
            await productsReviewsService.deleteReply(replyId);
            showToast("Reply deleted successfully", "success");
            refetchData();
        } catch (error) {
            console.error("Error deleting reply:", error);
            showToast("Failed to delete reply", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredReviews = useMemo(() => {
        return reviews.filter((r: any) => {
            const firstName = r?.user?.first_name || "";
            const commentText = r?.comment || "";
            return (
                firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                commentText.toLowerCase().includes(searchQuery.toLowerCase())
            );
        });
    }, [reviews, searchQuery]);

    const totalPages = Math.max(1, Math.ceil(filteredReviews.length / itemsPerPage));
    const safePage = Math.min(currentPage, totalPages || 1);
    const startIndex = (safePage - 1) * itemsPerPage;
    const paginatedReviews = filteredReviews.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="min-h-screen sm:p-4 py-4 md:p-8">
            {/* HEADER */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 custom-main-color-card rounded-full flex items-center justify-center shrink-0">
                        <MessageSquare size={24} className="custom-main-color-icon"/>
                    </div>
                    <div>
                        <h1 className="text-[24px] md:text-[30px] font-bold text-[var(--header-text)]">Review Management</h1>
                        <p className="text-gray-500 text-[12px] md:text-sm mt-1">Monitor and manage customer feedback.</p>
                    </div>
                </div>
            </div>

            {/* SEARCH */}
            <div className="mb-6 card-theme rounded-[20px] p-3 shadow-sm flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                    <input
                        type="text"
                        placeholder="Search by user name or comment"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full pl-12 pr-4 py-3 input-theme rounded-[20px] outline-none focus:ring-1 focus:ring-emerald-500 text-base shadow-sm"
                    />
                </div>
            </div>

            {/* TABLE */}
            <div className="card-theme border border-gray-100 rounded-2xl overflow-hidden shadow-sm relative min-h-[400px]">
                {(loading || isSubmitting) && (
                    <div className="absolute inset-0 z-[20] flex items-center justify-center">
                        <Loader2 className="animate-spin custom-main-color-icon" size={32}/>
                    </div>
                )}

                <div className="block overflow-x-auto w-full">
                    <table className="w-full text-left border-separate border-spacing-0 min-w-[900px]">
                        <thead>
                        <tr className="text-[14px] font-bold text-[var(--header-text)] border-b bg-gray-50/50">
                            <th className="px-6 py-5">User</th>
                            <th className="px-6 py-5">Products</th>
                            <th className="px-6 py-5">Email</th>
                            <th className="px-6 py-5">Rating</th>
                            <th className="px-6 py-4">Comment</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-5">Status</th>
                            <th className="px-6 py-5 text-right pr-8">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                        {paginatedReviews.length > 0 ? (
                            paginatedReviews.map((review: any, idx: number) => {
                                const reviewKey = review.id || `rev-${idx}`;
                                const isExpanded = expandedReviews.includes(review.id);
                                const hasReplies = review.replies?.length > 0;

                                const userFirst = review.user?.first_name || '';
                                const userLast = review.user?.last_name || '';
                                const avatarInitials = `${userFirst.charAt(0)}${userLast.charAt(0)}`.toUpperCase() || '?';

                                return (
                                    <React.Fragment key={reviewKey}>
                                        <tr className="hover:bg-gray-50/50 transition-colors">
                                            <td className="pl-4 pr-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <button onClick={() => toggleExpand(review.id)}
                                                            className={`p-1.5 card-theme rounded-full text-gray-400 hover:bg-gray-100 transition-transform cursor-pointer ${isExpanded ? 'rotate-90' : ''}`}>
                                                        <ChevronRight size={14}/>
                                                    </button>
                                                    <div
                                                        className="sm:w-12 sm:h-12 w-10 h-10 rounded-full overflow-hidden bg-gray-100 border border-gray-100 shrink-0 flex items-center justify-center">
                                                        {review.user?.image && !brokenImages[reviewKey] ? (
                                                            <img
                                                                src={review.user.image}
                                                                alt="User"
                                                                className="w-full h-full object-cover"
                                                                onError={() => setBrokenImages(prev => ({
                                                                    ...prev,
                                                                    [reviewKey]: true
                                                                }))}
                                                            />
                                                        ) : (
                                                            <div
                                                                className="w-full h-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                                                {avatarInitials}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span
                                                        className="text-sm font-bold text-[var(--header-text)]">{userFirst} {userLast}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="sm:w-12 sm:h-12 w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 p-1 flex items-center justify-center overflow-hidden shrink-0">
                                                        {review.product?.image && !brokenProductImages[reviewKey] ? (
                                                            <img
                                                                src={review.product.image}
                                                                alt="Products"
                                                                className="max-w-full max-h-full object-contain mix-blend-multiply"
                                                                onError={() => setBrokenProductImages(prev => ({
                                                                    ...prev,
                                                                    [reviewKey]: true
                                                                }))}
                                                            />
                                                        ) : (
                                                            <div
                                                                className="w-full h-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-400 font-bold">
                                                                PKG
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span
                                                        className="text-[14px] text-[var(--header-text)] font-bold truncate max-w-[120px]">{review.product?.productName || ''}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4"><span
                                                className="text-sm text-[var(--header-text)] font-medium">{review.user?.email || ''}</span>
                                            </td>
                                            <td className="px-6 py-4"><span
                                                className="text-sm font-bold text-[var(--header-text)]">{review.rating || 0} ⭐</span>
                                            </td>
                                            <td className="px-6 py-4"><span
                                                className="text-sm text-[var(--header-text)] max-w-[200px] truncate block">{review.comment || ''}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 text-sm text-[var(--header-text)] max-w-[200px]">
                                                <Calendar className="w-4 h-4 text-gray-400 shrink-0"/>
                                                <span className="truncate">{review.created_at || ''}</span>
                                            </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-3 py-1.5 rounded-[20px] text-[10px] font-black border uppercase whitespace-nowrap ${review.is_approved ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 'bg-red-50 text-red-500 border-red-100'}`}>
                                                    {review.is_approved ? 'Approved' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right pr-8">
                                                <button
                                                    onClick={() => router.push(`/admin/product-reviews/${review.id}`)}
                                                    className="p-2 custom-main-color-bg-hover custom-main-color-text-hover rounded-full cursor-pointer"
                                                >
                                                    <Eye size={16}/>
                                                </button>
                                            </td>
                                        </tr>

                                        {isExpanded && (
                                            <tr className="card-theme border-l-2 border-emerald-500/20">
                                                <td colSpan={7} className="pl-20 pr-6 py-3">
                                                    {/* Existing Replies */}
                                                    {review.replies?.map((reply: any, rIdx: number) => {
                                                        const replyKey = reply.id || `rep-${reviewKey}-${rIdx}`;
                                                        const adminFirst = reply.user?.first_name || '';
                                                        const adminLast = reply.user?.last_name || '';
                                                        const adminInitials = `${adminFirst.charAt(0)}${adminLast.charAt(0)}`.toUpperCase() || 'A';

                                                        const isSuperAdmin = currentUser?.role === 'super-admin';
                                                        const isOwner = reply.user?.id === currentUser?.id;
                                                        const canEdit = isSuperAdmin || isOwner;

                                                        return (
                                                            <div key={replyKey} className="flex items-center gap-3 mb-2 group/reply">
                                                                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 border border-gray-100 shrink-0 flex items-center justify-center">
                                                                    {reply.user?.image && !brokenImages[replyKey] ? (
                                                                        <img
                                                                            src={reply.user.image}
                                                                            alt="Staff"
                                                                            className="w-full h-full object-cover"
                                                                            onError={() => setBrokenImages(prev => ({ ...prev, [replyKey]: true }))}
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                                                            {adminInitials}
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {editingReplyId === reply.id ? (
                                                                    <div className="flex items-center gap-2 flex-1">
                                                                        <input
                                                                            type="text"
                                                                            value={editInputs[reply.id] || ''}
                                                                            onChange={(e) => setEditInputs(prev => ({ ...prev, [reply.id]: e.target.value }))}
                                                                            onKeyDown={(e) => e.key === 'Enter' && handleUpdateReply(reply.id)}
                                                                            className="flex-1 px-4 py-1.5 border rounded-full text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                                                                            autoFocus
                                                                        />
                                                                        <button onClick={() => handleUpdateReply(reply.id)} className="p-1.5 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-colors">
                                                                            <Check size={13}/>
                                                                        </button>
                                                                        <button onClick={handleCancelEdit} className="p-1.5 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition-colors">
                                                                            <X size={13}/>
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center gap-2 flex-1">
                                                                        <div className="italic text-xs text-gray-400 flex-1">
                                                                            <span className={`font-bold ${
                                                                                reply.user?.role === 'super-admin' ? 'text-emerald-500' :
                                                                                    reply.user?.role === 'admin' ? 'text-red-400' :
                                                                                        reply.user?.role === 'staff' ? 'text-purple-600' :
                                                                                            'text-blue-500'
                                                                            }`}>
                                                                                {reply.user?.role === 'super-admin' ? 'Super Admin' :
                                                                                    reply.user?.role === 'admin' ? 'Admin' :
                                                                                        reply.user?.role === 'staff' ? 'Staff' :
                                                                                            'Customer'}
                                                                            </span>{" "}
                                                                            <span
                                                                                className="font-bold text-[var(--header-text)]">
                                                                                {adminFirst} {adminLast} :{' '}
                                                                            </span>

                                                                            <span>{reply.comment || ''}</span>
                                                                            <div
                                                                                className="ms-2 my-2 flex items-center flex-wrap gap-x-4">
                                                                                <span className="inline-flex items-center gap-1 text-[10px] text-[var(--header-text)]">
                                                                                    <Calendar className="w-3 h-3 opacity-70"/>
                                                                                    <span>{reply.created_at || ''}</span>
                                                                                </span>
                                                                                <span
                                                                                    className="text-[10px] text-[var(--header-text)]">
                                                                                    ({reply.created_at_human || ''})
                                                                                </span>
                                                                            </div>
                                                                        </div>

                                                                        <div className="flex gap-1">
                                                                            <button
                                                                                onClick={() => handleStartEdit(reply)}
                                                                                className={`p-1.5 rounded-lg transition-all cursor-pointer ${canEdit ? 'text-gray-300 hover:text-emerald-500 hover:bg-emerald-50' : 'text-gray-200/50 cursor-not-allowed opacity-50'}`}
                                                                                title={canEdit ? "Edit reply" : "Only super-admins or authors can edit"}
                                                                            >
                                                                                <Pencil size={13}/>
                                                                            </button>

                                                                            <button
                                                                                onClick={() => handleDeleteReply(reply.id)}
                                                                                className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                                                                            >
                                                                                <Trash2 size={13}/>
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}

                                                    {!hasReplies && (
                                                        <div className="flex items-center gap-2 mt-3 ml-11">
                                                            <input
                                                                type="text"
                                                                placeholder="Type a reply..."
                                                                value={replyInputs[review.id] || ''}
                                                                onChange={(e) => setReplyInputs(prev => ({
                                                                    ...prev,
                                                                    [review.id]: e.target.value
                                                                }))}
                                                                onKeyDown={(e) => e.key === 'Enter' && handleSendReply(review.id)}
                                                                className="flex-1 px-4 py-2 input-theme rounded-full text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                                                            />
                                                            <button
                                                                onClick={() => handleSendReply(review.id)}
                                                                className="p-2 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-colors cursor-pointer"
                                                            >
                                                                <Send size={14}/>
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })
                        ) : !loading && (
                            <tr>
                                <td colSpan={8}>
                                    <div className="flex flex-col py-20 text-center text-gray-400 italic text-[14px] items-center gap-3">
                                        <MessageSquare className="w-12 h-12 text-gray-300"/>
                                        <span>No reviews found.</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                {/* BOTTOM PACK (Total Items always shows, Pagination only displays if items > 10) */}
                {!loading && filteredReviews.length > 0 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center py-4 px-6 gap-4 border-t border-gray-50/50">
                        <div className="text-sm text-gray-500 font-medium">
                            Total items: <span className="font-bold text-emerald-500">{filteredReviews.length}</span><span className="px-1">Comments</span>
                        </div>
                        {filteredReviews.length > itemsPerPage && (
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

export default ProductsReviews;