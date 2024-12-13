// SPDX-License-Identifier: AGPLv3
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SuperTokenMock is ERC20 {
    address private immutable underlyingToken;

    constructor(address _token) ERC20("SuperTokenMock", "STKx") {
        underlyingToken = _token;
    }

    function getUnderlyingToken() external view returns (address) {
        return underlyingToken;
    }

    function upgradeTo(address to, uint256 amount, bytes memory userData) external {
        ERC20(underlyingToken).transferFrom(msg.sender, address(this), amount);
        _mint(to, amount);
    }
}
