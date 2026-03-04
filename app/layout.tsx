import type { Metadata } from "next"
import { Ubuntu, Titan_One } from "next/font/google"
import "./globals.css"
import { Web3Provider } from "@/providers/Web3Provider"
import { Toaster } from "sonner"
import { SplashScreen } from "@/components/ui/SplashScreen"

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
  icons: {
    icon: [
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
}

export const viewport = {
  themeColor: "#4BBFE0",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
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
          <SplashScreen />
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
