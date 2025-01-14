import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("AirstreamFactory", (m) => {
  const factory = m.contract("AirstreamFactory", [
    "0x6DA13Bde224A05a288748d857b9e7DDEffd1dE08",
    m.getParameter("superTokenFactory"),
  ]);

  const airstreamAddress = m.staticCall(factory, "airstreamImplementation", []);
  const controllerAddress = m.staticCall(
    factory,
    "controllerImplementation",
    [],
  );

  const airstreamContract = m.contractAt("AirstreamExtended", airstreamAddress);
  const controllerContract = m.contractAt(
    "AirstreamController",
    controllerAddress,
  );

  return {
    factory,
    airstreamContract,
    controllerContract,
  };
});
