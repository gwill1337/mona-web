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
const DESCRIPTION = "Open-source, self-hosted monitoring platform with ML anomaly detection and built-in MCP server. One-command deploy.";
const TITLE = "MONA - Self-Hosted Monitoring and Analytics Platform"

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
    "metrics analytics",
    "infrastructure monitoring",
    "self hosted monitoring",
    "analyze metrics",
    "fastapi",
    "ML",
    "scikit-learn",
    "isolation forest",
    "mcp",
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

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "MONA",
  alternateName: "MONA - Monitor & Analytics Platform",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Linux, Kubernetes, Docker",
  description: DESCRIPTION,
  url: SITE_URL,
  license: "https://opensource.org/licenses/MIT",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  author: { "@type": "Person", name: "eliseyar", url: "https://github.com/gwill1337" },
  sameAs: ["https://github.com/gwill1337/MONA"],
};


export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${syne.variable} h-full antialiased`}
    >
      <head>
        <script type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      </head>
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
