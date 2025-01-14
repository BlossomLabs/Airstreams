// SPDX-License-Identifier: AGPLv3
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.22;

import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {AirstreamExtended} from "./AirstreamExtended.sol";
import {AirstreamController} from "./AirstreamController.sol";
import {AirstreamConfig, AirstreamExtendedConfig, ClaimingWindow} from "./libraries/AirstreamLib.sol";
import {ISuperTokenFactory} from "./interfaces/superfluid/ISuperTokenFactory.sol";
import {ISuperToken} from "./interfaces/superfluid/ISuperToken.sol";

contract AirstreamFactory {
    using SafeERC20 for IERC20;

    event AirstreamCreated(address airstream, address controller, address pool);
    error GDAv1ForwarderMustBeAContract();
    error SuperTokenFactoryMustBeAContract();

    address public immutable gdav1Forwarder;
    address public immutable superTokenFactory;
    AirstreamExtended public immutable airstreamImplementation;
    AirstreamController public immutable controllerImplementation;

    constructor(address _gdav1Forwarder, address _superTokenFactory) {
        if (!_isContract(_gdav1Forwarder)) revert GDAv1ForwarderMustBeAContract();
        if (!_isContract(_superTokenFactory)) revert SuperTokenFactoryMustBeAContract();
        gdav1Forwarder = _gdav1Forwarder;
        superTokenFactory = _superTokenFactory;
        airstreamImplementation = new AirstreamExtended(gdav1Forwarder);
        controllerImplementation = new AirstreamController(gdav1Forwarder);
    }

    /**
     * @notice Create a new airstream
     * @param config The configuration of the airstream
     */
    function createAirstream(AirstreamConfig memory config) public {
        createExtendedAirstream(config, AirstreamExtendedConfig({
            superToken: address(0),
            claimingWindow: ClaimingWindow({
                startDate: 0,
                duration: 0,
                treasury: address(0)
            }),
            initialRewardPPM: 0,
            feePPM: 0
        }));
    }

    /**
     * @notice Create a new airstream with extended configuration
     * @param config The configuration of the airstream
     * @param extendedConfig The extended configuration of the airstream
     */
    function createExtendedAirstream(AirstreamConfig memory config, AirstreamExtendedConfig memory extendedConfig) public {
        address token = config.token;
        if (extendedConfig.superToken != address(0)) {
            config.token = extendedConfig.superToken;
        } else {
            config.token = _getSuperTokenAddress(config.token);
        }

        uint256 initialAllowance = config.totalAmount * extendedConfig.initialRewardPPM / 1e6;

        // Create proxies first to get addresses
        AirstreamExtended airstream = AirstreamExtended(payable(address(new ERC1967Proxy(address(airstreamImplementation), new bytes(0)))));
        AirstreamController controller = AirstreamController(payable(address(new ERC1967Proxy(address(controllerImplementation), new bytes(0)))));

        // Initialize airstream and controller
        airstream.initialize(address(controller), config, extendedConfig);
        controller.initialize(address(this), address(airstream), initialAllowance);

        // Wrap (if necessary) and transfer tokens to controller
        _sendWrappedTokens(token, config.token, address(controller), config.totalAmount);

        // Start the airstream and transfer ownership
        controller.resumeAirstream();
        controller.transferOwnership(msg.sender);

        emit AirstreamCreated(address(airstream), address(controller), address(airstream.pool()));
    }

    function _getSuperTokenAddress(address token) internal returns (address superToken) {
        try ISuperToken(token).getHost() returns (address) {
            // If this succeeds, token is already a SuperToken
            superToken = token;
        } catch {
            // If getUnderlyingToken() fails, token is a regular ERC20
            superToken = ISuperTokenFactory(superTokenFactory).getCanonicalERC20Wrapper(token);
            if (superToken == address(0)) {
                superToken = address(ISuperTokenFactory(superTokenFactory).createCanonicalERC20Wrapper(token));
            }
        }
    }

    function _sendWrappedTokens(address token, address superToken, address to, uint256 amount) internal {
        if (token == superToken) {
            // If the token is already a SuperToken, transfer it directly to the address
            IERC20(token).safeTransferFrom(msg.sender, to, amount);
        } else {
            // Transfer tokens to factory, wrap them and send them to the address
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
            IERC20(token).approve(superToken, amount);
            ISuperToken(superToken).upgradeTo(to, amount, new bytes(0));
        }
    }

    function _isContract(address account) internal view returns (bool) {
        // This method relies on extcodesize, which returns 0 for contracts in
        // construction, since the code is only stored at the end of the
        // constructor execution.

        uint256 size;
        // solhint-disable-next-line no-inline-assembly
        assembly { size := extcodesize(account) }
        return size > 0;
    }
}
