import type { FormValues } from "@/utils/form";
import {
  type PublicClient,
  parseAbi,
  parseAbiItem,
  parseEventLogs,
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

export async function sendCreateAirstreamTx(
  writeContract: any,
  contractAddress: `0x${string}`,
  values: FormValues,
) {
  return new Promise<`0x${string}`>((resolve, reject) => {
    (async () => {
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
