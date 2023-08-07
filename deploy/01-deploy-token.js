//imports
const { network } = require("hardhat")
const {
  developmentChains,
  INITIAL_SUPPLY,
} = require("../helper-hardhat-config")
const { verify } = require("../helper-functions")

//main
module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const OurToken = await deploy("OurToken", {
    from: deployer,
    log: true,
    args: [INITIAL_SUPPLY],
    //wait for confirmation
    waitforconfirmations: network.config.blockConfirmations || 1,
  })

  log(`OurToken was deployed at ${OurToken.address}`)

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(OurToken.address, [INITIAL_SUPPLY])
  }
}

module.exports.tags = ["all", "token"]
