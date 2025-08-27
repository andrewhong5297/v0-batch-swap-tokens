"use client"

import { useState } from "react"
import { useAccount, useWalletClient } from "wagmi"
import { sendCalls, waitForCallsStatus } from "viem/actions"
import type { TokenBalance } from "@/types/token"
import { Button } from "./ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"

interface SwapButtonProps {
  selectedTokens: TokenBalance[]
  selectedTokensWithPercentages: Map<string, number>
  totalValue: number
  trailId: string
  versionId: string
  trailAppId: string
  primaryNodeId: string
}

type SwapStep = "idle" | "approving" | "swapping" | "completed"

export function SwapButton({
  selectedTokens,
  selectedTokensWithPercentages,
  totalValue,
  trailId,
  versionId,
  trailAppId,
  primaryNodeId,
}: SwapButtonProps) {
  const { address } = useAccount()
  const { data: walletClient } = useWalletClient()
  const [swapStep, setSwapStep] = useState<SwapStep>("idle")
  const [isExpanded, setIsExpanded] = useState(false)
  const [targetToken, setTargetToken] = useState("USDC")

  const handleSwap = async () => {
    if (!address || !walletClient || selectedTokens.length === 0) return

    try {
      const evaluationPromises = selectedTokens.map(async (token) => {
        const percentage = selectedTokensWithPercentages.get(token.address) || 100
        const humanReadableAmount = Number.parseFloat(token.humanReadableAmount)
        const actualAmountToSwap = (humanReadableAmount * percentage) / 100

        const response = await fetch(
          `https://trails-api.herd.eco/v1/trails/${trailId}/versions/${versionId}/steps/1/evaluations`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Herd-Trail-App-Id": trailAppId,
            },
            body: JSON.stringify({
              walletAddress: address,
              userInputs: {
                [primaryNodeId]: {
                  contract_address: { value: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913" }, // USDC
                  sell_token_address: { value: token.address },
                  sell_token_amount: { value: actualAmountToSwap.toString() },
                },
              },
              execution: { type: "latest" },
            }),
          },
        )
        return response.json()
      })

      const evaluationResults = await Promise.all(evaluationPromises)
      console.log("[v0] Evaluation results:", evaluationResults)

      const approvalCalls = evaluationResults
        .filter((result) => result.swapSteps?.approval?.approvalRequired)
        .map((result) => ({
          to: result.swapSteps.approval.contractAddress as `0x${string}`,
          data: result.swapSteps.approval.callData as `0x${string}`,
          value: BigInt(0),
        }))

      if (approvalCalls.length > 0) {
        setSwapStep("approving")
        console.log("[v0] Sending batch approvals:", approvalCalls)

        const approvalCallsId = await sendCalls(walletClient, {
          calls: approvalCalls,
        })

        console.log("[v0] Approval calls sent, waiting for confirmation:", approvalCallsId)
        const approvalStatus = await waitForCallsStatus(walletClient, {
          id: approvalCallsId,
        })

        if (approvalStatus.status !== "success") {
          throw new Error("Approval transactions failed")
        }
        console.log("[v0] Approvals confirmed")
      }

      setSwapStep("swapping")
      const swapCalls = evaluationResults
        .filter((result) => result.swapSteps?.swap)
        .map((result) => ({
          to: result.swapSteps.swap.contractAddress as `0x${string}`,
          data: result.swapSteps.swap.callData as `0x${string}`,
          value: BigInt(result.swapSteps.swap.payableAmount || "0"),
        }))

      console.log("[v0] Sending batch swaps:", swapCalls)
      const swapCallsId = await sendCalls(walletClient, {
        calls: swapCalls,
      })

      console.log("[v0] Swap calls sent, waiting for confirmation:", swapCallsId)
      const swapStatus = await waitForCallsStatus(walletClient, {
        id: swapCallsId,
      })

      if (swapStatus.status !== "success") {
        throw new Error("Swap transactions failed")
      }

      const executionPromises = swapStatus.receipts?.map(async (receipt) => {
        if (receipt.transactionHash) {
          return fetch(`https://trails-api.herd.eco/v1/trails/${trailId}/versions/${versionId}/executions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Herd-Trail-App-Id": trailAppId,
            },
            body: JSON.stringify({
              nodeId: primaryNodeId,
              transactionHash: receipt.transactionHash,
              walletAddress: address,
              execution: { type: "latest" },
            }),
          })
        }
      })

      if (executionPromises) {
        await Promise.all(executionPromises)
        console.log("[v0] All executions submitted successfully")
      }

      setSwapStep("completed")
      setTimeout(() => setSwapStep("idle"), 3000) // Reset after 3 seconds
    } catch (error) {
      console.error("[v0] Error during batch swap:", error)
      setSwapStep("idle")
    }
  }

  const getButtonText = () => {
    switch (swapStep) {
      case "approving":
        return "Approving tokens..."
      case "swapping":
        return "Swapping tokens..."
      case "completed":
        return "Swap completed!"
      default:
        return `Swap for $${totalValue.toFixed(2)} ${targetToken}`
    }
  }

  const showApprovalInfo = swapStep === "approving"

  return (
    <div className="fixed bottom-4 left-0 right-0 bg-black border-t border-gray-800">
      {showApprovalInfo && (
        <div className="p-3 bg-yellow-900/20 border-b border-yellow-700/30">
          <div className="text-sm text-yellow-300 text-center">Step 1 of 2: Approving tokens for swap</div>
        </div>
      )}

      {/* Expandable Summary */}
      {isExpanded && (
        <div className="p-4 border-b border-gray-700 max-h-64 overflow-y-auto">
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Selected Tokens</h3>
            {selectedTokens.map((token) => {
              const percentage = selectedTokensWithPercentages.get(token.address) || 100
              const tokenValue = (token.valueUsd * percentage) / 100
              const tokenAmount = (Number.parseFloat(token.humanReadableAmount) * percentage) / 100

              return (
                <div key={token.address} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={token.logoUrl || "/placeholder.svg"}
                      alt={token.symbol}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <div className="text-sm font-medium">{token.symbol}</div>
                      <div className="text-xs text-gray-400">
                        {tokenAmount.toFixed(2).toLocaleString()} ({percentage}%)
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">${tokenValue.toFixed(2).toLocaleString()}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Swap Button */}
      <div className="p-4">
        <div className="flex gap-2">
          <Button
            onClick={handleSwap}
            disabled={swapStep !== "idle" || selectedTokens.length === 0}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-xl text-lg font-semibold flex items-center justify-center gap-2"
          >
            {getButtonText()}
            {swapStep === "idle" && (
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold">$</span>
              </div>
            )}
          </Button>

          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            className="bg-black hover:bg-gray-800 text-white p-4 rounded-xl border border-gray-700"
            size="icon"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
