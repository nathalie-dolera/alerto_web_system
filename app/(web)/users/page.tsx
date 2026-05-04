import { Metadata } from "next";
import UsersPageClient from "./page-client";

export const metadata: Metadata = {
  title: "Alerto | Users",
  description: "Manage system users and permissions",
};

export default function UsersPage() {
  return <UsersPageClient />;
}