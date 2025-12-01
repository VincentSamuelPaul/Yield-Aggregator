import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const A_WETH_ADDRESS = "0x5b071b590a59395fE4025A0Ccc1FcC931AAc1830";
const ABI = ["function UNDERLYING_ASSET_ADDRESS() view returns (address)"];

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const atoken = new ethers.Contract(A_WETH_ADDRESS, ABI, provider);

  try {
    const underlying = await atoken.UNDERLYING_ASSET_ADDRESS();
    console.log("aWETH Underlying Asset:", underlying);
  } catch (e) {
    console.error("Error fetching underlying asset:", e);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
