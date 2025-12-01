import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const ADDRESS = "0x87870bca3fbe6056b2ea063ba79b377ff430d4ee";

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const code = await provider.getCode(ADDRESS);
  console.log("Code length:", code.length);
  if (code === "0x") {
    console.log("No code at this address!");
  } else {
    console.log("Contract exists.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
