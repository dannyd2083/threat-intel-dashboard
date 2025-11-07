"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

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
            domains: Math.floor(Math.random() * 80) + 30,
        })
    }
    return data
}

export function PhishingTrendsChart() {
    const data = generateMockData()

    return (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Phishing Trends
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                        <span>Phishing Domains</span>
                    </div>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <defs>
                        <linearGradient id="colorDomains" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                        </linearGradient>
                    </defs>
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
                    <Area
                        type="monotone"
                        dataKey="domains"
                        stroke="#f97316"
                        strokeWidth={2}
                        fill="url(#colorDomains)"
                    />
                </AreaChart>
            </ResponsiveContainer>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Total</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        {data.reduce((sum, item) => sum + item.domains, 0)}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Average</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        {Math.round(data.reduce((sum, item) => sum + item.domains, 0) / data.length)}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Peak</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        {Math.max(...data.map((item) => item.domains))}
                    </p>
                </div>
            </div>
        </div>
    )
}