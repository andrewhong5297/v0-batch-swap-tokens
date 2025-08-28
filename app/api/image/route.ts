import { NextResponse } from "next/server"

export async function GET() {
  // Generate a 3:2 aspect ratio token-themed thumbnail
  const imageBuffer = await fetch("/token-thumbnail.png").then((res) => res.arrayBuffer())

  return new NextResponse(Buffer.from(imageBuffer), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000",
    },
  })
}
