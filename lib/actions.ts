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

    // Extract transaction data from walletExecutions.txnsPerStep instead of totals
    const pastSwaps: any[] = []

    if (data.walletExecutions && data.walletExecutions.length > 0) {
      for (const walletExecution of data.walletExecutions) {
        // Get transactions from step 1 (the swap step)
        const step1Transactions = walletExecution.txnsPerStep?.["1"] || []

        for (const transaction of step1Transactions) {
          pastSwaps.push({
            txHash: transaction.txHash,
            blockTimestamp: transaction.blockTimestamp,
            sellTokenSymbol: transaction.evaluation?.finalInputValues?.sell_token_symbol || "Unknown",
            sellTokenAmount: transaction.evaluation?.finalInputValues?.sell_token_amount || "0",
            buyTokenSymbol: transaction.evaluation?.finalInputValues?.buy_token_symbol || "Unknown",
            buyTokenAmount: transaction.evaluation?.finalInputValues?.buy_token_amount || "0",
            sellTokenAmountUsd: transaction.evaluation?.finalInputValues?.sell_token_amount_usd || "0",
          })
        }
      }
    }

    // Sort by block timestamp (most recent first)
    return pastSwaps.sort((a, b) => b.blockTimestamp - a.blockTimestamp)
  } catch (error) {
    console.error("Error fetching past swaps:", error)
    return []
  }
}
