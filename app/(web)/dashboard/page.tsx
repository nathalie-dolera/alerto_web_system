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
  const { stats, users } = dashboardData ?? {};

  const usersData = users as any;
  const allUsers = Array.isArray(usersData) ? usersData : (usersData?.items || []);

  const commuters = allUsers.filter((user: any) => 
    user?.role?.toLowerCase() === "commuter"
  );

  const overallUsers = commuters.length;
  const perPage = 10;
  const currentPage = 1; 
  const pageCount = Math.max(1, Math.ceil(overallUsers / perPage));
  
  const itemsToShow = commuters.slice(0, perPage);

  return (
    <div className="flex h-screen overflow-hidden bg-[#151a23]">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <header className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
            <p className="text-slate-400">Real-time transit system health and monitoring</p>
          </div>
          <ExportButton stats={stats} users={users} filename="alertodashboardreport.csv" label="Export Data" />
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard title="Active Users" value={stats?.activeUsers ?? 0} type="users" href="/users?tab=Active" />
          <StatCard title="Mobile Users" value={stats?.registeredUsers ?? 0} type="registeredUsers" href="/users?tab=All%20Users" />
          <StatCard title="Connected Devices" value={stats?.connectedDevices ?? 0} type="devices" href="/devices" />
          <StatCard title="Alarms Triggered" value={stats?.alarmsTriggered ?? 0} type="alarms" href="/alarms" />
        </div>

        {}
        <UserTable 
          users={itemsToShow} 
          currentPage={currentPage} 
          pageCount={pageCount} 
          currentPageItems={itemsToShow.length} 
          overallUsers={overallUsers} 
        />

      </main>
    </div>
  );
}