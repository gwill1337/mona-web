import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Userboard demo",
  description: "Demo Userboard for MONA self-hosted anomaly detection and monitoring platform",
  alternates: { canonical: "/demo/userboard" }
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}