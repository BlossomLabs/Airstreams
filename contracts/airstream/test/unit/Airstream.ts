import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { expect } from "chai";
import { viem } from "hardhat";
import { getAddress, parseUnits, zeroAddress } from "viem";
import { expectEvent } from "../utils";

import { encodeFunctionData } from "viem";

import treeJSON from "../fixtures/merkle-tree.json";
const tree = StandardMerkleTree.load(treeJSON as any);

const merkleRoot =
  "0x83d9c1db51ee14c9aa71a3f72490fbaf8e3004479de4d0a5dfa57a927654a45b";

// A deployment function to set up the initial state
const deploy = async () => {
  const publicClient = await viem.getPublicClient();
  const [wallet1, wallet2] = await viem.getWalletClients();

  const gdav1Forwarder = await viem.deployContract("GDAv1ForwarderMock");

  const airstreamImplementation = await viem.deployContract("Airstream", [
    gdav1Forwarder.address,
  ]);

  async function deployAirstream(
    superToken: `0x${string}`,
    merkleRoot: `0x${string}`,
    totalAmount: bigint,
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
        args: [wallet1.account.address, superToken, merkleRoot, totalAmount],
      }),
    ]);
    return viem.getContractAt("Airstream", proxy.address);
  }

  const superToken = await viem.deployContract("ERC20Mock", [
    "SuperToken",
    "ST",
  ]);

  const airstream = await deployAirstream(
    superToken.address,
    merkleRoot,
    parseUnits("150000", 18),
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
    superToken: getAddress(superToken.address),
  };
};

describe("Airstream Contract Tests", () => {
  describe("Deployment", () => {
    it("should deploy with the correct initial parameters", async () => {
      const { airstream, gdav1Forwarder, superToken } =
        await loadFixture(deploy);
      expect(await airstream.read.distributionToken()).to.equal(superToken);
      expect(await airstream.read.gdav1Forwarder()).to.equal(
        getAddress(gdav1Forwarder.address),
      );
    });
    it("should revert if the pool cannot be created", async () => {
      const { deployAirstream } = await loadFixture(deploy);
      await expect(deployAirstream(zeroAddress, merkleRoot, 0n)).to.be.rejected;
    });
  });

  describe("Claim", () => {
    it("Should allow elegible accounts to claim a stream", async () => {
      const { airstream } = await loadFixture(deploy);
      const [index, [account, amount]] = [...tree.entries()][19];
      const proof = tree.getProof(index);
      await airstream.write.claim([account, amount, proof as `0x${string}`[]]);
      expect(await airstream.read.isClaimed([account])).to.equal(true);
    });
    it("Should revert if the account has already claimed", async () => {
      const { airstream } = await loadFixture(deploy);
      const [index, [account, amount]] = [...tree.entries()][19];
      const proof = tree.getProof(index);
      await airstream.write.claim([account, amount, proof as `0x${string}`[]]);
      await expect(
        airstream.write.claim([account, amount, proof as `0x${string}`[]]),
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
    it("Should allow the owner to withdraw tokens", async () => {
      const { airstream, wallet1, publicClient } = await loadFixture(deploy);
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
    it("Should revert if withdrawing tokens from a non-owner", async () => {
      const { airstream, addr2 } = await loadFixture(deploy);
      const token = await mintToken(airstream.address);
      await expect(
        airstream.write.withdraw([token.address], { account: addr2 }),
      ).to.be.rejectedWith("OwnableUnauthorizedAccount");
    });
  });
});
