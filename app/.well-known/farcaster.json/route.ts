import { NextResponse } from "next/server"

export async function GET() {
  // 307 Temporary Redirect to Farcaster hosted manifest
  return NextResponse.redirect(
    "https://api.farcaster.xyz/miniapps/hosted-manifest/0198f165-44ac-2125-3734-0a97f053322b",
    { status: 307 },
  )
}
