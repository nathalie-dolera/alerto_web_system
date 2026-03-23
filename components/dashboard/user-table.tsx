import { UserConnection } from "@/hooks/useDashboardData";

export function UserTable({ users }: { users: UserConnection[] }) {
  return (
    <div className="bg-[#242F41] rounded-xl border border-slate-700/30 overflow-hidden flex flex-col mt-6">
      
      <div className="p-6 flex items-center justify-between border-b border-slate-700/30">
        <h2 className="text-lg font-semibold text-white">User Connection Status</h2>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input 
            type="text" 
            placeholder="Search users..." 
            className="bg-[#1B2435] text-sm text-white border border-slate-700/50 rounded-lg pl-9 pr-4 py-2 w-64 focus:outline-none focus:border-slate-500 placeholder:text-slate-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="text-xs font-semibold text-slate-400 bg-[#1B2435]/50 border-b border-slate-700/30">
            <tr>
              <th className="px-6 py-4">USER NAME</th>
              <th className="px-6 py-4">DEVICE ID</th>
              <th className="px-6 py-4">STATUS</th>
              <th className="px-6 py-4">LAST ACTIVE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/30">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-700/10 transition-colors">
                <td className="px-6 py-5 text-white font-medium">{user.email}</td>
                <td className="px-6 py-5 text-slate-400">{user.deviceId}</td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${user.status === 'Connected' ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
                    <span className={user.status === 'Connected' ? 'text-emerald-400' : 'text-slate-400'}>
                      {user.status}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5 text-slate-400">{user.lastActive}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 px-6 border-t border-slate-700/30 flex items-center justify-between bg-[#242F41]">
        <span className="text-sm text-slate-400">Showing 1-4 of 12,840 users</span>
        <div className="flex gap-2">
          <button className="w-8 h-8 flex items-center justify-center rounded bg-[#1B2435] border border-slate-700/50 text-slate-400 hover:text-white transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded bg-[#1B2435] border border-slate-700/50 text-slate-400 hover:text-white transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      </div>

    </div>
  );
}