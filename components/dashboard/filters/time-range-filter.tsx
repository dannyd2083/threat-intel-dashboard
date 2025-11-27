"use client"

import {useState, useEffect, useRef} from "react"

interface TimeRangeFilterProps {
    onRangeChange: (days: number) => void
}

export function TimeRangeFilter({ onRangeChange }: TimeRangeFilterProps) {
    const [timeRange, setTimeRange] = useState("7 days")
    const [customDays, setCustomDays] = useState("")

    const timeRanges = ["24 hours", "7 days", "30 days", "Custom"]

    const onRangeChangeRef = useRef(onRangeChange)

    useEffect(() => {
        onRangeChangeRef.current = onRangeChange
    }, [onRangeChange])

    const convertToDays = (range: string): number => {
        switch (range) {
            case "24 hours":
                return 1
            case "7 days":
                return 7
            case "30 days":
                return 30
            default:
                return 7
        }
    }

    const handleTimeRangeChange = (value: string) => {
        setTimeRange(value)
        if (value !== "Custom") {
            setCustomDays("")
            const days = convertToDays(value)
            onRangeChange(days)
        }
    }

    useEffect(() => {
        if (timeRange === "Custom" && customDays) {
            const days = parseInt(customDays)
            if (days > 0 && days <= 1825) {
                onRangeChange(days)
            }
        }
    }, [customDays, timeRange, onRangeChange])
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
                <div className="mt-3">
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            min="1"
                            max="1825"
                            placeholder="Enter days"
                            value={customDays}
                            onChange={(e) => setCustomDays(e.target.value)}
                            className="flex-1 p-2.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                days
              </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Max: 1825 days (5 years)
                    </p>
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