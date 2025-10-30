"use client"

import { useState } from "react"

export function SeverityFilter() {
    const [severity, setSeverity] = useState("High")

    const severities = ["Critical", "High", "Medium", "Low"]

    return (
        <div>
            <label className="text-sm font-medium mb-2 block text-slate-700 dark:text-slate-300">
                Severity
            </label>
            <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full p-2.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
                {severities.map((sev) => (
                    <option key={sev} value={sev}>
                        {sev}
                    </option>
                ))}
            </select>
        </div>
    )
}