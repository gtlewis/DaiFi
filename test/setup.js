const MockDai = artifacts.require("MockERC20");
const MockDaiPriceOracle = artifacts.require("MockDaiPriceOracle");
const MockZeroDaiPriceOracle = artifacts.require("MockZeroDaiPriceOracle");
const MockAboveMaxDaiPriceOracle = artifacts.require("MockAboveMaxDaiPriceOracle");
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

const deployContractsWithAboveMaxPriceOracle = async function () {
  const mockDai = await MockDai.new();
  const mockAboveMaxDaiPriceOracle = await MockAboveMaxDaiPriceOracle.new();
  const daiFi = await DaiFi.new(mockDai.address, mockAboveMaxDaiPriceOracle.address);
  return {daiFi, mockDai, mockAboveMaxDaiPriceOracle};
}

const MAX_UINT256 = "115792089237316195423570985008687907853269984665640564039457584007913129639935";

module.exports = { deployContracts, deployContractsWithZeroPriceOracle, deployContractsWithAboveMaxPriceOracle, MAX_UINT256 };
