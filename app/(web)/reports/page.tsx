"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { ExportButton } from "@/components/dashboard/export-button";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("System Overview");
  const [selectedAnomaly, setSelectedAnomaly] = useState<string | null>(null);

  const getAiInsight = () => {
    switch (activeTab) {
      case "System Overview":
        return {
          compilation: "Compiled data over the last 30 days indicates a 5% increase in total trips monitored and a consistently high success rate for alert processing.",
          recommendation: "System resources are currently optimal. It is recommended to schedule a database optimization routine next month to maintain fast query speeds if trip growth continues."
        };
      case "User Activity":
        return {
          compilation: "Data reveals that peak active users consistently hit maximum volume between 05:00 PM and 07:00 PM, heavily driven by consistent daily commuters.",
          recommendation: "Deploy targeted push notifications regarding safety protocols at 04:30 PM to ensure commuters are prepared and devices are fully charged before the peak rush hour begins."
        };
      case "Alarm History":
        return {
          compilation: "Analysis of recent commute incidents highlights a significant spike in Driver Drowsiness alerts (10 incidents) alongside 32 Snoring incidents during late-night routes.",
          recommendation: "Implement mandatory in-app auditory wake-up pings for drivers operating after 10:00 PM. Schedule immediate safety reviews for drivers with multiple drowsiness flags to prevent accidents."
        };
      case "Device Metrics":
        return {
          compilation: "Network analysis confirms 8,405 connected devices, but data shows that a small percentage of active nodes experienced intermittent connectivity drops in rural zones.",
          recommendation: "Optimize the mobile app's offline-mode caching mechanism so that critical sensor data (like snoring or drowsiness detection) syncs immediately without data loss once connection is restored."
        };
      default:
        return null;
    }
  };

  const getAnomalyDetails = (type: string) => {
    switch (type) {
      case 'Driver Drowsiness':
        return (
          <div className="space-y-2 text-sm mt-2">
             <div className="grid grid-cols-3 text-slate-500 font-medium border-b border-slate-700/50 pb-2 mb-2">
                <span>Trip ID / Driver</span><span>Detection Time</span><span>System Response</span>
             </div>
             <div className="grid grid-cols-3 text-slate-300 pb-1.5 border-b border-slate-800">
                <span className="font-medium text-white">#TRP-512 (John D.)</span><span>Today, 11:42 PM</span><span className="text-purple-400">Wake-up Ping Sent (12s)</span>
             </div>
             <div className="grid grid-cols-3 text-slate-300 pb-1.5 border-b border-slate-800">
                <span className="font-medium text-white">#TRP-408 (Mike S.)</span><span>Today, 10:15 PM</span><span className="text-purple-400">Admin Voice Call (28s)</span>
             </div>
             <div className="grid grid-cols-3 text-slate-300 pb-1.5">
                <span className="font-medium text-white">#TRP-399 (Alex R.)</span><span>Yesterday, 01:05 AM</span><span className="text-purple-400">Wake-up Ping Sent (15s)</span>
             </div>
          </div>
        );
      case 'Theft / SOS':
        return (
          <div className="space-y-2 text-sm mt-2">
             <div className="grid grid-cols-3 text-slate-500 font-medium border-b border-slate-700/50 pb-2 mb-2">
                <span>Location</span><span>Alert Time</span><span>Resolution</span>
             </div>
             <div className="grid grid-cols-3 text-slate-300 pb-1.5 border-b border-slate-800">
                <span className="font-medium text-white">Bus 4A (EDSA)</span><span>Today, 06:15 PM</span><span className="text-red-400">Police Dispatched (35s)</span>
             </div>
             <div className="grid grid-cols-3 text-slate-300 pb-1.5">
                <span className="font-medium text-white">Jeepney (Recto)</span><span>Yesterday, 08:30 PM</span><span className="text-red-400">Driver Alerted (20s)</span>
             </div>
          </div>
        );
      case 'Route Deviations':
        return (
          <div className="space-y-2 text-sm mt-2">
             <div className="grid grid-cols-3 text-slate-500 font-medium border-b border-slate-700/50 pb-2 mb-2">
                <span>Trip ID</span><span>Deviation Distance</span><span>Status</span>
             </div>
             <div className="grid grid-cols-3 text-slate-300 pb-1.5 border-b border-slate-800">
                <span className="font-medium text-white">#TRP-882</span><span>1.2 km off-route</span><span className="text-yellow-400">Verified Detour (Traffic)</span>
             </div>
             <div className="grid grid-cols-3 text-slate-300 pb-1.5">
                <span className="font-medium text-white">#TRP-711</span><span>3.5 km off-route</span><span className="text-yellow-400">Admin Follow-up</span>
             </div>
          </div>
        );
      case 'Snoring Detected':
        return (
          <div className="space-y-2 text-sm mt-2">
             <div className="grid grid-cols-3 text-slate-500 font-medium border-b border-slate-700/50 pb-2 mb-2">
                <span>User ID</span><span>Duration Detected</span><span>Action Taken</span>
             </div>
             <div className="grid grid-cols-3 text-slate-300 pb-1.5 border-b border-slate-800">
                <span className="font-medium text-white">User #8120</span><span>15 minutes</span><span className="text-indigo-400">Destination Alarm Pre-set</span>
             </div>
             <div className="grid grid-cols-3 text-slate-300 pb-1.5 border-b border-slate-800">
                <span className="font-medium text-white">User #7401</span><span>45 minutes</span><span className="text-indigo-400">Logged to History</span>
             </div>
             <div className="grid grid-cols-3 text-slate-300 pb-1.5">
                <span className="font-medium text-white">User #6632</span><span>5 minutes</span><span className="text-indigo-400">False Alarm Dismissed</span>
             </div>
          </div>
        );
      default:
        return <p className="text-slate-400 text-sm mt-2">No detailed draft data available for this anomaly type.</p>;
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "System Overview":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
             <div className="bg-[#1B2435] border border-slate-700/50 rounded-xl p-6 flex flex-col justify-center">
                 <h4 className="text-slate-400 text-sm font-medium mb-1">Generated Reports</h4>
                 <span className="text-3xl font-bold text-white mb-4">24</span>
                 <div className="w-full bg-slate-700/50 h-2 rounded-full overflow-hidden">
                   <div className="bg-blue-500 w-3/4 h-full"></div>
                 </div>
                 <span className="text-xs text-slate-500 mt-2">75% compared to last month</span>
             </div>
             <div className="bg-[#1B2435] border border-slate-700/50 rounded-xl p-6 flex flex-col justify-center">
                 <h4 className="text-slate-400 text-sm font-medium mb-1">Total Trips Monitored</h4>
                 <span className="text-3xl font-bold text-white mb-4">15,430</span>
                 <span className="text-xs text-green-400">+5% this week</span>
             </div>
             <div className="bg-[#1B2435] border border-slate-700/50 rounded-xl p-6 flex flex-col justify-center">
                 <h4 className="text-slate-400 text-sm font-medium mb-1">Alerts Processed</h4>
                 <span className="text-3xl font-bold text-white mb-4">842</span>
                 <span className="text-xs text-slate-500">All time</span>
             </div>
          </div>
        );
      case "User Activity":
        return (
          <div className="grid grid-cols-1 gap-6 mb-6">
             <div className="bg-[#1B2435] border border-slate-700/50 rounded-xl p-6 min-h-[300px]">
                <h3 className="text-lg font-semibold text-white mb-6">Peak Commute Times</h3>
                <div className="space-y-6 max-w-3xl">
                   {[
                     { time: "07:00 AM - 09:00 AM", users: 1240, percent: "85%" },
                     { time: "05:00 PM - 07:00 PM", users: 1850, percent: "100%" },
                     { time: "12:00 PM - 01:00 PM", users: 890, percent: "45%" }
                   ].map((slot, i) => (
                    <div key={slot.time}>
                       <div className="flex justify-between text-sm mb-2">
                         <span className="text-slate-300 font-medium">{slot.time}</span>
                         <span className="text-slate-400">{slot.users} live users</span>
                       </div>
                      <div className="w-full bg-slate-700/50 h-4 rounded-full overflow-hidden">
                         <div className="bg-indigo-500 h-full rounded-full transition-all duration-1000" style={{ width: slot.percent }}></div>
                       </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        );
      case "Alarm History":
        return (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            <div className="bg-[#1B2435] border border-slate-700/50 rounded-xl p-6 flex flex-col items-center justify-center">
               <h4 className="text-slate-400 text-sm font-medium mb-6 text-center">Commute Anomalies (This Month)</h4>
               <div className="relative w-40 h-40 rounded-full border-[20px] border-slate-700/30 border-t-red-500 border-r-purple-500 border-b-indigo-500 border-l-yellow-500 flex items-center justify-center shadow-inner">
                  <div className="flex flex-col items-center">
                    <span className="text-3xl font-bold text-white">64</span>
                    <span className="text-xs text-slate-500">Total Incidents</span>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4 w-full mt-8 text-sm">
                  <div className="flex flex-col items-center gap-1"><div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"></div><span className="text-slate-300 text-xs">Drowsiness</span><span className="font-bold text-white">10</span></div>
                  <div className="flex flex-col items-center gap-1"><div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div><span className="text-slate-300 text-xs">Snoring</span><span className="font-bold text-white">32</span></div>
                  <div className="flex flex-col items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div><span className="text-slate-300 text-xs">Theft</span><span className="font-bold text-white">8</span></div>
                  <div className="flex flex-col items-center gap-1"><div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]"></div><span className="text-slate-300 text-xs">Route Dev.</span><span className="font-bold text-white">14</span></div>
               </div>
            </div>
            <div className="xl:col-span-2 bg-[#1B2435] border border-slate-700/50 rounded-xl p-6 flex flex-col relative transition-all duration-300">
                <h3 className="text-lg font-semibold text-white mb-2">Anomaly Resolution Time</h3>
                <p className="text-slate-400 text-sm mb-6">Time taken to acknowledge and resolve commute alerts. <strong className="text-blue-400">Click a bar to view detailed records.</strong></p>
                <div className="flex items-end justify-around h-48 mt-auto pb-4 border-b border-slate-700/50">
                   <button 
                     onClick={() => setSelectedAnomaly(selectedAnomaly === 'Route Deviations' ? null : 'Route Deviations')}
                     className="flex flex-col items-center gap-3 group focus:outline-none"
                   >
                     <div className={`w-16 sm:w-20 border-t-2 border-yellow-500 h-24 flex items-center justify-center transition-all ${selectedAnomaly === 'Route Deviations' ? 'bg-yellow-500/40 shadow-[0_0_15px_rgba(234,179,8,0.3)] scale-105 rounded-t-lg' : 'bg-yellow-500/20 group-hover:bg-yellow-500/30'}`}><span className="text-sm font-medium text-yellow-400">2m 15s</span></div>
                     <span className="text-xs sm:text-sm font-medium text-slate-300 text-center">Route Dev.<br/>(Caution)</span>
                   </button>
                   <button 
                     onClick={() => setSelectedAnomaly(selectedAnomaly === 'Snoring Detected' ? null : 'Snoring Detected')}
                     className="flex flex-col items-center gap-3 group focus:outline-none"
                   >
                     <div className={`w-16 sm:w-20 border-t-2 border-indigo-500 h-16 flex items-center justify-center transition-all ${selectedAnomaly === 'Snoring Detected' ? 'bg-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.3)] scale-105 rounded-t-lg' : 'bg-indigo-500/20 group-hover:bg-indigo-500/30'}`}><span className="text-sm font-medium text-indigo-400">1m 10s</span></div>
                     <span className="text-xs sm:text-sm font-medium text-slate-300 text-center">Snoring<br/>(Notice)</span>
                   </button>
                   <button 
                     onClick={() => setSelectedAnomaly(selectedAnomaly === 'Theft / SOS' ? null : 'Theft / SOS')}
                     className="flex flex-col items-center gap-3 group focus:outline-none"
                   >
                     <div className={`w-16 sm:w-20 border-t-2 border-red-500 h-8 flex items-center justify-center transition-all ${selectedAnomaly === 'Theft / SOS' ? 'bg-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.3)] scale-105 rounded-t-lg' : 'bg-red-500/20 group-hover:bg-red-500/30'}`}><span className="text-sm font-medium text-red-400">30s</span></div>
                     <span className="text-xs sm:text-sm font-medium text-slate-300 text-center">Theft / SOS<br/>(Emergency)</span>
                   </button>
                   <button 
                     onClick={() => setSelectedAnomaly(selectedAnomaly === 'Driver Drowsiness' ? null : 'Driver Drowsiness')}
                     className="flex flex-col items-center gap-3 group focus:outline-none"
                   >
                     <div className={`w-16 sm:w-20 border-t-2 border-purple-500 h-6 flex items-center justify-center transition-all ${selectedAnomaly === 'Driver Drowsiness' ? 'bg-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.3)] scale-105 rounded-t-lg' : 'bg-purple-500/20 group-hover:bg-purple-500/30'}`}><span className="text-sm font-medium text-purple-400">25s</span></div>
                     <span className="text-xs sm:text-sm font-medium text-slate-300 text-center">Drowsiness<br/>(Emergency)</span>
                   </button>
                </div>

                {/* Conditional Expandable Data Box */}
                {selectedAnomaly ? (
                  <div className="mt-4 p-5 bg-[#0F172A]/80 border border-slate-600 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
                     <div className="flex justify-between items-center mb-3">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                           {selectedAnomaly} Records
                           <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full uppercase tracking-wide">Sample Data</span>{' '}
                        </h4>
                        <button onClick={() => setSelectedAnomaly(null)} className="text-slate-400 hover:text-white p-1 bg-slate-800 rounded-full">
                           <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                     </div>
                     {getAnomalyDetails(selectedAnomaly)}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 mt-4 text-center">Driver Drowsiness incidents require the fastest response time to prevent imminent danger.</p>
                )}
            </div>
          </div>
        );
      case "Device Metrics":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
             <div className="bg-[#1B2435] border border-slate-700/50 rounded-xl p-6 flex flex-col justify-center relative overflow-hidden group hover:border-blue-500/50 transition-colors cursor-pointer">
                 <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-colors"></div>
                 <div className="flex items-center justify-between mb-4 relative z-10">
                    <h4 className="text-slate-400 text-sm font-medium">Total Connected</h4>
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                    </div>
                 </div>
                 <span className="text-4xl font-bold text-white relative z-10">8,405</span>
                 <span className="text-xs font-medium text-green-400 mt-3 flex items-center gap-1 relative z-10">
                   <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                   +124 this week
                 </span>
             </div>
             <div className="bg-[#1B2435] border border-slate-700/50 rounded-xl p-6 flex flex-col justify-center relative overflow-hidden group hover:border-green-500/50 transition-colors cursor-pointer">
                 <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/10 rounded-full blur-xl group-hover:bg-green-500/20 transition-colors"></div>
                 <div className="flex items-center justify-between mb-4 relative z-10">
                    <h4 className="text-slate-400 text-sm font-medium">Active Nodes</h4>
                    <div className="p-2 bg-green-500/10 rounded-lg relative flex items-center justify-center w-9 h-9">
                      <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                    </div>
                 </div>
                 <span className="text-4xl font-bold text-white relative z-10">1,240</span>
                 <span className="text-xs text-slate-400 mt-3 relative z-10">Currently commuting / live</span>
             </div>
          </div>
        );
      default:
        return null;
    }
  };

  const getTableData = () => {
    switch (activeTab) {
      case "System Overview":
        return [
          { id: "SYS-001", description: "Trip #15430 logged successfully to system database.", date: "Today, 08:00 AM", status: "Normal" },
          { id: "SYS-002", description: "Weekly data synchronization completed.", date: "Today, 03:00 AM", status: "Normal" },
          { id: "SYS-003", description: "Database query latency warning (optimization recommended).", date: "Yesterday, 04:30 PM", status: "Caution" },
          { id: "SYS-004", description: "Weekly trip volume calculated (+5% increase).", date: "Yesterday, 12:00 AM", status: "Normal" },
        ];
      case "User Activity":
        return [
          { id: "USR-001", description: "User #8406 updated their saved places.", date: "Today, 04:45 PM", status: "Changed" },
          { id: "USR-002", description: "Mass push notification dispatched (Safety Protocols).", date: "Today, 04:30 PM", status: "Normal" },
          { id: "USR-003", description: "User #8405 started a new commute from Quezon City.", date: "Today, 04:15 PM", status: "Live" },
          { id: "USR-004", description: "Peak user load threshold reached (1,850 users).", date: "Yesterday, 05:30 PM", status: "Notice" },
        ];
      case "Alarm History":
        return [
          { id: "ALM-001", description: "Driver Drowsiness detected on Trip #512.", date: "Today, 11:42 PM", status: "Emergency" },
          { id: "ALM-002", description: "Driver Drowsiness detected on Trip #408.", date: "Today, 10:15 PM", status: "Emergency" },
          { id: "ALM-003", description: "Snoring detected for User #8120.", date: "Today, 12:15 AM", status: "Notice" },
          { id: "ALM-004", description: "Snoring detected for User #7401.", date: "Yesterday, 01:30 AM", status: "Notice" },
        ];
      case "Device Metrics":
        return [
          { id: "DEV-001", description: "Device #X92 connected (Stable Network).", date: "5 mins ago", status: "Connected" },
          { id: "DEV-002", description: "Device #Y14 lost connection (Rural Zone A).", date: "12 mins ago", status: "Disconnected" },
          { id: "DEV-003", description: "Device #Z88 re-synced cached sensor data.", date: "18 mins ago", status: "Normal" },
          { id: "DEV-004", description: "Device #Y15 lost connection (Rural Zone B).", date: "1 hour ago", status: "Disconnected" },
        ];
      default:
        return [];
    }
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
  const tableData = getTableData();
  const currentAiInsight = getAiInsight();

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
          <ExportButton stats={{}} users={[]} filename={`alerto_${activeTab.toLowerCase().replaceAll(' ', '_')}_report.csv`} label="Export Report" />
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
                    <span className="mr-2">Alerto AI Data Compilation</span>
                    <span className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30 tracking-wider">AUTO-GENERATED</span>
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
               </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        {renderTabContent()}

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
                {tableData.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-800/40 transition-colors">
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

