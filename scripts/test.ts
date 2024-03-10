import { ethers } from "hardhat";
import hre from "hardhat";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const signer = await ethers.getSigner(
    "0x971A2ca93c3Dd1EB49E2c59F6b38e4e67fb90836"
  );

  const deployedAddress = "0xfa1C290577C12c59A2cC31Fdc0e68bF08C89A548";

  const artifact = await hre.artifacts.readArtifact("MultiSend");
  const contract = await ethers.getContractAtFromArtifact(
    artifact,
    deployedAddress,
    signer
  );

  console.log(signer.address);
  console.log(await ethers.provider.getFeeData());
  const contractBalance = await ethers.provider.getBalance(await contract.getAddress());
  console.log(`contract has ${ethers.formatUnits(contractBalance, 'ether')} ethers`)
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
