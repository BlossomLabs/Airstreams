import {
  impersonateAccount,
  loadFixture,
  mine,
  setBalance,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { expect } from "chai";
import hre, { viem } from "hardhat";
import { vars } from "hardhat/config";
import { getAddress, parseEventLogs, parseUnits } from "viem";

import treeJSON from "../fixtures/merkle-tree.json";
const tree = StandardMerkleTree.load(treeJSON as any);

const ethxTokenAddress = getAddress(
  "0x4ac8bD1bDaE47beeF2D1c6Aa62229509b962Aa0d",
); // ETHx on Optimism

const gdav1ForwarderAddress: `0x${string}` =
  "0x6DA13Bde224A05a288748d857b9e7DDEffd1dE08";

// A helper function to compare two bigints with an absolute difference
// Usage: expectAbsDiff(totalFlowRate, flowRate).to.be.lte(10n);
const expectAbsDiff = (a: bigint, b: bigint, message?: string) => {
  return expect(Number(a > b ? a - b : b - a), message);
};

// A deployment function to set up the initial state
const deploy = async () => {
  const publicClient = await viem.getPublicClient();
  const [wallet1, wallet2, wallet3] = await viem.getWalletClients();
  const accounts = [wallet1.account, wallet2.account, wallet3.account];

  // Deploy the AirstreamFactory contract
  const airstreamFactory = await viem.deployContract("AirstreamFactory", [
    gdav1ForwarderAddress,
  ]);

  const airstreamFromTx = async (hash: `0x${string}`) => {
    const receipt = await publicClient.getTransactionReceipt({ hash });
    const logs = parseEventLogs({
      abi: airstreamFactory.abi,
      logs: receipt.logs,
    });
    return logs[0].args;
  };

  // Prepare initial configuration
  const config = {
    distributionToken: ethxTokenAddress,
    merkleRoot:
      "0x83d9c1db51ee14c9aa71a3f72490fbaf8e3004479de4d0a5dfa57a927654a45b" as `0x${string}`,
    totalAmount: parseUnits("150000", 18),
  };

  // Create a new council
  const hash = await airstreamFactory.write.createAirstream([config]);

  const { airstream, pool } = await airstreamFromTx(hash);

  // Get the deployed Airstream contract
  const airstreamContract = await viem.getContractAt("Airstream", airstream);

  // Get the deployed Pool contract
  const poolContract = await viem.getContractAt("ISuperfluidPool", pool);
  const gdav1ForwarderContract = await viem.getContractAt(
    "GDAv1Forwarder",
    gdav1ForwarderAddress,
  );

  function claimArgs(index: number): [`0x${string}`, bigint, `0x${string}`[]] {
    const [_, [account, amount]] = [...tree.entries()][index];
    const proof = tree.getProof(index);
    return [account, amount, proof as `0x${string}`[]];
  }

  // Mint and transfer ETHx
  const ethxToken = await viem.getContractAt("ERC20", config.distributionToken);
  const tx = await wallet1.sendTransaction({
    to: config.distributionToken,
    value: parseUnits("100", 18),
    data: "0xcf81464b", // upgradeByETH()
  });
  await publicClient.waitForTransactionReceipt({ hash: tx });

  return {
    airstreamFactory,
    airstreamContract,
    poolContract,
    gdav1ForwarderContract,
    publicClient,
    wallet1,
    wallet2,
    accounts,
    claimArgs,
    airstreamFromTx,
    gdav1ForwarderAddress,
    config,
    ethxToken,
  };
};

describe("Integration Tests: Pools", () => {
  before(async () => {
    await hre.network.provider.request({
      method: "hardhat_reset",
      params: [
        {
          forking: {
            jsonRpcUrl: `https://opt-mainnet.g.alchemy.com/v2/${vars.get("ALCHEMY_KEY")}`,
            blockNumber: 125_042_537,
          },
        },
      ],
    });
  });

  describe("Airstream and Pool Interactions", () => {
    it("should allow recipients to claim their streams", async () => {
      const {
        airstreamContract,
        poolContract,
        gdav1ForwarderContract,
        config,
        wallet1,
        ethxToken,
        claimArgs,
      } = await loadFixture(deploy);

      // Distribute flows
      const flowRate = parseUnits("0.001", 18); // 0.001 ETHx per second
      await gdav1ForwarderContract.write.distributeFlow(
        [
          config.distributionToken,
          wallet1.account.address,
          poolContract.address,
          flowRate,
          "0x",
        ],
        { account: wallet1.account.address },
      );

      // Wait for a short period to allow flows to update
      await mine(1, { interval: 1000 });

      // Check total flow rate
      const totalFlowRate = await poolContract.read.getTotalFlowRate();
      expectAbsDiff(totalFlowRate, flowRate).to.be.lte(1e8);

      await airstreamContract.write.claim(claimArgs(0));

      await impersonateAccount(claimArgs(0)[0]);
      await setBalance(claimArgs(0)[0], 100n ** 18n);
      await gdav1ForwarderContract.write.connectPool(
        [poolContract.address, "0x"],
        { account: claimArgs(0)[0] },
      );

      await mine(1, { interval: 10000 });

      await airstreamContract.write.claim(claimArgs(1));

      await impersonateAccount(claimArgs(1)[0]);
      await setBalance(claimArgs(0)[0], 100n ** 18n);
      await gdav1ForwarderContract.write.connectPool(
        [poolContract.address, "0x"],
        { account: claimArgs(1)[0] },
      );

      await mine(1, { interval: 10000 });

      expectAbsDiff(
        await ethxToken.read.balanceOf([claimArgs(0)[0]]),
        await ethxToken.read.balanceOf([claimArgs(1)[0]]),
        "Balances should be equal",
      ).to.be.lte(1e8);
    });
  });
});
