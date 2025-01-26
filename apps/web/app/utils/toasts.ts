import type { ToastActionElement } from "@repo/ui/components/ui/toast";

type ToastOptions = {
  title: string;
  description: string;
  variant: "default" | "destructive";
  duration?: number;
  action?: ToastActionElement;
};

function walletNotConnectedToast(toast: (options: ToastOptions) => void) {
  toast({
    title: "Please connect your wallet",
    description: "You need to connect your wallet to create an airstream",
    variant: "destructive",
  });
}

function wrongNetworkToast(toast: (options: ToastOptions) => void) {
  toast({
    title: "Please connect to the correct network",
    description:
      "You need to connect to the correct network to create an airstream",
    variant: "destructive",
  });
}

function insufficientBalanceToast(toast: (options: ToastOptions) => void) {
  toast({
    title: "Insufficient balance",
    description:
      "You do not have enough balance of the selected token to create an airstream.",
    variant: "destructive",
  });
}

function sendCreateAirstreamTxErrorToast(
  toast: (options: ToastOptions) => void,
) {
  toast({
    title: "Error",
    description: "Failed to send transaction",
    variant: "destructive",
  });
}

function processTxErrorToast(toast: (options: ToastOptions) => void) {
  toast({
    title: "Error",
    description: "Failed to process transaction logs",
    variant: "destructive",
  });
  return;
}

function sendClaimAirstreamTxErrorToast(
  toast: (options: ToastOptions) => void,
) {
  toast({
    title: "Error",
    description: "Failed to send transaction",
    variant: "destructive",
  });
}

function uploadMerkleTreeToIpfsErrorToast(
  toast: (options: ToastOptions) => void,
) {
  toast({
    title: "Error uploading merkle tree to IPFS",
    description: "Upload it manually, please.",
    variant: "destructive",
  });
}

function airstreamLinkCopiedToast(toast: (options: ToastOptions) => void) {
  toast({
    title: "Link copied to clipboard",
    description: "You can now share it with your users!",
    variant: "default",
  });
}

export {
  walletNotConnectedToast,
  wrongNetworkToast,
  insufficientBalanceToast,
  sendCreateAirstreamTxErrorToast,
  processTxErrorToast,
  sendClaimAirstreamTxErrorToast,
  uploadMerkleTreeToIpfsErrorToast,
  airstreamLinkCopiedToast,
};
