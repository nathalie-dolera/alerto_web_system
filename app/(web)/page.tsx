import { Metadata } from "next";
import AdminLoginClient from "./page-client";

export const metadata: Metadata = {
  title: "Alerto | Login",
  description: "Admin login for Alerto platform",
};

export default function AdminLogin() {
  return <AdminLoginClient />;
}
