import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const STRATEGY_ADDRESS = "0xD436A77FDC0A78D6dEADcCaDfA94b544Db716B8E";
const STRATEGY_ABI = [
  "function totalBorrowed() view returns (uint256)",
  "function balanceOf() view returns (uint256)",
  "function asset() view returns (address)"
];

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const strategy = new ethers.Contract(STRATEGY_ADDRESS, STRATEGY_ABI, provider);

  const totalBorrowed = await strategy.totalBorrowed();
  const balance = await strategy.balanceOf();
  const asset = await strategy.asset();

  console.log("Strategy Address:", STRATEGY_ADDRESS);
  console.log("Asset:", asset);
  console.log("Total Borrowed:", ethers.formatEther(totalBorrowed));
  console.log("Strategy Balance (Assets + Loans):", ethers.formatEther(balance));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
