import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    merlin: {
      url: `https://rpc.merlinchain.io`,
      chainId: 4200,
      accounts: [process.env["PRIVATE_KEY"]!],
      gasPrice: 51000000
    },
  },
};

export default config;
