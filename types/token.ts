export interface TokenBalance {
  address: string
  symbol: string
  amount: string
  humanReadableAmount: number
  decimals: number
  priceUsd: number
  valueUsd: number
  logo: string | null
}

export interface SelectedToken {
  address: string
  percentage: number
}
