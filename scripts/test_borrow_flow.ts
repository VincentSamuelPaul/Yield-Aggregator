import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const VAULT_ADDRESS = "0x8c27a7e85c53410C73411eF6271D3d132E4F28B1";
const STRATEGY_ADDRESS = "0xD436A77FDC0A78D6dEADcCaDfA94b544Db716B8E";
const WETH_ADDRESS = "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14";

const VAULT_ABI = [
  "function deposit() payable",
  "function totalAssets() view returns (uint256)",
  "function totalShares() view returns (uint256)"
];
const STRATEGY_ABI = [
  "function borrow(uint256 amount)",
  "function repay(uint256 amount)",
  "function debts(address) view returns (uint256)"
];
const WETH_ABI = [
  "function deposit() payable",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address) view returns (uint256)"
];

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

  const vault = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, wallet);
  const strategy = new ethers.Contract(STRATEGY_ADDRESS, STRATEGY_ABI, wallet);
  const weth = new ethers.Contract(WETH_ADDRESS, WETH_ABI, wallet);

  console.log("Testing Borrow Flow with wallet:", wallet.address);

  // 1. Ensure Vault has funds (Deposit 0.001 ETH)
  console.log("1. Depositing to Vault...");
  const tx1 = await vault.deposit({ value: ethers.parseEther("0.001") });
  await tx1.wait();
  console.log("   Deposited.");

  // 2. Borrow 0.0001 WETH
  console.log("2. Borrowing 0.0001 WETH...");
  const tx2 = await strategy.borrow(ethers.parseEther("0.0001"));
  await tx2.wait();
  console.log("   Borrowed.");

  // 3. Check Debt
  const debt = await strategy.debts(wallet.address);
  console.log("   Current Debt:", ethers.formatEther(debt));

  // 4. Wrap extra ETH for interest (0.0001 ETH)
  console.log("3. Wrapping ETH for interest...");
  const tx3 = await weth.deposit({ value: ethers.parseEther("0.0001") });
  await tx3.wait();
  console.log("   Wrapped.");

  // 5. Approve Strategy
  console.log("4. Approving Strategy...");
  const tx4 = await weth.approve(STRATEGY_ADDRESS, ethers.parseEther("1.0"));
  await tx4.wait();
  console.log("   Approved.");

  // 6. Repay 0.00011 (Principal + Interest)
  console.log("5. Repaying 0.00011 WETH...");
  const repayAmount = ethers.parseEther("0.00011");

  // Check balance first
  const balance = await weth.balanceOf(wallet.address);
  if (balance < repayAmount) {
    console.error("   Insufficient WETH balance!", ethers.formatEther(balance));
    return;
  }

  const tx5 = await strategy.repay(repayAmount);
  await tx5.wait();
  console.log("   Repaid!");

  // 7. Check Debt again
  const debtAfter = await strategy.debts(wallet.address);
  console.log("   Final Debt:", ethers.formatEther(debtAfter));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
