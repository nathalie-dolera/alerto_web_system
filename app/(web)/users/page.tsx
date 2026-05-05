"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { UsersTable } from "@/components/users/users-table";
import { useUsers } from "@/hooks/useUsers";
import { downloadCSV } from "@/lib/exportUtils";

export default function UsersPage() {
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const { 
    users, totalUsers, searchQuery, setSearchQuery, 
    activeTab, setActiveTab, toggleUserStatus, deleteUser,
    currentUserRole, isAddModalOpen, setIsAddModalOpen, 
    handleAddSubAdmin, addLoading, addError, loading, error 
  } = useUsers();
  
  useEffect(() => {
    document.title = "Alerto | User";
  }, []);

  const clearForm = () => {
    setNewEmail("");
    setNewPassword("");
    setFieldErrors({});
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    clearForm();
  };

  return (
    <div className="min-h-screen bg-[#111827] flex font-sans">
      <Sidebar />

      <main className="flex-1 p-8 overflow-auto">
        <header className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
            <p className="text-slate-400">Manage and monitor system access for all registered users.</p>
          </div>
          <div className="flex items-center gap-3">
            {currentUserRole === 'super-admin' && (
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 bg-[#3B82F6] hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                Add Sub Admin
              </button>
            )}
            <button 
              onClick={() => downloadCSV(users, "alerto_users_export.csv")}
              className="flex items-center gap-2 bg-[#242F41] border border-slate-700/50 hover:bg-slate-700/50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export Data
            </button>
          </div>
        </header>

        <div className="flex flex-col gap-4">
          <div className="flex gap-6 border-b border-slate-700/50 pb-2">
            {(["All Users", "Active", "Inactive", "Disabled"] as const).map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`transition-colors font-medium pb-2 -mb-[9px] ${activeTab === tab ? 'text-white border-b-2 border-white' : 'text-slate-400 hover:text-white'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative mt-4">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email or role..." 
              className="bg-[#242F41] text-sm text-white border border-slate-700/30 rounded-lg pl-9 pr-4 py-3 w-full focus:outline-none focus:border-slate-500 placeholder:text-slate-500"
            />
          </div>
        </div>

        <UsersTable 
          users={users} 
          totalUsers={totalUsers}
          onToggleStatus={toggleUserStatus}
          onDelete={deleteUser}
          loading={loading}
        />
      </main>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E293B] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-700/50">
            <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Add Sub Admin</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              
              const errors: { email?: string; password?: string } = {};
              if (!newEmail.trim()) {
                errors.email = "Please enter an email address.";
              } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
                errors.email = "Please enter a valid email address.";
              } else {
                const domain = newEmail.split('@')[1]?.toLowerCase();
                const allowedDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'commutewake.com'];
                if (!allowedDomains.includes(domain)) {
                  errors.email = "Incorrect domain format";
                }
              }
              if (!newPassword.trim()) {
                errors.password = "Please enter a password.";
              } else if (newPassword.length < 8) {
                errors.password = "Password must be at least 8 characters long.";
              }
              
              setFieldErrors(errors);
              if (Object.keys(errors).length > 0) {
                return;
              }

              const success = await handleAddSubAdmin(newEmail, newPassword);
              if (success) {
                clearForm();
              }
            }} className="p-6 space-y-4" noValidate>
              {addError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm flex items-start gap-2">
                  <svg className="w-5 h-5 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <span>{addError}</span>
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Email Address</label>
                <input
                  type="email"
                  autoComplete="off"
                  value={newEmail}
                  onChange={(e) => {
                    setNewEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: undefined });
                  }}
                  placeholder="admin@example.com"
                  className={`w-full bg-[#0F172A] text-white border ${fieldErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-700/50 focus:border-blue-500 focus:ring-blue-500'} focus:ring-1 rounded-lg py-2.5 px-4 outline-none transition-all placeholder:text-slate-600 text-sm`}
                />
                {fieldErrors.email && (
                  <p className="text-red-400 text-xs mt-1">{fieldErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: undefined });
                  }}
                  placeholder="••••••••"
                  className={`w-full bg-[#0F172A] text-white border ${fieldErrors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-700/50 focus:border-blue-500 focus:ring-blue-500'} focus:ring-1 rounded-lg py-2.5 px-4 outline-none transition-all placeholder:text-slate-600 text-sm tracking-widest`}
                />
                {fieldErrors.password && (
                  <p className="text-red-400 text-xs mt-1">{fieldErrors.password}</p>
                )}
              </div>

              <div className="pt-4 flex gap-3 flex-row-reverse">
                <button
                  type="submit"
                  disabled={addLoading}
                  className={`bg-[#3B82F6] hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${addLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {addLoading ? 'Creating...' : 'Create Admin'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-transparent hover:bg-slate-800 text-slate-300 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to clear?")) {
                      clearForm();
                    }
                  }}
                  className="mr-auto text-slate-500 hover:text-slate-300 text-xs font-medium transition-colors"
                >
                  Clear Form
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}