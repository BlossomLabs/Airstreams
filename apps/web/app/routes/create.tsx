import BasicParametersCard from "@/components/form/BasicParametersCard";
import {
  getContractAddress,
  getRecipients,
  processTx,
  sendCreateAirstreamTx,
} from "@/utils/airstream";
import { type FormValues, useCreateAirstreamForm } from "@/utils/form";
import { downloadMerkleTree } from "@/utils/merkletree";
import {
  processTxErrorToast,
  sendCreateAirstreamTxErrorToast,
  walletNotConnectedToast,
  wrongNetworkToast,
} from "@/utils/toasts";
import { Button } from "@repo/ui/components/ui/button";
import { Form } from "@repo/ui/components/ui/form";
import { useToast } from "@repo/ui/hooks/use-toast";
import type { PublicClient } from "viem";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";

function CreatePage() {
  const { writeContract } = useWriteContract();
  const form = useCreateAirstreamForm();
  const { address, chain } = useAccount();
  const { toast } = useToast();
  const publicClient = usePublicClient() as PublicClient;

  async function onSubmit(values: FormValues) {
    console.log(values);
    if (!address || !chain) {
      walletNotConnectedToast(toast);
      return;
    }
    const contractAddress = getContractAddress(chain);
    if (!contractAddress) {
      wrongNetworkToast(toast);
      return;
    }
    const recipients = await getRecipients(values);
    let res: `0x${string}` | undefined;
    try {
      res = await sendCreateAirstreamTx(
        writeContract,
        contractAddress,
        values,
        recipients,
      );
    } catch (error) {
      console.error(error);
      sendCreateAirstreamTxErrorToast(toast);
      return;
    }
    console.log({ res });

    const result = await processTx(res, publicClient);
    if (!result || !result.airstream) {
      processTxErrorToast(toast);
      return;
    }
    const { airstream } = result;

    downloadMerkleTree(recipients, airstream, "sepolia");

    // try {
    //   res = await sendDistributeFlowTx(writeContract, airstream);
    // } catch (error) {
    //   sendDistributeFlowTxErrorToast(toast);
    //   return;
    // }
    // await publicClient.waitForTransactionReceipt({ hash })
    toast({
      title: "Airstream created",
      description: <>{airstream}</>,
      variant: "default",
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="py-10 mt-10">
        <div className="hidden">{JSON.stringify(form.formState.errors)}</div>{" "}
        {/* FIXME: If this is removed, the form will not re-render the errors */}
        <div className="max-w-xl mx-auto">
          <div className="px-3">
            <h2 className="font-header text-3xl font-bold mb-2 text-center">
              Create an Airstream
            </h2>
            <p className="text-gray-700 mb-6 text-center">
              This form creates a Superfluid contract with an airdrop streamed
              over time.
            </p>
          </div>

          <BasicParametersCard form={form} />

          <div className="flex justify-center">
            <Button
              type="submit"
              className="py-3 px-6 rounded-md w-full md:w-auto"
              size="xl"
            >
              Create Airstream
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}

export default CreatePage;
