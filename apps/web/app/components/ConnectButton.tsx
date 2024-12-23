import { ConnectButton as RainbowConnectButton } from "@rainbow-me/rainbowkit";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Button } from "@repo/ui/components/ui/button";
import { useAccount } from "wagmi";

export function ConnectButton() {
  const { address } = useAccount();
  const { openConnectModal } = useConnectModal();
  return address ? (
    <RainbowConnectButton showBalance={false} />
  ) : (
    <Button className="px-8 py-5" onClick={openConnectModal}>
      Connect Wallet
    </Button>
  );
}
