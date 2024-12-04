import type { FormValues } from "@/utils/form";
import { downloadMerkleTree, getMerkleRoot } from "@/utils/merkletree";
import { AIRSTREAM_FACTORY_ADDRESS } from "@/utils/site";
import { getTimeInSeconds } from "@/utils/time";
import {
  type PublicClient,
  isAddress,
  parseAbi,
  parseAbiItem,
  parseEventLogs,
  parseUnits,
} from "viem";
import { sepolia } from "viem/chains";

export async function processTx(
  hash: `0x${string}`,
  publicClient: PublicClient,
) {
  const receipt = await publicClient.waitForTransactionReceipt({
    hash,
    timeout: 5 * 60 * 1000,
  });
  console.log({ receipt });

  const logs = parseEventLogs({
    abi: [
      parseAbiItem("event AirstreamCreated(address airstream, address pool)"),
    ],
    logs: receipt.logs,
  });

  const { airstream } = logs
    .filter((log) => log.eventName === "AirstreamCreated")
    .map((log) => log.args)[0];

  return {
    airstream,
  };
}

export function getContractAddress(chain: any) {
  if (chain?.id === sepolia.id) {
    return AIRSTREAM_FACTORY_ADDRESS;
  }
  return undefined;
}

async function getTokenHolderAddresses(
  recipients: { address: string }[],
): Promise<`0x${string}`[]> {
  const addresses = await Promise.all(
    recipients.map(async (recipient) => {
      if (isAddress(recipient.address)) {
        return recipient.address as `0x${string}`;
      }
      throw new Error("ENS names not supported yet");
      // TODO: Uncomment this when we support ENS names
      //   const ensAddress = await publicClient.getEnsAddress({ name: normalize(recipient.address) });
      //   if (!ensAddress) {
      //     throw new Error(`Invalid ENS name: ${recipient.address}`);
      //   }
      //   return ensAddress;
    }),
  );
  return addresses;
}

export async function getRecipients(values: FormValues) {
  const recipientAddresses = await getTokenHolderAddresses(values.recipients);
  const recipients = recipientAddresses.map((address, index) => ({
    address,
    amount: parseUnits(String(values.recipients[index].amount), 18), // Supertokens have all 18 decimals
  }));
  return recipients;
}

export async function sendCreateAirstreamTx(
  writeContract: any,
  contractAddress: `0x${string}`,
  values: FormValues,
  recipients: { address: `0x${string}`; amount: bigint }[],
) {
  return new Promise<`0x${string}`>((resolve, reject) => {
    (async () => {
      // FIXME: This should have the airstream address instead of the factory address
      downloadMerkleTree(recipients, contractAddress, "sepolia");

      writeContract(
        {
          address: contractAddress,
          abi: parseAbi([
            "struct DeploymentConfig { address distributionToken; bytes32 merkleRoot; uint96 totalAmount; uint64 duration; }",
            "function createAirstream(DeploymentConfig memory config)",
          ]),
          functionName: "createAirstream",
          args: [
            {
              distributionToken: values.distributionToken,
              merkleRoot: getMerkleRoot(recipients),
              duration: getTimeInSeconds(
                values.airstreamDuration.amount,
                values.airstreamDuration.unit,
              ),
              totalAmount: BigInt(
                recipients.reduce((acc, curr) => acc + curr.amount, 0n),
              ),
            },
          ],
        },
        {
          onSuccess: resolve,
          onError: reject,
        },
      );
    })();
  });
}

export async function sendClaimAirstreamTx(
  writeContract: any,
  contractAddress: `0x${string}`,
  address: `0x${string}`,
  amount: bigint,
  proof: `0x${string}`[],
) {
  return new Promise<`0x${string}`>((resolve, reject) => {
    (async () => {
      console.log(contractAddress, { address, amount, proof });
      writeContract(
        {
          address: contractAddress,
          abi: parseAbi([
            "function claim(address account, uint256 amount, bytes32[] calldata proof)",
          ]),
          functionName: "claim",
          args: [address, amount, proof],
        },
        {
          onSuccess: resolve,
          onError: reject,
        },
      );
    })();
  });
}
