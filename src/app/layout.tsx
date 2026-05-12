import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PayPilot | Smart Receivables Automation",
  description: "Automate your billing and collection process with AI-driven follow-ups.",
};

import { ThemeProvider } from "@/components/shared/theme-provider";
import { Toaster } from "sonner";
import { AuthGuard } from "@/components/shared/auth-guard";

import { SidebarProvider } from "@/components/layout/sidebar-provider";

import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background text-foreground transition-colors duration-300`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthGuard>
            <SidebarProvider>
              {children}
            </SidebarProvider>
          </AuthGuard>
          <Toaster richColors position="top-right" closeButton />
          <SpeedInsights />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
