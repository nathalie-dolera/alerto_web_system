import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Devices | Alerto",
};

export default function DevicesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
