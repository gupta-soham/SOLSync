import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { NetworkProvider } from '@/contexts/NetworkContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL("https://crypt-media.vercel.app"),
  title: {
    default: "SOLSync - Seamless Solana Token Management",
    template: `%s | SOLSync`,
  },
  description:
    "Manage Solana tokens, swaps and accounts with ease",
  openGraph: {
    description:
      "Manage Solana tokens, swaps and accounts with ease",
    images: ["/og.png"],
    url: "https://crypt-media.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "Crypt",
    description:
      "Manage Solana tokens, swaps and accounts with ease",
    creator: "@_soham_gupta",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
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
          <NetworkProvider>
            {children}
          </NetworkProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}