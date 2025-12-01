import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

async function main() {
  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  const privateKey = process.env.PRIVATE_KEY;

  if (!rpcUrl || !privateKey) {
    throw new Error("Missing SEPOLIA_RPC_URL or PRIVATE_KEY in .env");
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  // Load deployments
  const deployments = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../deployments.json'), 'utf8'));

  const VAULT_ADDRESS = deployments.Vault;
  const STRATEGY_ADDRESS = deployments.MockStrategy;
  const WETH_ADDRESS = deployments.WETH;

  const VAULT_ABI = [
    "function totalAssets() view returns (uint256)",
    "function totalBorrowed() view returns (uint256)",
    "function balanceOf(address) view returns (uint256)",
    "function borrowed(address) view returns (uint256)",
    "function strategy() view returns (address)"
  ];

  const STRATEGY_ABI = [
    "function balanceOf() view returns (uint256)",
    "function totalBalance() view returns (uint256)"
  ];

  const WETH_ABI = [
    "function balanceOf(address) view returns (uint256)"
  ];

  const vault = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, provider);
  const strategy = new ethers.Contract(STRATEGY_ADDRESS, STRATEGY_ABI, provider);
  const weth = new ethers.Contract(WETH_ADDRESS, WETH_ABI, provider);

  console.log("=== Vault Debug Info ===");
  console.log("Vault Address:", VAULT_ADDRESS);
  console.log("Strategy Address:", STRATEGY_ADDRESS);
  console.log("WETH Address:", WETH_ADDRESS);
  console.log("User Address:", wallet.address);
  console.log();

  const totalAssets = await vault.totalAssets();
  const totalBorrowed = await vault.totalBorrowed();
  const userShares = await vault.balanceOf(wallet.address);
  const userBorrowed = await vault.borrowed(wallet.address);

  const vaultWethBalance = await weth.balanceOf(VAULT_ADDRESS);
  const strategyWethBalance = await weth.balanceOf(STRATEGY_ADDRESS);
  const strategyTotalBalance = await strategy.totalBalance();

  console.log("=== Vault State ===");
  console.log("Total Assets:", ethers.formatEther(totalAssets), "ETH");
  console.log("Total Borrowed:", ethers.formatEther(totalBorrowed), "WETH");
  console.log("Vault WETH Balance:", ethers.formatEther(vaultWethBalance), "WETH");
  console.log();

  console.log("=== Strategy State ===");
  console.log("Strategy Total Balance (tracked):", ethers.formatEther(strategyTotalBalance), "ETH");
  console.log("Strategy WETH Balance (actual):", ethers.formatEther(strategyWethBalance), "WETH");
  console.log();

  console.log("=== User State ===");
  console.log("User Shares:", ethers.formatEther(userShares));
  console.log("User Borrowed:", ethers.formatEther(userBorrowed), "WETH");
  console.log();

  console.log("=== Available for Borrowing ===");
  const availableInVault = vaultWethBalance;
  const availableInStrategy = strategyWethBalance; // Actual WETH in strategy
  const totalAvailable = availableInVault + availableInStrategy;

  console.log("Available in Vault:", ethers.formatEther(availableInVault), "WETH");
  console.log("Available in Strategy:", ethers.formatEther(availableInStrategy), "WETH");
  console.log("Total Available for Borrow:", ethers.formatEther(totalAvailable), "WETH");
  console.log();

  // Check if there's a mismatch
  if (strategyTotalBalance > strategyWethBalance) {
    console.log("⚠️  WARNING: Strategy tracking mismatch!");
    console.log("   Tracked:", ethers.formatEther(strategyTotalBalance), "ETH");
    console.log("   Actual WETH:", ethers.formatEther(strategyWethBalance), "WETH");
    console.log("   Difference:", ethers.formatEther(strategyTotalBalance - strategyWethBalance), "ETH");
    console.log("   This will cause borrow/withdraw to fail!");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
