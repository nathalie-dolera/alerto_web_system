import { useState, useMemo } from 'react';

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

  return {
    users: filteredUsers,
    totalUsers: users.length,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    toggleUserStatus,
    deleteUser
  };
}
