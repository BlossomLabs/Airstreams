import type { FormValues } from "@/utils/form";
import { getMerkleRoot } from "@/utils/merkletree";
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
import { AIRSTREAM_FACTORY_ADDRESS } from "../../../../constants";

export async function processTx(
  hash: `0x${string}`,
  publicClient: PublicClient,
) {
  if (!publicClient) return;

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

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

export async function sendCreateAirstreamTx(
  writeContract: any,
  contractAddress: `0x${string}`,
  values: FormValues,
) {
  return new Promise<`0x${string}`>((resolve, reject) => {
    (async () => {
      let recipientAddresses: `0x${string}`[];
      try {
        recipientAddresses = await getTokenHolderAddresses(values.recipients);
      } catch (e) {
        return reject(e);
      }
      const recipients = recipientAddresses.map((address, index) => ({
        address,
        amount: parseUnits(String(values.recipients[index].amount), 18), // Supertokens have all 18 decimals
      }));
      writeContract(
        {
          address: contractAddress,
          abi: parseAbi([
            "struct DeploymentConfig { address distributionToken }",
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
