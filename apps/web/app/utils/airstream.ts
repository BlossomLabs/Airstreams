import type { FormValues } from "@/utils/form";
import { getMerkleRoot } from "@/utils/merkletree";
import { getTimeInSeconds } from "@/utils/time";
import {
  type PublicClient,
  type TransactionReceipt,
  encodeAbiParameters,
  getAddress,
  isAddress,
  parseAbi,
  parseAbiItem,
  parseEventLogs,
  parseUnits,
} from "viem";
import { base } from "viem/chains";
import deployedAddresses from "../../../../contracts/airstream/ignition/deployments/chain-8453/deployed_addresses.json";

async function processCreateAirstreamReceipt(receipt: TransactionReceipt) {
  const logs = parseEventLogs({
    abi: [
      parseAbiItem(
        "event AirstreamCreated(address airstream, address controller, address pool)",
      ),
    ],
    logs: receipt.logs,
  });

  const { airstream } = logs
    .filter((log) => log.eventName === "AirstreamCreated")
    .map((log) => log.args)[0];

  return airstream;
}

export function getContractAddress(chain: any) {
  if (chain?.id === base.id) {
    return deployedAddresses[
      "AirstreamFactory#AirstreamFactory"
    ] as `0x${string}`;
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

export async function createAirstream(
  writeContractsSync: any,
  contractAddress: `0x${string}`,
  values: FormValues,
  recipients: { address: `0x${string}`; amount: bigint }[],
) {
  const totalAmount = BigInt(
    recipients.reduce((acc, curr) => acc + curr.amount, 0n),
  );

  const receipts = await writeContractsSync([
    {
      address: getAddress(values.distributionToken),
      abi: parseAbi(["function approve(address spender, uint256 amount)"]),
      args: [contractAddress, totalAmount],
    },
    {
      address: contractAddress,
      abi: parseAbi([
        "struct AirstreamConfig { string name; address token; bytes32 merkleRoot; uint96 totalAmount; uint64 duration; }",
        "function createAirstream(AirstreamConfig memory config)",
      ]),
      args: [
        {
          name: values.name,
          token: getAddress(values.distributionToken),
          merkleRoot: getMerkleRoot(recipients),
          duration: getTimeInSeconds(
            values.airstreamDuration.amount,
            values.airstreamDuration.unit,
          ),
          totalAmount,
        },
      ],
    },
  ]);
  const airstreamAddress = await processCreateAirstreamReceipt(receipts[1]);
  return airstreamAddress;
}

export async function isClaimed(
  publicClient: PublicClient,
  contractAddress: `0x${string}`,
  address: `0x${string}`,
) {
  const result = await publicClient.readContract({
    address: contractAddress,
    abi: parseAbi([
      "function isClaimed(address account) external view returns (bool)",
    ]),
    functionName: "isClaimed",
    args: [address],
  });
  return result;
}

function getClaimParams(
  address: `0x${string}`,
  amount: bigint,
  proof: `0x${string}`[],
) {
  return encodeAbiParameters(
    [{ type: "address" }, { type: "uint256" }, { type: "bytes32[]" }],
    [address, amount, proof],
  );
}

export async function claimAirstream(
  writeContractAsync: any,
  contractAddress: `0x${string}`,
  address: `0x${string}`,
  amount: bigint,
  proof: `0x${string}`[],
) {
  const macroForwarder = "0xFD0268E33111565dE546af2675351A4b1587F89F";

  const receipt = await writeContractAsync({
    address: macroForwarder,
    abi: parseAbi([
      "function runMacro(address m, bytes calldata params) external payable returns (bool)",
    ]),
    args: [contractAddress, getClaimParams(address, amount, proof)],
  });
  return receipt;
}
