"use client"

import { useState } from "react"

export function SourceFilter() {
    const [source, setSource] = useState("CVE")

    const sources = ["CVE", "Phishing", "Twitter"]

    return (
        <div>
            <label className="text-sm font-medium mb-2 block text-slate-700 dark:text-slate-300">
                Source
            </label>
            <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full p-2.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
                {sources.map((src) => (
                    <option key={src} value={src}>
                        {src}
                    </option>
                ))}
            </select>
        </div>
    )
}