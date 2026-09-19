'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import passwords from "@/src/app/components/assets/images/auth/password.png";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { authService } from "@/src/app/components/modules/auth/core/services/authService";

declare global {
    interface Window {
        turnstile: {
            render: (container: string | HTMLElement, options: object) => string;
            reset: (widgetId: string) => void;
            remove: (widgetId: string) => void;
        };
        onTurnstileLoad: () => void;
    }
}

const Login = () => {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

    const turnstileRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);

    const renderTurnstile = useCallback(() => {

        if (!turnstileRef.current || widgetIdRef.current || !window.turnstile) return;

        try {
            widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
                sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!,
                callback: (token: string) => setTurnstileToken(token),
                'expired-callback': () => setTurnstileToken(null),
                'error-callback': () => setTurnstileToken(null),
                theme: 'light',
            });
        } catch (error) {
            console.error("Turnstile rendering failed:", error);
        }
    }, []);

    useEffect(() => {

        window.onTurnstileLoad = () => {
            renderTurnstile();
        };

        if (window.turnstile) {
            renderTurnstile();
        }

        return () => {
            if (widgetIdRef.current && window.turnstile) {
                window.turnstile.remove(widgetIdRef.current);
                widgetIdRef.current = null;
            }
        };
    }, [renderTurnstile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!turnstileToken) {
            setErrorMessage("Please complete the security check.");
            setStatus('error');
            return;
        }

        setLoading(true);
        setErrorMessage(null);
        setStatus('idle');

        const result = await authService.login({
            ...formData,
            "turnstileToken": turnstileToken,
            "cf-turnstile-response": turnstileToken,
            "cf_turnstile_response": turnstileToken,
            "captcha_token": turnstileToken,
            "captcha": turnstileToken
        });

        if (result.error) {
            setStatus('error');
            setLoading(false);

            if (widgetIdRef.current && window.turnstile) {
                window.turnstile.reset(widgetIdRef.current);
                setTurnstileToken(null);
            }

            const errorMsg = result.error?.message || '';
            const errorStatus = (result.error as any)?.status;

            if (errorStatus === 401 || errorMsg.includes('401') || errorMsg.toLowerCase().includes('credential')) {
                setErrorMessage('Invalid email or password');
            } else {
                setErrorMessage(errorMsg || 'Invalid email or password');
            }
        } else {
            setStatus('success');
            setLoading(false);
            setTimeout(() => {
                router.push('/admin/dashboard');
            }, 1500);
        }
    };

    return (
        <>
            <Script
                src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad"
                strategy="afterInteractive"
            />

            <div className="bg-[var(--header-bg)] flex flex-col py-2 lg:py-1 sm:px-6 lg:px-8">
                <div className="flex items-center justify-center sm:p-6">
                    <div className="max-w-4xl w-full bg-white rounded-[32px] card-theme overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 flex md:grid md:grid-cols-2">

                        <div className="hidden md:flex custom-main-color-card items-center justify-center p-12">
                            <div className="relative w-full aspect-square max-w-[280px] transition-transform hover:scale-105 duration-500">
                                <Image src={passwords} alt="Secure Sign In" fill className="object-contain" priority />
                            </div>
                        </div>

                        <div className="w-full p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-[var(--header-bg)]">
                            <div className="mb-8 text-center md:text-left">
                                <h1 className="text-[26px] font-bold tracking-tight custom-main-color-text text-center">
                                    Admin Login
                                </h1>
                            </div>

                            {status === 'error' && errorMessage && (
                                <div className="mb-6 p-4 flex items-center gap-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl animate-in fade-in slide-in-from-top-2">
                                    <AlertCircle size={18} className="flex-shrink-0" />
                                    <p className="font-medium text-[12px]">{errorMessage}</p>
                                </div>
                            )}

                            {status === 'success' && (
                                <div className="mb-6 p-4 flex items-center gap-3 text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl animate-in fade-in slide-in-from-top-2">
                                    <CheckCircle2 size={18} className="flex-shrink-0" />
                                    <div>
                                        <p className="font-bold">Login Successful!</p>
                                        <p className="text-emerald-500 text-[12px]">Redirecting to dashboard...</p>
                                    </div>
                                </div>
                            )}

                            <form className="space-y-5" onSubmit={handleSubmit}>
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-gray-500 ml-1">
                                        Email<span className="text-[#EB5757] ml-0.5">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        disabled={loading || status === 'success'}
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3.5 input-theme rounded-[20px] focus:ring-4 focus:ring-[#FF2D55]/5 focus:border-[#FF2D55] outline-none transition-all disabled:bg-gray-50 disabled:text-gray-400"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-gray-500 ml-1">
                                        Password<span className="text-[#EB5757] ml-0.5">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            disabled={loading || status === 'success'}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full px-4 py-3.5 pr-12 border input-theme rounded-[20px] focus:ring-4 focus:ring-[#FF2D55]/5 focus:border-[#FF2D55] bg-white outline-none transition-all disabled:bg-gray-50 disabled:text-gray-400"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 px-3"
                                        >
                                            {showPassword ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 01-1.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" /></svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div ref={turnstileRef} className="w-full min-h-[65px]" />

                                <div className="space-y-3 pt-2">
                                    <button
                                        type="submit"
                                        disabled={loading || status === 'success' || !turnstileToken}
                                        className={`w-full py-4 text-white font-bold rounded-[20px] transition-all shadow-lg cursor-pointer ${
                                            status === 'success'
                                                ? 'bg-emerald-500'
                                                : 'custom-main-color-button disabled:opacity-50 disabled:cursor-not-allowed'
                                        }`}
                                    >
                                        {loading
                                            ? 'Verifying...'
                                            : status === 'success'
                                                ? 'Authenticated'
                                                : !turnstileToken
                                                    ? 'Complete Verification'
                                                    : 'Sign In'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;