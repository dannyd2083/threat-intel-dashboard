"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { DashboardContent } from "./dashboard-content"

export function DashboardWrapper() {
    const [timeRange, setTimeRange] = useState(7)

    return (
        <div className="flex items-stretch">
            <Sidebar onTimeRangeChange={setTimeRange} />
            <DashboardContent days={timeRange} />
        </div>
    )
}