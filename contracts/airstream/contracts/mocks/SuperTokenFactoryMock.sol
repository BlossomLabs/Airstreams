// SPDX-License-Identifier: AGPLv3
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import {SuperTokenMock} from "./SuperTokenMock.sol";
import {ISuperTokenFactory} from "../interfaces/ISuperTokenFactory.sol";
import {ISuperToken} from "../interfaces/ISuperToken.sol";

contract SuperTokenFactoryMock is ISuperTokenFactory {
    mapping(address => address) internal _canonicalWrapperSuperTokens;

    function createCanonicalERC20Wrapper(address _underlyingToken) external returns (ISuperToken) {
        address superToken = address(new SuperTokenMock(_underlyingToken));
        _canonicalWrapperSuperTokens[_underlyingToken] = superToken;
        return ISuperToken(superToken);
    }

    function getCanonicalERC20Wrapper(
        address _underlyingTokenAddress
    ) external view returns (address superTokenAddress) {
        superTokenAddress = _canonicalWrapperSuperTokens[
            _underlyingTokenAddress
        ];
    }
}
