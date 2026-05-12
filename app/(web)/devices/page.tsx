"use client";

import { useEffect } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { DevicesTable } from "@/components/devices/devices-table";
import { ExportButton } from "@/components/dashboard/export-button";
import { useDevices } from "@/hooks/useDevices";

export default function DevicesPage() {
  const { devices, stats, loading } = useDevices();
  
  useEffect(() => {
    document.title = "Alerto | Device";
  }, []);

  return (
    <div className="min-h-screen bg-[#111827] flex font-sans">
      <Sidebar />

      <main className="flex-1 p-8 overflow-auto">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">Device Management</h1>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <input 
                type="text" 
                placeholder="Search devices by ID or type..." 
                className="bg-[#242F41] text-sm text-white border border-slate-700/30 rounded-lg pl-9 pr-4 py-2 w-72 focus:outline-none focus:border-slate-500 placeholder:text-slate-500"
              />
            </div>
            <ExportButton data={devices} filename="alerto_devices_export.csv" label="Export Data" />
            <button className="flex items-center gap-2 bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              + Add New Device
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#242F41] rounded-xl p-6 shadow-sm border border-slate-700/30 flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-400 font-medium mb-1">Total Devices</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-white">{stats?.totalDevices || 0}</h3>
              </div>
            </div>
            <div className="text-blue-400"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m8 17 4 4 4-4"/></svg></div>
          </div>

          <div className="bg-[#242F41] rounded-xl p-6 shadow-sm border border-slate-700/30 flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-400 font-medium mb-1">Active Nodes</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-white">{stats?.activeNodes || 0}</h3>
              </div>
            </div>
            <div className="text-emerald-400"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg></div>
          </div>

          <div className="bg-[#242F41] rounded-xl p-6 shadow-sm border border-slate-700/30 flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-400 font-medium mb-1">Low Battery Alert</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-white">{stats?.lowBattery || 0}</h3>
              </div>
            </div>
            <div className="text-blue-500"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="16" height="22" x="4" y="2" rx="2" ry="2"/><line x1="12" x2="12" y1="18" y2="18.01"/></svg></div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20 text-slate-400">Loading devices...</div>
        ) : (
          <DevicesTable devices={devices} />
        )}

      </main>
    </div>
  );
}