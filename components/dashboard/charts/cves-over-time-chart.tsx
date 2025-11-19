"use client"

import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { format } from "date-fns"

interface TimelineData {
    date: string
    cves: number
}

interface CVEsOverTimeChartProps {
    days: number
}

export function CVEsOverTimeChart({ days }: CVEsOverTimeChartProps) {
    const [data, setData] = useState<TimelineData[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchTimeline() {
            setLoading(true)
            try {
                const response = await fetch(`/api/cves/timeline?days=${days}`)
                const result = await response.json()

                if (result.success && result.data) {
                    const formattedData = result.data.map((item: any) => ({
                        date: format(new Date(item.date), 'MMM dd'),
                        cves: parseInt(item.count)
                    }))
                    setData(formattedData)
                }
            } catch (error) {
                console.error('Failed to fetch CVE timeline:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchTimeline()
    }, [days])

    if (loading) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <div className="h-[350px] flex items-center justify-center">
                    <div className="text-slate-500 dark:text-slate-400 animate-pulse">Loading chart...</div>
                </div>
            </div>
        )
    }

    const total = data.reduce((sum, item) => sum + item.cves, 0)
    const average = data.length > 0 ? Math.round(total / data.length) : 0
    const peak = data.length > 0 ? Math.max(...data.map((item) => item.cves)) : 0

    return (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    CVEs Over Time ({days} days)
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                        <span>CVE Count</span>
                    </div>
                </div>
            </div>

            {data.length === 0 ? (
                <div className="h-[250px] flex items-center justify-center text-slate-500 dark:text-slate-400">
                    No data available for the last {days} days
                </div>
            ) : (
                <>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                            <XAxis
                                dataKey="date"
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                tickLine={{ stroke: '#cbd5e1' }}
                            />
                            <YAxis
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                tickLine={{ stroke: '#cbd5e1' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1e293b',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#f1f5f9',
                                }}
                                labelStyle={{ color: '#94a3b8' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="cves"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={{ fill: '#3b82f6', r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>

                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Total</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{total}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Average</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{average}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Peak</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{peak}</p>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}