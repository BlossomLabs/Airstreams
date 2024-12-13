// SPDX-License-Identifier: AGPLv3
pragma solidity ^0.8.22;

import {ISuperfluidPool} from "../interfaces/ISuperfluidPool.sol";
import {AirstreamLib} from "./AirstreamLib.sol";

library RedirectLib {
    using AirstreamLib for uint256;

    error InvalidInput();
    error InvalidAmounts();

    function redirectUnits(
        ISuperfluidPool pool,
        address[] memory from,
        address[] memory to,
        uint256[] memory amounts
    ) internal {
        if(from.length == 0 || to.length == 0) {
            revert InvalidInput();
        }

        // If amounts are provided, we expect a 3-column table of values
        if (amounts.length > 0 && from.length == to.length && from.length == amounts.length) {
            _handleThreeColumnRedirect(pool, from, to, amounts);
            return;
        }
        // If only from and to are provided, we expect a 2-column table
        else if (from.length != to.length) {
            _handleTwoColumnRedirect(pool, from, to);
            return;
        }
        // If from and to mismatch, maybe to is a single address
        else if (to.length == 1) {
            _handleSingleDestinationRedirect(pool, from, to[0]);
            return;
        }
        
        revert InvalidInput();
    }

    function _handleThreeColumnRedirect(
        ISuperfluidPool pool,
        address[] memory from,
        address[] memory to,
        uint256[] memory amounts
    ) private {
        uint128 amountAdded = 0;
        uint128 amountRemoved = 0;
        
        for (uint256 i = 0; i < from.length; i++) {
            amountAdded += amounts[i].toPoolUnits();
            amountRemoved += pool.getUnits(from[i]);
            pool.updateMemberUnits(to[i], amounts[i].toPoolUnits());
            pool.updateMemberUnits(from[i], 0);
        }
        
        if (amountRemoved != amountAdded) {
            revert InvalidAmounts();
        }
    }

    function _handleTwoColumnRedirect(
        ISuperfluidPool pool,
        address[] memory from,
        address[] memory to
    ) private {
        for (uint256 i = 0; i < from.length; i++) {
            pool.updateMemberUnits(to[i], pool.getUnits(from[i]));
            pool.updateMemberUnits(from[i], 0);
        }
    }

    function _handleSingleDestinationRedirect(
        ISuperfluidPool pool,
        address[] memory from,
        address to
    ) private {
        uint128 amountRemoved = 0;
        
        for (uint256 i = 0; i < from.length; i++) {
            amountRemoved += pool.getUnits(from[i]);
            pool.updateMemberUnits(from[i], 0);
        }
        
        pool.updateMemberUnits(to, amountRemoved);
    }
} 