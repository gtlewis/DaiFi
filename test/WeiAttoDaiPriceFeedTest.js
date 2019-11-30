const { deployContracts, deployContractsWithZeroPriceOracle, deployContractsWithAboveMaxPriceOracle, MAX_UINT256 } = require("./setup");
const truffleAssert = require('truffle-assertions');

contract("WeiAttoDaiPriceFeed", async accounts => {

  it("should fail when price is 0", async () => {
    const { daiFi } = await deployContractsWithZeroPriceOracle();
    truffleAssert.reverts(daiFi.getLatestQuotePrice("1"), "invalid Dai price");
    truffleAssert.reverts(daiFi.getLatestBasePrice("235"), "invalid Dai price");
  });

  it("should fail when price is greater than maximum price", async () => {
    const { daiFi } = await deployContractsWithAboveMaxPriceOracle();
    truffleAssert.reverts(daiFi.getLatestQuotePrice("1"), "invalid Dai price");
    truffleAssert.reverts(daiFi.getLatestBasePrice("235"), "invalid Dai price");
  });

  it("should return 0 prices when given 0 amounts", async () => {
    const { daiFi } = await deployContracts();
    assert.equal(await daiFi.getLatestQuotePrice("0"), "0");
    assert.equal(await daiFi.getLatestBasePrice("0"), "0");
  });

  it("should return valid prices when given valid amounts", async () => {
    const { daiFi } = await deployContracts();
    assert.equal(await daiFi.getLatestQuotePrice("1"), "234");
    assert.equal(await daiFi.getLatestBasePrice("235"), "1");
  });

  it("should fail when given maximum amounts", async () => {
    const { daiFi } = await deployContracts();
    truffleAssert.reverts(daiFi.getLatestQuotePrice(MAX_UINT256), "SafeMath: multiplication overflow");
    truffleAssert.reverts(daiFi.getLatestBasePrice(MAX_UINT256), "SafeMath: multiplication overflow");
  });

});
