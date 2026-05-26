import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Alarms | Alerto",
};

export default function AlarmsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
