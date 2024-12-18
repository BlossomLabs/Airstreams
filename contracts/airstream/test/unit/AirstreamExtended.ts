import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import {
  reset,
  time,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import { zeroAddress } from "viem";

import { deploy as _deploy } from "../fixtures/deploy";
import { claimArgs } from "../utils";

const now = () => Math.floor(new Date().getTime() / 1000);
const days = (n: number) => n * 24 * 60 * 60;
const minutes = (n: number) => n * 60;

const baseConfig = {
  superToken: zeroAddress,
  claimingWindow: {
    startDate: 0,
    duration: 0,
    treasury: zeroAddress,
  },
  initialRewardPPM: 0,
  feePPM: 0,
};

const claimingWindowExtendedConfig = {
  startDate: now() + days(31),
  duration: days(30),
  treasury: "0x000000000000000000000000000000000000dEaD" as `0x${string}`,
};

const extendedConfig = {
  superToken: zeroAddress,
  claimingWindow: claimingWindowExtendedConfig,
  initialRewardPPM: 40_0000,
  feePPM: 5_0000,
};

function deployBase() {
  return _deploy(baseConfig);
}

function deployExtended() {
  return _deploy(extendedConfig);
}

function deployWithStartDateAndOpenEndedClaimingWindow() {
  return _deploy({
    ...extendedConfig,
    claimingWindow: {
      ...claimingWindowExtendedConfig,
      duration: 0,
      treasury: zeroAddress,
    },
  });
}

function deployExtendedStartImmediately() {
  return _deploy({
    ...extendedConfig,
    claimingWindow: {
      startDate: 0,
      duration: 0,
      treasury: zeroAddress,
    },
  });
}

// function deployWithoutStartDateAndOpenEndedClaimingWindow() {
//     const config = extendedConfig();
//     const claimingWindow = claimingWindowExtendedConfig();
//     return _deploy({
//         ...config,
//         claimingWindow: {
//             ...claimingWindow,
//             startDate: 0,
//             duration: 0,
//             treasury: zeroAddress,
//         },
//     });
// }

describe("AirstreamExtended", () => {
  beforeEach(async () => {
    await reset();
  });

  describe("Claiming Window", () => {
    it("should allow to claim immediately if the claiming window is open (base config)", async () => {
      const { airstream } = await loadFixture(deployBase);
      await expect(airstream.write.claim(claimArgs(19))).to.be.not.rejected;
    });

    it("should allow to claim if the claiming window is open (extended config)", async () => {
      const { airstream } = await loadFixture(deployExtended);
      await expect(airstream.write.claim(claimArgs(19))).to.be.rejected;
      await time.increaseTo(
        extendedConfig.claimingWindow.startDate + minutes(1),
      );
      await expect(airstream.write.claim(claimArgs(19))).to.be.not.rejected;
    });

    it("should revert if the start date is in the future", async () => {
      const { airstream } = await loadFixture(
        deployWithStartDateAndOpenEndedClaimingWindow,
      );
      await time.increaseTo(
        extendedConfig.claimingWindow.startDate - minutes(1),
      );
      await expect(airstream.write.claim(claimArgs(19))).to.be.rejected;
    });
  });

  describe("Initial Rewards", () => {
    it("should be able to claim initial rewards (start immediately)", async () => {
      const { airstream, superToken } = await loadFixture(
        deployExtendedStartImmediately,
      );
      const totalAmount = await airstream.read.unclaimedAmount();
      await superToken.write.mint([
        airstream.address,
        (totalAmount * BigInt(extendedConfig.initialRewardPPM)) /
          BigInt(100_0000),
      ]);
      const [addr, amount] = claimArgs(19);
      await airstream.write.claim(claimArgs(19));
      const balanceAfter = await superToken.read.balanceOf([addr]);
      expect(balanceAfter).to.equal(
        (BigInt(amount) * BigInt(extendedConfig.initialRewardPPM)) /
          BigInt(100_0000),
      );
    });
  });
});
