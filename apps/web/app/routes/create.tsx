import BasicParametersCard from "@/components/form/BasicParametersCard";
import useWriteContractsSync from "@/hooks/useWriteContractsSync";
import {
  createAirstream,
  getContractAddress,
  getRecipients,
} from "@/utils/airstream";
import { type FormValues, useCreateAirstreamForm } from "@/utils/form";
import { downloadMerkleTree, uploadMerkleTreeToIpfs } from "@/utils/merkletree";
import {
  processTxErrorToast,
  sendCreateAirstreamTxErrorToast,
  walletNotConnectedToast,
  wrongNetworkToast,
} from "@/utils/toasts";
import { Button } from "@repo/ui/components/ui/button";
import { Form } from "@repo/ui/components/ui/form";
import { ToastAction } from "@repo/ui/components/ui/toast";
import { useToast } from "@repo/ui/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router";
import { useAccount } from "wagmi";

function CreatePage() {
  const { writeContractsSync } = useWriteContractsSync();
  const form = useCreateAirstreamForm();
  const { address, chain } = useAccount();
  const { toast } = useToast();
  const navigate = useNavigate();

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
    let result: `0x${string}` | undefined;
    try {
      result = await createAirstream(
        writeContractsSync,
        contractAddress,
        values,
        recipients,
      );
    } catch (error) {
      console.error(error);
      sendCreateAirstreamTxErrorToast(toast);
      return;
    }

    if (!result) {
      processTxErrorToast(toast);
      return;
    }
    const airstream = result;

    try {
      const cid = await uploadMerkleTreeToIpfs(
        values.name,
        recipients,
        airstream,
        chain.id,
      );
      navigate(`/claim/${cid}`);
      toast({
        title: "Airstream created",
        description:
          "Copy the link to your airstream to share it with your friends.",
        variant: "default",
        duration: 60000,
        action: (
          <ToastAction
            onClick={() =>
              navigator.clipboard.writeText(
                `${window.location.origin}/claim/${cid}`,
              )
            }
            altText="Copy"
          >
            Copy
          </ToastAction>
        ),
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error uploading merkle tree to IPFS",
        description: "Upload it manually, please.",
        variant: "destructive",
      });

      downloadMerkleTree(values.name, recipients, airstream, chain.id);
    }
  }

  const isSubmitting = form.formState.isSubmitting;

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
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Airstream...
                </>
              ) : (
                "Create Airstream"
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}

export default CreatePage;
