const setup = require("./setup");
const truffleAssert = require('truffle-assertions');

const MAX_UINT256 = "115792089237316195423570985008687907853269984665640564039457584007913129639935";

contract("WeiAttoDaiPriceFeed", async accounts => {

  it("should fail when price is 0", async () => {
    const contracts = await setup.deployContractsWithZeroPriceOracle();
    truffleAssert.reverts(contracts.daiFi.getLatestQuotePrice("1"), "invalid Dai price");
    truffleAssert.reverts(contracts.daiFi.getLatestBasePrice("235"), "invalid Dai price");
  });

  it("should return 0 prices when given 0 amounts", async () => {
    const contracts = await setup.deployContracts();
    assert.equal(await contracts.daiFi.getLatestQuotePrice("0"), "0");
    assert.equal(await contracts.daiFi.getLatestBasePrice("0"), "0");
  });

  it("should return valid prices when given valid amounts", async () => {
    const contracts = await setup.deployContracts();
    assert.equal(await contracts.daiFi.getLatestQuotePrice("1"), "234");
    assert.equal(await contracts.daiFi.getLatestBasePrice("235"), "1");
  });

  it("should return valid prices when given maximum amounts", async () => {
    const contracts = await setup.deployContracts();
    assert.equal(await contracts.daiFi.getLatestQuotePrice(MAX_UINT256), MAX_UINT256);
    assert.equal(await contracts.daiFi.getLatestBasePrice(MAX_UINT256), MAX_UINT256);
  });

});
