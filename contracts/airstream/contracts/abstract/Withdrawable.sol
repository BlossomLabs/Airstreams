// SPDX-License-Identifier: AGPLv3
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.22;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

abstract contract Withdrawable {
    event Withdrawn(address token, address account, uint256 amount);

    /**
     * @notice Withdraw tokens from the contract
     * @param _token Address of the token to withdraw
     */
    function _withdraw(address _token) internal {
        uint256 balance = IERC20(_token).balanceOf(address(this));
        IERC20(_token).transfer(msg.sender, balance);
        emit Withdrawn(_token, msg.sender, balance);
    }
}