# Yield Aggregator MVP

A decentralized finance (DeFi) yield aggregator built on Ethereum Sepolia testnet. Allows users to lend ETH to earn yield, borrow WETH with fees, and automatically invest deposits into yield-generating strategies.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install
cd frontend && npm install && cd ..

# 2. Configure environment
# Create .env file with:
# SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
# PRIVATE_KEY=your_private_key

# 3. Compile contracts
npx ts-node scripts/compile.ts

# 4. Deploy to Sepolia
npx ts-node scripts/deploy.ts

# 5. Run frontend
cd frontend && npm run dev
```

Open `http://localhost:5173` and connect your MetaMask wallet (Sepolia network).

## 🎯 Features

- **Vault System** - Secure deposit and withdrawal of ETH
- **Yield Strategies** - Automated investment strategies (MockStrategy for testing)
- **Lending** - Deposit ETH, earn yield through shares
- **Borrowing** - Borrow WETH with 10% fee
- **Yield Harvesting** - Simulate 5% yield generation
- **Modern UI** - Beautiful glassmorphism design with real-time updates

## 🏗️ Architecture

```
User Wallet (MetaMask)
        ↓
React Frontend (Ethers.js)
        ↓
Vault Contract (Sepolia)
    ↓           ↓
WETH Token    MockStrategy
```

## 💡 How It Works

### For Lenders
1. Deposit ETH → Receive shares representing vault ownership
2. Vault invests 90% in strategy, keeps 10% buffer
3. Strategy earns yield (5% simulated)
4. Withdraw shares → Receive ETH + earned yield

### For Borrowers
1. Borrow WETH from vault (10% fee added to debt)
2. Use WETH for trading, arbitrage, etc.
3. Repay debt with WETH
4. Fees distributed to lenders as yield

**Quick test** (requires ~0.02 ETH on Sepolia):
```
1. Deposit 0.01 ETH
2. Fund reward pool (0.01 ETH)
3. Harvest yield
4. Borrow 0.003 WETH
5. Repay 0.0033 WETH
6. Withdraw all shares
```
## 🔧 Tech Stack

**Smart Contracts**:
- Solidity ^0.8.0
- Ethers.js v6 (deployment)

**Frontend**:
- React 18 + TypeScript
- Vite (build tool)
- Ethers.js v6 (blockchain interaction)
- Recharts (data visualization)

**Network**:
- Ethereum Sepolia Testnet


## 🚧 Future Enhancements

- Integrate real strategies (Aave, Compound, Yearn)
- Multi-strategy support with migration
- Governance & DAO voting
- Collateralized borrowing
- Dynamic interest rates
- Liquidation mechanism

## 📄 License

MIT License


