import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("MultiSend.sol", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployMultisendFixture() {
    const initValue = ethers.parseUnits("1.2", "ether");

    const [owner, otherAccount, thirdAccount] = await ethers.getSigners();

    const Multisend = await ethers.getContractFactory("MultiSend");
    const multisend = await Multisend.deploy({
      value: initValue,
    });

    return { multisend, initValue, owner, otherAccount, thirdAccount };
  }

  describe("Deployment", function () {
    it("Should receive and store the funds", async function () {
      const { multisend, initValue } = await loadFixture(
        deployMultisendFixture
      );

      expect(await ethers.provider.getBalance(multisend.target)).to.equal(
        initValue
      );
    });

    it("Should set the right owner", async function () {
      const { multisend, owner } = await loadFixture(deployMultisendFixture);

      expect(await multisend.owner()).to.equal(owner.address);
    });
  });

  describe("Withdraw", function () {
    describe("Validations", function () {
      it("Should revert if called from another account", async function () {
        const { multisend, otherAccount } = await loadFixture(
          deployMultisendFixture
        );

        // We use lock.connect() to send a transaction from another account
        await expect(
          multisend.connect(otherAccount).withdraw([], [])
        ).to.be.reverted;
      });

      it("Shouldn't fail if sent from another account", async function () {
        const { multisend, otherAccount } = await loadFixture(
          deployMultisendFixture
        );

        await multisend.connect(otherAccount);

        const v = ethers.parseUnits("0.1", "ether");

        await expect(multisend.topUp({ value: v })).not.to.be.reverted;
      });
    });

    describe("Transfers", function () {
      it("Should transfer the funds to the correct recepient", async function () {
        const { multisend, initValue, owner, otherAccount, thirdAccount } =
          await loadFixture(deployMultisendFixture);

        const t1 = ethers.parseUnits("0.1", "ether");
        const t2 = ethers.parseUnits("0.2", "ether");
        const change = ethers.parseUnits("0.3", "ether");
        const remains = ethers.parseUnits("0.9", "ether");
        const msa = await multisend.getAddress()

        await expect(
          multisend.withdraw(
            [otherAccount.address, thirdAccount.address],
            [t1, t2]
          )
        ).to.changeEtherBalances(
          [msa, otherAccount, thirdAccount], [-change, t1,t2]
        );

        await expect(await ethers.provider.getBalance(msa)).to.equal(remains);
      });
    });
  });
});
