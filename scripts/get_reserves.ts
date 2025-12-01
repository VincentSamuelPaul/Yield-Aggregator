import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const UI_POOL_DATA_PROVIDER = "0x3f78cb00b1a0d782161e7650f9227572d42d8fc";
const POOL_ADDRESSES_PROVIDER = "0x012bac54348c0e635dcac9d5fb99f06f24136c9a";

const ABI = [
  "function getReservesData(address provider) view returns (tuple(address underlyingAsset, string name, string symbol, uint256 decimals, uint256 baseLTVasCollateral, uint256 reserveLiquidationThreshold, uint256 reserveLiquidationBonus, uint256 reserveFactor, bool usageAsCollateralEnabled, bool borrowingEnabled, bool stableBorrowRateEnabled, bool isActive, bool isFrozen, uint128 liquidityIndex, uint128 variableBorrowIndex, uint128 liquidityRate, uint128 variableBorrowRate, uint128 stableBorrowRate, uint40 lastUpdateTimestamp, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint256 availableLiquidity, uint256 totalPrincipalStableDebt, uint256 averageStableRate, uint256 stableDebtLastUpdateTimestamp, uint256 totalScaledVariableDebt, uint256 priceInMarketReferenceCurrency, address priceOracle, uint256 variableRateSlope1, uint256 variableRateSlope2, uint256 stableRateSlope1, uint256 stableRateSlope2, uint256 baseStableBorrowRate, uint256 baseVariableBorrowRate, uint256 maxStableRate, bool isPaused, bool isSiloedBorrowing, uint128 accruedToTreasury, uint128 unbacked, uint128 isolationModeTotalDebt, bool flashLoanEnabled, uint256 debtCeiling, uint256 ceiling, uint256 eModeCategoryId, uint8 borrowCap, uint8 supplyCap, uint256 eModeLtv, uint256 eModeLiquidationThreshold, uint256 eModeLiquidationBonus, address priceSource, string label)[], tuple(uint256 marketReferenceCurrencyUnit, int256 marketReferenceCurrencyPrice, int256 networkBaseTokenPriceInUsd, uint8 networkBaseTokenPriceDecimals)[])"
];

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const contract = new ethers.Contract(UI_POOL_DATA_PROVIDER, ABI, provider);

  console.log("Fetching reserves...");
  const [reserves] = await contract.getReservesData(POOL_ADDRESSES_PROVIDER);

  console.log("Found", reserves.length, "reserves.");

  for (const reserve of reserves) {
    if (reserve.symbol === "WETH" || reserve.symbol === "aWETH") {
      console.log("--- Found WETH/aWETH ---");
      console.log("Symbol:", reserve.symbol);
      console.log("Underlying Asset:", reserve.underlyingAsset);
      console.log("aToken Address:", reserve.aTokenAddress);
      console.log("Is Active:", reserve.isActive);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
