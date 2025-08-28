import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"

const farcasterFrame = {
  frame: {
    name: "Batch Token Swap",
    version: "1",
    iconUrl: "https://v0-batch-swap-tokens.vercel.app/api/icon",
    imageUrl: "https://v0-batch-swap-tokens.vercel.app/api/image",
    buttonTitle: "🔄 Batch Swap",
    splashImageUrl: "https://v0-batch-swap-tokens.vercel.app/api/splash",
    splashBackgroundColor: "#6200EA",
  },
}

export const metadata: Metadata = {
  title: "Batch Swap Tokens",
  description: "Batch swap tokens to clean up your wallet",
  generator: "v0.app",
  other: {
    "fc:miniapp": JSON.stringify(farcasterFrame),
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>{children}</body>
    </html>
  )
}
