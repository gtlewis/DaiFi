const MockDai = artifacts.require("MockERC20");
const MockDaiPriceOracle = artifacts.require("MockDaiPriceOracle");
const MockZeroDaiPriceOracle = artifacts.require("MockZeroDaiPriceOracle");
const DaiFi = artifacts.require("DaiFi");

const deployContracts = async function () {
  const mockDai = await MockDai.new();
  const mockDaiPriceOracle = await MockDaiPriceOracle.new();
  const daiFi = await DaiFi.new(mockDai.address, mockDaiPriceOracle.address);
  return {daiFi, mockDai, mockDaiPriceOracle};
}

const deployContractsWithZeroPriceOracle = async function () {
  const mockDai = await MockDai.new();
  const mockZeroDaiPriceOracle = await MockZeroDaiPriceOracle.new();
  const daiFi = await DaiFi.new(mockDai.address, mockZeroDaiPriceOracle.address);
  return {daiFi, mockDai, mockZeroDaiPriceOracle};
}

module.exports = {deployContracts, deployContractsWithZeroPriceOracle};
