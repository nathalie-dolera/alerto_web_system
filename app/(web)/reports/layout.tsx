import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reports | Alerto",
};

export default function ReportsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
