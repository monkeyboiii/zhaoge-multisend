import { ethers } from "hardhat";
import hre from "hardhat";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const signer = await ethers.getSigner(
    "0x971A2ca93c3Dd1EB49E2c59F6b38e4e67fb90836"
  );
  const deployedAddress = "0xfa1C290577C12c59A2cC31Fdc0e68bF08C89A548"; // on merlin
  
  // HACK: fill in
  const targetAddresses = [
    "",
  ];

  const targetValues = [];
  for (const _ of targetAddresses) {
    targetValues.push(ethers.parseUnits("0.0001", "ether"));
  }

  const artifact = await hre.artifacts.readArtifact("MultiSend");
  const contract = await ethers.getContractAtFromArtifact(
    artifact,
    deployedAddress,
    signer
  );

  const feeData = await ethers.provider.getFeeData();
  console.log(
    `contract connected, gasPrice ${ethers.formatUnits(
      feeData.gasPrice!,
      "gwei"
    )}`
  );
  const tx = await contract.withdraw(targetAddresses, targetValues, {
    // nonce: await signer.getNonce() + 1,
    gasPrice: ethers.parseUnits("0.05", "gwei"),
  });
  console.log("withdraw called");
  const receipt = await tx.wait();
  console.log(receipt);
  console.log("receipt received");
  // console.log(receipt);

  // contract after tx
  console.log(
    `contract balance = ${ethers.formatEther(
      await ethers.provider.getBalance(await contract.getAddress())
    )} ethers`
  );
  // recipients after tx
  await Promise.all(
    targetAddresses.map(async (ta) => {
      // 10% showing
      if (Math.random() < 0.9) {
        return;
      }
      console.log(
        `After tx, ${ta.substring(0, 8)}... balance = ${ethers.formatEther(
          await ethers.provider.getBalance(ta)
        )}`
      );
    })
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
