import { ethers } from "hardhat";

async function main() {
  const lockedAmount = ethers.parseEther("0.0001");

  const multisend = await ethers.deployContract("MultiSend", [], {
    value: lockedAmount,
  });

  await multisend.waitForDeployment();

  console.log(
    `Multisend with ${ethers.formatEther(
      lockedAmount
    )}ETH with owner ${await multisend.owner()} deployed to ${multisend.target}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
