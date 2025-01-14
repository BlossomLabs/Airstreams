import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import "@nomicfoundation/hardhat-ignition-viem";
import { vars } from "hardhat/config";

const alchemyKey = vars.has("ALCHEMY_KEY") ? vars.get("ALCHEMY_KEY") : "";
const walletKey = vars.has("WALLET_KEY") ? [vars.get("WALLET_KEY")] : [];
const etherscanKeySepolia = vars.has("ETHERSCAN_KEY_SEPOLIA")
  ? vars.get("ETHERSCAN_KEY_SEPOLIA")
  : "";
const etherscanKeyBase = vars.has("ETHERSCAN_KEY_BASE")
  ? vars.get("ETHERSCAN_KEY_BASE")
  : "";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.22",
    settings: {
      optimizer: {
        enabled: true,
        runs: 10000,
      },
    },
  },
  networks: {
    hardhat: {},
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${alchemyKey}`,
      accounts: walletKey,
    },
    base: {
      url: `https://base-mainnet.g.alchemy.com/v2/${alchemyKey}`,
      accounts: walletKey,
    },
  },
  ignition: {
    strategyConfig: {
      create2: {
        // To learn more about salts, see the CreateX documentation
        salt: "0x0000000000000000000000000000000000000000000000000000000000000000",
      },
    },
  },
  etherscan: {
    apiKey: {
      sepolia: etherscanKeySepolia,
      base: etherscanKeyBase,
    },
  },
  sourcify: {
    enabled: false,
  },
};

export default config;
