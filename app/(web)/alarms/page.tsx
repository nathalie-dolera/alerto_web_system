import { Metadata } from "next";
import AlarmsPageClient from "./page-client";

export const metadata: Metadata = {
  title: "Alerto | Alarms",
  description: "Monitor and manage security alarms",
};

export default function AlarmsPage() {
  return <AlarmsPageClient />;
}