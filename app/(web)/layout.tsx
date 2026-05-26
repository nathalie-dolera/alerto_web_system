import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | Alerto",
};

export default function WebGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
