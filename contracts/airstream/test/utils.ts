import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { expect } from "chai";
import { type PublicClient, parseAbiItem, parseEventLogs } from "viem";
import treeJSON from "./fixtures/merkle-tree.json";
const tree = StandardMerkleTree.load(treeJSON as any);

export async function expectEvent(
  txHash: `0x${string}`,
  publicClient: PublicClient,
  eventSignature: string,
  expectedArgs: any = undefined,
) {
  const tx = await publicClient.getTransactionReceipt({ hash: txHash });
  const logs = parseEventLogs({
    abi: [parseAbiItem(`event ${eventSignature}`)],
    logs: tx.logs,
  });
  const event = logs.find((e) => e.eventName === eventSignature.split("(")[0]);
  expect(event, `Event ${eventSignature} was not emitted`).to.exist;
  if (event && typeof expectedArgs !== "undefined") {
    expect(
      event.args,
      `Event ${eventSignature} args do not match`,
    ).to.deep.equal(expectedArgs);
  }
}

// A helper function to get the claim arguments for a given index of the merkle tree
export function claimArgs(
  index: number,
): [`0x${string}`, bigint, `0x${string}`[]] {
  const [_, [account, amount]] = [...tree.entries()][index];
  const proof = tree.getProof(index);
  return [account, amount, proof as `0x${string}`[]];
}
