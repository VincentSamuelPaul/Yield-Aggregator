// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IStrategy {
    function deposit() external payable;
    function withdraw(uint256 amount) external;
    function balanceOf() external view returns (uint256);
    function harvest() external;
}
