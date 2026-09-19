"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle, AlertTriangle, Info, Trash2, X } from "lucide-react";


type ToastType = "success" | "error" | "info" | "warning";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
}

interface AlertContextValue {
  showToast: (message: string, type?: ToastType) => void;
  showConfirm: (options: ConfirmOptions) => Promise<boolean>;
}


const AlertContext = createContext<AlertContextValue | null>(null);

export function useAlert(): AlertContextValue {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error("useAlert must be used inside <AlertProvider>");
  return ctx;
}


const TOAST_STYLES: Record<ToastType, string> = {
  success: "bg-emerald-50 border-emerald-200 text-emerald-700",
  error:   "bg-red-50   border-red-200   text-red-600",
  info:    "bg-blue-50  border-blue-200  text-blue-600",
  warning: "bg-amber-50 border-amber-200 text-amber-600",
};

const TOAST_ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle  size={15} />,
  error:   <AlertTriangle size={15} />,
  info:    <Info          size={15} />,
  warning: <AlertTriangle size={15} />,
};

function ToastStack({ toasts, onClose }: { toasts: ToastItem[]; onClose: (id: number) => void }) {
  if (!toasts.length) return null;

  return (
      <div
          className="
        fixed z-[9999] flex flex-col gap-2 pointer-events-none
         top-15 left-0 right-0 px-10
        sm:top-25 sm:bottom-auto sm:left-1/2 sm:-translate-x-1/2 sm:px-0 sm:w-max
    "
      >
        {toasts.map((t) => (
            <div
                key={t.id}
                className={`
                pointer-events-auto flex items-center gap-2 pl-4 pr-3 py-2 
                rounded-2xl border shadow-lg text-sm font-semibold 
                transition-all animate-fade-in  card-theme
                max-sm:w-full max-sm:max-w-md max-sm:mx-auto 
                ${TOAST_STYLES[t.type]}
            `}
            >
              {TOAST_ICONS[t.type]}
              <span className="flex-1 truncate">{t.message}</span>

              <button
                  onClick={() => onClose(t.id)}
                  className="ml-1 p-1 rounded-lg hover:bg-black/10 transition-colors cursor-pointer"
                  aria-label="Dismiss"
              >
                <X size={14}/>
              </button>
            </div>
        ))}
      </div>

  );
}


const CONFIRM_ICON: Record<NonNullable<ConfirmOptions["variant"]>, React.ReactNode> = {
  danger: <Trash2 size={22} className="text-red-500"/>,
  warning: <AlertTriangle size={22} className="text-amber-500"/>,
  info: <Info size={22} className="text-blue-500"/>,
};

const CONFIRM_ICON_BG: Record<NonNullable<ConfirmOptions["variant"]>, string> = {
  danger: "bg-red-50    border-red-100",
  warning: "bg-amber-50  border-amber-100",
  info: "bg-blue-50   border-blue-100",
};

const CONFIRM_BTN: Record<NonNullable<ConfirmOptions["variant"]>, string> = {
  danger: "bg-red-500    hover:bg-red-600    text-white",
  warning: "bg-amber-500  hover:bg-amber-600  text-white",
  info: "bg-blue-500   hover:bg-blue-600   text-white",
};

interface ConfirmState extends ConfirmOptions {
  resolve: (value: boolean) => void;
  loading: boolean;
}

function ConfirmModalUI({
                          state,
                          onConfirm,
                          onCancel,
                        }: {
  state: ConfirmState;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const variant  = state.variant ?? "danger";
  const iconBg   = CONFIRM_ICON_BG[variant];
  const btnStyle = CONFIRM_BTN[variant];

  return (
      <div className="fixed inset-0 z-[9998] flex items-center justify-center px-4">
        {/* Backdrop */}
        <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onCancel}
        />

        {/* Dialog */}
        <div className="relative bg-white dark:bg-[var(--header-bg)] input-theme rounded-3xl shadow-2xl p-7 w-full max-w-sm border border-gray-100">
          {/* Icon */}
          <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center mx-auto mb-4 ${iconBg}`}>
            {CONFIRM_ICON[variant]}
          </div>

          <h3 className="text-center font-black text-base mb-1 text-[var(--header-text)]">
            {state.title ?? "Are you sure?"}
          </h3>
          <p className="text-center text-sm text-gray-400 font-medium mb-6 leading-relaxed">
            {state.message}
          </p>

          <div className="flex gap-3">
            <button
                onClick={onCancel}
                disabled={state.loading}
                className="flex-1 px-4 py-2.5 rounded-xl font-black text-sm border-2 border-gray-200 text-gray-500 hover:border-gray-300 transition-all cursor-pointer disabled:opacity-40 input-theme"
            >
              {state.cancelLabel ?? "Cancel"}
            </button>
            <button
                onClick={onConfirm}
                disabled={state.loading}
                className={`flex-1 px-4 py-2.5 rounded-xl font-black text-sm transition-all cursor-pointer disabled:opacity-60 ${btnStyle}`}
            >
              {state.loading
                  ? "Please wait..."
                  : (state.confirmLabel ?? "Confirm")}
            </button>
          </div>
        </div>
      </div>
  );
}

//----- Provider -----//
let _toastId = 0;

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [toasts,  setToasts]  = useState<ToastItem[]>([]);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);


  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = ++_toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const closeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);


  const showConfirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirm({ ...options, resolve, loading: false });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (!confirm) return;
    setConfirm((prev) => prev ? { ...prev, loading: true } : null);
    confirm.resolve(true);
    setTimeout(() => setConfirm(null), 300);
  }, [confirm]);

  const handleCancel = useCallback(() => {
    if (!confirm) return;
    confirm.resolve(false);
    setConfirm(null);
  }, [confirm]);

  return (
      <AlertContext.Provider value={{ showToast, showConfirm }}>
        {children}

        {/* Global Toast Stack */}
        <ToastStack toasts={toasts} onClose={closeToast} />

        {/* Global Confirm Modal */}
        {confirm && (
            <ConfirmModalUI
                state={confirm}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        )}
      </AlertContext.Provider>
  );
}