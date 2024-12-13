// SPDX-License-Identifier: AGPLv3
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.22;

import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

error AlreadyClaimed();
error InvalidProof();

abstract contract Claimable {

    event Claimed(address indexed account, uint256 amount);

    // This is a packed array of booleans.
    mapping(uint256 => uint256) private claimedBitMap;

    function isClaimed(uint256 index) public view returns (bool) {
        uint256 claimedWordIndex = index / 256;
        uint256 claimedBitIndex = index % 256;
        uint256 claimedWord = claimedBitMap[claimedWordIndex];
        uint256 mask = (1 << claimedBitIndex);
        return claimedWord & mask == mask;
    }

    function merkleRoot() public view virtual returns (bytes32);

    function _setClaimed(uint256 index) private {
        uint256 claimedWordIndex = index / 256;
        uint256 claimedBitIndex = index % 256;
        claimedBitMap[claimedWordIndex] = claimedBitMap[claimedWordIndex] | (1 << claimedBitIndex);
    }

    function _claim(address account, uint256 amount, bytes32[] calldata proof)
        internal
    {
        if (isClaimed(uint256(uint160(account)))) revert AlreadyClaimed();

        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(account, amount))));
        if (!MerkleProof.verify(proof, merkleRoot(), leaf)) revert InvalidProof();

        // Mark it claimed
        _setClaimed(uint256(uint160(account)));
        emit Claimed(account, amount);
    }
}
