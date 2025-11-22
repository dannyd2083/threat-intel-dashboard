"use client"

interface Topic {
    name: string
    count: number
    color: string
}

// Mock data
const mockTopics: Topic[] = [
    { name: "#SecureTheGrid", count: 156, color: "text-blue-600 dark:text-blue-400" },
    { name: "#FutureOfDefense", count: 203, color: "text-purple-600 dark:text-purple-400" },
    { name: "#CyberDesignSystem", count: 89, color: "text-green-600 dark:text-green-400" },
    { name: "#DarkWebWatch", count: 134, color: "text-red-600 dark:text-red-400" },
    { name: "#CyberNova", count: 67, color: "text-yellow-600 dark:text-yellow-400" },
    { name: "#DarkModeDefense", count: 112, color: "text-pink-600 dark:text-pink-400" },
    { name: "#SecureByDesign", count: 45, color: "text-indigo-600 dark:text-indigo-400" },
    { name: "#HackFreeFuture", count: 98, color: "text-teal-600 dark:text-teal-400" },
    { name: "#ZeroTrustArch", count: 76, color: "text-cyan-600 dark:text-cyan-400" },
]

// 根据 count 计算字体大小
const getFontSize = (count: number, maxCount: number, minCount: number) => {
    const ratio = (count - minCount) / (maxCount - minCount)
    const minSize = 14
    const maxSize = 32
    return minSize + ratio * (maxSize - minSize)
}

export function TrendingTopicsCloud() {
    const maxCount = Math.max(...mockTopics.map((t) => t.count))
    const minCount = Math.min(...mockTopics.map((t) => t.count))

    return (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Trending Topics
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">
          Last 7 days
        </span>
            </div>

            {/* Topics Cloud */}
            <div className="flex-1 flex flex-wrap gap-3 items-center justify-center content-center p-4">
                {mockTopics.map((topic, index) => {
                    const fontSize = getFontSize(topic.count, maxCount, minCount)
                    return (
                        <button
                            key={index}
                            className={`${topic.color} font-bold hover:scale-110 transition-transform cursor-pointer`}
                            style={{ fontSize: `${fontSize}px` }}
                            title={`${topic.count} mentions`}
                        >
                            {topic.name}
                        </button>
                    )
                })}
            </div>

            {/* Top 3 Topics */}
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Top Topics
                </p>
                <div className="space-y-2">
                    {mockTopics
                        .sort((a, b) => b.count - a.count)
                        .slice(0, 3)
                        .map((topic, index) => (
                            <div key={index} className="flex items-center justify-between">
                <span className={`text-sm font-medium ${topic.color}`}>
                  {topic.name}
                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {topic.count} mentions
                </span>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    )
}