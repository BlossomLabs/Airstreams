# Airstream Contracts

In order to deploy the contracts, follow the steps below:

```shell
npx hardhat vars set ALCHEMY_KEY # API key from Alchemy.com
npx hardhat vars set WALLET_KEY # Private key of the wallet that will deploy the contracts
bun run deploy:<network>
```

In order to verify the contracts, follow the steps below:

```shell
npx hardhat vars set ETHERSCAN_KEY_OPTIMISM # API key from optimistic.etherscan.io
# or
npx hardhat vars set ETHERSCAN_KEY_BASE # API key from basescan.org

npx hardhat verify --network <network> <factoryAddress> 0x6DA13Bde224A05a288748d857b9e7DDEffd1dE08
npx hardhat verify --network <network> <airstreamAddress> 0x6DA13Bde224A05a288748d857b9e7DDEffd1dE08
```
