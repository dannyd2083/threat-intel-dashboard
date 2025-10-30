"use client"

import { SummaryCard } from "./summary-card"
import { Shield, Fish, MessageCircle } from "lucide-react"

// TODO: from API
interface SummaryData {
    totalCVEs: number
    phishingDomains: number
    totalTopics: number
}

export function SummaryCards() {
    // Mock data
    const data: SummaryData = {
        totalCVEs: 100,
        phishingDomains: 100,
        totalTopics: 100,
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