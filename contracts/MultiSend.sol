// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract MultiSend is Ownable {
    constructor() payable Ownable(msg.sender) {}

    receive() external payable virtual {}

    function topUp() public payable {}

    function sum(uint[] memory amounts) private pure returns (uint retVal) {
        // the value of message should be exact of total amounts
        uint totalAmnt = 0;

        for (uint i = 0; i < amounts.length; i++) {
            totalAmnt += amounts[i];
        }

        return totalAmnt;
    }

    function withdraw(
        address payable[] memory addrs,
        uint[] memory amnts
    ) public payable onlyOwner {
        require(
            addrs.length == amnts.length,
            "The length of two array should be the same"
        );

        uint totalAmnt = sum(amnts);

        require(
            address(this).balance >= totalAmnt,
            "The value is not sufficient or exceed"
        );

        for (uint i = 0; i < addrs.length; i++) {
            addrs[i].transfer(amnts[i]);
        }
    }
}
