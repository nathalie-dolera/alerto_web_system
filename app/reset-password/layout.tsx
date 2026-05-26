import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset password | Alerto",
};

export default function ResetPasswordLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
