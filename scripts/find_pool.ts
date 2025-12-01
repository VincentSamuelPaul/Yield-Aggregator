import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const PROVIDER_ADDRESS = "0x012bAC54348C0E635dCAc9D5FB99f06F24136C9A";
const ABI = [
  "function getPool() view returns (address)",
  "function getAddress(bytes32 id) view returns (address)"
];

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);

  // Check code first
  const code = await provider.getCode(PROVIDER_ADDRESS);
  if (code === "0x") {
    console.error("Provider address has no code!");
    return;
  }

  const contract = new ethers.Contract(PROVIDER_ADDRESS, ABI, provider);
  const pool = await contract.getPool();
  console.log("Active Pool Address:", pool);

  // PoolDataProvider ID: 0x0100000000000000000000000000000000000000000000000000000000000000
  // But usually it's just bytes32(uint256(1))? No, Aave uses specific IDs.
  // Actually, Aave V3 uses:
  // POOL_DATA_PROVIDER = 0x01;
  // Let's try to pass the hex string padded.

  const POOL_DATA_PROVIDER_ID = "0x0100000000000000000000000000000000000000000000000000000000000000";

  try {
    // "getAddress" is a reserved method in ethers.js Contract, so we must access the ABI function explicitly
    const dataProviderAddress = await contract.getFunction("getAddress")(POOL_DATA_PROVIDER_ID);
    console.log("PoolDataProvider Address:", dataProviderAddress);

    const DATA_PROVIDER_ABI = [
      "function getAllReservesTokens() external view returns (tuple(string symbol, address tokenAddress)[])"
    ];

    const dataProvider = new ethers.Contract(dataProviderAddress, DATA_PROVIDER_ABI, provider);
    const tokens = await dataProvider.getAllReservesTokens();

    console.log("Found", tokens.length, "tokens.");
    for (const token of tokens) {
      if (token.symbol === "WETH") {
        console.log(">>> FOUND WETH! <<<");
        console.log("Symbol:", token.symbol);
        console.log("Address:", token.tokenAddress);
      }
    }

  } catch (e) {
    console.error("Error fetching DataProvider:", e);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
