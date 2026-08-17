"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { StatCard } from "@/components/dashboard/stat-card";
import { UserTable } from "@/components/dashboard/user-table";
import { ExportButton } from "@/components/dashboard/export-button";
import type { DashboardData } from "@/hooks/useDashboardData";

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  useEffect(() => {
    document.title = "Alerto | Dashboard";
    
    let isMounted = true;
    
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/dashboard");
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setDashboardData(data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      }
    }

    // Initial fetch
    fetchData();

    // Poll every 10 seconds to match mobile app heartbeat frequency
    const interval = setInterval(fetchData, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const { stats, users } = dashboardData ?? {};

  const allUsers = Array.isArray(users) ? users : [];

  return (
    <div className="flex h-screen overflow-hidden bg-[#151a23]">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
          </div>
          <ExportButton stats={stats} users={users} filename="alertodashboardreport.csv" label="Export Data" />
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard title="Active Users" value={stats?.activeUsers ?? "0"} type="users" href="/users?tab=Active" />
          <StatCard title="Mobile Users" value={stats?.registeredUsers ?? "0"} type="registeredUsers" href="/users?tab=All%20Users" />
          <StatCard title="Connected Devices" value={stats?.connectedDevices ?? "0"} type="devices" href="/devices" />
          <StatCard title="Alarms Triggered" value={stats?.alarmsTriggered ?? "0"} type="alarms" href="/alarms" />
        </div>

        <UserTable 
          users={allUsers} 
        />

      </main>
    </div>
  );
}