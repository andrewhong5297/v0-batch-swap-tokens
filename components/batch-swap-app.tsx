"use client"

import { useState, useEffect } from "react"
import { useAccount, useSwitchChain } from "wagmi"
import { base } from "wagmi/chains"
import { ConnectKitButton } from "connectkit"
import { TokenList } from "./token-list"
import { SwapButton } from "./swap-button"
import { PastSwapsDropdown } from "./past-swaps-dropdown"
import type { TokenBalance } from "@/types/token"
import { sdk } from "@farcaster/frame-sdk"

const TRAIL_ID = "01981008-788e-7612-b501-b7f568328ef2"
const VERSION_ID = "01981008-7892-747d-adfe-4fbf2281aac9"
const TRAIL_APP_ID = "0198e91b-bf69-7e45-80b6-182589306b09"
const PRIMARY_NODE_ID = "0198332f-ed72-713a-a545-feb312fe888d"

export function BatchSwapApp() {
  const { address, status } = useAccount()
  const { switchChain } = useSwitchChain()
  const [tokens, setTokens] = useState<TokenBalance[]>([])
  const [selectedTokens, setSelectedTokens] = useState<Map<string, number>>(new Map())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const initializeSdk = async () => {
      try {
        await sdk.actions.ready()
      } catch (error) {
        console.error("Failed to initialize SDK:", error)
      }
    }

    initializeSdk()
  }, [])

  useEffect(() => {
    if (status === "connected") {
      switchChain({ chainId: base.id })
    }
  }, [switchChain, status])

  useEffect(() => {
    console.log(`status: ${status}, address: ${address}`)
    if (status === "connected" && address) {
      loadTokenBalances()
    }
  }, [status, address])

  const loadTokenBalances = async () => {
    if (!address) return

    setLoading(true)
    try {
      const response = await fetch("/api/token-balances", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ walletAddress: address }),
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch token balances: ${response.statusText}`)
      }

      const tokenBalances = await response.json()
      setTokens(tokenBalances)
    } catch (error) {
      console.error("Error loading token balances:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleTokenSelect = (tokenAddress: string) => {
    const newSelected = new Map(selectedTokens)
    if (newSelected.has(tokenAddress)) {
      newSelected.delete(tokenAddress)
    } else {
      if (newSelected.size >= 10) {
        return // Don't add more tokens if already at limit
      }
      newSelected.set(tokenAddress, 100)
    }
    setSelectedTokens(newSelected)
  }

  const handlePercentageChange = (tokenAddress: string, percentage: number) => {
    const newSelected = new Map(selectedTokens)
    if (newSelected.has(tokenAddress)) {
      newSelected.set(tokenAddress, percentage)
      setSelectedTokens(newSelected)
    }
  }

  const handleSelectMultiple = (count: number) => {
    const newSelected = new Map<string, number>()
    tokens.slice(0, Math.min(count, 10)).forEach((token) => {
      newSelected.set(token.address, 100)
    })
    setSelectedTokens(newSelected)
  }

  const handleClear = () => {
    setSelectedTokens(new Map())
  }

  const handleSwapComplete = () => {
    setSelectedTokens(new Map())
  }

  const selectedTokensList = tokens.filter((token) => selectedTokens.has(token.address))
  const totalValue = selectedTokensList.reduce((sum, token) => {
    const percentage = selectedTokens.get(token.address) || 100
    return sum + (token.valueUsd * percentage) / 100
  }, 0)

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="bg-purple-600 p-4 text-center">
        <h1 className="text-lg font-semibold text-balance">Batch swap tokens to clean up your wallet!</h1>
      </div>

      {status !== "connected" ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <p className="text-gray-400 text-balance">Connect your wallet to get started</p>
            <div className="flex justify-center">
              <ConnectKitButton />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          {/* Controls */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <span className="text-white">{selectedTokens.size} selected</span>
              {address && <PastSwapsDropdown walletAddress={address} />}
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => handleSelectMultiple(10)} className="text-white underline text-sm">
                Select 10
              </button>
              <button onClick={handleClear} className="text-white underline text-sm">
                Clear
              </button>
            </div>
          </div>

          {/* Token List */}
          <div className="flex-1 overflow-y-auto pb-32">
            <TokenList
              tokens={tokens}
              selectedTokens={selectedTokens}
              onTokenSelect={handleTokenSelect}
              onPercentageChange={handlePercentageChange}
              loading={loading}
            />
          </div>

          {/* Swap Button */}
          {selectedTokens.size > 0 && (
            <SwapButton
              selectedTokens={selectedTokensList}
              selectedTokensWithPercentages={selectedTokens}
              totalValue={totalValue}
              trailId={TRAIL_ID}
              versionId={VERSION_ID}
              trailAppId={TRAIL_APP_ID}
              primaryNodeId={PRIMARY_NODE_ID}
              onSwapComplete={handleSwapComplete}
              onReloadBalances={loadTokenBalances}
            />
          )}
        </div>
      )}

      {/* Footer */}
      <footer className="fixed bottom-0 text-center text-xs text-gray-500 bg-black w-full min-h-[20px]">
        <a
          href="https://herd.eco/trails/01981008-788e-7612-b501-b7f568328ef2/overlook"
          target="_blank"
          rel="noreferrer"
        >
          Powered by Herd
        </a>
      </footer>
    </div>
  )
}
