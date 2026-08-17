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

type TimeRange = "today" | "7d" | "30d";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("System Overview");
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [analysisByTab, setAnalysisByTab] = useState<Record<string, ReportAnalysis>>({});
  const [snapshotByTab, setSnapshotByTab] = useState<Record<string, any>>({});
  const [analysisStatus, setAnalysisStatus] = useState<"idle" | "loading" | "error">("idle");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [dataPointsPage, setDataPointsPage] = useState(1);
  const [devicesPage, setDevicesPage] = useState(1);
  const itemsPerPage = 10;

  async function handleDeleteDevice(userId: string) {
    setDeleteLoading(true);
    try {
      const res = await fetch("/api/admin/devices/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        setSnapshotByTab(prev => {
          const cacheKey = `${activeTab}-${timeRange}`;
          const current = prev[cacheKey];
          if (!current) return prev;
          const updatedDevices = (current.devicesList || []).filter((d: any) => d.id !== userId);
          return {
            ...prev,
            [cacheKey]: {
              ...current,
              devicesList: updatedDevices,
              totalDevices: Math.max(0, (current.totalDevices || 1) - 1),
            }
          };
        });
      }
    } catch (err) {
      console.error("Failed to delete device", err);
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  }

  useEffect(() => {
    document.title = "Alerto | Reports";
  }, []);

  const cacheKey = `${activeTab}-${timeRange}`;
  const currentSnapshot = snapshotByTab[cacheKey] || {};
  const currentAiInsight = analysisByTab[cacheKey];
  const currentAnalysisMeta = analysisByTab[cacheKey];

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    let cancelled = false;

    async function loadAnalysis() {
      setAnalysisStatus("loading");

      try {
        const response = await fetch(
          `/api/admin/reports/analysis?tab=${encodeURIComponent(activeTab)}&range=${timeRange}`,
          {
            cache: "no-store",
            signal,
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load report analysis");
        }

        const data = await response.json();
        if (!cancelled && data.analysis) {
          setAnalysisByTab((current) => ({
            ...current,
            [cacheKey]: data.analysis,
          }));
          if (data.snapshot) {
            setSnapshotByTab((current) => ({
              ...current,
              [cacheKey]: data.snapshot,
            }));
          }
          setAnalysisStatus("idle");
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          return;
        }
        console.error("Failed to load AI report analysis", error);
        if (!cancelled) setAnalysisStatus("error");
      }
    }

    loadAnalysis();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [activeTab, timeRange, cacheKey]);

  const getTableData = () => {
    const trips = currentSnapshot.recentTrips || [];
    return trips.map((trip: any, index: number) => {
      const tripDate = trip.date ? new Date(trip.date) : new Date();
      const tripYear = isNaN(tripDate.getTime()) ? 2026 : tripDate.getFullYear();
      const count = index + 1;
      const responseTimes: number[] = Array.isArray(trip.responseTimes) ? trip.responseTimes : [];
      let avgResponse = "—";
      if (responseTimes.length > 0) {
        const rawAvg = responseTimes.reduce((a: number, b: number) => a + b, 0) / responseTimes.length;
        // If logged in ms (>100), convert to seconds; otherwise keep as seconds
        const inSeconds = rawAvg > 100 ? Math.round(rawAvg / 1000) : Math.round(rawAvg);
        avgResponse = `${inSeconds}s`;
      }

      return {
        id: `TRP-${tripYear}${count}`,
        description: `Trip to ${trip.destinationName || 'Unknown'} (${trip.durationMinutes} mins) - ${trip.anomalyCount} anomalies.`,
        avgResponse,
        date: new Date(trip.date).toLocaleString(),
        status: trip.safetyStatus === 'Suspicious' ? 'Caution' : trip.safetyStatus === 'SOS-Triggered' ? 'Emergency' : trip.anomalyCount > 0 ? 'Notice' : 'Normal',
      };
    });
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
  const rangeOptions: { label: string; value: TimeRange }[] = [
    { label: "Today (24h)", value: "today" },
    { label: "Last 7 Days", value: "7d" },
    { label: "Last 30 Days", value: "30d" },
  ];

  const rangeLabel = timeRange === "today" ? "Today" : timeRange === "7d" ? "Last 7 Days" : "Last 30 Days";

  return (
    <div className="min-h-screen bg-[#111827] flex font-sans">
      <Sidebar />

      <main className="flex-1 p-8 overflow-auto">
        <header className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Reports & Analytics</h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Time Range Selector */}
            <div className="flex items-center bg-[#1B2435] border border-slate-700/50 rounded-lg p-1">
              {rangeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTimeRange(opt.value)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    timeRange === opt.value
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <ExportButton
              stats={{}}
              users={[]}
              filename={`alerto_${activeTab.toLowerCase().replace(/ /g, '_')}_${timeRange}_report.csv`}
              label="Export Report"
            />
          </div>
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

        {/* AI Insight Card for standard tabs (Theme matches solid StatCard style) */}
        {activeTab !== "Device Metrics" && activeTab !== "User Activity" && (
          <div className="bg-[#242F41] border border-slate-700/40 rounded-xl p-6 mb-6 relative overflow-hidden">
            <div className="flex items-start gap-4 relative z-10">
               <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
               </div>
               <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2 flex items-center flex-wrap gap-2">
                     Alerto AI Data Compilation
                     <span className="text-[10px] font-semibold bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/20 tracking-wider">AUTO-GENERATED</span>
                     <span className="text-[10px] font-semibold bg-slate-700/50 text-slate-300 px-2 py-0.5 rounded-full border border-slate-600/40 tracking-wider uppercase">
                       {rangeLabel}
                     </span>
                     {currentAnalysisMeta && (
                       <span className="text-[10px] font-semibold bg-slate-700/50 text-slate-300 px-2 py-0.5 rounded-full border border-slate-600/40 tracking-wider">
                         {currentAnalysisMeta.generatedBy === "gemini" ? "GEMINI" : "LOCAL FALLBACK"}
                       </span>
                     )}
                     {analysisStatus === "loading" && (
                       <span className="text-[10px] font-semibold bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30 tracking-wider">REFRESHING</span>
                     )}
                  </h3>
                  <p className="text-slate-300 text-sm mb-4 leading-relaxed max-w-4xl">
                    {currentAiInsight?.compilation || `Overview metrics for ${rangeLabel} are currently compiled across ${currentSnapshot.tripsCount ?? 0} monitored trips.`}
                  </p>
                  <div className="bg-[#151a23] border border-slate-700/40 rounded-lg p-4 max-w-4xl">
                     <h4 className="text-xs font-semibold text-blue-400 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                       <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                       AI Recommendation
                     </h4>
                     <p className="text-sm text-slate-300">
                       {currentAiInsight?.recommendation || 'Maintain real-time GPS telemetry and commuter safety monitoring to identify potential transit route bottlenecks.'}
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
                   <div className="bg-[#242F41] border border-slate-700/40 rounded-xl p-6 flex flex-col justify-center">
                       <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
                         <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                       </div>
                       <h4 className="text-slate-400 text-sm font-medium mb-1">Total Devices Registered</h4>
                       <span className="text-3xl font-bold text-white mb-4">{currentSnapshot.totalDevices ?? 0}</span>
                       <div className="w-full bg-slate-700/50 h-2 rounded-full overflow-hidden">
                         <div className="bg-blue-500 h-full" style={{ width: `${Math.min(100, ((currentSnapshot.connectedDevicesCount ?? 0) / Math.max(1, currentSnapshot.totalDevices ?? 1)) * 100)}%` }}></div>
                       </div>
                       <span className="text-xs text-slate-400 mt-2">{currentSnapshot.connectedDevicesCount ?? 0} currently connected</span>
                   </div>
                   <div className="bg-[#242F41] border border-slate-700/40 rounded-xl p-6 flex flex-col justify-center">
                       <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
                         <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18"/><path d="m15 6 6 6-6 6"/><path d="M3 6h4"/><path d="M3 18h4"/></svg>
                       </div>
                       <h4 className="text-slate-400 text-sm font-medium mb-1">Trips Monitored ({rangeLabel})</h4>
                       <span className="text-3xl font-bold text-white mb-4">{currentSnapshot.tripsCount ?? 0}</span>
                   </div>
                   <div className="bg-[#242F41] border border-slate-700/40 rounded-xl p-6 flex flex-col justify-center">
                       <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
                         <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                       </div>
                       <h4 className="text-slate-400 text-sm font-medium mb-1">Anomalies Detected ({rangeLabel})</h4>
                       <span className="text-3xl font-bold text-white mb-4">{currentSnapshot.anomalyTripsCount ?? 0}</span>
                   </div>
                </div>
              );
            case "User Activity":
              return (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                   <div className="bg-[#242F41] border border-slate-700/40 rounded-xl p-6 relative flex flex-col justify-between">
                     <div className="flex items-start gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                           <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                        </div>
                        <div className="flex-1">
                           <h3 className="text-lg font-semibold text-white mb-2 flex items-center flex-wrap gap-2">
                              Alerto AI Data Compilation
                              <span className="text-[10px] font-semibold bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/20 tracking-wider">AUTO-GENERATED</span>
                              <span className="text-[10px] font-semibold bg-slate-700/50 text-slate-300 px-2 py-0.5 rounded-full border border-slate-600/40 tracking-wider uppercase">
                                {rangeLabel}
                              </span>
                              {currentAnalysisMeta && (
                                <span className="text-[10px] font-semibold bg-slate-700/50 text-slate-300 px-2 py-0.5 rounded-full border border-slate-600/40 tracking-wider">
                                  {currentAnalysisMeta.generatedBy === "gemini" ? "GEMINI" : "LOCAL FALLBACK"}
                                </span>
                              )}
                              {analysisStatus === "loading" && (
                                <span className="text-[10px] font-semibold bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30 tracking-wider">REFRESHING</span>
                              )}
                           </h3>
                           <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                             {currentAiInsight?.compilation || `User activity metrics for ${rangeLabel} show ${currentSnapshot.registeredUsersCount ?? 0} registered users with ${currentSnapshot.activeUsersCount ?? 0} actively commuting.`}
                           </p>
                           <div className="bg-[#151a23] border border-slate-700/40 rounded-lg p-4">
                              <h4 className="text-xs font-semibold text-blue-400 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                                AI Recommendation
                              </h4>
                              <p className="text-sm text-slate-300">
                                {currentAiInsight?.recommendation || 'Encourage commuters to enable Bluetooth and background location services during trips for optimal safety tracking.'}
                              </p>
                           </div>
                        </div>
                     </div>
                   </div>
                   <div className="bg-[#242F41] border border-slate-700/40 rounded-xl p-6 min-h-[300px] flex flex-col">
                       <h3 className="text-lg font-semibold text-white mb-4">Peak Commute Times</h3>
                       {(() => {
                         const breakdown = currentSnapshot.commuteTimesBreakdown || { morning: 0, noon: 0, evening: 0 };
                         const peak = currentSnapshot.peakCommutePeriod || 'Morning';
                         const total = (breakdown.morning || 0) + (breakdown.noon || 0) + (breakdown.evening || 0);
                         const bars = [
                           { label: 'Morning', sublabel: '5AM – 12PM', count: breakdown.morning || 0, color: 'bg-orange-500', light: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/40' },
                           { label: 'Noon', sublabel: '12PM – 5PM', count: breakdown.noon || 0, color: 'bg-yellow-500', light: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/40' },
                           { label: 'Evening', sublabel: '5PM – 5AM', count: breakdown.evening || 0, color: 'bg-indigo-500', light: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/40' },
                         ];
                         return (
                           <div className="flex flex-col gap-3 flex-1">
                             {bars.map((bar) => {
                               const pct = total > 0 ? Math.round((bar.count / total) * 100) : 0;
                               const isPeak = bar.label === peak;
                               return (
                                 <div key={bar.label} className={`rounded-lg p-3 border ${bar.light} ${bar.border} ${isPeak ? 'ring-1 ring-white/10' : ''}`}>
                                   <div className="flex items-center justify-between mb-1.5">
                                     <div className="flex items-center gap-2">
                                       <span className={`text-sm font-semibold ${bar.text}`}>{bar.label}</span>
                                       {isPeak && <span className="text-[9px] font-bold bg-white/10 text-white px-1.5 py-0.5 rounded-full tracking-wider">PEAK</span>}
                                     </div>
                                     <span className={`text-sm font-bold ${bar.text}`}>{bar.count} trips</span>
                                   </div>
                                   <div className="w-full bg-slate-700/50 h-1.5 rounded-full overflow-hidden">
                                     <div className={`${bar.color} h-full rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                                   </div>
                                   <p className="text-slate-500 text-[10px] mt-1">{bar.sublabel} · {pct}% of trips</p>
                                 </div>
                               );
                             })}
                             <p className="text-slate-400 text-xs text-center mt-auto pt-2">
                               {currentSnapshot.activeCommutersCount ?? 0} active commuters · {total} total trips in {rangeLabel}
                             </p>
                           </div>
                         );
                       })()}
                   </div>
                </div>
              );
            case "Alarm History":
              const triggers = currentSnapshot.topAnomalyTriggers || [];
              const topTrigger1 = triggers[0] || { trigger: 'Drowsiness', count: 0 };
              const topTrigger2 = triggers[1] || { trigger: 'Hazard', count: 0 };
              const topTrigger3 = triggers[2] || { trigger: 'Anti-Theft', count: 0 };
              const topTrigger4 = triggers[3] || { trigger: 'Route Dev.', count: 0 };
              
              return (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
                  <div className="bg-[#242F41] border border-slate-700/40 rounded-xl p-5 flex flex-col items-center justify-center">
                     <h4 className="text-slate-400 text-sm font-medium mb-4 text-center">Commute Anomalies ({rangeLabel})</h4>
                     <div className="relative w-32 h-32 rounded-full border-[16px] border-slate-700/30 border-t-red-500 border-r-purple-500 border-b-blue-500 border-l-yellow-500 flex items-center justify-center shadow-inner">
                        <div className="flex flex-col items-center">
                          <span className="text-2xl font-bold text-white">{currentSnapshot.anomalyTripsCount ?? 0}</span>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider">Incidents</span>
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-3 w-full mt-4 text-sm">
                        <div className="flex flex-col items-center gap-0.5"><div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div><span className="text-slate-300 text-xs truncate max-w-full">{topTrigger1.trigger}</span><span className="font-bold text-white text-xs">{topTrigger1.count}</span></div>
                        <div className="flex flex-col items-center gap-0.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div><span className="text-slate-300 text-xs truncate max-w-full">{topTrigger2.trigger}</span><span className="font-bold text-white text-xs">{topTrigger2.count}</span></div>
                        <div className="flex flex-col items-center gap-0.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div><span className="text-slate-300 text-xs truncate max-w-full">{topTrigger3.trigger}</span><span className="font-bold text-white text-xs">{topTrigger3.count}</span></div>
                        <div className="flex flex-col items-center gap-0.5"><div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div><span className="text-slate-300 text-xs truncate max-w-full">{topTrigger4.trigger}</span><span className="font-bold text-white text-xs">{topTrigger4.count}</span></div>
                     </div>
                  </div>
                  <div className="xl:col-span-2 bg-[#242F41] border border-slate-700/40 rounded-xl p-5 flex flex-col justify-between relative transition-all duration-300">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">Average Response Time</h3>
                        <p className="text-slate-400 text-xs mb-4">Time taken to acknowledge and resolve commute alerts and anti-theft alarms ({rangeLabel}).</p>
                      </div>
                      {(() => {
                        const byType = currentSnapshot.avgResponseByType || {};
                        const routeDevSecs = byType.routeDev ? Math.round(byType.routeDev / 1000) : 0;
                        const antiTheftSecs = byType.antiTheft ? Math.round(byType.antiTheft / 1000) : 0;
                        const drowsinessSecs = byType.drowsiness ? Math.round(byType.drowsiness / 1000) : 0;
                        const overallSecs = byType.overall ? Math.round(byType.overall / 1000) : (currentSnapshot.averageResponseTimeMs ? Math.round(currentSnapshot.averageResponseTimeMs / 1000) : 0);
                        const maxSecs = Math.max(routeDevSecs, antiTheftSecs, drowsinessSecs, overallSecs, 1);
                        const hasData = overallSecs > 0;

                        if (!hasData) {
                          return (
                            <div className="flex flex-col items-center justify-center py-6 text-center">
                              <span className="text-5xl font-bold text-blue-400 block mb-1">0s</span>
                              <span className="text-slate-300 text-sm">System-wide Average</span>
                              <span className="text-xs text-slate-500 mt-2 italic">No response time data logged for this period.</span>
                            </div>
                          );
                        }

                        const bars = [
                          { label: 'Route Dev.', sublabel: '(Caution)', secs: routeDevSecs, color: 'bg-yellow-600', border: 'border-t-yellow-500', textColor: 'text-yellow-300' },
                          { label: 'Anti-Theft', sublabel: '(Emergency)', secs: antiTheftSecs, color: 'bg-red-900/80', border: 'border-t-red-500', textColor: 'text-red-300' },
                          { label: 'Drowsiness', sublabel: '(Emergency)', secs: drowsinessSecs, color: 'bg-purple-900/80', border: 'border-t-purple-500', textColor: 'text-purple-300' },
                          { label: 'Commute\nMonitor', sublabel: '(Overall)', secs: overallSecs, color: 'bg-blue-900/80', border: 'border-t-blue-400', textColor: 'text-blue-300' },
                        ];

                        return (
                          <div className="flex items-end justify-around gap-3 px-2 pb-2 pt-4 mt-auto">
                            {bars.map((bar) => {
                              const heightPct = Math.max(15, Math.round((bar.secs / maxSecs) * 100));
                              const label = bar.secs > 0 ? (bar.secs >= 60 ? `${Math.floor(bar.secs/60)}m ${bar.secs % 60}s` : `${bar.secs}s`) : '—';
                              return (
                                <div key={bar.label} className="flex flex-col items-center gap-2 flex-1">
                                  <span className={`text-sm font-bold ${bar.textColor}`}>{label}</span>
                                  <div
                                    className={`w-full max-w-[72px] rounded-sm border-t-2 ${bar.color} ${bar.border} transition-all duration-700`}
                                    style={{ height: `${heightPct * 1.2}px` }}
                                  />
                                  <div className="text-center">
                                    <p className="text-slate-300 text-xs whitespace-pre-line leading-tight">{bar.label}</p>
                                    <p className="text-slate-500 text-[10px]">{bar.sublabel}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                  </div>
                </div>
              );
            case "Device Metrics":
                return (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                     {/* Alerto AI Data Compilation (Solid Card theme matching second image) */}
                     <div className="bg-[#242F41] border border-slate-700/40 rounded-xl p-6 relative flex flex-col justify-between">
                      <div className="flex items-start gap-4 relative z-10">
                         <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                         </div>
                         <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-2 flex items-center flex-wrap gap-2">
                               Alerto AI Data Compilation
                               <span className="text-[10px] font-semibold bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/20 tracking-wider">AUTO-GENERATED</span>
                               <span className="text-[10px] font-semibold bg-slate-700/50 text-slate-300 px-2 py-0.5 rounded-full border border-slate-600/40 tracking-wider uppercase">
                                 {rangeLabel}
                               </span>
                               {currentAnalysisMeta && (
                                 <span className="text-[10px] font-semibold bg-slate-700/50 text-slate-300 px-2 py-0.5 rounded-full border border-slate-600/40 tracking-wider">
                                   {currentAnalysisMeta.generatedBy === "gemini" ? "GEMINI" : "LOCAL FALLBACK"}
                                 </span>
                               )}
                               {analysisStatus === "loading" && (
                                 <span className="text-[10px] font-semibold bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30 tracking-wider">REFRESHING</span>
                               )}
                            </h3>
                            <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                              {currentAiInsight?.compilation || `Device metrics for ${rangeLabel} are being analyzed for connection stability and hardware activity.`}
                            </p>
                            <div className="bg-[#151a23] border border-slate-700/40 rounded-lg p-4">
                               <h4 className="text-xs font-semibold text-blue-400 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                                 <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                                 AI Recommendation
                               </h4>
                               <p className="text-sm text-slate-300">
                                 {currentAiInsight?.recommendation || 'Ensure users maintain active Bluetooth bag tag connection during commutes to keep real-time tracking responsive.'}
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

                   {/* Total Connected Devices (Solid Card theme matching second image) */}
                   <div className="bg-[#242F41] border border-slate-700/40 rounded-xl p-6 flex flex-col justify-between relative">
                       <div>
                         <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                            </div>
                         </div>
                         <h4 className="text-slate-400 text-sm font-medium mb-1">Total Connected Devices</h4>
                         <span className="text-5xl font-bold text-white tracking-tight">{currentSnapshot.connectedDevicesCount ?? 0}</span>
                       </div>
                       <div className="pt-6 border-t border-slate-700/40 mt-6">
                         <div className="flex items-center justify-between text-xs mb-2">
                           <span className="text-slate-400">Connection Sessions</span>
                           <span className="text-blue-400 font-semibold">
                             {timeRange === 'today' ? currentSnapshot.deviceSessionsCountToday : timeRange === '7d' ? currentSnapshot.deviceSessionsCount7d : currentSnapshot.deviceSessionsCount30d} sessions
                           </span>
                         </div>
                         <div className="w-full bg-slate-700/50 h-2 rounded-full overflow-hidden mb-2">
                           <div 
                             className="bg-blue-500 h-full rounded-full transition-all duration-1000" 
                             style={{ width: `${Math.min(100, ((currentSnapshot.connectedDevicesCount ?? 0) / Math.max(1, currentSnapshot.totalDevices ?? 1)) * 100)}%` }}
                           ></div>
                         </div>
                         <span className="text-xs text-slate-400">{currentSnapshot.connectedDevicesCount ?? 0} active in this period out of {currentSnapshot.totalDevices ?? 0} registered devices</span>
                       </div>
                   </div>
                </div>
              );
            default:
              return null;
          }
        })()}

        {/* Table Area */}
        {activeTab === "Device Metrics" ? (
          <div className="bg-[#242F41] rounded-xl border border-slate-700/40 overflow-hidden flex flex-col mt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="text-xs font-semibold text-slate-400 bg-[#1B2435]/50 border-b border-slate-700/30">
                  <tr>
                    <th className="px-6 py-4">ACCOUNT</th>
                    <th className="px-6 py-4">DEVICE ID</th>
                    <th className="px-6 py-4">CONNECTION</th>
                    <th className="px-6 py-4">SESSIONS</th>
                    <th className="px-6 py-4 text-center">MANAGE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {(currentSnapshot.devicesList || []).length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                        No registered devices found.
                      </td>
                    </tr>
                  ) : (
                    (currentSnapshot.devicesList || [])
                      .slice((devicesPage - 1) * itemsPerPage, devicesPage * itemsPerPage)
                      .map((dev: any) => (
                      <tr key={dev.id} className="hover:bg-slate-700/10 transition-colors">
                        <td className="px-6 py-5 text-white font-medium">{dev.account || '—'}</td>
                        <td className="px-6 py-5 text-white font-medium">{dev.deviceId || '—'}</td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${dev.status === 'Connected' ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
                            <span className={dev.status === 'Connected' ? 'text-emerald-400' : 'text-slate-400'}>{dev.status}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-slate-300 font-medium">{dev.connectionCount || 0}</td>
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => setDeleteTarget(dev.id)}
                              disabled={deleteLoading}
                              className="text-slate-400 hover:text-rose-400 transition-colors p-1.5 rounded-md hover:bg-rose-500/10 cursor-pointer"
                              title="Delete Device"
                            >
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 px-6 border-t border-slate-700/30 flex items-center justify-between bg-[#242F41]">
              <span className="text-sm text-slate-400">
                Showing {(currentSnapshot.devicesList || []).length === 0 ? 0 : (devicesPage - 1) * itemsPerPage + 1} to {Math.min(devicesPage * itemsPerPage, (currentSnapshot.devicesList || []).length)} of {(currentSnapshot.devicesList || []).length} devices
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setDevicesPage(p => Math.max(1, p - 1))}
                  disabled={devicesPage === 1}
                  className={`w-8 h-8 flex items-center justify-center rounded border transition-colors ${devicesPage === 1 ? 'bg-[#1B2435]/50 border-slate-700/30 text-slate-600 cursor-not-allowed' : 'bg-[#1B2435] border-slate-700/50 text-slate-400 hover:text-white'}`}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <button 
                  onClick={() => setDevicesPage(p => Math.min(Math.max(1, Math.ceil((currentSnapshot.devicesList || []).length / itemsPerPage)), p + 1))}
                  disabled={devicesPage === Math.max(1, Math.ceil((currentSnapshot.devicesList || []).length / itemsPerPage))}
                  className={`w-8 h-8 flex items-center justify-center rounded border transition-colors ${devicesPage === Math.max(1, Math.ceil((currentSnapshot.devicesList || []).length / itemsPerPage)) ? 'bg-[#1B2435]/50 border-slate-700/30 text-slate-600 cursor-not-allowed' : 'bg-[#1B2435] border-slate-700/50 text-slate-400 hover:text-white'}`}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#242F41] border border-slate-700/40 rounded-xl overflow-hidden mt-6 flex flex-col">
            <div className="px-6 py-5 border-b border-slate-700/30 flex justify-between items-center bg-[#1B2435]/50 shrink-0">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                 <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
                 Data Points Analyzed by AI ({activeTab} • {rangeLabel})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm relative">
                <thead className="bg-[#1B2435]/80 text-slate-400 border-b border-slate-700/30 sticky top-0 z-10 backdrop-blur-sm">
                  <tr>
                    <th className="px-6 py-4 font-medium">Data Point ID</th>
                    <th className="px-6 py-4 font-medium">Source Event Description</th>
                    <th className="px-6 py-4 font-medium">Avg. Response Time</th>
                    <th className="px-6 py-4 font-medium">Timestamp</th>
                    <th className="px-6 py-4 font-medium">Tag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30 text-slate-300">
                  {getTableData().slice((dataPointsPage - 1) * itemsPerPage, dataPointsPage * itemsPerPage).map((row: any, index: number) => (
                    <tr key={index} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-400">{row.id}</td>
                      <td className="px-6 py-4">{row.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-300">{row.avgResponse}</td>
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
            <div className="p-4 px-6 border-t border-slate-700/30 flex items-center justify-between bg-[#242F41]">
              <span className="text-sm text-slate-400">
                Showing {getTableData().length === 0 ? 0 : (dataPointsPage - 1) * itemsPerPage + 1} to {Math.min(dataPointsPage * itemsPerPage, getTableData().length)} of {getTableData().length} records
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setDataPointsPage(p => Math.max(1, p - 1))}
                  disabled={dataPointsPage === 1}
                  className={`w-8 h-8 flex items-center justify-center rounded border transition-colors ${dataPointsPage === 1 ? 'bg-[#1B2435]/50 border-slate-700/30 text-slate-600 cursor-not-allowed' : 'bg-[#1B2435] border-slate-700/50 text-slate-400 hover:text-white'}`}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <button 
                  onClick={() => setDataPointsPage(p => Math.min(Math.max(1, Math.ceil(getTableData().length / itemsPerPage)), p + 1))}
                  disabled={dataPointsPage === Math.max(1, Math.ceil(getTableData().length / itemsPerPage))}
                  className={`w-8 h-8 flex items-center justify-center rounded border transition-colors ${dataPointsPage === Math.max(1, Math.ceil(getTableData().length / itemsPerPage)) ? 'bg-[#1B2435]/50 border-slate-700/30 text-slate-600 cursor-not-allowed' : 'bg-[#1B2435] border-slate-700/50 text-slate-400 hover:text-white'}`}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Delete Confirmation Modal for Device Metrics */}
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
              Are you sure you want to remove this device? This will clear the device ID from the user&apos;s account.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white bg-slate-700/30 hover:bg-slate-700/50 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteDevice(deleteTarget)}
                disabled={deleteLoading}
                className={`px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors cursor-pointer ${deleteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {deleteLoading ? 'Deleting...' : 'Delete Device'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
