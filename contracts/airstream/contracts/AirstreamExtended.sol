// SPDX-License-Identifier: AGPLv3
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.22;

import {BasicAirstream} from "./BasicAirstream.sol";
import {AirstreamLib, AirstreamConfig, AirstreamExtendedConfig, ClaimingWindow} from "./libraries/AirstreamLib.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract AirstreamExtended is BasicAirstream {
    using AirstreamLib for uint256;
    using SafeERC20 for IERC20;

    enum Stage {
        ClaimsNotStarted,
        ClaimsOpen,
        ClaimsClosed
    }

    error ClaimingWindowStillNotOpen();
    error ClaimingWindowStillNotClosed();
    error ClaimingWindowAlreadyClosed();
    error OpenEndedClaimingWindow();
    error StartDateAlreadyPassed(uint256 startDate, uint256 blockTimestamp);
    error InvalidClaimingWindow(uint64 duration, address treasury);
    error InvalidTreasury(address treasury);
    error InvalidInitialRewardPPM(uint256 initialRewardPPM);
    error InvalidFeePPM(uint256 feePPM);

    /* Claiming window: start date, duration, treasury address */
    ClaimingWindow public claimingWindow;
    /* Initial reward percentage (in parts per million) */
    uint24 public initialRewardPPM;
    /* Fee percentage (in parts per million) */
    uint24 public feePPM;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(address _gdav1Forwarder) BasicAirstream(_gdav1Forwarder) {}

    /**
     * @notice Initialize the airstream
     * @param _controller Address of the controller
     * @param _config Airstream configuration
     * @param _extendedConfig Airstream extended configuration
     */
    function initialize(address _controller, AirstreamConfig memory _config, AirstreamExtendedConfig memory _extendedConfig) initializer public override {
        __Airstream_init(_controller, _config);
        _configureExtendedConfig(_extendedConfig);
    }

    /**
     * @notice Claim the rewards for the given account
     * @param account Address of the account to claim for
     * @param amount Amount of the rewards to claim
     * @param proof Merkle proof for the claim
     */
    function claim(address account, uint256 amount, bytes32[] calldata proof) external override whenNotPaused nonReentrant {
        if (unclaimedAmount == 0) {
            revert NoUnclaimedTokens();
        }

        // Check if the claiming window is already open
        if (_getStage() == Stage.ClaimsNotStarted) {
            revert ClaimingWindowStillNotOpen();
        }

        // Check if the claiming window is still open
        if (_getStage() == Stage.ClaimsClosed) {
            revert ClaimingWindowAlreadyClosed();
        }

        // If the airstream didn't start yet, start it and set the proper pool units
        if (startedAt == 0) {
            startedAt = uint64(block.timestamp);
            _pool.updateMemberUnits(address(this), unclaimedAmount.toPoolUnits());
            _pool.updateMemberUnits(address(owner()), 0);
        }

        uint256 extraRewards = amount * initialRewardPPM / 1e6;
        if (extraRewards > 0) {
            IERC20(distributionToken()).safeTransferFrom(address(owner()), address(account), extraRewards);
        }
        _claimAirstream(account, amount, proof);
    }

    /**
     * @notice Stream back the unclaimed amount to the treasury after the claiming window is closed
     */
    function streamBackToTreasury() external whenNotPaused nonReentrant {
        // Check if the claiming window has a closing date
        if (claimingWindow.duration == 0) {
            revert OpenEndedClaimingWindow();
        }

        // Check if the claiming window is already closed
        if (_getStage() != Stage.ClaimsClosed) {
            revert ClaimingWindowStillNotClosed();
        }

        // Check if there is any unclaimed amount
        if (unclaimedAmount == 0) {
            revert NoUnclaimedTokens();
        }

        _pool.updateMemberUnits(address(this), 0);
        _pool.updateMemberUnits(claimingWindow.treasury, unclaimedAmount.toPoolUnits());

        IERC20 token = IERC20(_pool.superToken());
        uint256 balance = token.balanceOf(address(this));
        if (balance > 0) {
            token.transfer(claimingWindow.treasury, balance);
        }

        uint256 allowance = token.allowance(address(this), address(owner()));
        if (allowance > 0) {
            token.safeTransferFrom(address(owner()), claimingWindow.treasury, allowance);
        }

        unclaimedAmount = 0;
    }

    function _configureExtendedConfig(AirstreamExtendedConfig memory _extendedConfig) internal {
        uint64 startDate = _extendedConfig.claimingWindow.startDate;
        uint64 duration = _extendedConfig.claimingWindow.duration;
        address treasury = _extendedConfig.claimingWindow.treasury;
        if (startDate != 0 && block.timestamp > startDate) {
            revert StartDateAlreadyPassed(startDate, block.timestamp);
        }
        if (duration > 0 && treasury == address(0) || duration == 0 && treasury != address(0)) {
            revert InvalidClaimingWindow(duration, treasury);
        }
        if (treasury == address(this) || treasury == address(owner())) {
            revert InvalidTreasury(treasury);
        }
        if (_extendedConfig.initialRewardPPM > 1e6) {
            revert InvalidInitialRewardPPM(_extendedConfig.initialRewardPPM);
        }
        if (_extendedConfig.feePPM > 1e6) {
            revert InvalidFeePPM(_extendedConfig.feePPM);
        }
        claimingWindow = ClaimingWindow(startDate, duration, treasury);
        initialRewardPPM = _extendedConfig.initialRewardPPM;
        feePPM = _extendedConfig.feePPM;
        // If the airstream is supposed to start in the future, we need to set the proper pool units:
        // - The airstream should still not have any units
        // - The owner (who's already streaming to this contract) should receive the flow back
        if (claimingWindow.startDate != 0) {
            startedAt = 0;
            _pool.updateMemberUnits(address(this), 0);
            _pool.updateMemberUnits(address(owner()), 1);
        }
    }

    /**
     * @dev Get the stage of the airstream claims (not started, open, closed)
     */
    function _getStage() internal view returns (Stage) {
        // If the start date is set and it still hasn't passed, the airstream claims are not started
        if (claimingWindow.startDate != 0 && block.timestamp < claimingWindow.startDate) {
            return Stage.ClaimsNotStarted;
        }

        // If the claiming window is set and it has already ended, the airstream claims are closed
        if (claimingWindow.duration > 0 && block.timestamp >= claimingWindow.startDate + claimingWindow.duration) {
            return Stage.ClaimsClosed;
        }

        // Otherwise, the airstream claims are open
        return Stage.ClaimsOpen;
    }
}
