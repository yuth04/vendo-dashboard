'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface Props {
    onClose: () => void;
    onApply: (start: Date, end: Date) => void;
    initialStart?: Date;
    initialEnd?: Date;
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const DateRangePicker: React.FC<Props> = ({ onClose, onApply, initialStart, initialEnd }) => {
    const today = startOfDay(new Date());
    const [viewYear, setViewYear]   = useState(initialStart?.getFullYear() ?? today.getFullYear());
    const [viewMonth, setViewMonth] = useState(initialStart?.getMonth() ?? today.getMonth());
    const [start, setStart]         = useState<Date | null>(initialStart ?? null);
    const [end, setEnd]             = useState<Date | null>(initialEnd ?? null);
    const [hovered, setHovered]     = useState<Date | null>(null);

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(v => v - 1); }
        else setViewMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(v => v + 1); }
        else setViewMonth(m => m + 1);
    };

    const rightMonth = viewMonth === 11 ? 0 : viewMonth + 1;
    const rightYear  = viewMonth === 11 ? viewYear + 1 : viewYear;

    const handleDayClick = (date: Date) => {
        if (!start || (start && end)) {
            setStart(date); setEnd(null);
        } else {
            if (date < start) { setEnd(start); setStart(date); }
            else { setEnd(date); }
        }
    };

    const inRange = (date: Date) => {
        const s = start, e = end ?? hovered;
        if (!s || !e) return false;
        const lo = s < e ? s : e;
        const hi = s < e ? e : s;
        return date > lo && date < hi;
    };

    const formatHeader = (d: Date) =>
        d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

    const renderMonth = (year: number, month: number, isRightCalendar: boolean = false) => {
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const cells: (Date | null)[] = [
            ...Array(firstDay).fill(null),
            ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1))
        ];
        while (cells.length % 7 !== 0) cells.push(null);

        return (
            <div className={`flex-1 ${isRightCalendar ? 'hidden md:block' : 'block'}`}>
                <p className="text-center font-bold text-[var(--header-text)] mb-4 text-sm">
                    {MONTHS[month]} {year}
                </p>
                <div className="grid grid-cols-7 mb-2">
                    {DAYS.map(d => (
                        <div key={d} className="text-center text-[10px] font-bold text-slate-400 py-1">{d}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7">
                    {cells.map((date, i) => {
                        if (!date) return <div key={i} className="h-9" />;
                        const isStart = start && isSameDay(date, start);
                        const isEnd   = end   && isSameDay(date, end);
                        const isToday = isSameDay(date, today);
                        const inR     = inRange(date);
                        const isSelected = isStart || isEnd;

                        return (
                            <button
                                key={i}
                                type="button"
                                onClick={() => handleDayClick(date)}
                                onMouseEnter={() => start && !end && setHovered(date)}
                                onMouseLeave={() => setHovered(null)}
                                className={`
                                    relative h-9 w-full text-[12px] font-bold transition-all
                                    ${isSelected ? 'text-white z-10' : isToday ? 'text-emerald-500' : 'text-slate-700 hover:text-slate-900'}
                                    ${inR ? 'bg-indigo-50' : ''}
                                `}
                            >
                                {inR && <span className="absolute inset-0 bg-indigo-50" />}
                                <span className={`relative z-10 flex items-center justify-center w-8 h-8 mx-auto rounded-full
                                    ${isSelected ? 'bg-slate-900 text-white' : isToday ? 'ring-1 ring-emerald-400' : ''}`}>
                                    {date.getDate()}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    const displayStart = start ?? today;
    const displayEnd   = end ?? start ?? today;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center md:justify-end pt-25 md:pt-20 px-4 md:pr-6 bg-black/10 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none" onClick={onClose}>
            <div
                className="card-theme rounded-3xl shadow-2xl border border-slate-100 p-4 md:p-6 w-full md:w-[680px] max-w-full overflow-y-auto max-h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4 md:mb-6">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Range</p>
                    <button type="button" onClick={onClose} className=" text-slate-400 hover:text-slate-700 transition-colors p-1 cursor-pointer">
                        <X size={18} />
                    </button>
                </div>

                <div className="flex items-center justify-center mb-6">
                    <div className="custom-main-color-button text-white px-4 md:px-6 py-2 rounded-2xl text-[12px] md:text-sm font-bold flex items-center gap-2 whitespace-nowrap">
                        <span>{formatHeader(displayStart)}</span>
                        <span className="text-slate-500">-</span>
                        <span>{formatHeader(displayEnd)}</span>
                    </div>
                </div>

                <div className="flex items-start justify-between mb-4 gap-2">
                    <button type="button" onClick={prevMonth} className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500 shrink-0 mt-10 md:mt-0">
                        <ChevronLeft size={18} />
                    </button>

                    <div className="flex flex-col md:flex-row gap-8 flex-1 px-1">
                        {renderMonth(viewYear, viewMonth, false)}
                        {renderMonth(rightYear, rightMonth, true)}
                    </div>

                    <button type="button" onClick={nextMonth} className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500 shrink-0 mt-10 md:mt-0">
                        <ChevronRight size={18} />
                    </button>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button type="button" onClick={onClose}
                            className="px-4 md:px-5 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer">
                        Cancel
                    </button>
                    <button
                        type="button"
                        disabled={!start}
                        onClick={() => start && onApply(start, end ?? start)}
                        className="px-4 md:px-5 py-2 rounded-xl text-sm font-bold bg-slate-900 text-white hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DateRangePicker;