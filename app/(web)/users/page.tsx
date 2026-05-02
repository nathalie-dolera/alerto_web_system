"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { UsersTable } from "@/components/users/users-table";
import { useUsers } from "@/hooks/useUsers";
import { downloadCSV } from "@/lib/exportUtils";

export default function UsersPage() {
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showAddPassword, setShowAddPassword] = useState(false);
  
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [userToUpdate, setUserToUpdate] = useState<any>(null);
  const [updatePasswordInput, setUpdatePasswordInput] = useState("");
  const [showUpdatePassword, setShowUpdatePassword] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState(false);

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
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    clearForm();
    setShowAddPassword(false);
  };

  const openUpdateModal = (user: any) => {
    setUserToUpdate(user);
    setIsUpdateModalOpen(true);
    setUpdatePasswordInput("");
    setUpdateError("");
    setUpdateSuccess(false);
    setShowUpdatePassword(false);
  };

  const closeUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setUserToUpdate(null);
    setUpdatePasswordInput("");
    setUpdateSuccess(false);
    setShowUpdatePassword(false);
  };

  const submitUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatePasswordInput) return;

    setUpdateLoading(true);
    setUpdateError("");

    try {
      const res = await fetch(`/api/admin/users/${userToUpdate.id}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: updatePasswordInput }),
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("API route not found. Did you create the backend endpoint?");
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update password");
      }

      setUpdateSuccess(true);
      setTimeout(() => {
        closeUpdateModal();
      }, 2000);
      
    } catch (err: any) {
       setUpdateError(err.message || "Something went wrong.");
    } finally {
       setUpdateLoading(false);
    }
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
          onUpdatePassword={openUpdateModal} 
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
              const success = await handleAddSubAdmin(newEmail, newPassword);
              if (success) {
                setNewEmail("");
                setNewPassword("");
              }
            }} className="p-6 space-y-4">
              {addError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                  {addError}
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Email Address</label>
                <input
                  type="email"
                  required
                  autoComplete="off"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full bg-[#0F172A] text-white border border-slate-700/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg py-2.5 px-4 outline-none transition-all placeholder:text-slate-600 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <div className="relative">
                  <input
                    type={showAddPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#0F172A] text-white border border-slate-700/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg py-2.5 px-4 pr-10 outline-none transition-all placeholder:text-slate-600 text-sm tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAddPassword(!showAddPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    {showAddPassword ? (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
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
                  onClick={clearForm}
                  className="mr-auto text-slate-500 hover:text-slate-300 text-xs font-medium transition-colors"
                >
                  Clear Form
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isUpdateModalOpen && userToUpdate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E293B] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-700/50">
            <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Update Password</h2>
              <button onClick={closeUpdateModal} className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            
            <form onSubmit={submitUpdatePassword} className="p-6 space-y-4">
              <div className="mb-2">
                <p className="text-sm text-slate-400">Updating password for: <span className="text-white font-semibold">{userToUpdate.email || userToUpdate.name}</span></p>
              </div>

              {updateError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                  {updateError}
                </div>
              )}

              {updateSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm">
                  Password updated successfully!
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">New Password</label>
                <div className="relative">
                  <input
                    type={showUpdatePassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={updatePasswordInput}
                    onChange={(e) => setUpdatePasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#0F172A] text-white border border-slate-700/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg py-2.5 px-4 pr-10 outline-none transition-all placeholder:text-slate-600 text-sm tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={() => setShowUpdatePassword(!showUpdatePassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    {showUpdatePassword ? (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-4 flex gap-3 flex-row-reverse">
                <button
                  type="submit"
                  disabled={updateLoading || updateSuccess}
                  className={`bg-[#3B82F6] hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${(updateLoading || updateSuccess) ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {updateLoading ? 'Updating...' : 'Save Password'}
                </button>
                <button
                  type="button"
                  onClick={closeUpdateModal}
                  className="bg-transparent hover:bg-slate-800 text-slate-300 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}