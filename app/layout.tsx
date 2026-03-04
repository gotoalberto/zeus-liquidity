import type { Metadata } from "next"
import { Ubuntu, Titan_One } from "next/font/google"
import "./globals.css"
import { Web3Provider } from "@/providers/Web3Provider"
import { Toaster } from "sonner"

const ubuntu = Ubuntu({
  variable: "--font-ubuntu",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
})

const titanOne = Titan_One({
  variable: "--font-titan-one",
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
        className={`${ubuntu.variable} ${titanOne.variable} font-sans antialiased bg-background text-foreground`}
      >
        <Web3Provider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#ffffff",
                border: "3px solid #000000",
                color: "#000000",
                boxShadow: "4px 4px 0px 0px #000000",
                borderRadius: "1rem",
                fontFamily: "Ubuntu, sans-serif",
                fontWeight: "600",
              },
            }}
          />
        </Web3Provider>
      </body>
    </html>
  )
}
