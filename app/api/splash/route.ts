import { NextResponse } from "next/server"

export async function GET() {
  // Generate a 200x200 token-themed splash icon
  const imageBuffer = await fetch("/token-splash.png").then((res) => res.arrayBuffer())

  return new NextResponse(Buffer.from(imageBuffer), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000",
    },
  })
}
