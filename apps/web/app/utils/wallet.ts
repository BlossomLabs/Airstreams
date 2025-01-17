import "@rainbow-me/rainbowkit/styles.css";
import { SITE_NAME } from "@/utils/site";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { createPublicClient } from "viem";
import { http, type Config, createConfig } from "wagmi";
import { base, mainnet } from "wagmi/chains";

export const WALLETCONNECT_PROJECT_ID =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? "";

if (!WALLETCONNECT_PROJECT_ID) {
  console.warn(
    "You need to provide a VITE_WALLETCONNECT_PROJECT_ID env variable",
  );
}

export const WALLETCONNECT_CONFIG: Config = getDefaultConfig({
  appName: SITE_NAME,
  projectId: WALLETCONNECT_PROJECT_ID || "dummy",
  chains: [base],
  ssr: false,
});

export const mainnetConfig = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(),
  },
});

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
}); // Use this to get ENS addresses
