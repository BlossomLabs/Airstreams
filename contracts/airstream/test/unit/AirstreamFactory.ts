import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { assert, expect } from "chai";
import { viem } from "hardhat";
import { getAddress, parseEther, parseEventLogs } from "viem";

// A deployment function to set up the initial state
const deploy = async () => {
  const publicClient = await viem.getPublicClient();
  const [wallet1, wallet2] = await viem.getWalletClients();

  const gdav1Forwarder = await viem.deployContract("GDAv1ForwarderMock");

  const airstreamFactory = await viem.deployContract("AirstreamFactory", [
    gdav1Forwarder.address,
  ]);

  const airstreamFromTx = async (hash: `0x${string}`) => {
    const receipt = await publicClient.getTransactionReceipt({ hash });
    const logs = parseEventLogs({
      abi: airstreamFactory.abi,
      logs: receipt.logs,
    });
    return logs[0].args;
  };

  return {
    airstreamFactory,
    publicClient,
    wallet1,
    wallet2,
    addr1: wallet1.account.address,
    addr2: wallet2.account.address,
    airstreamFromTx,
    gdav1Forwarder,
  };
};

describe("AirstreamFactory Contract Tests", () => {
  describe("Deployment", () => {
    it("should set the correct GDAv1Forwarder address", async () => {
      const { airstreamFactory, gdav1Forwarder } = await loadFixture(deploy);
      assert.equal(
        await airstreamFactory.read.gdav1Forwarder(),
        getAddress(gdav1Forwarder.address),
      );
    });

    it("should revert if GDAv1Forwarder address is not a contract", async () => {
      await expect(
        viem.deployContract("CouncilFactory", [
          "0x000000000000000000000000000000000000dead",
        ]),
      ).to.be.rejected;
    });
  });
  describe("createCouncil", () => {
    it("should create a new airstream and emit a AirstreamCreated event", async () => {
      const { airstreamFactory, airstreamFromTx } = await loadFixture(deploy);
      const config = {
        distributionToken:
          "0x30a6933ca9230361972e413a15dc8114c952414e" as `0x${string}`, // ETHx on Sepolia
        merkleRoot:
          "0x83d9c1db51ee14c9aa71a3f72490fbaf8e3004479de4d0a5dfa57a927654a45b" as `0x${string}`,
        duration: 1000000n,
        totalAmount: parseEther("150000"),
      };

      const hash = await airstreamFactory.write.createAirstream([config]);

      const { airstream, pool } = await airstreamFromTx(hash);
      expect(airstream).to.be.a("string");
      expect(pool).to.be.a("string");
    });
  });
});
