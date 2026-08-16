"use client";

import { useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function AlarmsTable({ alarms }: { alarms: any[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const totalPages = Math.max(1, Math.ceil(alarms.length / itemsPerPage));
  const currentAlarms = alarms.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  function getStatusStyles(status: string) {
    switch (status) {
      case 'Triggered':
        return {
          badge: 'border-red-500/30 text-red-400 bg-red-500/10',
          dot: 'bg-red-400',
        };
      case 'Pending':
        return {
          badge: 'border-orange-500/30 text-orange-400 bg-orange-500/10',
          dot: 'bg-orange-400',
        };
      case 'Resolved':
        return {
          badge: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
          dot: 'bg-emerald-400',
        };
      default:
        return {
          badge: 'border-slate-500/30 text-slate-400 bg-slate-500/10',
          dot: 'bg-slate-400',
        };
    }
  }

  return (
    <div className="bg-[#242F41] rounded-xl border border-slate-700/30 overflow-hidden flex flex-col mt-6">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="text-xs font-semibold text-slate-400 bg-[#1B2435]/50 border-b border-slate-700/30">
            <tr>
              <th className="px-6 py-4">ALARM ID</th>
              <th className="px-6 py-4">USER</th>
              <th className="px-6 py-4">LOCATION</th>
              <th className="px-6 py-4">TRIGGER</th>
              <th className="px-6 py-4">TIME TRIGGERED</th>
              <th className="px-6 py-4">ALARM STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/30">
            {alarms.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                  No alarms found matching your filters.
                </td>
              </tr>
            ) : (
              currentAlarms.map((alarm, index) => {
                const styles = getStatusStyles(alarm.status);
                return (
                  <tr key={index} className="hover:bg-slate-700/10 transition-colors">
                    <td className="px-6 py-5 text-white font-medium">{alarm.id}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${alarm.avatarBg} ${alarm.avatarText}`}>
                          {alarm.initials}
                        </div>
                        <span className="text-slate-300">{alarm.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-slate-300 max-w-[200px]">
                      <div className="relative group flex items-center">
                        <span className="block truncate cursor-default">{alarm.location || 'Unknown'}</span>
                        <div className="absolute left-0 top-full mt-1 hidden group-hover:block w-max max-w-xs bg-slate-800 text-white text-xs rounded p-2 z-50 shadow-lg border border-slate-700/50 whitespace-normal break-words">
                          {alarm.location || 'Unknown'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-slate-400">
                      {Array.isArray(alarm.triggers) && alarm.triggers.length > 0 ? alarm.triggers.join(', ') : 'N/A'}
                    </td>
                    <td className="px-6 py-5 text-slate-400">{alarm.time}</td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium ${styles.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`}></span>
                        {alarm.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 px-6 border-t border-slate-700/30 flex items-center justify-between bg-[#242F41]">
        <span className="text-sm text-slate-400">
          Showing {alarms.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, alarms.length)} of {alarms.length} recorded alarms
        </span>
        <div className="flex gap-2">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={`w-8 h-8 flex items-center justify-center rounded border transition-colors ${currentPage === 1 ? 'bg-[#1B2435]/50 border-slate-700/30 text-slate-600 cursor-not-allowed' : 'bg-[#1B2435] border-slate-700/50 text-slate-400 hover:text-white'}`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={`w-8 h-8 flex items-center justify-center rounded border transition-colors ${currentPage === totalPages ? 'bg-[#1B2435]/50 border-slate-700/30 text-slate-600 cursor-not-allowed' : 'bg-[#1B2435] border-slate-700/50 text-slate-400 hover:text-white'}`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

