import { ChatInterface } from "@/components/chat-interface"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-2">
            Threat Intelligence Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            AI-powered threat intelligence analysis and query platform
          </p>
        </div>
        <div className="max-w-4xl mx-auto">
          <ChatInterface />
        </div>
      </div>
    </main>
  )
}

