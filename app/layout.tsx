import type { Metadata } from "next"
import { Inter, JetBrains_Mono, Bangers } from "next/font/google"
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

const bangers = Bangers({
  variable: "--font-bangers",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
})

export const metadata: Metadata = {
  title: "ZEUS Liquidity Manager | earn.pepes.dog",
  description: "Provide liquidity for ZEUS/ETH on Uniswap V4. The god dog earns.",
  keywords: ["ZEUS", "Uniswap V4", "Liquidity", "DeFi", "Ethereum", "Pepe"],
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
        className={`${inter.variable} ${jetbrainsMono.variable} ${bangers.variable} font-sans antialiased bg-background text-foreground`}
      >
        <Web3Provider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#0F1020",
                border: "1px solid rgba(232,161,23,0.3)",
                color: "#F0F0FF",
                boxShadow: "0 0 20px rgba(232,161,23,0.15)",
              },
            }}
          />
        </Web3Provider>
      </body>
    </html>
  )
}
