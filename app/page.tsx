import { ChatInterface } from "@/components/chat-interface"
import { Sidebar } from "@/components/dashboard/sidebar"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">

        <div className="flex">
            <Sidebar/>
            <DashboardContent />
        </div>

        <div className="px-6 py-8">
            <div className="max-w-6xl mx-auto">
                <ChatInterface />
            </div>
        </div>

    </main>
  )
}

