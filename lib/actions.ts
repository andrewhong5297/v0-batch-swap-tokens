// API documentation: https://trails-api.herd.eco/v1/trails/01981008-788e-7612-b501-b7f568328ef2/versions/01981008-7892-747d-adfe-4fbf2281aac9/guidebook.txt?trailAppId=0198a42e-6183-745a-abca-cb89fd695d50
export async function fetchPastSwaps(walletAddress: string) {
  const TRAIL_ID = "01981008-788e-7612-b501-b7f568328ef2"
  const VERSION_ID = "01981008-7892-747d-adfe-4fbf2281aac9"
  const TRAIL_APP_ID = "0198e91b-bf69-7e45-80b6-182589306b09"

  try {
    const response = await fetch(
      `https://trails-api.herd.eco/v1/trails/${TRAIL_ID}/versions/${VERSION_ID}/executions/query`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Herd-Trail-App-Id": TRAIL_APP_ID,
        },
        body: JSON.stringify({
          walletAddresses: [walletAddress],
        }),
      },
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch past swaps: ${response.statusText}`)
    }

    const data = await response.json()

    // Extract transaction hashes with swap details from step 1 transactions
    const pastSwaps = data.totals?.stepStats?.["1"]?.transactionHashes || []

    return pastSwaps.map((swap: any) => ({
      txHash: swap.txHash,
      blockTimestamp: swap.blockTimestamp,
      sellTokenSymbol: swap.evaluation?.finalInputValues?.sell_token_symbol || "Unknown",
      sellTokenAmount: swap.evaluation?.finalInputValues?.sell_token_amount || "0",
      buyTokenSymbol: swap.evaluation?.finalInputValues?.buy_token_symbol || "Unknown",
      buyTokenAmount: swap.evaluation?.finalInputValues?.buy_token_amount || "0",
      sellTokenAmountUsd: swap.evaluation?.finalInputValues?.sell_token_amount_usd || "0",
    }))
  } catch (error) {
    console.error("Error fetching past swaps:", error)
    return []
  }
}
