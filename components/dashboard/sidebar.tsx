"use client"

import { LayoutDashboard, MessageSquare } from "lucide-react"
import { TimeRangeFilter } from "./filters/time-range-filter"
import { SourceFilter } from "./filters/source-filter"
import { SeverityFilter } from "./filters/severity-filter"
import { VendorFilter } from "./filters/vendor-filter"

interface SidebarProps {
    viewMode: "dashboard" | "chat"
    onViewModeChange: (mode: "dashboard" | "chat") => void
}

export function Sidebar({ viewMode, onViewModeChange }: SidebarProps) {
    return (
        <aside className="w-[280px] min-h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6">
            {/* View Mode Toggle */}
            <div className="mb-8">
                <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <button
                        onClick={() => onViewModeChange("dashboard")}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                            viewMode === "dashboard"
                                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                        }`}
                    >
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Dashboard</span>
                    </button>
                    <button
                        onClick={() => onViewModeChange("chat")}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                            viewMode === "chat"
                                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                        }`}
                    >
                        <MessageSquare className="h-4 w-4" />
                        <span>Chat</span>
                    </button>
                </div>
            </div>

            {/* Conditional Content based on View Mode */}
            {viewMode === "dashboard" && (
                <>
                    {/* Sidebar Header */}
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                            Filters
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Refine your threat intelligence data
                        </p>
                    </div>

                    {/* Filter Components */}
                    <div className="space-y-6">
                        <TimeRangeFilter />
                        <SourceFilter />
                        <SeverityFilter />
                        <VendorFilter />
                    </div>

                    {/* Optional: Reset Filters Button */}
                    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
                        <button
                            className="w-full px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            onClick={() => {
                                // TODO: Implement reset filters functionality
                                console.log("Reset filters")
                            }}
                        >
                            Reset Filters
                        </button>
                    </div>
                </>
            )}

            {viewMode === "chat" && (
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        AI Assistant
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Intelligent threat intelligence analysis and queries
                    </p>
                </div>
            )}
        </aside>
    )
}