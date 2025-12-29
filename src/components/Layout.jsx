import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { cn } from '../lib/utils'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* Content Area */}
      <div className={cn(
        "flex flex-col min-h-screen transition-all duration-300",
        sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-[260px]"
      )}>
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
