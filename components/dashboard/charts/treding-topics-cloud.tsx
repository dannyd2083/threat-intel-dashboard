"use client"

import { useEffect, useState } from "react"

interface TrendingTerm {
    term: string
    weight: number
}

interface ApiResponse {
    success: boolean
    data: TrendingTerm[]
    stats?: {
        storiesAnalyzed: number
        uniqueWords: number
        topWords: number
        daysQueried: number
    }
}

interface TopicWithColor extends TrendingTerm {
    color: string
}

// Color palette for the word cloud
const COLORS = [
    "text-blue-600 dark:text-blue-400",
    "text-purple-600 dark:text-purple-400",
    "text-green-600 dark:text-green-400",
    "text-red-600 dark:text-red-400",
    "text-yellow-600 dark:text-yellow-400",
    "text-pink-600 dark:text-pink-400",
    "text-indigo-600 dark:text-indigo-400",
    "text-teal-600 dark:text-teal-400",
    "text-cyan-600 dark:text-cyan-400",
    "text-orange-600 dark:text-orange-400",
]

// Calculate font size based on weight (0-100)
const getFontSize = (weight: number) => {
    const minSize = 14
    const maxSize = 32
    return minSize + (weight / 100) * (maxSize - minSize)
}

interface TrendingTopicsCloudProps {
    days: number
}

export function TrendingTopicsCloud({ days }: TrendingTopicsCloudProps) {
    const [topics, setTopics] = useState<TopicWithColor[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [stats, setStats] = useState<ApiResponse['stats'] | null>(null)

    useEffect(() => {
        async function fetchTrendingTopics() {
            try {
                setLoading(true)
                const response = await fetch(`/api/trending/hackernews?days=${days}`)
                const data: ApiResponse = await response.json()

                if (!data.success) {
                    throw new Error('Failed to fetch trending topics')
                }

                // Assign colors to topics
                const topicsWithColors = data.data.map((topic, index) => ({
                    ...topic,
                    color: COLORS[index % COLORS.length]
                }))

                setTopics(topicsWithColors)
                setStats(data.stats || null)
                setError(null)
            } catch (err) {
                console.error('Error fetching trending topics:', err)
                setError('Failed to load trending topics')
            } finally {
                setLoading(false)
            }
        }

        fetchTrendingTopics()
    }, [days])

    const maxWeight = topics[0]?.weight || 100
    const minWeight = topics[topics.length - 1]?.weight || 0

    // Generate time range label based on days
    const getTimeRangeLabel = () => {
        if (days === 1) return 'Last 24 hours'
        if (days === 7) return 'Last 7 days'
        if (days === 30) return 'Last 30 days'
        if (days >= 365) return `Last ${Math.floor(days / 365)} year${days >= 730 ? 's' : ''}`
        return `Last ${days} days`
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 shadow-sm h-[824px] flex flex-col">
            {/* Header - Fixed */}
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Trending Topics
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                    {loading ? 'Loading...' : getTimeRangeLabel()}
                </span>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Loading trending topics...</p>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            )}

            {/* Topics Cloud - Only this section scrolls */}
            {!loading && !error && topics.length > 0 && (
                <>
                    {/* Scrollable Topics Area */}
                    <div className="flex-1 overflow-y-auto min-h-0 pr-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
                        <div className="flex flex-wrap gap-3 items-center justify-center content-start p-4">
                            {topics.slice(0, 20).map((topic, index) => {
                                const fontSize = getFontSize(topic.weight)
                                return (
                                    <button
                                        key={index}
                                        className={`${topic.color} font-bold hover:scale-110 transition-transform cursor-pointer`}
                                        style={{ fontSize: `${fontSize}px` }}
                                        title={`Weight: ${topic.weight}`}
                                    >
                                        {topic.term}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Top Security Terms - Fixed at bottom */}
                    <div className="flex-shrink-0 mt-auto pt-4 border-t border-slate-200 dark:border-slate-800">
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                            Top Security Terms
                        </p>
                        <div className="space-y-2">
                            {topics.slice(0, 3).map((topic, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <span className={`text-sm font-medium ${topic.color}`}>
                                        {topic.term}
                                    </span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                        {topic.weight}% relevance
                                    </span>
                                </div>
                            ))}
                        </div>
                        {stats && (
                            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                                From {stats.storiesAnalyzed} Hacker News stories
                            </p>
                        )}
                    </div>
                </>
            )}

            {/* No Data State */}
            {!loading && !error && topics.length === 0 && (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            No trending topics found
                        </p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Try refreshing the data
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}