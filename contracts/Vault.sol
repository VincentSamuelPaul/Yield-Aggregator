// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IStrategy.sol";
import "./IWETH.sol";

contract Vault {
    IWETH public immutable weth;
    IStrategy public strategy;
    
    mapping(address => uint256) public shares;
    uint256 public totalShares;

    mapping(address => uint256) public borrowed;
    uint256 public totalBorrowed;

    constructor(address _weth) {
        weth = IWETH(_weth);
    }

    function setStrategy(address _strategy) external {
        strategy = IStrategy(_strategy);
    }

    function deposit() external payable {
        uint256 amount = msg.value;
        require(amount > 0, "Zero amount");

        uint256 _totalAssets = totalAssets();
        uint256 shareIssuance = 0;

        if (totalShares == 0 || _totalAssets == 0) {
            shareIssuance = amount;
        } else {
            shareIssuance = (amount * totalShares) / _totalAssets;
        }

        // Wrap ETH to WETH
        weth.deposit{value: amount}();

        // Strategy Integration: Keep 10% buffer, send 90% to Strategy
        if (address(strategy) != address(0)) {
            uint256 balance = weth.balanceOf(address(this));
            uint256 buffer = (_totalAssets * 10) / 100; // 10% buffer
            
            if (balance > buffer) {
                uint256 investAmount = balance - buffer;
                // Unwrap WETH to ETH to send to Strategy (since MockStrategy accepts ETH)
                weth.withdraw(investAmount);
                strategy.deposit{value: investAmount}();
            }
        }

        shares[msg.sender] += shareIssuance;
        totalShares += shareIssuance;
    }

    function withdraw(uint256 shareAmount) external {
        require(shareAmount > 0, "Zero amount");
        require(shares[msg.sender] >= shareAmount, "Insufficient shares");

        uint256 _totalAssets = totalAssets();
        uint256 amountToWithdraw = (shareAmount * _totalAssets) / totalShares;

        uint256 availableLiquidity = weth.balanceOf(address(this));
        
        // If not enough liquidity, withdraw from Strategy
        if (availableLiquidity < amountToWithdraw && address(strategy) != address(0)) {
            uint256 shortage = amountToWithdraw - availableLiquidity;
            strategy.withdraw(shortage);
            // Strategy returns ETH, wrap it back to WETH for consistency or just use it
            // Actually, our withdraw logic unwraps WETH at the end anyway.
            // So if strategy returns ETH, we just need to make sure we have enough WETH/ETH total.
            // Let's wrap it to WETH to keep the logic simple below
            weth.deposit{value: shortage}();
            availableLiquidity += shortage;
        }

        require(availableLiquidity >= amountToWithdraw, "Insufficient liquidity");

        shares[msg.sender] -= shareAmount;
        totalShares -= shareAmount;

        // Unwrap WETH to ETH
        weth.withdraw(amountToWithdraw);

        // Send ETH to user
        (bool sent, ) = msg.sender.call{value: amountToWithdraw}("");
        require(sent, "Failed to send Ether");
    }

    function borrow(uint256 amount) external {
        require(amount > 0, "Zero amount");
        
        uint256 availableLiquidity = weth.balanceOf(address(this));
        
        // If not enough liquidity, withdraw from Strategy
        if (availableLiquidity < amount && address(strategy) != address(0)) {
            uint256 shortage = amount - availableLiquidity;
            strategy.withdraw(shortage);
            weth.deposit{value: shortage}();
            availableLiquidity += shortage;
        }

        require(availableLiquidity >= amount, "Insufficient liquidity");

        // Calculate 10% fee
        uint256 fee = (amount * 10) / 100;
        uint256 totalDebt = amount + fee;

        borrowed[msg.sender] += totalDebt;
        totalBorrowed += totalDebt;

        weth.transfer(msg.sender, amount);
    }

    function repay(uint256 amount) external {
        require(amount > 0, "Zero amount");
        require(borrowed[msg.sender] >= amount, "Over repayment");

        // User must have approved WETH transfer
        weth.transferFrom(msg.sender, address(this), amount);

        borrowed[msg.sender] -= amount;
        totalBorrowed -= amount;
        
        // Push to strategy if buffer exceeded? 
        // For simplicity, we only push on deposit for now.
    }

    function totalAssets() public view returns (uint256) {
        uint256 strategyBalance = 0;
        if (address(strategy) != address(0)) {
            strategyBalance = strategy.balanceOf();
        }
        return weth.balanceOf(address(this)) + totalBorrowed + strategyBalance;
    }

    function balanceOf(address user) public view returns (uint256) {
        return shares[user];
    }
    
    // Allow receiving ETH from WETH withdrawal and Strategy
    receive() external payable {}
}
