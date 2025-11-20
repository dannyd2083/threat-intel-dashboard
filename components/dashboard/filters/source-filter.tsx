"use client"

interface SourceFilterProps {
    value: string
    onChange: (value: string) => void
}

export function SourceFilter({ value, onChange }: SourceFilterProps) {
    const sources = ["All", "CVE", "Phishing"]

    return (
        <div>
            <label className="text-sm font-medium mb-2 block text-slate-700 dark:text-slate-300">
                Source
            </label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
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