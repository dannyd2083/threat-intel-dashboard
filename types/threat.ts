export interface ThreatItem {
    id: string
    type: "CVE" | "Phishing"
    title: string
    severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "N/A"
    date: string
    source: string

    // CVE specific fields
    cve_id?: string
    vendor?: string
    product?: string
    cvss_score?: number
    description?: string

    // Phishing specific fields
    domain?: string
    url?: string
    target?: string
    status?: string
}

export interface FilterState {
    source: "All" | "CVE" | "Phishing"
    days: number
    severity: string
    vendor: string
}