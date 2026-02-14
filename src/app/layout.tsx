import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Bookmark Manager",
  description:
    "Save and organize your bookmarks with real-time sync across devices",
  keywords: ["bookmarks", "organization", "productivity", "web tools"],
  authors: [{ name: "Smart Bookmark Manager" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link href="/dist/styles.css" rel="stylesheet"></link>
      </head>
      <body className="h-full font-sans antialiased bg-background">
        {children}
      </body>
    </html>
  );
}
