"use client"; 

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar() {
  const pathname = usePathname(); 

  return (
    <aside className="w-64 bg-[#1B2435] border-r border-slate-700/30 flex flex-col h-screen sticky top-0">
      
      <div className="h-24 flex items-center px-6 gap-3 cursor-pointer hover:bg-slate-700/10 transition-colors">
        <div className="relative w-14 h-14 shrink-0 overflow-hidden rounded-xl shadow-lg border border-slate-700/50 bg-[#1E293B]">
          <img 
            src="/alerto_logo1.png" 
            alt="Alerto Logo" 
            className="w-full h-full object-contain p-1"
            onError={(e) => {
               e.currentTarget.src = "/alerto_logo1.jpg.jpg";
            }}
          />
        </div>
        <div>
          <h1 className="text-white font-bold tracking-wide text-lg leading-tight">ALERTO</h1>
          <p className="text-xs text-slate-400">Admin Control</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1.5">
        <Link 
          href="/dashboard" 
          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            pathname === "/dashboard" 
              ? "bg-slate-400/20 text-white" 
              : "text-slate-400 hover:text-white hover:bg-slate-700/30" 
          }`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
          Dashboard
        </Link>

        <Link 
          href="/users" 
          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            pathname === "/users" 
              ? "bg-slate-400/20 text-white" 
              : "text-slate-400 hover:text-white hover:bg-slate-700/30" 
          }`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Users
        </Link>

        <Link 
          href="/devices" 
          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            pathname === "/devices" 
              ? "bg-slate-400/20 text-white" 
              : "text-slate-400 hover:text-white hover:bg-slate-700/30"
          }`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
          Devices
        </Link>

        <Link 
          href="/alarms" 
          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            pathname === "/alarms" 
              ? "bg-slate-400/20 text-white" 
              : "text-slate-400 hover:text-white hover:bg-slate-700/30"
          }`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          Alarms
        </Link>
      </nav>

      <div className="p-6 mt-auto">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-white">Mira Medilo</span>
          <span className="text-xs text-slate-500">System Admin</span>
        </div>
      </div>
    </aside>
  );
}