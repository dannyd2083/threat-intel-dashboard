"use client"

import { SummaryCards } from "./cards/summary-cards"
import { CVEsOverTimeChart } from "@/components/dashboard/charts/cves-over-time-chart"
import { PhishingTrendsChart } from "@/components/dashboard/charts/phishing-trends-chart"
import { TrendingTopicsCloud } from "@/components/dashboard/charts/treding-topics-cloud"

interface DashboardContentProps {
    days: number
}

export function DashboardContent({ days }: DashboardContentProps) {
    return (
        <div className="flex-1 pt-6 px-6 pb-0">
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

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: CVE and Phishing Charts */}
                <div className="lg:col-span-2 space-y-6">
                    <CVEsOverTimeChart days={days} />
                    <PhishingTrendsChart days={days} />
                </div>

                {/* Right Column: Trending Topics */}
                <div className="lg:col-span-1">
                    <TrendingTopicsCloud days={days} />
                </div>
            </div>
        </div>
    )
}