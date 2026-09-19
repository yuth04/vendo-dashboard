"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 text-center">

            <h1 className="text-7xl font-bold custom-main-color-text">404</h1>

            <p className="mt-4 text-xl font-semibold text-gray-800">
                Page Not Found
            </p>

            <p className="mt-2 text-gray-500 max-w-md">
                Sorry, the page you are looking for does not exist or has been moved.
            </p>

            <Link
                href="/admin/dashboard"
                className="mt-8 inline-flex items-center gap-2 custom-main-color-button-hover custom-main-color-button text-white px-6 py-3 rounded-[20px] hover:bg-[#FF2D40] transition"
            >
                <ArrowLeft size={18} />
                Back to Home
            </Link>

        </div>
    )
}
