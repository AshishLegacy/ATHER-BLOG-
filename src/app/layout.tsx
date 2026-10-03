import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getCurrentUser } from "@/lib/auth";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "AetherBlog — Modern Engineering & System Design",
    template: "%s | AetherBlog",
  },
  description:
    "A modern full-stack publication exploring web development, artificial intelligence, system architecture, and UI/UX design.",
  keywords: [
    "Next.js 15",
    "React 19",
    "TypeScript",
    "System Design",
    "Web Development",
    "Software Engineering",
  ],
  authors: [{ name: "AetherBlog Engineering Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "AetherBlog",
    title: "AetherBlog — Modern Engineering & System Design",
    description:
      "A modern full-stack publication exploring web development, artificial intelligence, and system architecture.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80",
        width: 1200,
        height: 630,
        alt: "AetherBlog Cover",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AetherBlog — Modern Engineering & System Design",
    description:
      "A modern full-stack publication exploring web development, artificial intelligence, and system architecture.",
    images: ["https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} min-h-screen flex flex-col font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar user={user} />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
