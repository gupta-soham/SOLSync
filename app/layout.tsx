import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { NetworkProvider } from '@/contexts/NetworkContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SOLSync - Seamless Solana Token Management',
  description: 'Manage Solana tokens, swaps and accounts with ease',
}

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