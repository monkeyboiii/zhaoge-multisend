import { ethers } from "ethers";
import fs from "fs";
import readline from "readline";

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

async function main() {
  const signer = ethers.Wallet.createRandom();

  const ans = await askQuestion(
    `Generate a new key to possibly overwrite private.key & public.address file [y/N] `
  );

  if ((ans as string).trim().toLowerCase() !== "y") {
    console.log("User canclled generating, exiting...");
    return;
  }

  fs.writeFileSync("private.key", `PRIVATE_KEY=${signer.privateKey}`);
  fs.writeFileSync("public.address", `PUBLIC_ADDRESS=${signer.address}`);

  console.log("random key generated");
}

main().catch((error) => {
  console.error(error);
  console.log("Program exit with error code");
  process.exitCode = 1;
});
