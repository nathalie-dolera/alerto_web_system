import { Sidebar } from "@/components/dashboard/sidebar";
import { UsersTable } from "@/components/users/users-table";

export default function UsersPage() {
  return (
    <div className="min-h-screen bg-[#111827] flex font-sans">
      <Sidebar />

      <main className="flex-1 p-8 overflow-auto">
        <header className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
            <p className="text-slate-400">Manage and monitor system access for all registered users.</p>
          </div>
          <button className="flex items-center gap-2 bg-[#242F41] border border-slate-700/50 hover:bg-slate-700/50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export CSV
          </button>
        </header>

        <div className="flex flex-col gap-4">
          <div className="flex gap-6 border-b border-slate-700/50 pb-2">
            <button className="text-white font-medium border-b-2 border-white pb-2 -mb-[9px]">All Users</button>
            <button className="text-slate-400 hover:text-white font-medium pb-2 -mb-[9px]">Active</button>
            <button className="text-slate-400 hover:text-white font-medium pb-2 -mb-[9px]">Inactive</button>
          </div>

          <div className="relative mt-4">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input 
              type="text" 
              placeholder="Search by name, email or role..." 
              className="bg-[#242F41] text-sm text-white border border-slate-700/30 rounded-lg pl-9 pr-4 py-3 w-full focus:outline-none focus:border-slate-500 placeholder:text-slate-500"
            />
          </div>
        </div>

        <UsersTable />
      </main>
    </div>
  );
}