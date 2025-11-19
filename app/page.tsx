import { DashboardWrapper } from "@/components/dashboard/dashboard-wrapper"
import { ChatInterface } from "@/components/chat-interface"

import {DataTable} from "@/components/data-table/data-table";
export default function Home() {

    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">

          <DashboardWrapper />
        <div className="px-6 py-8 bg-slate-50 dark:bg-slate-900/50">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[500px]">
                {/* Left: Data Table */}
                <div className="h-full">
                    <DataTable />
                </div>
                {/* Right: Chat Interface */}
                <div className="h-full">
                    <ChatInterface />
                </div>
            </div>
        </div>
    </main>
  )
}

