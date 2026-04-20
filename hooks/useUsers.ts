import { useState, useMemo, useEffect } from 'react';

export type UserStatus = 'All Users' | 'Active' | 'Inactive' | 'Disabled';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  joinDate: string;
  status: string;
  isAdmin?: boolean;
  alarmCount?: number;
  tripCount?: number;
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<UserStatus>("All Users");

  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const [authRes, usersRes] = await Promise.all([
          fetch("/api/admin/auth/me"),
          fetch("/api/admin/users")
        ]);

        if (authRes.ok) {
          const authData = await authRes.json();
          setCurrentUserRole(authData.user.role);
        }

        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData);
        } else {
          setError("Failed to fetch users");
        }
      } catch (err) {
        console.error("Failed to fetch data", err);
        setError("An error occurred while loading users");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "Active" || tab === "Inactive" || tab === "All Users") {
        setActiveTab(tab as UserStatus);
      }
    }
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Determine display status
      let displayStatus: UserStatus = 'Active';
      
      if (user.status === 'Inactive') {
        displayStatus = 'Disabled';
      } else if (!user.isAdmin) {
        // Commuters
        displayStatus = ((user.alarmCount || 0) > 0 || (user.tripCount || 0) > 0) ? 'Active' : 'Inactive';
      } else {
        // Admins
        displayStatus = 'Active';
      }

      const matchesSearch = 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTab = activeTab === "All Users" || displayStatus === activeTab;
      
      return matchesSearch && matchesTab;
    });
  }, [users, searchQuery, activeTab]);

  const toggleUserStatus = async (id: string) => {
    const user = users.find(u => u.id === id);
    if (!user) return;

    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update status");
      }
    } catch (err) {
      console.error("Failed to toggle status", err);
      alert("An error occurred while updating status");
    }
  };

  const deleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete user");
      }
    } catch (err) {
      console.error("Failed to delete user", err);
      alert("An error occurred while deleting user");
    }
  };

  const handleAddSubAdmin = async (email: string, password: string): Promise<boolean> => {
    setAddLoading(true);
    setAddError("");
    try {
      const res = await fetch("/api/admin/users/sub-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      
      if (res.ok) {
        const newAdminUser: User = {
          id: (Math.floor(Math.random() * 10000) + 100).toString(), // Temporary ID
          name: email.split('@')[0],
          email: email,
          role: "Sub Admin",
          joinDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          status: "Active"
        };
        setUsers(prev => [...prev, newAdminUser]);
        setIsAddModalOpen(false);
        return true;
      } else {
        setAddError(data.error || "Failed to create sub admin");
        return false;
      }
    } catch (err) {
      setAddError("An error occurred. Please try again.");
      return false;
    } finally {
      setAddLoading(false);
    }
  };

  return {
    users: filteredUsers,
    totalUsers: users.length,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    toggleUserStatus,
    deleteUser,
    currentUserRole,
    isAddModalOpen,
    setIsAddModalOpen,
    handleAddSubAdmin,
    addLoading,
    addError
  };
}
