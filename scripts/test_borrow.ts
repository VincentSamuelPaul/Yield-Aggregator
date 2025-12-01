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

  const VAULT_ABI = [
    "function borrow(uint256)",
  ];

  const vault = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, wallet);

  console.log("Attempting to borrow 0.003 WETH...");

  try {
    // Try to estimate gas first (this is what's failing)
    const borrowAmount = ethers.parseEther("0.003");
    const gasEstimate = await vault.borrow.estimateGas(borrowAmount);
    console.log("Gas estimate:", gasEstimate.toString());

    // If we get here, the transaction should work
    const tx = await vault.borrow(borrowAmount);
    console.log("Transaction sent:", tx.hash);
    await tx.wait();
    console.log("✅ Borrow successful!");

  } catch (error: any) {
    console.error("❌ Borrow failed!");
    console.error("Error:", error.message);

    // Try to get more details
    if (error.data) {
      console.error("Error data:", error.data);
    }

    // Let's try calling the strategy withdraw directly to see what fails
    console.log("\n=== Testing Strategy Withdraw Directly ===");

    const STRATEGY_ABI = [
      "function withdraw(uint256)",
      "function totalBalance() view returns (uint256)",
      "function balanceOf() view returns (uint256)"
    ];

    const WETH_ABI = [
      "function balanceOf(address) view returns (uint256)"
    ];

    const strategy = new ethers.Contract(STRATEGY_ADDRESS, STRATEGY_ABI, wallet);
    const weth = new ethers.Contract(deployments.WETH, WETH_ABI, provider);

    const totalBalance = await strategy.totalBalance();
    const strategyWeth = await weth.balanceOf(STRATEGY_ADDRESS);

    console.log("Strategy totalBalance:", ethers.formatEther(totalBalance));
    console.log("Strategy WETH balance:", ethers.formatEther(strategyWeth));

    try {
      const withdrawAmount = ethers.parseEther("0.003");
      const gasEst = await strategy.withdraw.estimateGas(withdrawAmount);
      console.log("✅ Strategy withdraw gas estimate:", gasEst.toString());
    } catch (stratError: any) {
      console.error("❌ Strategy withdraw would also fail:", stratError.message);

      // The issue might be that WETH.withdraw() is failing
      // Let's check if the strategy can actually unwrap WETH
      console.log("\n=== Checking WETH Unwrap ===");
      console.log("Strategy needs to unwrap 0.003 WETH to send as ETH");
      console.log("Strategy has", ethers.formatEther(strategyWeth), "WETH");

      if (strategyWeth < ethers.parseEther("0.003")) {
        console.log("❌ Strategy doesn't have enough WETH!");
      } else {
        console.log("✅ Strategy has enough WETH");
        console.log("The issue might be with the WETH contract or the send() call");
      }
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
