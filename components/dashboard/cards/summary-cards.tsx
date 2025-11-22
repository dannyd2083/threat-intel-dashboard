"use client"
import { useEffect, useState } from "react"
import { SummaryCard } from "./summary-card"
import { Shield, Fish, MessageCircle } from "lucide-react"

// TODO: from API
interface SummaryData {
    totalCVEs: number
    phishingDomains: number
    criticalCVEs: number
    highCVEs: number
    activePhishing: number
}

export function SummaryCards() {
    const [data, setData] = useState<SummaryData>({
        totalCVEs: 0,
        phishingDomains: 0,
        criticalCVEs: 0,
        highCVEs: 0,
        activePhishing: 0,
    })

    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchStats() {
            try {
                const response = await fetch('/api/stats')
                const result = await response.json()

                if (result.success) {
                    setData({
                        totalCVEs: result.data.total_cves || 0,
                        phishingDomains: result.data.total_phishing || 0,
                        criticalCVEs: result.data.critical_cves || 0,
                        highCVEs: result.data.high_cves || 0,
                        activePhishing: result.data.active_phishing || 0,
                    })
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [])

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 shadow-sm animate-pulse">
                        <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Card 1: Total CVEs */}
            <SummaryCard
                title="Total CVEs"
                value={data.totalCVEs}
                icon={<Shield className="h-12 w-12 text-red-500" />}
                trend="up"
                trendValue="+12%"
                description="Common Vulnerabilities & Exposures"
            />

            {/* Card 2: Phishing Domains */}
            <SummaryCard
                title="Phishing Domains"
                value={data.phishingDomains}
                icon={<Fish className="h-12 w-12 text-orange-500" />}
                trend="down"
                trendValue="-8%"
                description="Detected malicious domains"
            />

            {/* Card 3: Total Topics */}
            <SummaryCard
                title="Total Topics"
                value={data.totalTopics}
                icon={<MessageCircle className="h-12 w-12 text-blue-500" />}
                trend="up"
                trendValue="+24%"
                description="Trending security discussions"
            />
        </div>
    )
}