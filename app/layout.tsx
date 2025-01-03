import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { NetworkProvider } from "@/contexts/NetworkContext";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://solsync-sg.vercel.app"),
  title: {
    default: "SOLSync - Seamless Solana Token Management",
    template: `%s | SOLSync`,
  },
  description: "Manage Solana tokens, swaps and accounts with ease",
  openGraph: {
    description: "Manage Solana tokens, swaps and accounts with ease",
    images: ["/og.png"],
    url: "https://solsync-sg.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "SOLSync - Seamless Solana Token Management",
    description: "Manage Solana tokens, swaps and accounts with ease",
    creator: "@sohamgpt",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <NetworkProvider>{children}</NetworkProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
