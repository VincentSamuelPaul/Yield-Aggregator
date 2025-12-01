# Yield Aggregator - Quick Reference

## 🚀 Quick Start (5 Minutes)

```bash
# 1. Install dependencies
npm install && cd frontend && npm install && cd ..

# 2. Set up environment (.env file)
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=your_private_key

# 3. Compile & Deploy
npx ts-node scripts/compile.ts
npx ts-node scripts/deploy.ts

# 4. Run frontend
cd frontend && npm run dev
```

---

## 📊 Contract Addresses (Sepolia)

```
Vault:        0x30Cd4faC30d1E4b73b8179aab4fBc009C907E024
MockStrategy: 0xeE8F07acFCaFd0273d2F67771edaCA7D70C6a360
WETH:         0xc558dbdd856501fcd9aaf1e62eae57a9f0629a3c
```

---

## 🎯 Core Concepts

### What is a Yield Aggregator?
A DeFi protocol that:
- Accepts deposits from lenders
- Invests funds in yield-generating strategies
- Allows borrowing with fees
- Distributes profits to lenders

### Key Terms

| Term | Definition |
|------|------------|
| **Shares** | Ownership tokens representing your % of the vault |
| **WETH** | Wrapped ETH - ERC20 version of ETH |
| **Strategy** | Smart contract that invests funds to earn yield |
| **Harvest** | Collect earned yield from the strategy |
| **Utilization** | % of vault funds currently borrowed |

---

## 💰 User Actions

### Lender (Earn Yield)

```javascript
// 1. Deposit ETH
await vault.deposit({ value: parseEther("0.01") });
// → Receive shares

// 2. Wait for yield to accumulate
// (or trigger harvest manually)

// 3. Withdraw
const shares = await vault.balanceOf(userAddress);
await vault.withdraw(shares);
// → Receive ETH + earned yield
```

### Borrower (Get Liquidity)

```javascript
// 1. Borrow WETH (10% fee)
await vault.borrow(parseEther("0.003"));
// → Receive 0.003 WETH, owe 0.0033 WETH

// 2. Use WETH for whatever you need

// 3. Repay debt
await weth.approve(vaultAddress, parseEther("0.0033"));
await vault.repay(parseEther("0.0033"));
// → Debt cleared
```

---

## 📈 How Yield Works

```
1. Lender deposits 1 ETH → Receives 1 share
2. Vault invests 0.9 ETH in strategy (keeps 0.1 buffer)
3. Strategy earns 5% yield → Now has 0.945 ETH
4. Total vault assets: 1.045 ETH
5. Lender's 1 share is now worth 1.045 ETH
6. Lender withdraws → Receives 1.045 ETH (0.045 profit!)
```

---

## 🔧 Smart Contract Functions

### Vault.sol

| Function | Parameters | Description |
|----------|------------|-------------|
| `deposit()` | `payable` | Deposit ETH, receive shares |
| `withdraw(uint256)` | `shareAmount` | Burn shares, receive ETH |
| `borrow(uint256)` | `amount` | Borrow WETH with 10% fee |
| `repay(uint256)` | `amount` | Repay borrowed WETH |
| `totalAssets()` | - | View total vault value |
| `balanceOf(address)` | `user` | View user's shares |
| `borrowed(address)` | `user` | View user's debt |

### MockStrategy.sol

| Function | Parameters | Description |
|----------|------------|-------------|
| `deposit()` | `payable` | Receive funds from vault |
| `withdraw(uint256)` | `amount` | Return funds to vault |
| `harvest()` | - | Simulate 5% yield generation |
| `balanceOf()` | - | View strategy's balance |

---

## 🎨 Frontend Components

### Main UI Sections

1. **Header**
   - Connect Wallet button
   - Connected address display

2. **Vault Health Card**
   - Pie chart (Borrowed / Strategy / Idle)
   - Total assets, strategy balance
   - Harvest & fund reward pool buttons

3. **Lender Actions Card**
   - Your shares & wallet balance
   - Deposit input & button
   - Withdraw all button

