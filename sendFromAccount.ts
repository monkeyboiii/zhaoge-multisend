import dotenv from "dotenv";
import { ethers } from "ethers";
import readline from "readline";

dotenv.config();

function askQuestion(query: string) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const privateKey = process.env["PRIVATE_KEY"];
  if (!privateKey) {
    throw new Error("env PRIVATE_KEY not set");
  }

  const provider = new ethers.JsonRpcProvider("https://rpc.merlinchain.io", {
    name: "merlin",
    chainId: 4200,
  });

  const signer = new ethers.Wallet(privateKey, provider);
  // HACK: change
  const targetValue = ethers.parseEther("0.0001");

  // HACK: fill with required
  const targetAddresses = [""];

  // double check
  const ans = await askQuestion(
    `EACH send ${ethers.formatEther(targetValue)} ethers from ${
      signer.address
    } to ${targetAddresses.length} addresses? [y/N] `
  );

  if ((ans as string).trim().toLowerCase() !== "y") {
    console.log("User canclled sending, exiting...");
    return;
  }

  console.log(
    `Account balance = ${ethers.formatEther(
      await provider.getBalance(signer.address)
    )} ethers`
  );

  for (const [i, addr] of targetAddresses.entries()) {
    console.log(`[${i}] sending ${ethers.formatEther(targetValue)} to ${addr}`);
    const tx = await signer.sendTransaction({
      to: addr,
      value: targetValue,
      // nonce: await signer.getNonce() + 1,
      gasPrice: ethers.parseUnits("0.05", "gwei"),
    });
    console.log("tx sent");
    const receipt = await tx.wait();
    // console.log(receipt)
    console.log(`got receipt hash ${receipt?.hash}, wait till next...\n`);
    await sleep(1 * 1000);
  }
}

main().catch((error) => {
  console.error(error);
  console.log("Program exit with error code");
  process.exitCode = 1;
});
