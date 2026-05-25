"use client";

import type { User } from "@/hooks/useUsers";

interface UsersTableProps {
  users: User[];
  totalUsers: number;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
  onUpdatePassword?: (user: User) => void;
}

export function UsersTable({ users, totalUsers, onToggleStatus, onDelete, loading, onUpdatePassword }: UsersTableProps) {
  if (loading) {
    return (
      <div className="bg-[#242F41] rounded-xl border border-slate-700/30 p-12 flex flex-col items-center justify-center mt-6">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400">Loading users...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-[#242F41] rounded-xl border border-slate-700/30 p-12 flex flex-col items-center justify-center mt-6 text-center">
        <svg className="w-12 h-12 text-slate-600 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        <h3 className="text-white font-semibold mb-1">No users found</h3>
        <p className="text-slate-500 text-sm">No users match your current search or filter criteria.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#242F41] rounded-xl border border-slate-700/30 overflow-hidden flex flex-col mt-6">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="text-xs font-semibold text-slate-400 bg-[#1B2435]/50 border-b border-slate-700/30">
            <tr>
              <th className="px-6 py-4">NAME</th>
              <th className="px-6 py-4">ROLE</th>
              <th className="px-6 py-4">JOIN DATE</th>
              <th className="px-6 py-4">STATUS</th>
              <th className="px-6 py-4 text-center">MANAGE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/30">
            {users.map((user) => {
              let displayStatus = 'Active';
              if (user.status === 'Inactive') {
                displayStatus = 'Disabled';
              } else if (!user.isAdmin) {
                displayStatus = user.isOnline ? 'Active' : 'Inactive';
              }

              return (
                <tr key={user.id} className="hover:bg-slate-700/10 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-white font-medium">{user.name}</div>
                    {user.email && <div className="text-xs text-slate-500">{user.email}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-[#1B2435] border border-slate-700/50 text-slate-300 px-3 py-1 rounded-full text-xs font-medium">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">{user.joinDate}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        displayStatus === 'Active' ? 'bg-emerald-400' : 
                        displayStatus === 'Disabled' ? 'bg-rose-500' : 'bg-slate-500'
                      }`}></span>
                      <span className={
                        displayStatus === 'Active' ? 'text-emerald-400' : 
                        displayStatus === 'Disabled' ? 'text-rose-400' : 'text-slate-400'
                      }>{displayStatus}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      
                      <button 
                        onClick={() => onToggleStatus(user.id)}
                        className={`h-[32px] w-[120px] flex items-center justify-center text-xs font-semibold rounded-lg border transition-all ${
                          user.status === 'Active' 
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20' 
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                        }`}
                      >
                        {user.status === 'Active' ? 'Restrict Access' : 'Allow Access'}
                      </button>

                      <div className="relative group flex items-center justify-center">
                        <button 
                          onClick={() => onDelete(user.id)}
                          className="h-[32px] w-[32px] flex items-center justify-center rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-all" 
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none px-2.5 py-1 bg-slate-800 text-xs font-medium text-slate-200 rounded-md whitespace-nowrap shadow-xl border border-slate-700/50 z-10">
                          Delete user
                        </div>
                      </div>

                      {(user.role === 'Sub Admin' || user.role === 'System Admin') ? (
                        <div className="relative group flex items-center justify-center">
                          <button 
                            onClick={() => {
                              if (onUpdatePassword) {
                                onUpdatePassword(user);
                              }
                            }}
                            className="h-[32px] w-[32px] flex items-center justify-center rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-blue-400 hover:border-blue-500/30 transition-all" 
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/>
                              <path d="m21 2-9.6 9.6"/>
                              <circle cx="7.5" cy="15.5" r="5.5"/>
                            </svg>
                          </button>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none px-2.5 py-1 bg-slate-800 text-xs font-medium text-slate-200 rounded-md whitespace-nowrap shadow-xl border border-slate-700/50 z-10">
                            Update password
                          </div>
                        </div>
                      ) : (
                        <div className="w-[32px]"></div>
                      )}

                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="p-4 px-6 border-t border-slate-700/30 flex items-center justify-between bg-[#242F41]">
        <span className="text-sm text-slate-400">Showing {users.length > 0 ? 1 : 0} to {users.length} of {totalUsers} users</span>
        <div className="flex gap-2">
          <button className="w-8 h-8 flex items-center justify-center rounded bg-[#1B2435] border border-slate-700/50 text-slate-400 hover:text-white"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg></button>
          <button className="w-8 h-8 flex items-center justify-center rounded bg-[#1B2435] border border-slate-700/50 text-slate-400 hover:text-white"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg></button>
        </div>
      </div>
    </div>
  );
}