const { assert, expect } = require("chai")
const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const {
  developmentChains,
  INITIAL_SUPPLY,
} = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("OurToken Unit Test", function () {
      //Multipler is used to make reading the math easier because of the 18 decimal points
      const multiplier = 10 ** 18
      //set params
      let ourToken, deployer, user1
      beforeEach(async function () {
        //get accounts
        const accounts = await getNamedAccounts()
        deployer = accounts.deployer
        user1 = accounts.user1

        await deployments.fixture("all")
        ourToken = await ethers.getContract("OurToken", deployer)
      })
      it("was deployed", async () => {
        assert(ourToken.address)
      })
      describe("constructor", () => {
        it("Should have correct INITIAL_SUPPLY of token ", async () => {
          const supply = (await ourToken.totalSupply()).toString()
          assert.equal(supply, INITIAL_SUPPLY)
        })
        it("initializes the token with the correct name and symbol ", async () => {
          const tokenName = (await ourToken.name()).toString()
          const tokenSymbol = (await ourToken.symbol()).toString()
          assert.equal(tokenName, "OurToken")
          assert.equal(tokenSymbol, "OT")
        })
      })
      describe("transfers", () => {
        it("Should be able to transfer tokens successfully to an address", async () => {
          const amountToSend = ethers.utils.parseEther("30")
          await ourToken.transfer(user1, amountToSend)
          expect(await ourToken.balanceOf(user1)).to.equal(amountToSend)

          //Another way to do it
          // //Arrange
          // const startingOurTokenBalance = await ourToken.provider.getBalance(
          //   ourToken.address
          // )
          // const startingDeployerBalance = await ourToken.provider.getBalance(
          //   deployer
          // )

          // //Act
          // const amountToSend = ethers.utils.parseEther("30")
          // const transactionResponse = await ourToken.transfer(
          //   deployer,
          //   amountToSend
          // )
          // const transactionReceipt = await transactionResponse.wait(1)
          // const { gasUsed, effectiveGasPrice } = transactionReceipt
          // const gasCost = gasUsed.mul(effectiveGasPrice)

          // const endingOurTokenBalance = await ourToken.provider.getBalance(
          //   ourToken.address
          // )
          // const endingDeployerBalance = await ourToken.provider.getBalance(
          //   deployer
          // )
          // //Assert
          // assert.equal(
          //   startingOurTokenBalance.add(startingDeployerBalance).toString(),
          //   endingDeployerBalance.add(gasCost).toString()
          // )
        })
        it("emits a transfer event, when a transfer occurs", async () => {
          const amountToSend = ethers.utils.parseEther("30")
          await expect(ourToken.transfer(user1, amountToSend)).to.emit(
            ourToken,
            "Transfer"
          )
        })
      })

      describe("allowances", () => {
        const amount = (20 * multiplier).toString()
        beforeEach(async () => {
          playerToken = await ethers.getContract("OurToken", user1)
        })
        it("Should approve other address to spend token", async () => {
          const tokensToSpend = ethers.utils.parseEther("5")
          await ourToken.approve(user1, tokensToSpend)
          await playerToken.transferFrom(deployer, user1, tokensToSpend)
          expect(await playerToken.balanceOf(user1)).to.equal(tokensToSpend)
        })
        it("doesn't allow an unnaproved member to do transfers", async () => {
          await expect(
            playerToken.transferFrom(deployer, user1, amount)
          ).to.be.revertedWith("ERC20: insufficient allowance")
        })
        it("emits an approval event, when an approval occurs", async () => {
          await expect(ourToken.approve(user1, amount)).to.emit(
            ourToken,
            "Approval"
          )
        })
        it("the allowance being set is accurate", async () => {
          await ourToken.approve(user1, amount)
          const allowance = await ourToken.allowance(deployer, user1)
          assert.equal(allowance.toString(), amount)
        })
        it("won't allow a user to go over the allowance", async () => {
          await ourToken.approve(user1, amount)
          await expect(
            playerToken.transferFrom(
              deployer,
              user1,
              (40 * multiplier).toString()
            )
          ).to.be.revertedWith("ERC20: insufficient allowance")
        })
      })
    })
