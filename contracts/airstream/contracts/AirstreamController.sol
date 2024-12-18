// SPDX-License-Identifier: AGPLv3
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.22;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {Airstream} from "./Airstream.sol";
import {GDAv1Forwarder} from "./interfaces/GDAv1Forwarder.sol";
import {Withdrawable} from "./abstract/Withdrawable.sol";

contract AirstreamController is Initializable, PausableUpgradeable, OwnableUpgradeable, UUPSUpgradeable, Withdrawable {

    error InvalidAirstreamOwner();
    address public immutable gdav1Forwarder;
    Airstream public airstream;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(address _gdav1Forwarder) {
        gdav1Forwarder = _gdav1Forwarder;
        _disableInitializers();
    }

    /**
     * @notice Initialize the controller
     * @dev The airstream contract is initialized in paused state
     * @param _owner The owner of the controller
     * @param _airstream The address of the airstream contract
     * @param _initialAllowance The initial allowance of the airstream
     */
    function initialize(address _owner, address _airstream, uint256 _initialAllowance) public initializer {
        __Pausable_init();
        __Ownable_init(_owner);
        __UUPSUpgradeable_init();
        airstream = Airstream(_airstream);

        // Allow the airstream to transfer the initial allowance
        if (_initialAllowance > 0) {
            IERC20(airstream.distributionToken()).approve(address(airstream), _initialAllowance);
        }

        // Start paused
        _pause();
        airstream.pause();
    }

    /**
     * @notice Redirect the rewards from one account to another
     * @param from The address to redirect from
     * @param to The address to redirect to
     */
    function redirectReward(address from, address to) public onlyOwner {
        address[] memory froms = new address[](1);
        froms[0] = from;
        address[] memory tos = new address[](1);
        tos[0] = to;
        redirectRewards(froms, tos, new uint256[](0));
    }

    /**
     * @notice Redirect the rewards from multiple accounts to another
     * @param from The addresses to redirect from
     * @param to The address to redirect to
     */
    function redirectRewards(address[] memory from, address to) public onlyOwner {
        address[] memory tos = new address[](1);
        tos[0] = to;
        redirectRewards(from, tos, new uint256[](0));
    }

    /**
     * @notice Redirect the rewards from multiple accounts to multiple accounts
     * @param from The addresses to redirect from
     * @param to The addresses to redirect to
     */
    function redirectRewards(address[] memory from, address[] memory to) public onlyOwner {
        airstream.redirectRewards(from, to, new uint256[](0));
    }

    /**
     * @notice Redirect the rewards from multiple accounts to multiple accounts allowing reallocation of units
     * @param from The addresses to redirect from
     * @param to The addresses to redirect to
     * @param amounts The amounts of units for each `to` address
     */
    function redirectRewards(address[] memory from, address[] memory to, uint256[] memory amounts) public onlyOwner {
        airstream.redirectRewards(from, to, amounts);
    }

    /**
     * @notice Pause the airstream
     */
    function pauseAirstream() public onlyOwner {
        _pause();
        airstream.pause();
        _stopFlow();
    }

    /**
     * @notice Resume the airstream
     */
    function resumeAirstream() public onlyOwner {
        if (airstream.owner() != address(this)) {
            revert InvalidAirstreamOwner();
        }
        _unpause();
        airstream.unpause();
        _startFlow();
    }

    /**
     * @notice Withdraw the token from the airstream contract and the controller
     * @dev The airstream contract must be paused
     * @param _token Address of the token to withdraw
     */
    function withdraw(address _token) public onlyOwner whenPaused {
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
}
