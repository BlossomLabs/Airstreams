// SPDX-License-Identifier: AGPLv3
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.22;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {Airstream} from "./Airstream.sol";
import {GDAv1Forwarder} from "./interfaces/GDAv1Forwarder.sol";
import {Withdrawable} from "./abstract/Withdrawable.sol";

contract AirstreamController is Initializable, PausableUpgradeable, OwnableUpgradeable, UUPSUpgradeable, Withdrawable {
    using SafeERC20 for IERC20;

    address public immutable gdav1Forwarder;
    Airstream airstream;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(address _gdav1Forwarder) {
        gdav1Forwarder = _gdav1Forwarder;
        _disableInitializers();
    }

    function initialize(address _owner, address _airstream) public initializer {
        __Pausable_init();
        __Ownable_init(_owner);
        __UUPSUpgradeable_init();
        airstream = Airstream(_airstream);
        _startFlow();
        _authorizeAmount(1); // TODO: Add the correct amount
    }

    function pause() public onlyOwner {
        _pause();
        airstream.pause();
        _stopFlow();
    }

    function unpause() public onlyOwner {
        _unpause();
        airstream.unpause();
        _startFlow();
    }

    /**
     * @notice Stop the flow and withdraw the token from the airstream contract and the controller
     * @param _token Address of the token to withdraw
     */
    function stopAndWithdraw(address _token) public onlyOwner {
        // Withdraw the token from the airstream contract to the controller
        airstream.withdraw(_token);
        // Withdraw the token from the controller to the owner
        _withdraw(_token);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function _startFlow() internal {
        GDAv1Forwarder(gdav1Forwarder).distributeFlow(
            airstream.distributionToken(),
            address(this),
            address(airstream.pool()),
            airstream.flowRate(),
            new bytes(0)
        );
    }

    function _stopFlow() internal {
        GDAv1Forwarder(gdav1Forwarder).distributeFlow(
            airstream.distributionToken(),
            address(this),
            address(airstream.pool()),
            0,
            new bytes(0)
        );
    }

    function _authorizeAmount(uint96 _authorizedAmount) internal onlyInitializing {
        IERC20(airstream.distributionToken()).approve(address(airstream), _authorizedAmount);
    }
}
