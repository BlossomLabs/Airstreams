// SPDX-License-Identifier: AGPLv3
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.22;

import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {Airstream} from "./Airstream.sol";
import {AirstreamController} from "./AirstreamController.sol";
import {AirstreamConfig, AirstreamExtendedConfig} from "./libraries/AirstreamLib.sol";
import {ISuperTokenFactory} from "./interfaces/ISuperTokenFactory.sol";
import {ISuperToken} from "./interfaces/ISuperToken.sol";

contract AirstreamFactory {
    using SafeERC20 for IERC20;

    event AirstreamCreated(address airstream, address controller, address pool);
    error GDAv1ForwarderMustBeAContract();
    error SuperTokenFactoryMustBeAContract();

    address public immutable gdav1Forwarder;
    address public immutable superTokenFactory;
    Airstream immutable implementation;
    AirstreamController immutable controllerImplementation;

    constructor(address _gdav1Forwarder, address _superTokenFactory) {
        if (!isContract(_gdav1Forwarder)) revert GDAv1ForwarderMustBeAContract();
        if (!isContract(_superTokenFactory)) revert SuperTokenFactoryMustBeAContract();
        gdav1Forwarder = _gdav1Forwarder;
        superTokenFactory = _superTokenFactory;
        implementation = new Airstream(gdav1Forwarder);
        controllerImplementation = new AirstreamController(gdav1Forwarder);
    }

    function createAirstream(AirstreamConfig memory config) public {
        createAirstream(config, AirstreamExtendedConfig({
            superToken: address(0),
            startDate: 0,
            initialRewardPct: 0,
            claimingWindow: 0,
            minimumClaims: 0,
            feePct: 0
        }));
    }

    function createAirstream(AirstreamConfig memory config, AirstreamExtendedConfig memory extendedConfig) public {
        address token = config.token;
        config.token = _getSuperTokenAddress(config.token);

        // Create proxies first to get addresses
        Airstream airstream = Airstream(payable(address(new ERC1967Proxy(address(implementation), new bytes(0)))));
        AirstreamController controller = AirstreamController(payable(address(new ERC1967Proxy(address(controllerImplementation), new bytes(0)))));

        // Initialize airstream and controller
        airstream.initialize(address(controller), config, extendedConfig);
        controller.initialize(address(this), address(airstream));

        // Wrap (if necessary) and transfer tokens to controller
        _sendWrappedTokensToController(token, config.token, address(controller), config.totalAmount);

        // Start the airstream and transfer ownership
        controller.resumeAirstream();
        controller.transferOwnership(msg.sender);

        emit AirstreamCreated(address(airstream), address(controller), address(airstream.pool()));
    }

    function _getSuperTokenAddress(address token) internal returns (address superToken) {
        try ISuperToken(token).getUnderlyingToken() returns (address) {
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

    function _sendWrappedTokensToController(address token, address superToken, address controller, uint256 amount) internal {
        if (token == superToken) {
            // If the token is already a SuperToken, transfer it directly to the controller
            IERC20(token).safeTransferFrom(msg.sender, controller, amount);
        } else {
            // Transfer tokens to factory, wrap them and send them to controller
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
            IERC20(token).approve(superToken, amount);
            ISuperToken(superToken).upgradeTo(controller, amount, new bytes(0));
        }
    }

    function isContract(address account) internal view returns (bool) {
        // This method relies on extcodesize, which returns 0 for contracts in
        // construction, since the code is only stored at the end of the
        // constructor execution.

        uint256 size;
        // solhint-disable-next-line no-inline-assembly
        assembly { size := extcodesize(account) }
        return size > 0;
    }
}
