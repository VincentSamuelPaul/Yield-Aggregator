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

  console.log(`Deploying from: ${wallet.address}`);

  const artifactsPath = path.resolve(__dirname, '../artifacts');

  // Load artifacts
  const VaultArtifact = JSON.parse(fs.readFileSync(path.join(artifactsPath, 'Vault.json'), 'utf8'));
  const MockStrategyArtifact = JSON.parse(fs.readFileSync(path.join(artifactsPath, 'MockStrategy.json'), 'utf8'));

  // Use the same WETH as before so user doesn't need to re-wrap
  const WETH_ADDRESS = "0xc558dbdd856501fcd9aaf1e62eae57a9f0629a3c";

  // 2. Deploy Vault
  console.log("Deploying Vault...");
  const VaultFactory = new ethers.ContractFactory(VaultArtifact.abi, VaultArtifact.evm.bytecode.object, wallet);
  const vault = await VaultFactory.deploy(WETH_ADDRESS);
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log("Vault deployed at:", vaultAddress);

  // 3. Deploy MockStrategy
  console.log("Deploying MockStrategy...");
  const MockStrategyFactory = new ethers.ContractFactory(MockStrategyArtifact.abi, MockStrategyArtifact.evm.bytecode.object, wallet);
  const strategy = await MockStrategyFactory.deploy(WETH_ADDRESS);
  await strategy.waitForDeployment();
  const strategyAddress = await strategy.getAddress();
  console.log("MockStrategy deployed at:", strategyAddress);

  // 4. Set Strategy on Vault
  console.log("Setting Strategy on Vault...");
  const tx = await (vault as any).setStrategy(strategyAddress);
  await tx.wait();
  console.log("Strategy set successfully.");

  // Save deployments
  const deployments = {
    Vault: vaultAddress,
    MockStrategy: strategyAddress,
    WETH: WETH_ADDRESS,
    Network: "Sepolia"
  };
  fs.writeFileSync(path.resolve(__dirname, '../deployments.json'), JSON.stringify(deployments, null, 2));
  console.log("Deployments saved to deployments.json");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
