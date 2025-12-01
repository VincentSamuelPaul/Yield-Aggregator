import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

async function main() {
  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  const deployments = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../deployments.json'), 'utf8'));
  const vaultAddress = deployments.Vault;

  console.log("Checking Vault at:", vaultAddress);

  const Vault_ABI = [
    "function totalAssets() view returns (uint256)",
    "function totalShares() view returns (uint256)",
    "function totalBorrowed() view returns (uint256)"
  ];
  const vault = new ethers.Contract(vaultAddress, Vault_ABI, provider);

  const totalAssets = await vault.totalAssets();
  const totalShares = await vault.totalShares();
  const totalBorrowed = await vault.totalBorrowed();

  console.log("Total Assets:", ethers.formatEther(totalAssets));
  console.log("Total Shares:", ethers.formatEther(totalShares));
  console.log("Total Borrowed:", ethers.formatEther(totalBorrowed));

  if (totalAssets === 0n && totalShares === 0n && totalBorrowed === 0n) {
    console.log("SUCCESS: Vault is empty.");
  } else {
    console.log("WARNING: Vault is NOT empty.");
  }
}

main().catch(console.error);
