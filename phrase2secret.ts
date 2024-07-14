/**
 * 使用方法：
 * 命令行输入 npx ts-node phrase2secret.ts
 */
import fs from "fs";
import path from "path";
import readline from "readline";
import { Wallet } from "ethers";

function askQuestion(query: string) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve: (value: string) => void) =>
    rl.question(query, (ans: string) => {
      rl.close();
      resolve(ans);
    })
  );
}

async function main() {
  const privateKeys = [];
  const ans = await askQuestion(`选择模式：
1. 从文件读入（多个）
2. 从单个文件读入（多行）
3. 从命令行读入（单个）
4. 从命令行读入（连续）
5. 退出
[1/2/3/4/*5*]: `);
  let writeDir = "./private.keys";

  //
  //
  // 选择模式
  if (ans.trim().toLowerCase() === "1") {
    // NOTE:·
    // 所有文件放在一个目录下
    // 每个文件包含一个助记词
    // 并且以.txt结尾

    let directory = await askQuestion("请输入文件路径：（默认是./phrases/）: ");
    directory = directory ? directory.trim() : "./phrases/";
    const files = fs.readdirSync(directory);
    for (const phrasesFile of files.filter((file) => path.extname(file).toLowerCase() === ".txt")) {
      const mnemonic = fs.readFileSync(path.join(directory, phrasesFile), "utf-8");
      const walletMnemonic = Wallet.fromPhrase(mnemonic.trim());
      privateKeys.push(walletMnemonic.privateKey);
    }
  } else if (ans.trim().toLowerCase() == "2") {
    // NOTE:
    // 所有助记词防在一个文件中
    // 该文件每行包含一个助记词

    let directory = await askQuestion("请输入文件路径：（默认是./phrase.txt）: ");
    directory = directory ? directory.trim() : "./phrase.txt";
    const mnemonics = fs.readFileSync(directory, "utf-8");
    mnemonics.split(/\r?\n/).forEach((mnemonic) => {
      if (mnemonic.length > 0) {
        const walletMnemonic = Wallet.fromPhrase(mnemonic.trim());
        privateKeys.push(walletMnemonic.privateKey);
      }
    });
  } else if (ans.trim().toLowerCase() == "3") {
    // NOTE:
    // 单次，12个词语粘贴进入

    let mnemonic = await askQuestion("请输入一组助记词: ");
    try {
      const walletMnemonic = Wallet.fromPhrase(mnemonic.trim());
      privateKeys.push(walletMnemonic.privateKey);
    } catch (e) {
      console.error(`发生错误: ${e}`);
      return;
    }
  } else if (ans.trim().toLowerCase() == "4") {
    // NOTE:
    // 每次一组，12个词语粘贴进入

    let count = 1;
    let mnemonic = await askQuestion(`请输入第${count}组助记词，或者直接回车退出: `);
    mnemonic = mnemonic.trim();
    try {
      while (mnemonic !== "") {
        const walletMnemonic = Wallet.fromPhrase(mnemonic.trim());
        privateKeys.push(walletMnemonic.privateKey);
        count++;
        mnemonic = await askQuestion(`请输入第${count}组助记词，或者直接回车退出: `);
        mnemonic = mnemonic.trim();
      }
    } catch (e) {
      console.error(`发生错误: ${e}`);
      return;
    }
  } else {
    console.log("退出...");
    return;
  }

  fs.writeFileSync(writeDir, privateKeys.join("\n"), "utf-8");
  console.log(`一共输出${privateKeys.length}个私钥到${writeDir}路径`);
}

main().catch((error) => {
  console.error(error);
  console.log("Program exit with error code");
  process.exitCode = 1;
});
