import { StandardMerkleTree } from "@openzeppelin/merkle-tree";

type Recipient = { address: `0x${string}`; amount: bigint };

export function getMerkleRoot(recipients: Recipient[]): `0x${string}` {
  const tree = StandardMerkleTree.of(
    recipients.map((recipient) => [recipient.address, recipient.amount]),
    ["address", "uint256"],
  );
  downloadMerkleTree(tree);
  return tree.root as `0x${string}`;
}

function downloadMerkleTree(
  tree: StandardMerkleTree<(bigint | `0x${string}`)[]>,
) {
  const json = tree.dump();
  const content = JSON.stringify(json, (_, value) =>
    typeof value === "bigint" ? Number(value) : value,
  );

  // Create a Blob from the content
  const blob = new Blob([content], { type: "application/json" });

  // Create a URL for the Blob and set it as the href attribute
  const url = URL.createObjectURL(blob);

  // Create a temporary link and set the download attribute
  const link = document.createElement("a");
  link.href = url;
  link.download = "merkle-tree.json";

  // Append link to the body and trigger click for download
  document.body.appendChild(link);
  link.click();

  // Clean up: remove the link and release the object URL
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
