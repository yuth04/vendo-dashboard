"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAlert } from "@/src/app/components/context/AlertContext";
import {
    Loader2, ChevronLeft, Star, Send, Pencil,
    Check, X, Trash2, ImageOff, BadgeCheck, Clock, MessageSquare, Calendar
} from 'lucide-react';
import { productsReviewsService } from "@/src/app/components/modules/product-reviews/core/services/productsReviewsService";
import {PageLoader} from "@/src/app/components/helpers/components/PageLoader";
import {DataNotFound} from "@/src/app/components/helpers/components/DataNotFound";

const ProductsReviewsDetails = () => {
    const { id } = useParams();
    const router = useRouter();
    const { showToast, showConfirm } = useAlert();

    const [review, setReview] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [replyInput, setReplyInput] = useState('');
    const [editingReplyId, setEditingReplyId] = useState<number | null>(null);
    const [editInput, setEditInput] = useState('');


    const fetchReviewDetails = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const response: any = await productsReviewsService.fetchReviewById(id as string);
            setReview(response?.data?.data || response?.data || null);
        } catch (error) {
            console.error("Failed to fetch review details", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchReviewDetails(); }, [id]);


    const handleSendReply = async () => {
        if (!replyInput.trim()) return;
        setIsSubmitting(true);
        try {
            await productsReviewsService.replyToReview(review.id, replyInput);
            setReplyInput('');
            showToast("Reply sent successfully", "success");
            fetchReviewDetails();
        } catch {
            showToast("Failed to send reply", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStartEdit = (reply: any) => {
        setEditingReplyId(reply.id);
        setEditInput(reply.comment);
    };

    const handleCancelEdit = () => setEditingReplyId(null);


    const handleUpdateReply = async (replyId: number) => {
        if (!editInput.trim()) return;
        setIsSubmitting(true);
        try {
            await productsReviewsService.updateReply(replyId, editInput);
            setEditingReplyId(null);
            showToast("Reply updated successfully", "success");
            fetchReviewDetails();
        } catch {
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
            fetchReviewDetails();
        } catch {
            showToast("Failed to delete reply", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return (
        <PageLoader/>
    );

    if (!review) return (
        <DataNotFound
            title="Review not found."
            message="We couldn't find any reviews matching your search criteria."
            icon={MessageSquare}
        />
    );



    const hasReplies = review.replies?.length > 0;
    const stars = Array.from({ length: 5 }, (_, i) => i < review.rating);

    // Dynamic role mapping fallback from first reply or standard 'admin' context
    const computedRole = review.replies?.[0]?.user?.role || 'admin';

    return (
        <div className="min-h-screen sm:p-4 py-4 md:p-8 relative">
            {/* Action overlay indicator triggered dynamically on mutation logic processing */}
            {isSubmitting && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/20 backdrop-blur-[1px]">
                    <Loader2 className="animate-spin custom-main-color-icon" size={32}/>
                </div>
            )}

            <button
                onClick={() => router.back()}
                className="mb-6 flex items-center gap-2 text-[var(--header-text)] custom-main-color-text-hover transition-colors uppercase text-[12px] sm:text-[14px] font-black cursor-pointer"
            >
                <ChevronLeft size={24}/> Back to Reviews
            </button>

            <div className="card-theme rounded-[20px] p-6 shadow-sm mb-5">
                <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
                    <div className="flex items-center gap-4">
                        <img
                            src={review.user?.image || '/placeholder.png'}
                            alt="User"
                            className="w-14 h-14 rounded-full object-cover border-2 border-gray-100"
                        />
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-lg font-black text-[var(--header-text)]">
                                    {review.user?.first_name} {review.user?.last_name}
                                </h2>
                                <span className="inline-flex items-center ms-6 gap-2 text-sm text-gray-400">
                                    <Calendar className="w-4 h-4 text-gray-400 shrink-0"/>
                                    <span>{review.created_at || ''}</span>
                                </span>
                                <span className="text-[12px] text-gray-400 opacity-80">
                                    ({review.created_at_human})
                                </span>
                            </div>
                            <p className="text-sm text-gray-400">{review.user?.email}</p>
                            <span className={`mt-1 inline-block text-[10px] font-black px-2 py-0.5 rounded-full border uppercase
                                ${review.user?.role === 'admin' ? 'bg-purple-50 text-purple-500 border-purple-100' : 'bg-blue-50 text-blue-500 border-blue-100'}`}>
                                {review.user?.role}
                            </span>
                        </div>
                    </div>

                    {/* Approved badge */}
                    <span className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-[20px] text-[11px] font-black border uppercase
                        ${review.is_approved ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 'bg-red-50 text-red-500 border-red-100'}`}>
                        {review.is_approved ? <BadgeCheck size={13}/> : <Clock size={13}/>}
                        {review.is_approved ? 'Approved' : 'Pending'}
                    </span>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-1 mb-4">
                    {stars.map((filled, i) => (
                        <Star key={i} size={18}
                              className={filled ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}/>
                    ))}
                    <span className="ml-2 text-sm font-bold text-[var(--header-text)]">{review.rating}/5</span>
                </div>

                {/* Comment */}
                <div className="p-4 input-theme rounded-xl text-sm text-gray-600 leading-relaxed">
                    {review.comment}
                </div>

                {/* Review image (if any) */}
                {review.image ? (
                    <div className="mt-4">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Attached Image</p>
                        <img
                            src={review.image}
                            alt="Review"
                            className="rounded-xl max-h-56 object-cover border border-gray-100"
                        />
                    </div>
                ) : (
                    <div className="mt-4 flex items-center gap-2 text-gray-300 text-xs">
                        <ImageOff size={14}/> No image attached
                    </div>
                )}
            </div>

            {/* ── Products Card ── */}
            <div className="card-theme rounded-[20px] p-6 shadow-sm mb-5">
                <h3 className="text-[16px] font-black text-[var(--header-text)] mb-4">Reviewed Products</h3>
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 p-1 flex items-center justify-center overflow-hidden shrink-0">
                        <img
                            src={review.product?.image || '/placeholder.png'}
                            alt="Products"
                            className="max-w-full max-h-full object-contain mix-blend-multiply"
                        />
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-[var(--header-text)]">{review.product?.productName}</p>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{review.product?.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="text-emerald-500 font-black text-sm">${review.product?.discount_price || review.product?.price}</span>
                            {review.product?.discount_price && (
                                <span className="text-gray-300 line-through text-xs">${review.product?.price}</span>
                            )}
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase
                                ${review.product?.status === 'active' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                                {review.product?.status}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Replies Card ── */}
            <div className="card-theme rounded-[20px] p-6 shadow-sm">
                <h3 className="text-[16px] font-black text-[var(--header-text)] mb-4 capitalize">
                    {computedRole} Replies ({review.replies?.length ?? 0})
                </h3>

                {/* Reply list */}
                {hasReplies ? (
                    <div className="space-y-3 mb-5">
                        {review.replies.map((reply: any) => (
                            <div key={reply.id} className="flex items-start gap-3 group/reply">
                                <img
                                    src={reply.user?.image || '/placeholder.png'}
                                    alt="Staff"
                                    className="w-9 h-9 rounded-full object-cover border border-gray-100 shrink-0 mt-0.5"
                                />
                                <div className="flex-1">
                                    {editingReplyId === reply.id ? (
                                        // Edit mode
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={editInput}
                                                onChange={(e) => setEditInput(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleUpdateReply(reply.id)}
                                                autoFocus
                                                className="flex-1 px-4 py-2 input-theme border rounded-full text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                                            />
                                            <button onClick={() => handleUpdateReply(reply.id)} className="p-1.5 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-colors cursor-pointer">
                                                <Check size={13}/>
                                            </button>
                                            <button onClick={handleCancelEdit} className="p-1.5 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition-colors cursor-pointer">
                                                <X size={13}/>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-start gap-2">
                                            <div className="flex-1 input-theme rounded-2xl rounded-tl-none px-4 py-2.5">
                                                <div className="flex items-center gap-1.5 mb-0.5 text-[14px] font-black text-[var(--header-text)]">
                                                    <span>{reply.user?.first_name} {reply.user?.last_name}</span>
                                                    <span
                                                        className="ml-1.5 text-[14px] font-bold text-purple-400 normal-case">
                                                        {reply.user?.role || 'admin'}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 text-[12px] ms-3 text-[var(--header-text)] font-normal">
                                                        <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0"/>
                                                        <span>{reply.created_at || ''}</span>
                                                    </span>
                                                    <span
                                                        className="text-[10px] ms-1 text-[var(--header-text)] font-normal opacity-70">
                                                        ({reply.created_at_human})
                                                    </span>
                                                </div>
                                                <p className="text-[12px] pt-1 text-[var(--header-text)]">
                                                    {reply.comment}
                                                </p>
                                            </div>
                                            <div
                                                className="flex gap-1 opacity-0 group-hover/reply:opacity-100 transition-opacity pt-1">
                                                <button onClick={() => handleStartEdit(reply)}
                                                        className="p-1.5 text-gray-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer">
                                                    <Pencil size={13}/>
                                                </button>
                                                <button onClick={() => handleDeleteReply(reply.id)}
                                                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer">
                                                    <Trash2 size={13}/>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-300 italic mb-5">No replies yet. Be the first to respond.</p>
                )}

                {!hasReplies && (
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            placeholder="Type a reply..."
                            value={replyInput}
                            onChange={(e) => setReplyInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                            className="flex-1 px-4 py-2.5 input-theme border rounded-full text-sm outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        <button
                            onClick={handleSendReply}
                            className="p-2.5 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-colors cursor-pointer"
                        >
                            <Send size={16}/>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductsReviewsDetails;