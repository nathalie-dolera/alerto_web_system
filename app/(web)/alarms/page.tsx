"use client";

import { useEffect } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { AlarmsTable } from "@/components/alarms/alarms-table";
import { ExportButton } from "@/components/dashboard/export-button";
import { useAlarms } from "@/hooks/useAlarms";

export default function AlarmsPage() {
  const { alarms, loading } = useAlarms();
  useEffect(() => {
    document.title = "Alerto | Alarm";
  }, []);

  return (
    <div className="min-h-screen bg-[#111827] flex font-sans">
      <Sidebar />

      <main className="flex-1 p-8 overflow-auto">
        <header className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Alarms Management</h1>
            <p className="text-slate-400">Monitor and resolve triggered security alarms across the facility</p>
          </div>
          <ExportButton data={alarms} filename="alerto_alarms_export.csv" label="Export Data" />
        </header>

        <div className="flex gap-6 border-b border-slate-700/50 mb-6">
          <button className="flex items-center gap-2 text-slate-400 hover:text-white font-medium pb-3 -mb-[1px]">
            Active Alarms
            <span className="bg-slate-700 text-white text-[10px] px-2 py-0.5 rounded-full">12</span>
          </button>
          <button className="text-blue-500 border-b-2 border-blue-500 font-medium pb-3 -mb-[1px]">
            Alarm History
          </button>
        </div>

        <div className="flex items-center gap-4 mb-2">
          <div className="relative flex-1 max-w-md">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input 
              type="text" 
              placeholder="Search by ID, User or Location..." 
              className="bg-[#1B2435] text-sm text-white border border-slate-700/50 rounded-lg pl-9 pr-4 py-2.5 w-full focus:outline-none focus:border-slate-500 placeholder:text-slate-500"
            />
          </div>

          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <select className="bg-[#1B2435] text-sm text-white border border-slate-700/50 rounded-lg pl-9 pr-8 py-2.5 appearance-none focus:outline-none focus:border-slate-500">
              <option>Date Range: All Time</option>
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
          </div>

          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="21" y1="4" x2="14" y2="4"/><line x1="10" y1="4" x2="3" y2="4"/><line x1="21" y1="12" x2="12" y2="12"/><line x1="8" y1="12" x2="3" y2="12"/><line x1="21" y1="20" x2="16" y2="20"/><line x1="12" y1="20" x2="3" y2="20"/><line x1="14" y1="2" x2="14" y2="6"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="16" y1="18" x2="16" y2="22"/></svg>
            <select className="bg-[#1B2435] text-sm text-white border border-slate-700/50 rounded-lg pl-9 pr-8 py-2.5 appearance-none focus:outline-none focus:border-slate-500">
              <option>Status: All</option>
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20 text-slate-400">Loading alarms...</div>
        ) : (
          <AlarmsTable alarms={alarms} />
        )}

      </main>
    </div>
  );
}