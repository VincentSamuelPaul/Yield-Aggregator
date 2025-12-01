import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const AAVE_POOL_ADDRESS = "0x6ae43d3271ff6888e7fc43fd7321a503ff738951";
const WETH_CANDIDATES = [
  "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14",
  "0xd0dF82De051244F04Bff3A8BB1F62E1CD39EeD92",
  "0x7b79995e5f793A0CBc6D477b86E65eA734681ca7",
  "0x2170ed0880ac9a755fd29b2688956bd959f933f8" // Another one
];

const POOL_ABI = [
  "function getReserveData(address asset) view returns (tuple(uint256 configuration, uint128 liquidityIndex, uint128 currentLiquidityRate, uint128 variableBorrowIndex, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint8 id))"
];

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const pool = new ethers.Contract(AAVE_POOL_ADDRESS, POOL_ABI, provider);

  for (const weth of WETH_CANDIDATES) {
    console.log("Checking:", weth);
    try {
      const data = await pool.getReserveData(weth);
      if (data.aTokenAddress !== "0x0000000000000000000000000000000000000000") {
        console.log(">>> FOUND MATCH! <<<");
        console.log("WETH:", weth);
        console.log("aWETH:", data.aTokenAddress);
        return;
      } else {
        console.log("  Not supported (aToken is 0)");
      }
    } catch (e) {
      console.log("  Reverted (Not supported)");
    }
  }
  console.log("No matching WETH found in candidates.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
