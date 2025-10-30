"use client"

import { ReactNode } from "react"
import { TrendingUp, TrendingDown } from "lucide-react"

interface SummaryCardProps {
    title: string
    value: number | string
    icon: ReactNode
    trend?: "up" | "down"
    trendValue?: string
    description?: string
}

export function SummaryCard({
                                title,
                                value,
                                icon,
                                trend,
                                trendValue,
                                description,
                            }: SummaryCardProps) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-start justify-between">
                {/* Left: Title and Value */}
                <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                        {title}
                    </p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                        {value}
                    </p>

                    {/* Trend indicator */}
                    {trend && trendValue && (
                        <div className="flex items-center gap-1 mt-2">
                            {trend === "up" ? (
                                <TrendingUp className="h-4 w-4 text-green-500" />
                            ) : (
                                <TrendingDown className="h-4 w-4 text-red-500" />
                            )}
                            <span
                                className={`text-xs font-medium ${
                                    trend === "up" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                                }`}
                            >
                {trendValue}
              </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                vs last period
              </span>
                        </div>
                    )}

                    {/* Optional description */}
                    {description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                            {description}
                        </p>
                    )}
                </div>

                {/* Right: Icon */}
                <div className="flex-shrink-0 ml-4">
                    <div className="text-5xl">{icon}</div>
                </div>
            </div>
        </div>
    )
}