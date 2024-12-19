// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ISuperToken {
    /**
     * @dev Return the underlying token contract
     * @return tokenAddr Underlying token address
     */
    function getUnderlyingToken() external view returns(address tokenAddr);

    /**
     * @dev Upgrade ERC20 to SuperToken.
     * @param amount Number of tokens to be upgraded (in 18 decimals)
     *
     * @custom:note It will use `transferFrom` to get tokens. Before calling this
     * function you should `approve` this contract
     */
    function upgrade(uint256 amount) external;

    /**
     * @dev Upgrade ERC20 to SuperToken and transfer immediately
     * @param to The account to receive upgraded tokens
     * @param amount Number of tokens to be upgraded (in 18 decimals)
     * @param userData User data for the TokensRecipient callback
     *
     * @custom:note It will use `transferFrom` to get tokens. Before calling this
     * function you should `approve` this contract
     *
     * @custom:warning
     * - there is potential of reentrancy IF the "to" account is a registered ERC777 recipient.
     * @custom:requirements
     * - if `userData` is NOT empty AND `to` is a contract, it MUST be a registered ERC777 recipient
     *   otherwise it reverts.
     */
    function upgradeTo(address to, uint256 amount, bytes calldata userData) external;

    /**
     * @dev Get the host of the SuperToken
     * @return host The host of the SuperToken
     */
    function getHost() external view returns (address);
}
