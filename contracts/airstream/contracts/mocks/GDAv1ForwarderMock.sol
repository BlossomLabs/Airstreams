// SPDX-License-Identifier: AGPLv3
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import {PoolConfig} from "../interfaces/gdav1/GDAv1Forwarder.sol";
import {PoolMock} from "./PoolMock.sol";

contract GDAv1ForwarderMock {
    function createPool(
        address token,
        address admin,
        PoolConfig memory config
    ) external returns (bool success, address pool) {
        if (token == address(0)) {
            success = false;
            pool = address(0);
        } else {
            success = true;
            pool = address(new PoolMock(token, admin, config));
        }
    }

    function connectPool(address pool, bytes memory userData) external pure returns (bool) {
        pool;
        userData;
        return true;
    }

    function distributeFlow(address token, address receiver, address pool, int96 flowRate, bytes memory userData) external pure returns (bool) {
        token;
        receiver;
        pool;
        flowRate;
        userData;
        return true;
    }
}
