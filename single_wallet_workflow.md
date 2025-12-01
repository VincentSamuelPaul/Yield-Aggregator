# Single Wallet Testing Guide

You can test all features of the Yield Aggregator using a single MetaMask wallet. Since you are acting as both the **Lender** and the **Borrower**, you will be interacting with the pool's liquidity which is primarily funded by your own deposits.

## Prerequisites
- **Wallet**: One MetaMask account with ETH.
- **Network**: Local Hardhat Network (or Sepolia if deployed there).

## Step-by-Step Guide

### 1. Connect & Deposit (Lender Role)
1.  **Connect Wallet**: Click the "Connect Wallet" button.
2.  **Deposit ETH**:
    - Go to "Lender Actions".
    - Enter an amount (e.g., `0.1` ETH).
    - Click **Deposit**.
    - **Verify**:
        - "Your Shares" should equal `0.1`.
        - "Strategy Balance" should be `0.09` ETH (90% allocated).
        - "Idle Liquidity" should be `0.01` ETH (10% buffer).

### 2. Borrowing (Borrower Role)
1.  **Borrow WETH**:
    - Go to "Borrower Actions".
    - Enter an amount (e.g., `0.05` WETH).
    - Click **Borrow**.
    - **Verify**:
        - "Your Debt" increases to `0.055` WETH (includes 10% fee).
        - Your wallet's WETH balance increases by `0.05`.
        - "Idle Liquidity" decreases (or Strategy Balance decreases if buffer was insufficient).

### 3. Repayment
1.  **Repay Debt**:
    - In "Borrower Actions", enter `0.55` (or the full debt amount).
    - Click **Approve & Repay**.
    - **Verify**:
        - "Your Debt" becomes `0`.
        - Your wallet's WETH balance decreases.

### 4. Yield Farming (Simulation)
*Note: The "Harvest" button simulates a 5% yield by increasing the Strategy's internal balance counter. In this mock setup, it does not automatically mint real ETH.*

1.  **Harvest Yield**:
    - Click **Harvest Yield (Simulate 5%)**.
    - **Verify**:
        - "Strategy Balance" increases by 5%.
        - "Total Assets" increases.

### 5. Withdraw Profit (Advanced)
To successfully withdraw the *profit* generated in Step 4, the Strategy contract must physically hold the extra ETH.

1.  **Fund the Strategy**:
    - Click **Fund Reward Pool (0.01 ETH)**.
    - Confirm the transaction in MetaMask.
    - *This sends real ETH to the strategy to back the simulated yield.*

2.  **Withdraw All**:
    - Go to "Lender Actions".
    - Click **Withdraw All Shares**.
    - **Verify**:
        - You receive your original deposit + profit.
        - "Your Shares" becomes `0`.

## Summary
By following this flow, you have exercised:
- `deposit()`
- `borrow()` (with auto-pull from strategy)
- `repay()`
- `harvest()`
- `withdraw()` (with auto-pull from strategy)
