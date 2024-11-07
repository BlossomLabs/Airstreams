import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("AirstreamFactory", (m) => {
  const factory = m.contract("AirstreamFactory", []);

  const airstream = m.call(factory, "createAirstream", [
    {
      distributionToken: m.getParameter("distributionToken"),
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
