import { WALLETCONNECT_CONFIG } from "@/utils/wallet";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { WagmiProvider } from "wagmi";

const queryClient = new QueryClient();

export function WalletProvider(props: PropsWithChildren) {
  return (
    <WagmiProvider config={WALLETCONNECT_CONFIG}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{props.children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
