"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { ExportButton } from "@/components/dashboard/export-button";

type ReportAnalysis = {
  compilation: string;
  recommendation: string;
  generatedBy: "gemini" | "fallback";
  model: string;
  analyzedAt: string;
};

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("System Overview");
  const [selectedAnomaly, setSelectedAnomaly] = useState<string | null>(null);
  const [analysisByTab, setAnalysisByTab] = useState<Record<string, ReportAnalysis>>({});
  const [snapshotByTab, setSnapshotByTab] = useState<Record<string, any>>({});
  const [analysisStatus, setAnalysisStatus] = useState<"idle" | "loading" | "error">("idle");

  useEffect(() => {
    document.title = "Alerto | Reports";
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadAnalysis() {
      setAnalysisStatus("loading");

      try {
        const response = await fetch(`/api/admin/reports/analysis?tab=${encodeURIComponent(activeTab)}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load report analysis");
        }

        const data = await response.json();
        if (!cancelled && data.analysis) {
          setAnalysisByTab((current) => ({
            ...current,
            [activeTab]: data.analysis,
          }));
          if (data.snapshot) {
            setSnapshotByTab((current) => ({
              ...current,
              [activeTab]: data.snapshot,
            }));
          }
          setAnalysisStatus("idle");
        }
      } catch (error) {
        console.error("Failed to load AI report analysis", error);
        if (!cancelled) setAnalysisStatus("error");
      }
    }

    loadAnalysis();

    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  const getTableData = () => {
    const trips = currentSnapshot.recentTrips || [];
    return trips.map((trip: any) => ({
      id: `TRP-${trip.id}`,
      description: `Trip to ${trip.destinationName || 'Unknown'} (${trip.durationMinutes} mins) - ${trip.anomalyCount} anomalies.`,
      date: new Date(trip.date).toLocaleString(),
      status: trip.safetyStatus === 'Suspicious' ? 'Caution' : trip.safetyStatus === 'SOS-Triggered' ? 'Emergency' : trip.anomalyCount > 0 ? 'Notice' : 'Normal',
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Normal":
      case "Live":
      case "Connected":
        return "text-green-400 bg-green-400/10 border-green-400/20";
      case "Caution":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "Emergency":
      case "Disconnected":
        return "text-red-400 bg-red-400/10 border-red-400/20";
      case "Notice":
      case "Changed":
        return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      default:
        return "text-slate-400 bg-slate-400/10 border-slate-400/20";
    }
  };

  const tabs = ["System Overview", "User Activity", "Alarm History", "Device Metrics"];
  const currentSnapshot = snapshotByTab[activeTab] || {};
  const currentAiInsight = analysisByTab[activeTab];
  const currentAnalysisMeta = analysisByTab[activeTab];

  // Reset selected anomaly when tab changes
  useEffect(() => {
    setSelectedAnomaly(null);
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#111827] flex font-sans">
      <Sidebar />

      <main className="flex-1 p-8 overflow-auto">
        <header className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Reports & Analytics</h1>
            <p className="text-slate-400">View comprehensive system reports and historical data</p>
          </div>
          <ExportButton stats={{}} users={[]} filename={`alerto_${activeTab.toLowerCase().replace(/ /g, '_')}_report.csv`} label="Export Report" />
        </header>

        {/* Tab Navigation */}
        <div className="flex gap-6 border-b border-slate-700/50 mb-6">
          {tabs.map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`font-medium pb-3 -mb-[1px] transition-colors ${
                activeTab === tab 
                  ? "text-blue-500 border-b-2 border-blue-500" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* AI Insight Card */}
        {currentAiInsight && (
          <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-[#1B2435] border border-indigo-500/30 rounded-xl p-6 mb-6 relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/10 blur-3xl rounded-full group-hover:bg-indigo-500/20 transition-all duration-700"></div>
            <div className="flex items-start gap-4 relative z-10">
               <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 mt-1 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
               </div>
               <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                     Alerto AI Data Compilation
                     <span className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30 tracking-wider">AUTO-GENERATED</span>
                     {currentAnalysisMeta && (
                       <span className="text-[10px] font-semibold bg-slate-700/60 text-slate-300 px-2 py-0.5 rounded-full border border-slate-600 tracking-wider">
                         {currentAnalysisMeta.generatedBy === "gemini" ? "GEMINI" : "LOCAL FALLBACK"}
                       </span>
                     )}
                     {analysisStatus === "loading" && (
                       <span className="text-[10px] font-semibold bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30 tracking-wider">REFRESHING</span>
                     )}
                  </h3>
                  <p className="text-slate-300 text-sm mb-4 leading-relaxed max-w-4xl">
                    {currentAiInsight.compilation}
                  </p>
                  <div className="bg-[#0F172A]/60 border border-indigo-500/20 rounded-lg p-4 shadow-inner max-w-4xl">
                     <h4 className="text-xs font-semibold text-indigo-400 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                       <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                       AI Recommendation
                     </h4>
                     <p className="text-sm text-slate-300">
                       {currentAiInsight.recommendation}
                     </p>
                  </div>
                  {analysisStatus === "error" && (
                    <p className="text-xs text-amber-300 mt-3">
                      Live Gemini analysis is unavailable right now, so the report is showing the saved baseline insight.
                    </p>
                  )}
               </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        {(() => {
          switch (activeTab) {
            case "System Overview":
              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                   <div className="bg-[#1B2435] border border-slate-700/50 rounded-xl p-6 flex flex-col justify-center">
                       <h4 className="text-slate-400 text-sm font-medium mb-1">Total Devices Registered</h4>
                       <span className="text-3xl font-bold text-white mb-4">{currentSnapshot.totalDevices ?? 0}</span>
                       <div className="w-full bg-slate-700/50 h-2 rounded-full overflow-hidden">
                         <div className="bg-blue-500 w-3/4 h-full" style={{ width: `${Math.min(100, ((currentSnapshot.connectedDevicesCount ?? 0) / Math.max(1, currentSnapshot.totalDevices ?? 1)) * 100)}%` }}></div>
                       </div>
                       <span className="text-xs text-slate-500 mt-2">{currentSnapshot.connectedDevicesCount ?? 0} currently connected</span>
                   </div>
                   <div className="bg-[#1B2435] border border-slate-700/50 rounded-xl p-6 flex flex-col justify-center">
                       <h4 className="text-slate-400 text-sm font-medium mb-1">Trips Monitored (30 Days)</h4>
                       <span className="text-3xl font-bold text-white mb-4">{currentSnapshot.tripsLast30Days ?? 0}</span>
                   </div>
                   <div className="bg-[#1B2435] border border-slate-700/50 rounded-xl p-6 flex flex-col justify-center">
                       <h4 className="text-slate-400 text-sm font-medium mb-1">Alerts Processed (30 Days)</h4>
                       <span className="text-3xl font-bold text-white mb-4">{currentSnapshot.alertsLast30Days ?? 0}</span>
                   </div>
                </div>
              );
            case "User Activity":
              return (
                <div className="grid grid-cols-1 gap-6 mb-6">
                   <div className="bg-[#1B2435] border border-slate-700/50 rounded-xl p-6 min-h-[300px]">
                      <h3 className="text-lg font-semibold text-white mb-6">User Base Overview</h3>
                      <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                          <h4 className="text-slate-400 text-sm mb-2">Registered Users</h4>
                          <span className="text-4xl font-bold text-white">{currentSnapshot.registeredUsersCount ?? 0}</span>
                        </div>
                        <div>
                          <h4 className="text-slate-400 text-sm mb-2">Live / Active Right Now</h4>
                          <span className="text-4xl font-bold text-indigo-400">{currentSnapshot.activeUsersCount ?? 0}</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-700/50 h-4 rounded-full overflow-hidden mt-auto">
                         <div className="bg-indigo-500 h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, ((currentSnapshot.activeUsersCount ?? 0) / Math.max(1, currentSnapshot.registeredUsersCount ?? 1)) * 100)}%` }}></div>
                      </div>
                      <p className="text-slate-400 text-sm mt-4 text-center">Percentage of registered users currently commuting</p>
                   </div>
                </div>
              );
            case "Alarm History":
              const triggers = currentSnapshot.topAnomalyTriggers || [];
              const topTrigger1 = triggers[0] || { trigger: 'Drowsiness', count: 0 };
              const topTrigger2 = triggers[1] || { trigger: 'Snoring', count: 0 };
              const topTrigger3 = triggers[2] || { trigger: 'Theft/SOS', count: 0 };
              const topTrigger4 = triggers[3] || { trigger: 'Route Dev.', count: 0 };
              
              return (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
                  <div className="bg-[#1B2435] border border-slate-700/50 rounded-xl p-6 flex flex-col items-center justify-center">
                     <h4 className="text-slate-400 text-sm font-medium mb-6 text-center">Commute Anomalies (30 Days)</h4>
                     <div className="relative w-40 h-40 rounded-full border-[20px] border-slate-700/30 border-t-red-500 border-r-purple-500 border-b-indigo-500 border-l-yellow-500 flex items-center justify-center shadow-inner">
                        <div className="flex flex-col items-center">
                          <span className="text-3xl font-bold text-white">{currentSnapshot.anomalyTripsCount ?? 0}</span>
                          <span className="text-xs text-slate-500">Total Incidents</span>
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4 w-full mt-8 text-sm">
                        <div className="flex flex-col items-center gap-1"><div className="w-3 h-3 rounded-full bg-purple-500"></div><span className="text-slate-300 text-xs truncate max-w-full">{topTrigger1.trigger}</span><span className="font-bold text-white">{topTrigger1.count}</span></div>
                        <div className="flex flex-col items-center gap-1"><div className="w-3 h-3 rounded-full bg-indigo-500"></div><span className="text-slate-300 text-xs truncate max-w-full">{topTrigger2.trigger}</span><span className="font-bold text-white">{topTrigger2.count}</span></div>
                        <div className="flex flex-col items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500"></div><span className="text-slate-300 text-xs truncate max-w-full">{topTrigger3.trigger}</span><span className="font-bold text-white">{topTrigger3.count}</span></div>
                        <div className="flex flex-col items-center gap-1"><div className="w-3 h-3 rounded-full bg-yellow-500"></div><span className="text-slate-300 text-xs truncate max-w-full">{topTrigger4.trigger}</span><span className="font-bold text-white">{topTrigger4.count}</span></div>
                     </div>
                  </div>
                  <div className="xl:col-span-2 bg-[#1B2435] border border-slate-700/50 rounded-xl p-6 flex flex-col relative transition-all duration-300">
                      <h3 className="text-lg font-semibold text-white mb-2">Average Response Time</h3>
                      <p className="text-slate-400 text-sm mb-6">Time taken to acknowledge and resolve commute alerts across the system.</p>
                      <div className="flex items-center justify-center h-48 mt-auto pb-4">
                        <div className="text-center">
                          <span className="text-6xl font-bold text-blue-400 block mb-4">{currentSnapshot.averageResponseTimeMs ? Math.round(currentSnapshot.averageResponseTimeMs / 1000) : 0}s</span>
                          <span className="text-slate-300 text-lg">System-wide Average</span>
                        </div>
                      </div>
                  </div>
                </div>
              );
            case "Device Metrics":
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                   <div className="bg-[#1B2435] border border-slate-700/50 rounded-xl p-6 flex flex-col justify-center relative overflow-hidden group hover:border-blue-500/50 transition-colors">
                       <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-colors"></div>
                       <div className="flex items-center justify-between mb-4 relative z-10">
                          <h4 className="text-slate-400 text-sm font-medium">Total Connected Devices</h4>
                          <div className="p-2 bg-blue-500/10 rounded-lg">
                            <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                          </div>
                       </div>
                       <span className="text-4xl font-bold text-white relative z-10">{currentSnapshot.connectedDevicesCount ?? 0}</span>
                       <span className="text-xs text-slate-400 mt-3 relative z-10">Out of {currentSnapshot.totalDevices ?? 0} registered devices</span>
                   </div>
                   <div className="bg-[#1B2435] border border-slate-700/50 rounded-xl p-6 flex flex-col justify-center relative overflow-hidden group hover:border-red-500/50 transition-colors">
                       <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/10 rounded-full blur-xl group-hover:bg-red-500/20 transition-colors"></div>
                       <div className="flex items-center justify-between mb-4 relative z-10">
                          <h4 className="text-slate-400 text-sm font-medium">Low Battery Warnings</h4>
                          <div className="p-2 bg-red-500/10 rounded-lg relative flex items-center justify-center w-9 h-9">
                            <svg className="w-5 h-5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="16" height="10" rx="2" ry="2"/><line x1="22" y1="11" x2="22" y2="13"/></svg>
                          </div>
                       </div>
                       <span className="text-4xl font-bold text-white relative z-10">{currentSnapshot.lowBatteryUsersCount ?? 0}</span>
                       <span className="text-xs text-slate-400 mt-3 relative z-10">Devices below 20% battery</span>
                   </div>
                </div>
              );
            default:
              return null;
          }
        })()}

        {/* Source Data Activity Table */}
        <div className="bg-[#1B2435] border border-indigo-500/30 rounded-xl overflow-hidden mt-6 relative shadow-[0_0_10px_rgba(99,102,241,0.05)]">
          <div className="px-6 py-5 border-b border-slate-700/50 flex justify-between items-center bg-indigo-500/5">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
               <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
               Data Points Analyzed by AI ({activeTab})
            </h3>
            <button className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-medium">View Full Source Log</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#0F172A]/80 text-slate-400 border-b border-slate-700/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Data Point ID</th>
                  <th className="px-6 py-4 font-medium">Source Event Description</th>
                  <th className="px-6 py-4 font-medium">Timestamp</th>
                  <th className="px-6 py-4 font-medium">Tag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50 text-slate-300 bg-[#0F172A]/30">
                {getTableData().map((row, index) => (
                  <tr key={index} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-400">{row.id}</td>
                    <td className="px-6 py-4">{row.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500">{row.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${getStatusColor(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
