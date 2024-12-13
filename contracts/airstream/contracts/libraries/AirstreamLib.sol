// SPDX-License-Identifier: AGPLv3
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.22;

struct AirstreamConfig {
    string  name;
    address token;
    bytes32 merkleRoot;
    uint96  totalAmount;
    uint64  duration;
}

struct AirstreamExtendedConfig {
    address superToken;
    uint64  startDate;
    uint16  initialRewardPct;
    uint64  claimingWindow;
    uint96  minimumClaims;
    uint16  feePct;
}

library AirstreamLib {
    function toPoolUnits(uint256 value) internal pure returns (uint128) {
        return uint128(value / 1e15);
    }
}
