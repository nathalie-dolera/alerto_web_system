import { Metadata } from "next";
import { getDashboardData } from "@/hooks/useDashboardData";
import { Sidebar } from "@/components/dashboard/sidebar";
import { StatCard } from "@/components/dashboard/stat-card";
import { UserTable } from "@/components/dashboard/user-table";
import { ExportButton } from "@/components/dashboard/export-button";

export const metadata: Metadata = {
  title: "Alerto | Dashboard",
};

export default async function DashboardPage() {
  const dashboardData = await getDashboardData();
  const { stats, users } = dashboardData;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#111827] flex font-sans transition-colors duration-200">
      
      <Sidebar />

      <main className="flex-1 p-8 overflow-auto">
        
        <header className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Dashboard Overview</h1>
            <p className="text-slate-500 dark:text-slate-400">Real-time transit system health and monitoring</p>
          </div>
          <ExportButton stats={stats} users={users} filename="alerto_dashboard_report.csv" label="Export Data" />
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Active Users" value={stats.activeUsers} type="users" href="/users?tab=Active" />
          <StatCard title="Mobile Users" value={stats.registeredUsers} type="registeredUsers" href="/users?tab=All%20Users" />
          <StatCard title="Connected Devices" value={stats.connectedDevices} type="devices" href="/devices" />
          <StatCard title="Alarms Triggered" value={stats.alarmsTriggered} type="alarms" href="/alarms" />
        </div>

        <UserTable users={users} />

      </main>
    </div>
  );
}