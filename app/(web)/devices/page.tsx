import { Metadata } from "next";
import DevicesPageClient from "./page-client";

export const metadata: Metadata = {
  title: "Alerto | Devices",
  description: "Manage and monitor connected devices",
};

export default function DevicesPage() {
  return <DevicesPageClient />;
}