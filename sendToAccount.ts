import dotenv from "dotenv";
import { ethers, toBigInt } from "ethers";
import fs from "fs";
import readline from "readline";

dotenv.config();

const readFilename = "private.keys";
const writeFilename = "error.keys";
const successKeys = [];
const errorKeys = [];
const gasPrice = ethers.parseUnits("0.05", "gwei");
const ERC20TxGas = 21000; // TODO: confirm
const NativeTxGas = 21000;

// HACK: you can change these parameters
const parallel = 5;
const ERC20Left = 3;
const nativeLeft = 1;
const targetAddress = "0x7bF8fbE0a52A62d6b66962a86194e49A6d02c24b";

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

type SendInput = {
  index: number;
  remainingERC20Count: bigint;
  remainingNativeCount: bigint;
};

async function signerSend(signer: ethers.Wallet, input: SendInput) {
  const remainingValue =
    input.remainingNativeCount * toBigInt(NativeTxGas) * toBigInt(gasPrice) +
    input.remainingERC20Count * toBigInt(ERC20TxGas) * toBigInt(gasPrice);
  const targetValue =
    (await signer.provider!.getBalance(signer.address)) - remainingValue;

  console.log(
    `[${input.index}] sending ${ethers.formatEther(targetValue)} ETHERS from ${
      signer.address
    }`
  );

  const tx = await signer.sendTransaction({
    to: targetAddress,
    value: targetValue,
    // nonce: await signer.getNonce() + 1,
    gasPrice,
  });

  console.log("tx sent");
  const receipt = await tx.wait();
  console.log(`got receipt hash ${receipt?.hash}, wait till next...\n`);
}

async function signerSendERC20(signer: ethers.Wallet, input: SendInput) {
  const remainingValue =
    input.remainingNativeCount * toBigInt(NativeTxGas) * toBigInt(gasPrice) +
    input.remainingERC20Count * toBigInt(ERC20TxGas) * toBigInt(gasPrice);
  const targetValue =
    (await signer.provider!.getBalance(signer.address)) - remainingValue;

  // TODO: change
  console.log(
    `[${input.index}] sending ${ethers.formatEther(
      targetValue
    )} token (${0}) from ${signer.address}`
  );

  // TODO: change
  const tx = await signer.sendTransaction({
    to: targetAddress,
    value: targetValue,
    // nonce: await signer.getNonce() + 1,
    gasPrice,
  });

  console.log("tx sent");
  const receipt = await tx.wait();
  console.log(`got receipt hash ${receipt?.hash}, wait till next...\n`);
}

async function main() {
  // ---------------------------------------------------------------------------
  // PREPARE ARGS
  // ---------------------------------------------------------------------------
  
  if (!ethers.isAddress(targetAddress)) {
    throw new Error(`target ${targetAddress} invalid`);
  }

  const provider = new ethers.JsonRpcProvider("https://rpc.merlinchain.io", {
    name: "merlin",
    chainId: 4200,
  });

  const pks = fs
    .readFileSync(readFilename, "utf-8")
    .split("\n")
    .filter((line) => line !== "");
  const signers = pks.map((line) => {
    return new ethers.Wallet(line.trim(), provider);
  });

  // ---------------------------------------------------------------------------
  // CONFIRM
  // ---------------------------------------------------------------------------

  const ans = await askQuestion(
    `EACH send all remaining ethers so that ${nativeLeft} native tx and ${ERC20Left} ERC20 tx are still callable, from ${signers.length} addresses to ${targetAddress}? [y/N]`
  );

  if ((ans as string).trim().toLowerCase() !== "y") {
    console.log("User canclled sending, exiting...");
    return;
  }

  console.log(
    `Before send, ${targetAddress} account balance = ${ethers.formatEther(
      await provider.getBalance(targetAddress)
    )} ethers`
  );

  // ---------------------------------------------------------------------------
  // MAIN SEND
  // ---------------------------------------------------------------------------

  for (let i = 0; i < signers.length; i++) {
    await sleep(1 * 1000);
  }
}

main().catch((error) => {
  console.error(error);
  console.log("Program exit with error code");
  process.exitCode = 1;
});
