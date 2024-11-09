import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("AirstreamFactory", (m) => {
  const factory = m.contract("AirstreamFactory", [
    "0x6DA13Bde224A05a288748d857b9e7DDEffd1dE08",
  ]);

  const airstream = m.call(factory, "createAirstream", [
    {
      distributionToken: "0x30a6933Ca9230361972E413a15dC8114c952414e",
      merkleRoot:
        "0x0000000000000000000000000000000000000000000000000000000000000000",
      duration: 1,
      totalAmount: 1,
    },
  ]);

  const airstreamAddress = m.readEventArgument(
    airstream,
    "AirstreamCreated",
    "airstream",
  );

  const airstreamContract = m.contractAt("Airstream", airstreamAddress);

  return { factory, airstreamContract };
});
