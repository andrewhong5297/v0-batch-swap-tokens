import { NextResponse } from "next/server"

export async function GET() {
  // Generate a 1024x1024 token-themed icon
  const imageBuffer = await fetch("/token-icon.png").then((res) => res.arrayBuffer())

  return new NextResponse(Buffer.from(imageBuffer), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000",
    },
  })
}
