// SPDX-License-Identifier: AGPLv3
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.22;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {GDAv1Forwarder, PoolConfig} from "./interfaces/GDAv1Forwarder.sol";
import {ISuperfluidPool} from "./interfaces/ISuperfluidPool.sol";
import {Claimable} from "./abstract/Claimable.sol";
import {Withdrawable} from "./abstract/Withdrawable.sol";
import {AirstreamLib, AirstreamConfig, AirstreamExtendedConfig} from "./libraries/AirstreamLib.sol";

contract Airstream is Initializable, PausableUpgradeable, OwnableUpgradeable, UUPSUpgradeable, Claimable, Withdrawable, ReentrancyGuardUpgradeable {
    using AirstreamLib for uint256;

    error PoolCreationFailed();
    error InvalidDurationOrAmount();
    error NoUnclaimedTokens();
    event AirstreamCreated(string name, address pool);

    address public immutable gdav1Forwarder;
    string public name;
    ISuperfluidPool public pool;
    bytes32 public merkleRoot_;
    uint256 public unclaimedAmount;
    int96 public flowRate;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(address _gdav1Forwarder) {
        gdav1Forwarder = _gdav1Forwarder;
        _disableInitializers();
    }

    function initialize(address _controller, AirstreamConfig memory _config, AirstreamExtendedConfig memory _extendedConfig) initializer public {
        __Pausable_init();
        __Ownable_init(_controller);
        __UUPSUpgradeable_init();
        if (_config.totalAmount == 0 || _config.duration == 0) {
            revert InvalidDurationOrAmount();
        }
        name = _config.name;
        merkleRoot_ = _config.merkleRoot;
        unclaimedAmount = _config.totalAmount;
        flowRate = int96(_config.totalAmount / _config.duration);
        _createPool(_config.token, gdav1Forwarder);
        _configureExtendedConfig(_extendedConfig);
        emit AirstreamCreated(_config.name, address(pool));
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function claim(address account, uint256 amount, bytes32[] calldata proof) external whenNotPaused nonReentrant {
        if (unclaimedAmount == 0) {
            revert NoUnclaimedTokens();
        }

        // Verify claim and update state
        _claim(account, amount, proof);
        
        // Update pool units for claimer
        pool.updateMemberUnits(account, amount.toPoolUnits());

        IERC20 token = IERC20(pool.superToken());

        uint256 unclaimedBalance = token.balanceOf(address(this)) * amount / unclaimedAmount;
        if (unclaimedBalance > 0) {
            token.transfer(account, unclaimedBalance);
        }

        // Update contract's pool units and state
        unclaimedAmount -= amount;
        pool.updateMemberUnits(address(this), unclaimedAmount.toPoolUnits());
    }

    function withdraw(address token) external onlyOwner {
        _withdraw(token);
    }

    function merkleRoot() public view override returns (bytes32) {
        return merkleRoot_;
    }

    function distributionToken() public view returns (address) {
        return pool.superToken();
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        onlyOwner
        override
    {}

    function _configureExtendedConfig(AirstreamExtendedConfig memory _extendedConfig) internal {
        // TODO: Implement extended config
    }

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
        pool.updateMemberUnits(address(this), unclaimedAmount.toPoolUnits());
        GDAv1Forwarder(gdav1Forwarder).connectPool(_pool, "");
    }
}
