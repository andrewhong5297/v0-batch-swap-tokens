import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"

const baseUrl = "https://v0-batch-swap-tokens.vercel.app"

const frameEmbed = {
  version: "next",
  imageUrl: `${baseUrl}/api/image`,
  button: {
    title: "Swap Tokens Now",
    action: {
      type: "launch_frame",
      name: "Batch Token Swap",
      url: baseUrl,
      splashImageUrl: `${baseUrl}/api/splash`,
      splashBackgroundColor: "#6200EA",
    },
  },
}

export const metadata: Metadata = {
  title: "Batch Token Swap",
  description: "Swap your tokens all in one go, using a Herd trail!",
  generator: "v0.app",
  metadataBase: new URL(baseUrl),
  openGraph: {
    title: "Batch Token Swap",
    description: "Swap your tokens all in one go, using a Herd trail!",
    url: baseUrl,
    siteName: "Batch Token Swap",
    images: [
      {
        url: "/api/image",
        width: 1200,
        height: 800,
        alt: "Batch Token Swap",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Batch Token Swap",
    description: "Swap your tokens all in one go, using a Herd trail!",
    images: ["/api/image"],
  },
  other: {
    "fc:miniapp": JSON.stringify(frameEmbed),
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
