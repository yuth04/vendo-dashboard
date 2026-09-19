'use client';

import React, { useState, useMemo } from 'react';
import {
    Plus,
    Edit3,
    Trash2,
    Loader2,
    ShieldCheck,
    ShieldAlert, Search, Filter, ChevronDown
} from 'lucide-react';
import { useAlert } from "@/src/app/components/context/AlertContext";
import AddSliderModal from "@/src/app/components/modules/settings/sliders/components/AddSliderModal";
import EditSliderModal from "@/src/app/components/modules/settings/sliders/components/EditSliderModal";
import { BsSliders2 } from "react-icons/bs";
import { slidersClient } from "@/src/app/components/modules/settings/sliders/core/api/sliderClient";
import { INITIAL_CAROUSEL_DATA } from "@/src/app/components/modules/settings/sliders/core/models/sliderModel";
import * as SliderService from "../core/services/sliderService";
import Pagination from "@/src/app/components/modules/settings/sliders/components/Pagination";
import {useSliderData} from "@/src/app/components/modules/settings/sliders/core/hook/useSliderData";

const Sliders = () => {
    const { showToast, showConfirm } = useAlert();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedSlider, setSelectedSlider] = useState<any>(null);
    const [statusLoadingId, setStatusLoadingId] = useState<number | null>(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Statuses");

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

    const { data, loading, error, refetchData: refresh } = useSliderData(
        slidersClient.fetchSliders,
        INITIAL_CAROUSEL_DATA,
        true
    );

    const slidersList = (data as any)?.carousels || [];

    const filteredList = useMemo(() => {
        return SliderService.filterSliders(slidersList, searchQuery, statusFilter);
    }, [slidersList, searchQuery, statusFilter]);

    const totalPages = Math.ceil(filteredList.length / itemsPerPage);
    const safePage = Math.min(currentPage, totalPages || 1);

    const currentItems = useMemo(() => {
        const indexOfLastItem = safePage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        return filteredList.slice(indexOfFirstItem, indexOfLastItem);
    }, [safePage, filteredList, itemsPerPage]);

    const handleToggleStatus = async (slider: any) => {
        const confirmed = await showConfirm({
            title: `${!slider.status ? 'Activate' : 'Deactivate'} Slider`,
            message: `Are you sure you want to ${!slider.status ? 'activate' : 'deactivate'} this slider?`,
            confirmLabel: !slider.status ? "Activate" : "Deactivate",
            variant: !slider.status ? "info" : "warning"
        });

        if (!confirmed) return;

        setStatusLoadingId(slider.id);
        try {
            const { response, newStatus } = await SliderService.toggleSliderStatusLogic(slider);

            if (!response.error) {
                showToast(`Slider ${newStatus ? 'activated' : 'deactivated'}`, "success");
                refresh();
            } else {
                showToast(response.error.message || "Failed to update status", "error");
            }
        } catch (err) {
            showToast("An unexpected error occurred", "error");
        } finally {
            setStatusLoadingId(null);
        }
    };

    const handleEditClick = (item: any) => {
        setSelectedSlider(item);
        setIsEditOpen(true);
    };

    const handleDeleteClick = async (id: number) => {
        const confirmed = await showConfirm({
            title: "Delete Slider?",
            message: "Are you sure you want to delete this carousel slide? This action cannot be undone.",
            confirmLabel: "Delete Now",
            variant: "danger"
        });

        if (confirmed) {
            try {
                const res = await SliderService.deleteSliderLogic(id);
                if (!res.error) {
                    showToast("Slider deleted successfully", "success");
                    refresh();
                } else {
                    showToast(res.error.message || "Failed to delete slider", "error");
                }
            } catch (err) {
                showToast("An error occurred during deletion", "error");
            }
        }
    };

    return (
        <div className="min-h-screen p-4 sm:p-8">
            <div className="mb-6 sm:mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full custom-main-color-card custom-main-color-text">
                        <BsSliders2 className="w-5 h-5 sm:w-6 sm:h-6"/>
                    </div>
                    <div>
                        <h1 className="text-lg sm:text-[20px] font-black text-[var(--header-text)]">Homepage Sliders</h1>
                        <p className="text-xs sm:text-sm text-gray-500">Manage main carousel slides.</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsAddOpen(true)}
                    className="flex items-center justify-center gap-2 rounded-full custom-main-color-button custom-main-color-button-hover px-6 py-2.5 text-sm font-bold text-white cursor-pointer w-full sm:w-auto"
                >
                    <Plus size={18}/> Add Slider
                </button>
            </div>

            <div className="mt-8 flex flex-col md:flex-row items-center gap-3 rounded-[20px] card-theme p-3 shadow-sm border border-gray-100">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                    <input type="text" value={searchQuery} onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                    }} placeholder="Search sliders by title..."
                           className="w-full rounded-[20px] input-theme py-3 pl-11 pr-4 text-base outline-none shadow-sm"/>
                </div>
                <div className="relative group min-w-[180px] w-full md:w-auto">
                    <select value={statusFilter} onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setCurrentPage(1);
                    }}
                            className="w-full appearance-none pl-11 pr-10 py-3 card-theme rounded-[20px] text-base font-bold text-slate-500 outline-none cursor-pointer shadow-sm">
                        <option value="All Statuses">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                    <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <ChevronDown size={16}
                                 className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                </div>
            </div>

            {loading && (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="animate-spin custom-main-color-icon mb-2" size={32}/>
                </div>
            )}

            {!loading && !error && (
                <>
                    {/* Mobile View */}
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                        {currentItems.map((item: any) => (
                            <div key={item.id} className="rounded-2xl card-theme bg-white p-4 space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex gap-3">
                                        <span className="rounded-[20px] bg-gray-100 px-2 py-1 text-[10px] font-black text-gray-900">#{item.position}</span>
                                        <span className={`inline-flex rounded-[20px] px-2 py-1 text-[9px] font-black tracking-wider ${item.status ? "bg-emerald-50 border border-emerald-200 text-emerald-600" : "bg-gray-100 text-gray-400"}`}>
                                            {item.status ? 'ACTIVE' : 'INACTIVE'}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEditClick(item)} className="p-2 text-gray-400 hover:text-blue-500 active:scale-90 transition-all cursor-pointer"><Edit3 size={16}/></button>
                                        <button onClick={() => handleToggleStatus(item)} disabled={statusLoadingId === item.id} className={`p-2 transition-all cursor-pointer ${item.status ? 'text-orange-500 hover:text-orange-600' : 'text-emerald-500 hover:text-emerald-600'}`}>
                                            {statusLoadingId === item.id ? <Loader2 size={16} className="animate-spin"/> : item.status ? <ShieldAlert size={16}/> : <ShieldCheck size={16}/>}
                                        </button>
                                        <button onClick={() => handleDeleteClick(item.id)} className="p-2 text-gray-400 hover:text-red-500 active:scale-90 transition-all cursor-pointer"><Trash2 size={16}/></button>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="h-16 w-24 shrink-0 overflow-hidden rounded-xl border border-gray-100 shadow-sm bg-white">
                                        <img src={item.image} alt={item.title} className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x200?text=No+Image"; }}/>
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-black text-sm text-[var(--header-text)] truncate">{item.title}</span>
                                        <span className="text-[11px] font-medium text-gray-400 line-clamp-2 mt-1">{item.description}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Table View */}
                    <div className="mt-6 hidden md:block overflow-hidden rounded-xl card-theme">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-[14px] font-semibold text-gray-500">
                            <tr>
                                <th className="pb-4 py-4 pl-4 w-24">position</th>
                                <th className="pb-4 py-4 w-40">Image</th>
                                <th className="pb-4 py-4">Title & Description</th>
                                <th className="pb-4 py-4 w-32">Status</th>
                                <th className="pb-4 text-right py-4 pr-4 w-32">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                            {currentItems.map((item: any) => (
                                <tr key={item.id} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="py-6 pl-4 font-black text-gray-900"><span className="rounded-lg bg-gray-100 px-2 py-1">#{item.position}</span></td>
                                    <td className="py-6"><div className="h-16 w-28 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"><img src={item.image} alt={item.title} className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x200?text=No+Image"; }}/></div></td>
                                    <td className="py-6"><div className="flex flex-col max-w-md"><span className="font-black text-[var(--header-text)] line-clamp-1">{item.title}</span><span className="text-xs font-medium text-[var(--header-text)] mt-1 line-clamp-2 leading-relaxed">{item.description}</span></div></td>
                                    <td className="py-6"><span className={`inline-flex rounded-[20px] px-3 py-1 text-[10px] font-black tracking-wider ${item.status ? "bg-emerald-50 border border-emerald-200 text-emerald-600" : "bg-gray-100 text-gray-400"}`}>{item.status ? 'ACTIVE' : 'INACTIVE'}</span></td>
                                    <td className="py-6 text-right pr-4">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleEditClick(item)} className="rounded-xl card-theme p-2 text-gray-400 hover:bg-white custom-main-color-text-hover hover:shadow-sm transition-all active:scale-90 cursor-pointer"><Edit3 size={18}/></button>
                                            <button onClick={() => handleToggleStatus(item)} disabled={statusLoadingId === item.id} className="rounded-xl card-theme p-2 text-gray-400 hover:bg-white hover:shadow-sm transition-all active:scale-90 cursor-pointer">
                                                {statusLoadingId === item.id ? <Loader2 size={18} className="animate-spin"/> : item.status ? <ShieldAlert size={18} className="text-orange-500"/> : <ShieldCheck size={18} className="text-emerald-500"/>}
                                            </button>
                                            <button onClick={() => handleDeleteClick(item.id)} className="rounded-xl card-theme p-2 text-gray-400 hover:bg-white hover:text-red-500 hover:shadow-sm transition-all active:scale-90 cursor-pointer"><Trash2 size={18}/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        {filteredList.length === 0 && (
                            <div className="flex flex-col py-20 text-center text-gray-400 italic text-[14px] items-center gap-3">
                                <BsSliders2 className="w-12 h-12 text-gray-300"/>
                                <span>No sliders found.</span>
                            </div>
                        )}
                    </div>

                    {/* BOTTOM PACK (Total Items & Pagination) */}
                    {filteredList.length > 0 && (
                        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 p-4 gap-4">
                            <div className="text-sm text-gray-500 font-medium">
                                Total items: <span
                                className="font-bold text-emerald-500">{filteredList.length}</span><span className="px-1">sliders</span>
                            </div>
                            {/* Clean Modular Pagination Navigation */}
                            <Pagination
                                currentPage={safePage}
                                totalPages={totalPages}
                                onPageChange={(page) => setCurrentPage(page)}
                            />
                        </div>
                    )}
                </>
            )}

            <AddSliderModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} refreshData={refresh} />
            <EditSliderModal isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setSelectedSlider(null); }} refreshData={refresh} editData={selectedSlider} />
        </div>
    );
};

export default Sliders;