import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const VAULT_ADDRESS = "0x429DA8254DBeC4Fe3da00fC52150237226632AB6";
const STRATEGY_ADDRESS = "0x6195Ffb5999678e6D690407Ef8b93D135F7Ca27e";
const WETH_ADDRESS = "0xd0df82de051244f04bff3a8bb1f62e1cd39eed92";

const WETH_ABI = [
  "function allowance(address owner, address spender) view returns (uint256)"
];

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const weth = new ethers.Contract(WETH_ADDRESS, WETH_ABI, provider);

  const allowance = await weth.allowance(VAULT_ADDRESS, STRATEGY_ADDRESS);
  console.log("Vault -> Strategy Allowance:", ethers.formatEther(allowance));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
