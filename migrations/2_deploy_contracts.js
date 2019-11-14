const MockDai = artifacts.require("MockERC20");
const DaiFi = artifacts.require("DaiFi");

module.exports = async function(deployer) {
  await deployer.deploy(MockDai);
  deployer.deploy(DaiFi, MockDai.address);
};