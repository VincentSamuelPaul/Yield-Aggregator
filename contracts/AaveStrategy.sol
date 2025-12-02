// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}

interface IPool {
    function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external;
    function withdraw(address asset, uint256 amount, address to) external returns (uint256);
}

contract AaveStrategy {
    IERC20 public asset; // WETH
    IERC20 public aToken; // aWETH (Interest bearing token)
    IPool public pool;

    // Sepolia Addresses
    // WETH: 0xd0dF82De051244F04Bff3A8BB1F62E1CD39EeD92
    // Pool: 0x87870BcA3FbE6056b2eA063bA79B377Ff430d4EE

    constructor(address _asset, address _pool, address _aToken) {
        asset = IERC20(_asset);
        pool = IPool(_pool);
        aToken = IERC20(_aToken);
    }

    function deposit(uint256 amount) external {
        // 1. Receive WETH from Vault
        require(asset.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        // 2. Approve Aave Pool
        asset.approve(address(pool), amount);
        
        // 3. Supply to Aave
        pool.supply(address(asset), amount, address(this), 0);
    }

    function withdraw(uint256 amount) external {
        // 1. Withdraw from Aave (burns aTokens, returns WETH)
        // Aave withdraw returns the amount withdrawn
        pool.withdraw(address(asset), amount, address(this));
        
        // 2. Send WETH back to Vault (msg.sender)
        require(asset.transfer(msg.sender, amount), "Transfer failed");
    }

    // Total Assets = aWETH Balance
    function balanceOf() external view returns (uint256) {
        return aToken.balanceOf(address(this));
    }
}
