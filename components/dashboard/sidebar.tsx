"use client"

import { TimeRangeFilter } from "./filters/time-range-filter"
import { SourceFilter } from "./filters/source-filter"
import { SeverityFilter } from "./filters/severity-filter"
import { VendorFilter } from "./filters/vendor-filter"

export function Sidebar() {
    return (
        <aside className="w-[280px] min-h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6">
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
        </aside>
    )
}