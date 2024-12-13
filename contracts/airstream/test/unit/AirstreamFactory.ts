import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { assert, expect } from "chai";
import { viem } from "hardhat";
import { getAddress, parseEventLogs, parseUnits, zeroAddress } from "viem";

// A deployment function to set up the initial state
const deploy = async () => {
  const publicClient = await viem.getPublicClient();
  const [wallet1, wallet2] = await viem.getWalletClients();

  const gdav1Forwarder = await viem.deployContract("GDAv1ForwarderMock");
  const superTokenFactory = await viem.deployContract("SuperTokenFactoryMock");

  const airstreamFactory = await viem.deployContract("AirstreamFactory", [
    gdav1Forwarder.address,
    superTokenFactory.address,
  ]);

  const airstreamFromTx = async (hash: `0x${string}`) => {
    const receipt = await publicClient.getTransactionReceipt({ hash });
    const logs = parseEventLogs({
      abi: airstreamFactory.abi,
      logs: receipt.logs,
    });
    return logs[0].args;
  };

  const tokenMock = await viem.deployContract("ERC20Mock", [
    "Mock Token",
    "MTK",
  ]);
  await tokenMock.write.mint([
    wallet1.account.address,
    parseUnits("150000", 18),
  ]);

  return {
    airstreamFactory,
    publicClient,
    wallet1,
    wallet2,
    addr1: wallet1.account.address,
    addr2: wallet2.account.address,
    airstreamFromTx,
    gdav1Forwarder,
    superTokenFactory,
    tokenMock,
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

    it("should set the correct SuperTokenFactory address", async () => {
      const { airstreamFactory, superTokenFactory } = await loadFixture(deploy);
      assert.equal(
        await airstreamFactory.read.superTokenFactory(),
        getAddress(superTokenFactory.address),
      );
    });

    it("should revert if GDAv1Forwarder address is not a contract", async () => {
      const { superTokenFactory } = await loadFixture(deploy);
      await expect(
        viem.deployContract("AirstreamFactory", [
          "0x000000000000000000000000000000000000dead",
          superTokenFactory.address,
        ]),
      ).to.be.rejected;
    });

    it("should revert if SuperTokenFactory address is not a contract", async () => {
      const { gdav1Forwarder } = await loadFixture(deploy);
      await expect(
        viem.deployContract("AirstreamFactory", [
          gdav1Forwarder.address,
          "0x000000000000000000000000000000000000dead",
        ]),
      ).to.be.rejected;
    });
  });
  describe("createAirstream", () => {
    it("should create a new airstream and emit a AirstreamCreated event (no extended config)", async () => {
      const { airstreamFactory, airstreamFromTx, tokenMock } =
        await loadFixture(deploy);

      await tokenMock.write.approve([
        airstreamFactory.address,
        parseUnits("150000", 18),
      ]);

      const config = {
        name: "Test Airstream",
        token: tokenMock.address,
        merkleRoot:
          "0x83d9c1db51ee14c9aa71a3f72490fbaf8e3004479de4d0a5dfa57a927654a45b" as `0x${string}`,
        totalAmount: parseUnits("150000", 18),
        duration: 1000000n,
      };

      const hash = await airstreamFactory.write.createAirstream([config]);

      const { airstream, controller, pool } = await airstreamFromTx(hash);
      expect(airstream).to.be.a("string");
      expect(controller).to.be.a("string");
      expect(pool).to.be.a("string");
    });

    it("should create a new airstream and emit a AirstreamCreated event (with extended config)", async () => {
      const { airstreamFactory, airstreamFromTx, tokenMock } =
        await loadFixture(deploy);

      await tokenMock.write.approve([
        airstreamFactory.address,
        parseUnits("150000", 18),
      ]);

      const config = {
        name: "Test Airstream",
        token: tokenMock.address,
        merkleRoot:
          "0x83d9c1db51ee14c9aa71a3f72490fbaf8e3004479de4d0a5dfa57a927654a45b" as `0x${string}`,
        totalAmount: parseUnits("150000", 18),
        duration: 1000000n,
      };

      const extendedConfig = {
        superToken: zeroAddress,
        startDate: 0n,
        initialRewardPct: 0,
        claimingWindow: 0n,
        minimumClaims: 0n,
        feePct: 0,
      };

      const hash = await airstreamFactory.write.createAirstream([
        config,
        extendedConfig,
      ]);

      const { airstream, controller, pool } = await airstreamFromTx(hash);
      expect(airstream).to.be.a("string");
      expect(controller).to.be.a("string");
      expect(pool).to.be.a("string");
    });

    it("should revert if the distribution token is not approved", async () => {
      const { airstreamFactory, tokenMock } = await loadFixture(deploy);

      const config = {
        name: "Test Airstream",
        token: tokenMock.address,
        merkleRoot:
          "0x83d9c1db51ee14c9aa71a3f72490fbaf8e3004479de4d0a5dfa57a927654a45b" as `0x${string}`,
        duration: 1000000n,
        totalAmount: parseUnits("150000", 18),
      };
      const extendedConfig = {
        superToken: zeroAddress,
        startDate: 0n,
        initialRewardPct: 0n,
        claimingWindow: 0n,
        minimumClaims: 0n,
        feePct: 0n,
      };

      await expect(
        airstreamFactory.write.createAirstream([config, extendedConfig]),
      ).to.be.rejected;
    });
  });
});
