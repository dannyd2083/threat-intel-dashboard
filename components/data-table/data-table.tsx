"use client"

import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ThreatData {
    id: string
    type: "CVE" | "Phishing" | "Twitter"
    title: string
    severity: "Critical" | "High" | "Medium" | "Low"
    date: string
    source: string
}

// Mock data
const mockData: ThreatData[] = [
    { id: "CVE-2024-1234", type: "CVE", title: "Remote Code Execution in Apache", severity: "Critical", date: "2024-11-05", source: "NVD" },
    { id: "CVE-2024-1235", type: "CVE", title: "SQL Injection in WordPress Plugin", severity: "High", date: "2024-11-04", source: "NVD" },
    { id: "CVE-2024-1236", type: "CVE", title: "XSS Vulnerability in React App", severity: "Medium", date: "2024-11-03", source: "NVD" },
    { id: "PHISH-001", type: "Phishing", title: "microsoft-login-fake.com", severity: "High", date: "2024-11-05", source: "PhishTank" },
    { id: "PHISH-002", type: "Phishing", title: "paypal-security-update.net", severity: "Critical", date: "2024-11-04", source: "OpenPhish" },
    { id: "TWEET-001", type: "Twitter", title: "#ZeroDayAlert - New exploit found", severity: "High", date: "2024-11-05", source: "Twitter" },
    { id: "CVE-2024-1237", type: "CVE", title: "Buffer Overflow in Linux Kernel", severity: "Critical", date: "2024-11-02", source: "NVD" },
    { id: "PHISH-003", type: "Phishing", title: "amazon-verification.org", severity: "Medium", date: "2024-11-03", source: "PhishTank" },
    { id: "TWEET-002", type: "Twitter", title: "#RansomwareAlert - New variant detected", severity: "High", date: "2024-11-04", source: "Twitter" },
    { id: "CVE-2024-1238", type: "CVE", title: "Path Traversal in Node.js", severity: "High", date: "2024-11-01", source: "NVD" },
]

const getSeverityColor = (severity: string) => {
    switch (severity) {
        case "Critical":
            return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
        case "High":
            return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
        case "Medium":
            return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
        case "Low":
            return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
        default:
            return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400"
    }
}

const getTypeColor = (type: string) => {
    switch (type) {
        case "CVE":
            return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
        case "Phishing":
            return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
        case "Twitter":
            return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400"
        default:
            return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400"
    }
}

export function DataTable() {
    const [selectedRow, setSelectedRow] = useState<string | null>(null)

    return (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm h-full flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                            Filtered Results
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {mockData.length} items found
                        </p>
                    </div>
                    <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Table */}
            <ScrollArea className="flex-1">
                <div className="p-6">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800">
                            <th className="text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-3">
                                ID
                            </th>
                            <th className="text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-3">
                                Type
                            </th>
                            <th className="text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-3">
                                Title
                            </th>
                            <th className="text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-3">
                                Severity
                            </th>
                            <th className="text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-3">
                                Date
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {mockData.map((item) => (
                            <tr
                                key={item.id}
                                onClick={() => setSelectedRow(item.id)}
                                className={`border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${
                                    selectedRow === item.id ? "bg-blue-50 dark:bg-blue-900/20" : ""
                                }`}
                            >
                                <td className="py-3 text-sm font-mono text-slate-900 dark:text-slate-100">
                                    {item.id}
                                </td>
                                <td className="py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                      {item.type}
                    </span>
                                </td>
                                <td className="py-3 text-sm text-slate-700 dark:text-slate-300 max-w-xs truncate">
                                    {item.title}
                                </td>
                                <td className="py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(item.severity)}`}>
                      {item.severity}
                    </span>
                                </td>
                                <td className="py-3 text-sm text-slate-500 dark:text-slate-400">
                                    {item.date}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </ScrollArea>
        </div>
    )
}