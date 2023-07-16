import '@/styles/globals.css'
import type {AppProps} from 'next/app';
import {WagmiConfig, createConfig} from "wagmi";
import {
  ConnectKitProvider,
  ConnectKitButton,
  getDefaultConfig
} from "connectkit";
import {useEffect, useState} from "react";

const config = createConfig(
    /**
     * The default config method, create account on alchemy and WalletConnect and get the API keys,
     * add the value to the configuration
     */
    getDefaultConfig({
      alchemyId: "hIhqPwcbAGXh61YBFwaaEPRgHc8p9Ho5",
      // https://dashboard.alchemy.com/apps/p7su40l922fespyk
      walletConnectProjectId: "f4bd94feb72aca7729b613126c23bb92",
      // https://cloud.walletconnect.com
      appName: "eth-token-swap-app"
    })
)

export default function App({Component, pageProps}: AppProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() =>
          setMounted(true),
      // when first loaded, set the mounted value to true
      // the dependencies are empty, update only when dependencies change (no dependencies)
      []
  )

  // inside the ConnectKitProvider is the app
  return (
      <div style={{padding: "20px"}}>
        <WagmiConfig config={config}>
          <ConnectKitProvider theme="auto" mode="light">
            <ConnectKitButton/>
            {mounted && <Component {...pageProps}/>}
          </ConnectKitProvider>
        </WagmiConfig>
      </div>
  )
}