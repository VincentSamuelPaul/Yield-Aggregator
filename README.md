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

## 📚 Documentation

- **[Complete Documentation](DOCUMENTATION.md)** - Full project documentation with architecture, smart contracts, and technical deep dives
- **[Quick Reference](QUICK_REFERENCE.md)** - Essential commands, formulas, and troubleshooting
- **[Testing Guide](/.gemini/antigravity/brain/ee1b9731-d443-4a13-92f1-bd44787667fa/testing_guide.md)** - Step-by-step testing instructions
- **[Bug Fixes Walkthrough](/.gemini/antigravity/brain/ee1b9731-d443-4a13-92f1-bd44787667fa/walkthrough.md)** - Critical bug fixes and solutions

## 🎯 Features

- 🏦 **Vault System** - Secure deposit and withdrawal of ETH
- 📈 **Yield Strategies** - Automated investment strategies (MockStrategy for testing)
- 💰 **Lending** - Deposit ETH, earn yield through shares
- 💸 **Borrowing** - Borrow WETH with 10% fee
- 🌾 **Yield Harvesting** - Simulate 5% yield generation
- 🎨 **Modern UI** - Beautiful glassmorphism design with real-time updates

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

### Smart Contracts

| Contract | Address (Sepolia) | Purpose |
|----------|-------------------|---------|
| Vault | `0x30Cd4faC30d1E4b73b8179aab4fBc009C907E024` | Main vault managing deposits/withdrawals/borrowing |
| MockStrategy | `0xeE8F07acFCaFd0273d2F67771edaCA7D70C6a360` | Simulates yield-generating strategy |
| WETH | `0xc558dbdd856501fcd9aaf1e62eae57a9f0629a3c` | Wrapped ETH token |

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

## 🧪 Testing

See [Testing Guide](/.gemini/antigravity/brain/ee1b9731-d443-4a13-92f1-bd44787667fa/testing_guide.md) for complete testing workflow.

**Quick test** (requires ~0.02 ETH on Sepolia):
```
1. Deposit 0.01 ETH
2. Fund reward pool (0.01 ETH)
3. Harvest yield
4. Borrow 0.003 WETH
5. Repay 0.0033 WETH
6. Withdraw all shares
```

## 📁 Project Structure

```
try-2/
├── contracts/           # Solidity smart contracts
│   ├── Vault.sol       # Main vault contract
│   └── MockStrategy.sol # Mock investment strategy
├── scripts/            # Deployment & utility scripts
│   ├── compile.ts      # Compile contracts
│   └── deploy.ts       # Deploy to Sepolia
├── frontend/           # React application
│   └── src/
│       ├── App.tsx     # Main component
│       └── App.css     # Glassmorphism styles
├── DOCUMENTATION.md    # Complete documentation
├── QUICK_REFERENCE.md  # Quick reference guide
└── deployments.json    # Deployed contract addresses
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

## 🔐 Security

> [!WARNING]
> This is a **learning project** and **NOT production-ready**. Do not use on mainnet without:
> - Professional smart contract audit
> - Comprehensive test suite
> - Access controls & governance
> - Emergency pause mechanism

## 📖 Learn More

- **Architecture & Design**: See [DOCUMENTATION.md](DOCUMENTATION.md#architecture)
- **Smart Contract Details**: See [DOCUMENTATION.md](DOCUMENTATION.md#smart-contracts)
- **Frontend Implementation**: See [DOCUMENTATION.md](DOCUMENTATION.md#frontend-application)
- **Formulas & Calculations**: See [QUICK_REFERENCE.md](QUICK_REFERENCE.md#-formulas)

## 🐛 Troubleshooting

**"Execution reverted" errors?**
- Check [Bug Fixes Walkthrough](/.gemini/antigravity/brain/ee1b9731-d443-4a13-92f1-bd44787667fa/walkthrough.md)
- Ensure you funded the reward pool before harvesting
- Verify you have sufficient balance

**Transaction pending forever?**
- Increase gas price in MetaMask
- Check Sepolia network status

**More issues?** See [QUICK_REFERENCE.md](QUICK_REFERENCE.md#-common-issues)

## 🎓 Key Concepts

- **Shares**: Ownership tokens representing your % of the vault
- **WETH**: Wrapped ETH - ERC20 version of ETH for easier DeFi integration
- **Strategy**: Smart contract that invests funds to earn yield
- **Harvest**: Collect earned yield from the strategy
- **Utilization**: % of vault funds currently borrowed

## 🚧 Future Enhancements

- Integrate real strategies (Aave, Compound, Yearn)
- Multi-strategy support with migration
- Governance & DAO voting
- Collateralized borrowing
- Dynamic interest rates
- Liquidation mechanism

## 📄 License

MIT License

## 🤝 Contributing

This is a learning project! Feel free to:
- Fork and experiment
- Report bugs
- Suggest improvements
- Add features

---

**Ready to dive deeper?** Check out [DOCUMENTATION.md](DOCUMENTATION.md) for the complete guide! 📚
