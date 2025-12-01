// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IStrategy.sol";
import "./IWETH.sol";

contract MockStrategy is IStrategy {
    IWETH public immutable weth;
    uint256 public totalBalance;

    constructor(address _weth) {
        weth = IWETH(_weth);
    }

    function deposit() external payable override {
        uint256 amount = msg.value;
        if (amount > 0) {
            weth.deposit{value: amount}();
            totalBalance += amount;
        }
    }

    function withdraw(uint256 amount) external override {
        require(amount <= totalBalance, "Insufficient strategy balance");
        
        // Simulate withdrawal by unwrapping WETH
        weth.withdraw(amount);
        totalBalance -= amount;

        // Send ETH back to Vault
        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Failed to send Ether");
    }

    function balanceOf() external view override returns (uint256) {
        return totalBalance;
    }

    // Simulates earning 5% yield
    function harvest() external override {
        uint256 yield = (totalBalance * 5) / 100;
        
        // Check how much WETH we actually have vs what we're tracking
        uint256 actualWethBalance = weth.balanceOf(address(this));
        uint256 currentTracked = totalBalance;
        
        // Only increase totalBalance if we have enough actual WETH to back it
        // This prevents withdrawal failures due to phantom balance
        if (actualWethBalance >= currentTracked + yield) {
            // We have enough WETH (someone funded the reward pool)
            totalBalance += yield;
        } else if (actualWethBalance > currentTracked) {
            // We have some extra WETH, but not the full 5%
            // Increase by whatever extra we have
            totalBalance = actualWethBalance;
        }
        // If actualWethBalance < currentTracked, we have a problem and shouldn't increase
        // This means someone withdrew WETH directly or there's an accounting error
    }
    
    // Helper to fund the strategy with "yield" tokens so withdrawals actually work
    // Only wrap ETH if it's not coming from WETH (to avoid circular wrap/unwrap)
    receive() external payable {
        if (msg.sender != address(weth) && msg.value > 0) {
            weth.deposit{value: msg.value}();
        }
    }
}
