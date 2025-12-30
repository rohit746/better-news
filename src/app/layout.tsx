import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { ThemeToggle } from "~/components/theme-toggle";

export const metadata: Metadata = {
  title: "Better News",
  description: "A beautiful Hacker News client",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground selection:bg-primary/20 selection:text-primary antialiased">
        <TRPCReactProvider>
          <div className="bg-noise pointer-events-none fixed inset-0 z-[-1] opacity-[0.4]" />
          <div className="mx-auto min-h-screen max-w-4xl px-4 py-8 md:py-16">
            <header className="border-border mb-16 flex items-baseline justify-between border-b pb-6">
              <div className="flex flex-col gap-1">
                <h1 className="text-primary font-mono text-3xl font-bold tracking-tighter">
                  BETTER_NEWS
                </h1>
                <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
                  Realtime Feed v1.0
                </p>
              </div>
              <ThemeToggle />
            </header>
            <main>{children}</main>
            <footer className="border-border text-muted-foreground mt-24 border-t pt-8 text-center text-xs font-medium tracking-widest uppercase">
              <p>Designed for Clarity • Built with tRPC</p>
            </footer>
          </div>
        </TRPCReactProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const storedTheme = localStorage.getItem('theme');
                  const isDark = storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (_) {}
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
