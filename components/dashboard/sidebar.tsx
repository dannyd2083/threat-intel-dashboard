"use client"

import { useCallback } from "react"
import { TimeRangeFilter } from "./filters/time-range-filter"
import { SourceFilter } from "./filters/source-filter"
import { SeverityFilter } from "./filters/severity-filter"
import { VendorFilter } from "./filters/vendor-filter"
import { FilterState } from "@/types/threat"
import { LayoutDashboard, Bot } from "lucide-react"

interface SidebarProps {
    filters: FilterState
    onFiltersChange: (filters: Partial<FilterState>) => void
    activeTab: 'dashboard' | 'chatbot'
    onTabChange: (tab: 'dashboard' | 'chatbot') => void
}

export function Sidebar({ filters, onFiltersChange, activeTab, onTabChange }: SidebarProps) {
    const handleTimeRangeChange = useCallback((days: number) => {
        onFiltersChange({ days })
    }, [onFiltersChange])

    const handleSourceChange = useCallback((source: string) => {
        onFiltersChange({ source: source as any })
    }, [onFiltersChange])

    const handleSeverityChange = useCallback((severity: string) => {
        onFiltersChange({ severity })
    }, [onFiltersChange])

    const handleVendorChange = useCallback((vendor: string) => {
        onFiltersChange({ vendor })
    }, [onFiltersChange])

    const handleReset = useCallback(() => {
        onFiltersChange({
            source: 'All',
            days: 7,
            severity: 'All',
            vendor: 'All'
        })
    }, [onFiltersChange])

    return (
        <aside className="w-[280px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
            <div className="border-b border-slate-200 dark:border-slate-800">
                <div className="flex">
                    <button
                        onClick={() => onTabChange('dashboard')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition-colors relative ${
                            activeTab === 'dashboard'
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                        }`}
                    >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                        {activeTab === 'dashboard' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
                        )}
                    </button>
                    <button
                        onClick={() => onTabChange('chatbot')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition-colors relative ${
                            activeTab === 'chatbot'
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                        }`}
                    >
                        <Bot className="h-4 w-4" />
                        Chatbot
                        {activeTab === 'chatbot' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
                        )}
                    </button>
                </div>
            </div>

            <div className="flex-1 p-6 flex flex-col overflow-auto">
                {activeTab === 'dashboard' ? (
                    <>
                        <div className="mb-8">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                Filters
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Refine your threat intelligence data
                            </p>
                        </div>

                        <div className="space-y-6">
                            <TimeRangeFilter
                                onRangeChange={handleTimeRangeChange}
                            />

                            <SourceFilter
                                value={filters.source}
                                onChange={handleSourceChange}
                            />

                            {(filters.source === 'CVE' || filters.source === 'All') && (
                                <>
                                    <SeverityFilter
                                        value={filters.severity}
                                        onChange={handleSeverityChange}
                                    />

                                    <VendorFilter
                                        value={filters.vendor}
                                        onChange={handleVendorChange}
                                    />
                                </>
                            )}
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
                            <button
                                className="w-full px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                onClick={handleReset}
                            >
                                Reset Filters
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                AI Assistant
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Chat with threat intelligence expert
                            </p>
                        </div>
                        
                        <div className="flex-1 flex items-center justify-center text-center">
                            <div className="space-y-3">
                                <Bot className="h-16 w-16 mx-auto text-blue-500" />
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Threat Intelligence AI Assistant
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-500">
                                    Connected to real-time database for accurate threat intelligence analysis
                                </p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </aside>
    )
}