"use client"

import type { TokenBalance } from "@/types/token"
import { Check } from "lucide-react"

interface TokenListProps {
  tokens: TokenBalance[]
  selectedTokens: Map<string, number> // Changed from Set to Map to track percentages
  onTokenSelect: (tokenAddress: string) => void
  onPercentageChange: (tokenAddress: string, percentage: number) => void // Added percentage change handler
  loading: boolean
}

export function TokenList({ tokens, selectedTokens, onTokenSelect, onPercentageChange, loading }: TokenListProps) {
  if (loading) {
    return <div className="p-4 text-center text-gray-400">Loading token balances...</div>
  }

  if (tokens.length === 0) {
    return (
      <div className="p-4 text-center text-gray-400">
        No tokens found. Make sure you have tokens in your wallet and a valid Dune API key.
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {tokens.map((token) => {
        const isSelected = selectedTokens.has(token.address)
        const selectedPercentage = selectedTokens.get(token.address) || 100

        return (
          <div
            key={token.address}
            className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
              isSelected ? "bg-gray-800 border border-purple-600" : "hover:bg-gray-800"
            }`}
            onClick={() => onTokenSelect(token.address)}
          >
            {/* Token Icon */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                {token.logo ? (
                  <img
                    src={token.logo || "/placeholder.svg"}
                    alt={token.symbol}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-semibold text-white">{token.symbol.charAt(0)}</span>
                )}
              </div>

              {/* Token Info */}
              <div>
                <div className="font-medium text-white">{token.symbol}</div>
                <div className="text-sm text-gray-400">
                  {token.humanReadableAmount.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}{" "}
                  {token.symbol}
                </div>
              </div>
            </div>

            {/* USD value and checkbox */}
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-3">
                {/* USD Value */}
                <div className="text-right">
                  <div className="text-white font-medium">${token.valueUsd.toFixed(2)}</div>
                </div>

                {/* Checkbox */}
                <div
                  className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                    isSelected ? "bg-purple-600 border-purple-600" : "border-gray-600"
                  }`}
                >
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>
              </div>

              {/* Percentage buttons */}
              {isSelected && (
                <div className="flex gap-1">
                  {[10, 50, 100].map((percentage) => (
                    <button
                      key={percentage}
                      onClick={(e) => {
                        e.stopPropagation()
                        onPercentageChange(token.address, percentage)
                      }}
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                        selectedPercentage === percentage
                          ? "bg-purple-600 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      {percentage}%
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
