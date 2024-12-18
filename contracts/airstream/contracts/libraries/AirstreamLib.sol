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

struct ClaimingWindow {
    uint64  startDate;
    uint64  duration;
    address treasury;
}

struct AirstreamExtendedConfig {
    address superToken;
    ClaimingWindow claimingWindow;
    uint24  initialRewardPPM;
    uint24  feePPM;
}

library AirstreamLib {
    function toPoolUnits(uint256 value) internal pure returns (uint128) {
        return uint128(value / 1e15);
    }

    function fromPoolUnits(uint128 value) internal pure returns (uint256) {
        return value * 1e15;
    }
}
