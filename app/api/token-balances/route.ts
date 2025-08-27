import { NextRequest, NextResponse } from 'next/server'

const TRAIL_ID = "01981008-788e-7612-b501-b7f568328ef2"
const VERSION_ID = "01981008-7892-747d-adfe-4fbf2281aac9"
const TRAIL_APP_ID = "0198e91b-bf69-7e45-80b6-182589306b09"

export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json()

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    const duneApiKey = process.env.DUNE_API_KEY

    if (!duneApiKey) {
      console.error("DUNE_API_KEY environment variable is not set")
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const response = await fetch(
      `https://trails-api.herd.eco/v1/trails/${TRAIL_ID}/versions/${VERSION_ID}/nodes/01983330-716a-72ad-88ea-3f9f3988f730/read`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Herd-Trail-App-Id": TRAIL_APP_ID,
        },
        body: JSON.stringify({
          walletAddress,
          userInputs: {
            "01983330-716a-72ad-88ea-3f9f3988f730": {
              duneApiKey: { value: duneApiKey },
            },
          },
          execution: { type: "latest" },
        }),
      },
    )

    const data = await response.json()

    if (data.outputs?.tokenBalances) {
      const balancesData = JSON.parse(data.outputs.tokenBalances)
      const formattedTokens = balancesData.balances
        .filter((token: any) => Number.parseFloat(token.amount) > 0)
        .filter((token: any) => token.address !== "native")
        .filter((token: any) => token.address !== "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913") // Filter out USDC
        .map((token: any) => {
          const decimals = token.decimals || 18
          const rawAmount = BigInt(token.amount)
          const divisor = BigInt(10 ** decimals)
          const humanReadableAmount = Number(rawAmount) / Number(divisor)

          return {
            address: token.address,
            symbol: token.symbol || "Unknown",
            amount: token.amount, // Keep raw amount for transactions
            humanReadableAmount, // Add human-readable amount for display
            decimals,
            priceUsd: token.price_usd || 0,
            valueUsd: token.value_usd || 0,
            logo: token.token_metadata?.logo || null,
          }
        })
        .sort((a: any, b: any) => b.valueUsd - a.valueUsd)

      return NextResponse.json(formattedTokens)
    }

    return NextResponse.json([])
  } catch (error) {
    console.error("Error fetching token balances:", error)
    return NextResponse.json(
      { error: 'Failed to fetch token balances' },
      { status: 500 }
    )
  }
}
