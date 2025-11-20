"use client"

import { useReducer, useEffect, useState } from "react"
import { Sidebar } from "./sidebar"
import { DashboardContent } from "./dashboard-content"
import { DataTable } from "@/components/data-table/data-table"
import { ChatInterface } from "@/components/chat-interface"
import { FilterState, ThreatItem } from "@/types/threat"

function filtersReducer(state: FilterState, action: Partial<FilterState>): FilterState {
    return { ...state, ...action }
}

export function DashboardWrapper() {
    const [filters, dispatch] = useReducer(filtersReducer, {
        source: 'All',
        days: 7,
        severity: 'All',
        vendor: 'All'
    })

    const [tableData, setTableData] = useState<ThreatItem[]>([])
    const [loading, setLoading] = useState(false)


    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalCount, setTotalCount] = useState(0)

    useEffect(() => {
        async function fetchThreats() {
            setLoading(true)
            try {
                const params = new URLSearchParams({
                    source: filters.source,
                    days: filters.days.toString(),
                    page: page.toString(),
                    pageSize: '10',
                })

                if (filters.severity !== 'All') {
                    params.append('severity', filters.severity)
                }

                if (filters.vendor !== 'All') {
                    params.append('vendor', filters.vendor)
                }

                const response = await fetch(`/api/threats?${params}`)
                const result = await response.json()

                if (result.success) {
                    setTableData(result.data)
                    setTotalPages(result.totalPages)
                    setTotalCount(result.total)
                }
            } catch (error) {
                console.error('Failed to fetch threats:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchThreats()
    }, [filters.source, filters.days, filters.severity, filters.vendor, page])


    useEffect(() => {
        setPage(1)
    }, [filters.source, filters.days, filters.severity, filters.vendor])

    return (
        <>
            <div className="flex items-stretch">
                <Sidebar
                    filters={filters}
                    onFiltersChange={dispatch}
                />
                <DashboardContent days={filters.days} />
            </div>

            <div className="px-6 py-8 bg-slate-50 dark:bg-slate-900/50">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[500px]">
                    <div className="h-full">
                        <DataTable
                            data={tableData}
                            loading={loading}
                            page={page}
                            totalPages={totalPages}
                            totalCount={totalCount}
                            onPageChange={setPage}
                        />
                    </div>
                    <div className="h-full">
                        <ChatInterface />
                    </div>
                </div>
            </div>
        </>
    )
}