import { viem } from "hardhat";
import { encodeFunctionData, getAddress, parseUnits, zeroAddress } from "viem";

interface ClaimingWindow {
  startDate: number;
  duration: number;
  treasury: `0x${string}`;
}

interface ExtendedConfig {
  superToken: `0x${string}`;
  claimingWindow: ClaimingWindow;
  initialRewardPPM: number;
  feePPM: number;
}

export const merkleRoot =
  "0x83d9c1db51ee14c9aa71a3f72490fbaf8e3004479de4d0a5dfa57a927654a45b";

// A deployment function to set up the initial state
export const deploy = async (
  extendedConfig: ExtendedConfig | undefined = undefined,
) => {
  const publicClient = await viem.getPublicClient();
  const [wallet1, wallet2] = await viem.getWalletClients();

  const gdav1Forwarder = await viem.deployContract("GDAv1ForwarderMock");

  const airstreamImplementation = await viem.deployContract(
    "AirstreamExtended",
    [gdav1Forwarder.address],
  );

  async function deployAirstream(
    token: `0x${string}`,
    merkleRoot: `0x${string}`,
    totalAmount: bigint,
    duration: number,
  ) {
    const proxy = await viem.deployContract("ERC1967Proxy", [
      airstreamImplementation.address,
      encodeFunctionData({
        abi: [
          airstreamImplementation.abi.find(
            (abi) => abi.type === "function" && abi.name === "initialize",
          ),
        ], // initialize function
        functionName: "initialize",
        args: [
          wallet1.account.address,
          {
            token: token,
            merkleRoot,
            totalAmount,
            duration,
          },
          extendedConfig || {
            superToken: zeroAddress,
            claimingWindow: {
              startDate: 0,
              duration: 0,
              treasury: zeroAddress,
            },
            initialRewardPPM: 0,
            feePPM: 0,
          },
        ],
      }),
    ]);
    return viem.getContractAt("AirstreamExtended", proxy.address);
  }

  const superToken = await viem.deployContract("ERC20Mock", [
    "SuperToken",
    "ST",
  ]);

  const airstream = await deployAirstream(
    superToken.address,
    merkleRoot,
    parseUnits("150000", 18),
    24 * 60 * 60, // 1 day
  );

  const pool = await viem.getContractAt(
    "ISuperfluidPool",
    await airstream.read.pool(),
  );

  return {
    airstream,
    deployAirstream,
    pool,
    publicClient,
    wallet1,
    wallet2,
    addr1: wallet1.account.address,
    addr2: wallet2.account.address,
    gdav1Forwarder,
    superToken,
    superTokenAddress: getAddress(superToken.address),
  };
};
