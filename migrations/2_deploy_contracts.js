const MockDai = artifacts.require("MockERC20");
const MockDaiPriceOracle = artifacts.require("MockDaiPriceOracle");
const DaiFi = artifacts.require("DaiFi");

module.exports = async function(deployer) {
  await deployer.deploy(MockDai);
  await deployer.deploy(MockDaiPriceOracle);
  await deployer.deploy(DaiFi, MockDai.address, MockDaiPriceOracle.address);
};
