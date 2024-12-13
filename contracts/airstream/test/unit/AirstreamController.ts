import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { expect } from "chai";
import { viem } from "hardhat";
import { getAddress, parseUnits, zeroAddress } from "viem";
import { expectEvent } from "../utils";

import { encodeFunctionData } from "viem";

// A deployment function to set up the initial state
const deploy = async () => {
  const publicClient = await viem.getPublicClient();
  const [wallet1, wallet2] = await viem.getWalletClients();

  const gdav1Forwarder = await viem.deployContract("GDAv1ForwarderMock");
  const airstreamMock = await viem.deployContract("AirstreamMock");

  const controllerImplementation = await viem.deployContract(
    "AirstreamController",
    [gdav1Forwarder.address],
  );

  async function deployAirstreamController(
    owner: `0x${string}`,
    airstream: `0x${string}`,
  ) {
    const proxy = await viem.deployContract("ERC1967Proxy", [
      controllerImplementation.address,
      encodeFunctionData({
        abi: [
          controllerImplementation.abi.find(
            (abi) => abi.type === "function" && abi.name === "initialize",
          ),
        ], // initialize function
        functionName: "initialize",
        args: [owner, airstream],
      }),
    ]);
    return viem.getContractAt("AirstreamController", proxy.address);
  }

  const superToken = await viem.deployContract("ERC20Mock", [
    "SuperToken",
    "ST",
  ]);

  const controller = await deployAirstreamController(
    wallet1.account.address,
    airstreamMock.address,
  );

  //   await superToken.write.mint([controller.address, parseUnits("100", 18)]);
  await airstreamMock.write.mockSetOwner([controller.address]);
  await controller.write.resumeAirstream();

  return {
    airstreamMock,
    controller,
    deployAirstreamController,
    publicClient,
    wallet1,
    wallet2,
    addr1: wallet1.account.address,
    addr2: wallet2.account.address,
    gdav1Forwarder,
    superToken: getAddress(superToken.address),
  };
};

describe("AirstreamController Contract Tests", () => {
  describe("Deployment and start", () => {
    it("should deploy with the correct initial parameters", async () => {
      const { airstreamMock, controller, gdav1Forwarder } =
        await loadFixture(deploy);
      expect(await controller.read.airstream()).to.equal(
        getAddress(airstreamMock.address),
      );
      expect(await controller.read.gdav1Forwarder()).to.equal(
        getAddress(gdav1Forwarder.address),
      );
    });
  });

  describe("Start Airstream", () => {
    it("should revert if the airstream is already started", async () => {
      const { controller } = await loadFixture(deploy);
      await expect(controller.write.resumeAirstream()).to.be.rejectedWith(
        "ExpectedPause",
      );
    });
    it("should revert if the airstream is not owned by the controller", async () => {
      const { controller, airstreamMock } = await loadFixture(deploy);
      await airstreamMock.write.mockSetOwner([zeroAddress]);
      await expect(controller.write.resumeAirstream()).to.be.rejectedWith(
        "InvalidAirstreamOwner",
      );
    });
  });

  describe("Pause and Resume Airstream", () => {
    it("should pause the airstream", async () => {
      const { controller } = await loadFixture(deploy);
      await controller.write.pauseAirstream();
    });

    it("should resume the airstream", async () => {
      const { controller } = await loadFixture(deploy);
      await controller.write.pauseAirstream();
      await controller.write.resumeAirstream();
    });

    it("should revert if the airstream is already paused", async () => {
      const { controller } = await loadFixture(deploy);
      await controller.write.pauseAirstream();
      await expect(controller.write.pauseAirstream()).to.be.rejectedWith(
        "EnforcedPause",
      );
    });
  });

  describe("Withdrawal", () => {
    async function mintToken(councilAddr: `0x${string}`) {
      const token = await viem.deployContract("ERC20Mock", [
        "Test Token",
        "TT",
      ]);
      await token.write.mint([councilAddr, parseUnits("0.1", 18)]);
      return token;
    }
    it("should allow the owner to withdraw tokens", async () => {
      const { controller, wallet1, publicClient } = await loadFixture(deploy);
      await controller.write.pauseAirstream();
      const token = await mintToken(controller.address);
      const tx = await controller.write.withdraw([token.address]);
      expect(await token.read.balanceOf([controller.address])).to.equal(0n);
      expect(await token.read.balanceOf([wallet1.account.address])).to.equal(
        parseUnits("0.1", 18),
      );
      await expectEvent(
        tx,
        publicClient,
        "Withdrawn(address token, address account, uint256 amount)",
        {
          token: getAddress(token.address),
          account: getAddress(wallet1.account.address),
          amount: parseUnits("0.1", 18),
        },
      );
    });
    it("should revert if withdrawing tokens from a non-owner", async () => {
      const { addr2, controller } = await loadFixture(deploy);
      await controller.write.pauseAirstream();
      const token = await mintToken(controller.address);
      await expect(
        controller.write.withdraw([token.address], { account: addr2 }),
      ).to.be.rejectedWith("OwnableUnauthorizedAccount");
    });
    it("should revert if the airstream is not paused", async () => {
      const { controller, superToken } = await loadFixture(deploy);
      await expect(controller.write.withdraw([superToken])).to.be.rejectedWith(
        "ExpectedPause",
      );
    });
  });
});
