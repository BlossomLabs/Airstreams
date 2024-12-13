// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AirstreamMock {
    uint256 public withdrawCalled;
    uint256 public redirectRewardsCalled;
    bool public paused;
    address public owner;

    function mockSetOwner(address _owner) external {
        owner = _owner;
    }

    function redirectRewards(address[] memory from, address[] memory to, uint256[] memory amounts) public {
        from;
        to;
        amounts;
        redirectRewardsCalled++;
    }

    function pause() public {
        paused = true;
    }

    function unpause() public {
        paused = false;
    }

    function withdraw(address _token) public {
        _token;
        withdrawCalled++;
    }

    function distributionToken() public pure returns (address) {
        return address(0);
    }

    function pool() public pure returns (address) {
        return address(0);
    }

    function flowRate() public pure returns (uint256) {
        return 0;
    }
}
