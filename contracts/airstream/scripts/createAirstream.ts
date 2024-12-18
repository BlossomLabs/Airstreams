import { viem } from "hardhat";
import { parseEventLogs, parseUnits } from "viem";
import { AIRSTREAM_FACTORY_ADDRESS } from "../../../constants";

async function main() {
  const publicClient = await viem.getPublicClient();

  const airstreamFactory = await viem.getContractAt(
    "AirstreamFactory",
    AIRSTREAM_FACTORY_ADDRESS,
  );

  const hash = await airstreamFactory.write.createAirstream([
    {
      name: "Test Airstream",
      token: "0x708169c8C87563Ce904E0a7F3BFC1F3b0b767f41", // DAIx
      merkleRoot:
        "0x83d9c1db51ee14c9aa71a3f72490fbaf8e3004479de4d0a5dfa57a927654a45b" as `0x${string}`,
      totalAmount: parseUnits("150000", 18),
      duration: 1000000n,
    },
  ]);

  const receipt = await publicClient.waitForTransactionReceipt({
    hash,
  });

  const logs = parseEventLogs({
    abi: airstreamFactory.abi,
    logs: receipt.logs,
  });

  // Type guard to check if log.args has the expected shape
  function isAirstreamCreatedArgs(
    args: any,
  ): args is { airstream: `0x${string}`; pool: `0x${string}` } {
    return (
      args &&
      typeof args.airstream === "string" &&
      typeof args.pool === "string"
    );
  }

  logs
    .filter((log) => log.eventName === "AirstreamCreated")
    .map((log) => log.args)
    .filter(isAirstreamCreatedArgs)
    .map(
      ({ airstream, pool }) =>
        `Airstream deployed to ${airstream} with pool ${pool}`,
    )
    .map((s) => console.log(s));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
