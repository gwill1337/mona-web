import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MCP",
  description: "MCP documentation for MONA self-hosted anomaly detection and monitoring platform",
  alternates: { canonical: "/demo/mcp" }
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}