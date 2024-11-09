// SPDX-License-Identifier: AGPLv3
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {GDAv1Forwarder, PoolConfig} from "./interfaces/GDAv1Forwarder.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ISuperfluidPool} from "./interfaces/ISuperfluidPool.sol";
import {Claimable} from "./abstract/Claimable.sol";

library AirstreamLib {
    function toPoolUnits(uint256 value) internal pure returns (uint128) {
        return uint128(value / 1e15);
    }
}

contract Airstream is Initializable, OwnableUpgradeable, UUPSUpgradeable, Claimable, ReentrancyGuardUpgradeable {
    using AirstreamLib for uint256;

    error PoolCreationFailed();
    error NoUnclaimedTokens();
    event Withdrawn(address token, address account, uint256 amount);
    event Claimed(address indexed account, uint256 amount);
    
    address public immutable gdav1Forwarder;
    ISuperfluidPool public pool;
    bytes32 public merkleRoot_;
    uint256 public unclaimedAmount;
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(address _gdav1Forwarder) {
        gdav1Forwarder = _gdav1Forwarder;
        _disableInitializers();
    }

    function initialize(address _initialOwner, address _distributionToken, bytes32 _merkleRoot, uint256 _totalAmount) initializer public {
        __Ownable_init(_initialOwner);
        __UUPSUpgradeable_init();
        if (_totalAmount == 0) {
            revert NoUnclaimedTokens();
        }
        merkleRoot_ = _merkleRoot;
        unclaimedAmount = _totalAmount;
        _createPool(_distributionToken, gdav1Forwarder);
    }

    function claim(address account, uint256 amount, bytes32[] calldata proof) nonReentrant external {
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

        emit Claimed(account, amount);
    }

    /**
     * @notice Withdraw tokens from the contract
     * @param _token Address of the token to withdraw
     */
    function withdraw(address _token) public onlyOwner {
        uint256 balance = IERC20(_token).balanceOf(address(this));
        IERC20(_token).transfer(msg.sender, balance);
        emit Withdrawn(_token, msg.sender, balance);
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
