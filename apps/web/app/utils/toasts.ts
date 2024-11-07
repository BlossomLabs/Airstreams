type ToastOptions = {
  title: string;
  description: string;
  variant: "default" | "destructive";
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

export {
  walletNotConnectedToast,
  wrongNetworkToast,
  sendCreateAirstreamTxErrorToast,
  processTxErrorToast,
};
