"use client"

import { useState } from "react"
import { ThreatItem } from "@/types/threat"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface DataTableProps {
    data: ThreatItem[]
    loading?: boolean
    page: number
    totalPages: number
    totalCount: number
    onPageChange: (page: number) => void
}

const getSeverityColor = (severity: string) => {
    switch (severity) {
        case "CRITICAL":
            return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
        case "HIGH":
            return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
        case "MEDIUM":
            return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
        case "LOW":
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
        default:
            return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400"
    }
}

export function DataTable({ data, loading = false, page, totalPages, totalCount, onPageChange }: DataTableProps) {
    const [selectedRow, setSelectedRow] = useState<string | null>(null)

    // Determine if we're showing phishing data
    const isPhishingData = data.length > 0 && data[0].type === "Phishing"

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
                            {totalCount} total items • Page {page} of {totalPages}
                        </p>
                    </div>
                    <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
                <div className="p-6">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-slate-500 dark:text-slate-400 animate-pulse">
                                Loading data...
                            </div>
                        </div>
                    ) : data.length === 0 ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-slate-500 dark:text-slate-400">
                                No data found. Try adjusting your filters.
                            </div>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800">
                                <th className="text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-3">
                                    ID
                                </th>
                                {isPhishingData ? (
                                    <>
                                        <th className="text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-3">
                                            Domain/URL
                                        </th>
                                        <th className="text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-3">
                                            Status
                                        </th>
                                        <th className="text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-3">
                                            Attack Type
                                        </th>
                                        <th className="text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-3">
                                            Date
                                        </th>
                                    </>
                                ) : (
                                    <>
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
                                            Vendor/Target
                                        </th>
                                        <th className="text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-3">
                                            Date
                                        </th>
                                    </>
                                )}
                            </tr>
                            </thead>
                            <tbody>
                            {data.map((item) => (
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
                                    {isPhishingData ? (
                                        <>
                                            <td className="py-3 text-sm text-slate-700 dark:text-slate-300 max-w-xs truncate">
                                                {item.domain || item.url || item.title}
                                            </td>
                                            <td className="py-3">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    item.status?.toLowerCase() === 'active'
                                                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                        : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                }`}>
                                                    {item.status || 'Unknown'}
                                                </span>
                                            </td>
                                            <td className="py-3 text-sm text-slate-700 dark:text-slate-300">
                                                {item.target || 'N/A'}
                                            </td>
                                            <td className="py-3 text-sm text-slate-500 dark:text-slate-400">
                                                {new Date(item.date).toLocaleDateString()}
                                            </td>
                                        </>
                                    ) : (
                                        <>
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
                                                {item.vendor || item.target || 'N/A'}
                                            </td>
                                            <td className="py-3 text-sm text-slate-500 dark:text-slate-400">
                                                {new Date(item.date).toLocaleDateString()}
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Pagination */}
            {!loading && totalPages > 1 && (
                <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                            Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, totalCount)} of {totalCount} results
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => onPageChange(page - 1)}
                                disabled={page === 1}
                                className="px-3 py-1 rounded border border-slate-300 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>

                            {/* Page numbers */}
                            <div className="flex gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum
                                    if (totalPages <= 5) {
                                        pageNum = i + 1
                                    } else if (page <= 3) {
                                        pageNum = i + 1
                                    } else if (page >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i
                                    } else {
                                        pageNum = page - 2 + i
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => onPageChange(pageNum)}
                                            className={`px-3 py-1 rounded border ${
                                                page === pageNum
                                                    ? 'bg-blue-500 text-white border-blue-500'
                                                    : 'border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                                            } transition-colors`}
                                        >
                                            {pageNum}
                                        </button>
                                    )
                                })}
                            </div>

                            <button
                                onClick={() => onPageChange(page + 1)}
                                disabled={page === totalPages}
                                className="px-3 py-1 rounded border border-slate-300 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}