4. **Borrower Actions Card**
   - Your debt & WETH balance
   - Borrow input & button
   - Repay input & button

---

## 🧪 Testing Checklist

- [ ] Connect wallet (MetaMask on Sepolia)
- [ ] Deposit 0.01 ETH
- [ ] Verify shares received
- [ ] Fund reward pool (0.01 ETH)
- [ ] Harvest yield
- [ ] Verify balance increased
- [ ] Borrow 0.003 WETH
- [ ] Verify debt = 0.0033 WETH
- [ ] Repay full debt
- [ ] Verify debt = 0
- [ ] Withdraw all shares
- [ ] Verify received ETH > initial deposit

---

## 🐛 Common Issues

### "Execution reverted" on withdraw
**Cause**: Strategy doesn't have enough WETH to back the balance
**Solution**: Fund reward pool before harvesting

### "Execution reverted" on borrow
**Cause**: Circular wrap/unwrap bug (should be fixed)
**Solution**: Redeploy with latest contracts

### Transaction pending forever
**Cause**: Low gas price or network congestion
**Solution**: Increase gas price in MetaMask

### "Insufficient shares"
**Cause**: Trying to withdraw more than you own
**Solution**: Check your balance with refresh button

---

## 📐 Formulas

### Share Calculation (Deposit)
```
shares = (depositAmount × totalShares) / totalAssets
```
*First deposit: shares = depositAmount*

### Withdrawal Amount
```
ethAmount = (shares × totalAssets) / totalShares
```

### Borrow Fee
```
debt = borrowAmount × 1.1
```
*10% upfront fee*

### Total Assets
```
totalAssets = vaultWETH + totalBorrowed + strategyBalance
```

---

## 🔐 Security Notes

> [!CAUTION]
> **This is a learning project, NOT production-ready!**

Before mainnet deployment:
- ✅ Professional smart contract audit
- ✅ Comprehensive test suite (unit + integration)
- ✅ Access controls & governance
- ✅ Emergency pause mechanism
- ✅ Upgradeability pattern
- ✅ Insurance fund
- ✅ Time locks on critical functions

---

## 📚 File Locations

| File | Purpose |
|------|---------|
| [`DOCUMENTATION.md`](file:///Users/forge/Forge/try-2/DOCUMENTATION.md) | Complete project documentation |
| [`contracts/Vault.sol`](file:///Users/forge/Forge/try-2/contracts/Vault.sol) | Main vault contract |
| [`contracts/MockStrategy.sol`](file:///Users/forge/Forge/try-2/contracts/MockStrategy.sol) | Mock strategy contract |
| [`frontend/src/App.tsx`](file:///Users/forge/Forge/try-2/frontend/src/App.tsx) | React frontend |
| [`scripts/deploy.ts`](file:///Users/forge/Forge/try-2/scripts/deploy.ts) | Deployment script |
| [`deployments.json`](file:///Users/forge/Forge/try-2/deployments.json) | Deployed addresses |

---

## 🎓 Learning Resources

- **Full Documentation**: [`DOCUMENTATION.md`](file:///Users/forge/Forge/try-2/DOCUMENTATION.md)
- **Testing Guide**: [`testing_guide.md`](file:///Users/forge/.gemini/antigravity/brain/ee1b9731-d443-4a13-92f1-bd44787667fa/testing_guide.md)
- **Bug Fixes**: [`walkthrough.md`](file:///Users/forge/.gemini/antigravity/brain/ee1b9731-d443-4a13-92f1-bd44787667fa/walkthrough.md)

---

## 💡 Pro Tips

1. **Always refresh** after transactions to see updated balances
2. **Fund reward pool** before harvesting to see yield increase
3. **Keep some ETH** for gas fees (don't deposit everything)
4. **Test on Sepolia first** before considering mainnet
5. **Read the docs** - they explain everything in detail!

---

**Need help?** Check [`DOCUMENTATION.md`](file:///Users/forge/Forge/try-2/DOCUMENTATION.md) for detailed explanations! 📖
