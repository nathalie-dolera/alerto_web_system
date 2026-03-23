import { getDashboardData } from "@/hooks/useDashboardData";
import { Sidebar } from "@/components/dashboard/sidebar";
import { StatCard } from "@/components/dashboard/stat-card";
import { UserTable } from "@/components/dashboard/user-table";



export default async function DashboardPage() {
  const dashboardData = await getDashboardData();
  const { stats, users } = dashboardData;

  return (
    <div className="min-h-screen bg-[#111827] flex font-sans">
      
      <Sidebar />

      <main className="flex-1 p-8 overflow-auto">
        
        <header className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
            <p className="text-slate-400">Real-time transit system health and monitoring</p>
          </div>
          <button className="flex items-center gap-2 bg-[#242F41] border border-slate-700/50 hover:bg-slate-700/50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export Report
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Active Users" value={stats.activeUsers} type="users" />
          <StatCard title="Connected Devices" value={stats.connectedDevices} type="devices" />
          <StatCard title="Alarms Triggered" value={stats.alarmsTriggered} type="alarms" />
        </div>

        <UserTable users={users} />

      </main>
    </div>
  );
}