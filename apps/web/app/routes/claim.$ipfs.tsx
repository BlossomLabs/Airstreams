import { ConnectButton } from "@/components/ConnectButton";
import FormCard from "@/components/form/shared/FormCard";

import { claimAirstream } from "@/utils/airstream";
import { getProof } from "@/utils/merkletree";
import { walletNotConnectedToast } from "@/utils/toasts";
import { sendClaimAirstreamTxErrorToast } from "@/utils/toasts";
import { Button } from "@repo/ui/components/ui/button";
import { useToast } from "@repo/ui/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { formatUnits, parseAbi } from "viem";
import {
  useAccount,
  useBalance,
  useReadContracts,
  useWriteContract,
} from "wagmi";

function ClaimPage() {
  const { writeContractAsync } = useWriteContract();
  const { address, chain } = useAccount();
  const { toast } = useToast();
  const ipfsHash = useParams().ipfs;

  const { data: file, isLoading } = useQuery({
    queryKey: ["file", ipfsHash],
    queryFn: () => {
      return fetch(`https://ipfs.blossom.software/ipfs/${ipfsHash}`).then(
        (res) => res.json(),
      );
    },
  });

  const [proof, setProof] = useState<`0x${string}`[] | null>(null);
  const [amount, setAmount] = useState<bigint | null>(null);

  const { data } = useReadContracts({
    contracts: [
      {
        abi: parseAbi([
          "function isClaimed(address account) public view returns (bool)",
        ]),
        functionName: "isClaimed",
        address: file?.contract,
        // biome-ignore lint/style/noNonNullAssertion: It's not undefined since the query is enabled
        args: [address!],
      },
      {
        abi: parseAbi([
          "function distributionToken() public view returns (address)",
        ]),
        functionName: "distributionToken",
        address: file?.contract,
      },
    ],
    query: {
      enabled: !!address && !!file?.contract,
    },
  });

  const isClaimed = data?.[0]?.result;
  const tokenAddr = data?.[1]?.result;

  useEffect(() => {
    if (!file || !address) {
      return;
    }
    const [proof_, amount_] = getProof(file, address) || [];
    if (proof_ && amount_) {
      setProof(proof_ as `0x${string}`[]);
      setAmount(amount_ as bigint);
    }
  }, [file, address]);

  async function onClaim() {
    if (!address || !chain) {
      walletNotConnectedToast(toast);
      return;
    }

    const contractAddress = file.contract;

    if (!contractAddress) {
      toast({
        title: "Contract address not found",
        description: "Please contact the team",
        variant: "destructive",
      });
      return;
    }

    try {
      if (amount && proof) {
        await claimAirstream(
          writeContractAsync,
          contractAddress,
          address,
          amount,
          proof,
        );
        toast({
          title: "Airstream claimed",
          description: "You started receiving your tokens!",
          variant: "default",
        });
      }
    } catch (error) {
      console.error(error);
      sendClaimAirstreamTxErrorToast(toast);
      return;
    }
  }

  if (!address) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="px-3 mt-16">
          <FormCard
            title="Claim your Airstream"
            description="Connect your wallet to check if you're eligible for this Airstream. Great surprises might be waiting for you!"
          >
            <div className="flex justify-center">
              <ConnectButton />
            </div>
          </FormCard>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return;
  }

  if (isClaimed) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="px-3 mt-16">
          <FormCard
            title="You claimed your Airstream"
            description="This is your balance"
          >
            <div className="flex justify-center font-bold text-lg">
              <Balance tokenAddr={tokenAddr} />
            </div>
          </FormCard>
        </div>
      </div>
    );
  }

  if (amount && proof) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="px-3 mt-16">
          <FormCard
            title="You are elegible for this Airstream"
            description="Congratulations  🎉! You can claim your Airstream now and start receiving your tokens!"
          >
            <div className="flex justify-center">
              <Button
                className="py-3 px-6 rounded-md w-full md:w-auto"
                size="xl"
                onClick={onClaim}
              >
                Claim your stream
              </Button>
            </div>
          </FormCard>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="px-3 mt-16">
        <FormCard
          title="You are not elegible for this Airstream"
          description="It's sad, we know. But you can still join the community and be eligible for future Airstreams!"
        >
          <div className="flex justify-center">
            <div className="text-6xl">😢</div>
          </div>
        </FormCard>
      </div>
    </div>
  );
}

function Balance({ tokenAddr }: { tokenAddr: `0x${string}` | undefined }) {
  const { address } = useAccount();
  const { data: balance } = useBalance({
    address,
    token: tokenAddr,
    query: {
      enabled: !!tokenAddr,
      refetchInterval: 1000,
    },
  });
  return (
    <div>
      {formatUnits(balance?.value || 0n, balance?.decimals || 18)}{" "}
      {balance?.symbol}
    </div>
  );
}

export default ClaimPage;
