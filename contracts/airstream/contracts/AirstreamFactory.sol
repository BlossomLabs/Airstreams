// SPDX-License-Identifier: AGPLv3
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.22;

import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {Airstream} from "./Airstream.sol";

contract AirstreamFactory {

    event AirstreamCreated(address airstream, address pool);

    error GDAv1ForwarderMustBeAContract();

    struct DeploymentConfig {
        address distributionToken;
        bytes32 merkleRoot;
        uint96 totalAmount;
        uint64 duration;
    }

    address public immutable gdav1Forwarder;
    Airstream immutable implementation;

    constructor(address _gdav1Forwarder) {
        if (!isContract(_gdav1Forwarder)) revert GDAv1ForwarderMustBeAContract();
        gdav1Forwarder = _gdav1Forwarder;
        implementation = new Airstream(gdav1Forwarder);
    }

    function createAirstream(DeploymentConfig calldata config) public {
        Airstream airstream = Airstream(payable(new ERC1967Proxy(
            address(implementation),
            abi.encodeWithSelector(
                implementation.initialize.selector,
                msg.sender,
                config.distributionToken,
                config.merkleRoot,
                config.totalAmount,
                config.duration
            )
        )));
        emit AirstreamCreated(address(airstream), address(airstream.pool()));
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
