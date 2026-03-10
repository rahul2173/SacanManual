import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "ScanManual — Instant Product Identity & Manuals",
  description:
    "Scan any physical product using your camera to instantly retrieve official user manuals, guides, and chat with an AI product expert.",
  keywords: ["product scanner", "user manual finder", "AI product guide", "visual identification", "Sony manual", "iPhone guide"],
  authors: [{ name: "ScanManual Team" }],
  robots: "index, follow",
  openGraph: {
    title: "ScanManual — Point, Scan, Learn",
    description: "The ultimate AI-powered manual finder for all your physical products.",
    type: "website",
    siteName: "ScanManual",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ScanManual — AI Product Expert",
    description: "Identify any product and get its manual instantly.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-[#0a0a0a] text-white">
        {children}
      </body>
    </html>
  );
}
