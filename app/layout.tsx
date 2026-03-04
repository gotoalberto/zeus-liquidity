import type { Metadata } from "next"
import { Inter, JetBrains_Mono, DM_Sans } from "next/font/google"
import "./globals.css"
import { Web3Provider } from "@/providers/Web3Provider"
import { Toaster } from "sonner"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
})

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "ZEUS Liquidity Manager | Uniswap V4",
  description: "Professional liquidity management for ZEUS/ETH pair on Uniswap V4. Provide liquidity with market cap-based ranges.",
  keywords: ["ZEUS", "Uniswap V4", "Liquidity", "DeFi", "Ethereum"],
  authors: [{ name: "ZEUS Protocol" }],
}

export const viewport = {
  themeColor: "#E8A117",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${dmSans.variable} font-sans antialiased bg-background text-foreground`}
      >
        <Web3Provider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#161720",
                border: "1px solid #1E2030",
                color: "#E5E7EB",
              },
            }}
          />
        </Web3Provider>
      </body>
    </html>
  )
}
