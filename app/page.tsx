// Trail API reference: https://trails-api.herd.eco/v1/trails/01981008-788e-7612-b501-b7f568328ef2/versions/01981008-7892-747d-adfe-4fbf2281aac9/guidebook.txt?promptObject=web_app&trailAppId=0198e91b-bf69-7e45-80b6-182589306b09

import { BatchSwapApp } from "@/components/batch-swap-app"
import { Web3Provider } from "@/components/web3-provider"

export default function Home() {
  return (
    <Web3Provider>
      <BatchSwapApp />
    </Web3Provider>
  )
}
