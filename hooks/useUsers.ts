import { useState, useMemo, useEffect } from 'react';

export type UserStatus = 'All Users' | 'Active' | 'Inactive';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  joinDate: string;
  status: string;
}

const initialUsers: User[] = [
  { id: 1, name: "Mira Medilo", email: "mira.m@alerto.com", role: "System Admin", joinDate: "Oct 12, 2023", status: "Active" },
  { id: 2, name: "fiona.a@alerto.com", email: "", role: "Commuter", joinDate: "Nov 04, 2023", status: "Active" },
  { id: 3, name: "nathalie.d@alerto.com", email: "", role: "Commuter", joinDate: "Jan 15, 2024", status: "Inactive" },
];

export function useUsers() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<UserStatus>("All Users");

  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/admin/auth/me");
        if (res.ok) {
          const data = await res.json();
          setCurrentUserRole(data.user.role);
        }
      } catch (err) {
        console.error("Failed to fetch user role", err);
      }
    }
    fetchUser();
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
      const matchesSearch = 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTab = activeTab === "All Users" || user.status === activeTab;
      
      return matchesSearch && matchesTab;
    });
  }, [users, searchQuery, activeTab]);

  const toggleUserStatus = (id: number) => {
    setUsers(prev => prev.map(user => {
      if (user.id === id) {
        return { ...user, status: user.status === 'Active' ? 'Inactive' : 'Active' };
      }
      return user;
    }));
  };

  const deleteUser = (id: number) => {
    setUsers(prev => prev.filter(user => user.id !== id));
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
          id: Math.floor(Math.random() * 10000) + 100, // Temporary ID
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
