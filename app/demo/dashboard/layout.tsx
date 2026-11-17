import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard demo",
  description: "Demo dashboard for MONA self-hosted anomaly detection and monitoring platform",
  alternates: { canonical: "/demo/dashboard" }
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}