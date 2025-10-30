"use client"

import { useState } from "react"

export function TimeRangeFilter() {
    const [timeRange, setTimeRange] = useState("7 days")
    const [customDays, setCustomDays] = useState("")

    const timeRanges = ["24 hours", "7 days", "30 days", "Custom"]

    const handleTimeRangeChange = (value: string) => {
        setTimeRange(value)
        if (value !== "Custom") {
            setCustomDays("")
        }
    }
    return (
        <div>
            <label className="text-sm font-medium mb-2 block text-slate-700 dark:text-slate-300">
                Time Range
            </label>

            <select
                value={timeRange}
                onChange={(e) => handleTimeRangeChange(e.target.value)}
                className="w-full p-2.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
                {timeRanges.map((range) => (
                    <option key={range} value={range}>
                        {range}
                    </option>
                ))}
            </select>

            {timeRange === "Custom" && (
                <div className="mt-3 flex items-center gap-2">
                    <input
                        type="number"
                        min="1"
                        max="365"
                        placeholder="Enter days"
                        value={customDays}
                        onChange={(e) => setCustomDays(e.target.value)}
                        className="flex-1 p-2.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
            days
          </span>
                </div>
            )}

            {timeRange === "Custom" && customDays && (
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Selected: {customDays} days
                </p>
            )}
        </div>
    )
}