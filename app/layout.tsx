import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"

const farcasterFrame = {
  version: "next",
  imageUrl: "https://v0-batch-swap-tokens.vercel.app/api/image",
  button: {
    title: "🔄 Batch Swap",
    action: {
      type: "launch_frame",
      name: "Batch Swap Tokens",
      url: "https://v0-batch-swap-tokens.vercel.app",
      splashImageUrl: "https://v0-batch-swap-tokens.vercel.app/api/splash",
      splashBackgroundColor: "#000000",
    },
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
