"use client";

import { useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DevicesTable({ devices: initialDevices }: { devices: any[] }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [devices, setDevices] = useState<any[]>(initialDevices);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  // Sync when new data arrives
  if (initialDevices !== devices && initialDevices.length !== devices.length) {
    setDevices(initialDevices);
  }

  async function handleToggleConnection(deviceId: string, currentStatus: string) {
    setLoading(deviceId);
    try {
      const newStatus = currentStatus === "Connected" ? "Offline" : "Connected";
      const res = await fetch("/api/admin/devices/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: deviceId, isOnline: newStatus === "Connected" }),
      });
      if (res.ok) {
        setDevices(prev =>
          prev.map(d => d.id === deviceId ? { ...d, status: newStatus } : d)
        );
      }
    } catch (err) {
      console.error("Failed to toggle connection", err);
    } finally {
      setLoading(null);
    }
  }

  async function handleDelete(deviceId: string) {
    setLoading(deviceId);
    try {
      const res = await fetch("/api/admin/devices/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: deviceId }),
      });
      if (res.ok) {
        setDevices(prev => prev.filter(d => d.id !== deviceId));
      }
    } catch (err) {
      console.error("Failed to delete device", err);
    } finally {
      setLoading(null);
      setDeleteTarget(null);
    }
  }

  return (
    <>
      <div className="bg-[#242F41] rounded-xl border border-slate-700/30 overflow-hidden flex flex-col mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="text-xs font-semibold text-slate-400 bg-[#1B2435]/50 border-b border-slate-700/30">
              <tr>
                <th className="px-6 py-4">ACCOUNT</th>
                <th className="px-6 py-4">DEVICE ID</th>
                <th className="px-6 py-4">CONNECTION</th>
                <th className="px-6 py-4 text-center">MANAGE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {devices.map((dev) => (
                <tr key={dev.id} className="hover:bg-slate-700/10 transition-colors">
                  <td className="px-6 py-5 text-white font-medium">{dev.account || '—'}</td>
                  <td className="px-6 py-5 text-white font-medium">{dev.deviceId || '—'}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${dev.status === 'Connected' ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
                      <span className={dev.status === 'Connected' ? 'text-emerald-400' : 'text-slate-400'}>{dev.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center">
                      <button
                        onClick={() => setDeleteTarget(dev.id)}
                        disabled={loading === dev.id}
                        className={`text-slate-400 hover:text-rose-400 transition-colors p-1.5 rounded-md hover:bg-rose-500/10 ${loading === dev.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        title="Delete Device"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 px-6 border-t border-slate-700/30 flex items-center justify-between bg-[#242F41]">
          <span className="text-sm text-slate-400">
            Showing {devices.length > 0 ? 1 : 0} to {devices.length} of {devices.length} devices
          </span>
          <div className="flex gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded bg-[#1B2435] border border-slate-700/50 text-slate-400 hover:text-white"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg></button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-[#1B2435] border border-slate-700/50 text-slate-400 hover:text-white"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg></button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1B2435] border border-slate-700/50 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </div>
              <h3 className="text-lg font-semibold text-white">Delete Device</h3>
            </div>
            <p className="text-slate-400 text-sm mb-6">
              Are you sure you want to remove this device? This will clear the device ID from the user&apos;s account. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white bg-slate-700/30 hover:bg-slate-700/50 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteTarget)}
                disabled={loading === deleteTarget}
                className={`px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors cursor-pointer ${loading === deleteTarget ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading === deleteTarget ? 'Deleting...' : 'Delete Device'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}