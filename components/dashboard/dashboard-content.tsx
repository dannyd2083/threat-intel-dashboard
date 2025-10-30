"use client"

import { SummaryCards } from "./cards/summary-cards"

export function DashboardContent() {
    return (
        <div className="flex-1 p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-2">
                    Threat Intelligence Dashboard
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                    AI-powered threat intelligence analysis and query platform
                </p>
            </div>

            {/* Summary Cards */}
            <SummaryCards />

            {/* Charts Section Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Left: Charts placeholder */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 p-12 text-center">
                        <p className="text-slate-400 text-lg">📈 Charts coming in Phase 3</p>
                    </div>
                </div>

                {/* Right: Topics placeholder */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-slate-900 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 p-12 text-center h-full flex items-center justify-center">
                        <p className="text-slate-400 text-lg">☁️ Topics Cloud coming in Phase 3</p>
                    </div>
                </div>
            </div>
        </div>
    )
}