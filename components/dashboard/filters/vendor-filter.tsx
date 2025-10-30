"use client"

import { useState } from "react"

export function VendorFilter() {
    const [vendor, setVendor] = useState("Microsoft")

    const vendors = ["Microsoft", "Apple", "Google", "Adobe", "Oracle", "Cisco"]

    return (
        <div>
            <label className="text-sm font-medium mb-2 block text-slate-700 dark:text-slate-300">
                Vendor
            </label>
            <select
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                className="w-full p-2.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
                {vendors.map((vnd) => (
                    <option key={vnd} value={vnd}>
                        {vnd}
                    </option>
                ))}
            </select>
        </div>
    )
}