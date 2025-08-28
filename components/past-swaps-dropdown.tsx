"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ExternalLink } from "lucide-react"
import { fetchPastSwaps } from "@/lib/actions"

interface PastSwap {
  txHash: string
  blockTimestamp: number
  sellTokenSymbol: string
  sellTokenAmount: string
  buyTokenSymbol: string
  buyTokenAmount: string
  sellTokenAmountUsd: string
}

interface PastSwapsDropdownProps {
  walletAddress: string
}

export function PastSwapsDropdown({ walletAddress }: PastSwapsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [pastSwaps, setPastSwaps] = useState<PastSwap[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (walletAddress) {
      loadPastSwaps()
    }
  }, [walletAddress])

  const loadPastSwaps = async () => {
    setLoading(true)
    try {
      const swaps = await fetchPastSwaps(walletAddress)
      setPastSwaps(swaps)
    } catch (error) {
      console.error("Error loading past swaps:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString()
  }

  const formatAmount = (amount: string) => {
    const num = Number.parseFloat(amount)
    return num.toFixed(2)
  }

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 text-white text-sm underline">
        Past Swaps
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          <div className="p-3 border-b border-gray-700">
            <h3 className="text-white font-medium">Past Swaps</h3>
          </div>

          {loading ? (
            <div className="p-4 text-center text-gray-400">Loading...</div>
          ) : pastSwaps.length === 0 ? (
            <div className="p-4 text-center text-gray-400">No past swaps found</div>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              {pastSwaps.map((swap) => (
                <div key={swap.txHash} className="p-3 border-b border-gray-800 last:border-b-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white">
                        {formatAmount(swap.sellTokenAmount)} {swap.sellTokenSymbol} →{" "}
                        {formatAmount(swap.buyTokenAmount)} {swap.buyTokenSymbol}
                      </div>
                      <div className="text-xs text-gray-400">
                        ${formatAmount(swap.sellTokenAmountUsd)} • {formatDate(swap.blockTimestamp)}
                      </div>
                      <div className="text-xs text-gray-500 font-mono truncate">
                        {swap.txHash.slice(0, 10)}...{swap.txHash.slice(-8)}
                      </div>
                    </div>
                    <a
                      href={`https://herd.eco/base/tx/${swap.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
