import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Docs",
  description: "Documentation for MONA self-hosted anomaly detection and monitoring platform",
  alternates: { canonical: "/demo/docs" }
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}