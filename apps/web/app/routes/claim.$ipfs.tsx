import { Connect } from "@/components/Connect";
import FormCard from "@/components/form/shared/FormCard";

import { sendClaimAirstreamTx } from "@/utils/airstream";
import { getProof } from "@/utils/merkletree";
import { walletNotConnectedToast } from "@/utils/toasts";
import { sendClaimAirstreamTxErrorToast } from "@/utils/toasts";
import { Button } from "@repo/ui/components/ui/button";
import { useToast } from "@repo/ui/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import type { PublicClient } from "viem";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";

const availableHashes = [
  "QmYXPMoF77ZMkvmgb2A6DDZEk8r61uX8mQrGckNxwsgX1C",
  "QmYGgfNWPgkTkjMrQpTCHLxDxmrSrtxXMTiKBJS59W54bQQma1TbyFCe6WFcoQ4riHSe2Z6tkNaWtXrNzEESHHxAtVFF",
];

function ClaimPage() {
  const { writeContract } = useWriteContract();
  const { address, chain } = useAccount();
  const { toast } = useToast();
  const publicClient = usePublicClient() as PublicClient;
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

    let res: `0x${string}` | undefined;
    try {
      if (amount && proof) {
        res = await sendClaimAirstreamTx(
          writeContract,
          contractAddress,
          address,
          amount,
          proof,
        );
      }
    } catch (error) {
      console.error(error);
      sendClaimAirstreamTxErrorToast(toast);
      return;
    }

    // const result = await processTx(res, publicClient);
    // if (!result || !result.airstream) {
    //   processTxErrorToast(toast);
    //   return;
    // }
    // const { airstream } = result;
    // toast({
    //   title: "Airstream claimed",
    //   description: <>{airstream}</>,
    //   variant: "default",
    // });
  }

  if (!address) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="px-3 mt-16">
          <FormCard
            title="Claim your Airstream"
            description="Connect your wallet to check if you're eligible for this AirStream. Great surprises might be waiting for you!"
          >
            <div className="flex justify-center">
              <Connect />
              {/* <Button
                className="py-3 px-6 rounded-md w-full md:w-auto"
                size="xl"
                >
                Connect Wallet
                </Button> */}
            </div>
          </FormCard>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return;
  }

  if (amount && proof) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="px-3 mt-16">
          <FormCard
            title="You are elegible for this AirStream"
            description="Congratulations  🎉! You can claim your AirStream now and start receiving your tokens!"
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
          title="You are not elegible for this AirStream"
          description="It's sad, we know. But you can still join the community and be eligible for future AirStreams!"
        >
          <div className="flex justify-center">
            <div className="text-6xl">😢</div>
          </div>
        </FormCard>
      </div>
    </div>
  );
}

export default ClaimPage;
