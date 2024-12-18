import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import { viem } from "hardhat";
import { getAddress, parseUnits, zeroAddress } from "viem";
import { deploy, merkleRoot } from "../fixtures/deploy";
import { claimArgs, expectEvent } from "../utils";

describe("Airstream Contract Tests", () => {
  describe("Deployment", () => {
    it("should deploy with the correct initial parameters", async () => {
      const { airstream, gdav1Forwarder, superTokenAddress, publicClient } =
        await loadFixture(deploy);
      expect(await airstream.read.distributionToken()).to.equal(
        superTokenAddress,
      );
      expect(await airstream.read.gdav1Forwarder()).to.equal(
        getAddress(gdav1Forwarder.address),
      );
      const latestBlock = await publicClient.getBlock();
      expect(await airstream.read.startedAt()).to.equal(latestBlock.timestamp);
    });
    it("should revert if the pool cannot be created", async () => {
      const { deployAirstream } = await loadFixture(deploy);
      await expect(deployAirstream(zeroAddress, merkleRoot, 1n, 1)).to.be
        .rejected;
    });
  });

  describe("Claim", () => {
    it("should allow elegible accounts to claim a stream", async () => {
      const { airstream } = await loadFixture(deploy);
      const [account, amount, proof] = claimArgs(19);
      await airstream.write.claim([account, amount, proof]);
      expect(await airstream.read.isClaimed([account])).to.equal(true);
    });
    it("should revert if the account has already claimed", async () => {
      const { airstream } = await loadFixture(deploy);
      const [account, amount, proof] = claimArgs(19);
      await airstream.write.claim([account, amount, proof]);
      await expect(airstream.write.claim([account, amount, proof])).to.be
        .rejected;
    });
  });

  describe("Redirection", () => {
    it("should allow the admin to redirect units", async () => {
      const { airstream, addr1, addr2 } = await loadFixture(deploy);
      await airstream.write.redirectRewards([[addr1], [addr2], []]);
    });
    it("should revert if called by a non-admin", async () => {
      const { airstream, addr1, addr2 } = await loadFixture(deploy);
      await expect(
        airstream.write.redirectRewards([[addr1], [addr2], []], {
          account: addr2,
        }),
      ).to.be.rejected;
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
      const { airstream, wallet1, publicClient } = await loadFixture(deploy);
      await airstream.write.pause();
      const token = await mintToken(airstream.address);
      const tx = await airstream.write.withdraw([token.address]);
      expect(await token.read.balanceOf([airstream.address])).to.equal(0n);
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
      const { airstream, addr2 } = await loadFixture(deploy);
      const token = await mintToken(airstream.address);
      await expect(
        airstream.write.withdraw([token.address], { account: addr2 }),
      ).to.be.rejectedWith("OwnableUnauthorizedAccount");
    });
    it("should revert if the airstream is not paused", async () => {
      const { airstream } = await loadFixture(deploy);
      const token = await mintToken(airstream.address);
      await expect(
        airstream.write.withdraw([token.address]),
      ).to.be.rejectedWith("ExpectedPause");
    });
  });
});
