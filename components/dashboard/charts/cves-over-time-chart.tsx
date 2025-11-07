"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

// Mock data
const generateMockData = () => {
    const data = []
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)

    for (let i = 0; i < 30; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i)
        data.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            cves: Math.floor(Math.random() * 50) + 20,
        })
    }
    return data
}

export function CVEsOverTimeChart() {
    const data = generateMockData()

    return (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    CVEs Over Time
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                        <span>CVE Count</span>
                    </div>
                </div>
            </div>

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

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Total</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        {data.reduce((sum, item) => sum + item.cves, 0)}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Average</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        {Math.round(data.reduce((sum, item) => sum + item.cves, 0) / data.length)}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Peak</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        {Math.max(...data.map((item) => item.cves))}
                    </p>
                </div>
            </div>
        </div>
    )
}