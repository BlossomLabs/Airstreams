// SPDX-License-Identifier: AGPLv3
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {GDAv1Forwarder, PoolConfig} from "./interfaces/GDAv1Forwarder.sol";
import {ISuperfluidPool} from "./interfaces/ISuperfluidPool.sol";

contract Airstream is Initializable, OwnableUpgradeable, UUPSUpgradeable {

    error PoolCreationFailed();
    
    address public immutable gdav1Forwarder;
    ISuperfluidPool public pool;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(address _gdav1Forwarder) {
        gdav1Forwarder = _gdav1Forwarder;
        _disableInitializers();
    }

    function initialize(address initialOwner, address distributionToken) initializer public {
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();

        _createPool(distributionToken, gdav1Forwarder);
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        onlyOwner
        override
    {}

    function _createPool(address _distributionToken, address _gdav1Forwarder) internal onlyInitializing {
        // Create a new pool using the GDAv1Forwarder
        (bool _success, address _pool) = GDAv1Forwarder(_gdav1Forwarder)
            .createPool(
                _distributionToken,
                address(this),
                PoolConfig({
                    transferabilityForUnitsOwner: false,
                    distributionFromAnyAddress: true
                })
            );
        // Revert if pool creation fails
        if (!_success) revert PoolCreationFailed();
        // Set the Airstream's pool
        pool = ISuperfluidPool(_pool);
    }
}
