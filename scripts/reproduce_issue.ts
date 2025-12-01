import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  const privateKey = process.env.PRIVATE_KEY;

  if (!rpcUrl || !privateKey) {
    throw new Error("Missing SEPOLIA_RPC_URL or PRIVATE_KEY in .env");
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log(`Running reproduction script from: ${wallet.address}`);

  const deploymentsPath = path.resolve(__dirname, '../deployments.json');
  if (!fs.existsSync(deploymentsPath)) {
    throw new Error("deployments.json not found. Run deploy.ts first.");
  }
  const deployments = JSON.parse(fs.readFileSync(deploymentsPath, 'utf8'));

  const vaultAddress = deployments.Vault;
  const strategyAddress = deployments.MockStrategy;

  const artifactsPath = path.resolve(__dirname, '../artifacts');
  const VaultArtifact = JSON.parse(fs.readFileSync(path.join(artifactsPath, 'Vault.json'), 'utf8'));
  const StrategyArtifact = JSON.parse(fs.readFileSync(path.join(artifactsPath, 'MockStrategy.json'), 'utf8'));

  const vault = new ethers.Contract(vaultAddress, VaultArtifact.abi, wallet);
  const strategy = new ethers.Contract(strategyAddress, StrategyArtifact.abi, wallet);

  // 1. Deposit if needed (check shares first)
  const shares = await vault.balanceOf(wallet.address);
  console.log(`Current shares: ${shares.toString()}`);

  if (shares == 0n) {
    console.log("Depositing 0.01 ETH...");
    const tx = await vault.deposit({ value: ethers.parseEther("0.01") });
    await tx.wait();
    console.log("Deposited.");
  }

  // 2. Fund the strategy (Simulate "Fund Reward Pool")
  console.log("Funding strategy with 0.01 ETH...");
  const fundTx = await wallet.sendTransaction({
    to: strategyAddress,
    value: ethers.parseEther("0.01")
  });
  await fundTx.wait();
  console.log("Funded.");

  // 3. Harvest to generate "fake" yield
  console.log("Harvesting yield...");
  const harvestTx = await strategy.harvest();
  await harvestTx.wait();
  console.log("Harvested.");

  // DEBUG: Check balances
  const WETH_ABI = ["function balanceOf(address) view returns (uint256)"];
  const weth = new ethers.Contract("0xc558dbdd856501fcd9aaf1e62eae57a9f0629a3c", WETH_ABI, wallet);

  const stratWeth = await weth.balanceOf(strategyAddress);
  const stratEth = await provider.getBalance(strategyAddress);
  const stratTotal = await strategy.totalBalance();

  console.log(`Strategy WETH: ${ethers.formatEther(stratWeth)}`);
  console.log(`Strategy ETH: ${ethers.formatEther(stratEth)}`);
  console.log(`Strategy totalBalance (tracked): ${ethers.formatEther(stratTotal)}`);

  const vaultWeth = await weth.balanceOf(vaultAddress);
  const vaultEth = await provider.getBalance(vaultAddress);
  console.log(`Vault WETH: ${ethers.formatEther(vaultWeth)}`);
  console.log(`Vault ETH: ${ethers.formatEther(vaultEth)}`);

  // 3. Try to withdraw all shares
  const sharesAfter = await vault.balanceOf(wallet.address);
  console.log(`Attempting to withdraw ${sharesAfter.toString()} shares...`);

  try {
    // Estimate gas first to see if it fails there
    await vault.withdraw.estimateGas(sharesAfter);
    console.log("Gas estimation succeeded.");

    const withdrawTx = await vault.withdraw(sharesAfter);
    await withdrawTx.wait();
    console.log("Withdrawal succeeded!");
  } catch (error) {
    console.error("Withdrawal failed as expected!");
    console.error(error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
