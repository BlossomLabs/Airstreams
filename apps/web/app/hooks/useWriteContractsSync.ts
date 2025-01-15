import type { TransactionReceipt } from "viem";
import { usePublicClient, useWriteContract } from "wagmi";

function useWriteContractsSync() {
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  async function writeContractsSync(
    operations: any[],
  ): Promise<TransactionReceipt[] | null> {
    if (!publicClient) {
      return null;
    }
    const receipts: TransactionReceipt[] = [];
    for (const operation of operations) {
      const hash = await writeContractAsync(operation);
      receipts.push(
        await publicClient.waitForTransactionReceipt({
          hash,
          confirmations: 1,
        }),
      );
      console.log("receipt", receipts[receipts.length - 1]);
    }
    return receipts;
  }

  return {
    writeContractsSync,
  };
}

export default useWriteContractsSync;
