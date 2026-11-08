import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Syne } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

const SITE_URL = "https://mona-eliseyar.vercel.app";
const DESCRIPTION = "Self-hosted monitoring platform with ML anomaly detection and built-in MCP server. One-command deploy.";
const TITLE = "MONA — Monitoring and Analysis Platform"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s | MONA",
  },
  description: DESCRIPTION,
  applicationName: "MONA",
  keywords: [
    "monitoring platform",
    "anomaly detection",
    "metrics analysis",
    "observability",
    "infrastructure monitoring",
    "self hosted monitoring",
    "analyze metrics",
    "fastapi",
    "ML",
    "scikit-learn",
    "isolation forest",
    "mcp",
    "python",
  ],
  authors: [{ name: "eliseyar", url: "https://github.com/gwill1337" }],
  alternates: {
    canonical: "/",
  },
  verification: {
    google: "yWfmJFF-8Q8Id4lXFXfH2d_vEMZ10owh7bYGAeQdimk"
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "MONA",
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "technology",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${syne.variable} h-full antialiased`}
    >
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
