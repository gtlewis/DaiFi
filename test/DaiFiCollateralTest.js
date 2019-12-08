const { deployContracts, MAX_UINT256 } = require("./setup");
const truffleAssert = require('truffle-assertions');
const BigNumber = require('bignumber.js');
BigNumber.set({ROUNDING_MODE: 1});

contract("DaiFiCollateral", async accounts => {

  it("should determine collateralised for Wei only when sufficient attoDai is supplied", async () => {
    const { daiFi, mockDaiPriceOracle } = await deployContracts();
    const attoDaiPerWei = BigNumber(await mockDaiPriceOracle.read()).div("1000000000000000000");
    const account = {wei_: {supplied: "0", borrowed: "0"}, attoDai:{supplied: "0", borrowed: "0"}};
    assert.equal(await daiFi.isCollateralisedForWei(account), true);
    account.wei_.borrowed = "1";
    assert.equal(await daiFi.isCollateralisedForWei(account), false);
    let minimumSupply = BigNumber(account.wei_.borrowed).times("2").times(attoDaiPerWei).plus("1").toFixed(0);
    account.attoDai.supplied = BigNumber(minimumSupply).minus("1").toFixed();
    assert.equal(await daiFi.isCollateralisedForWei(account), false);
    account.attoDai.supplied = minimumSupply;
    assert.equal(await daiFi.isCollateralisedForWei(account), true);
    account.wei_.borrowed = "1000000000000000000";
    assert.equal(await daiFi.isCollateralisedForWei(account), false);
    minimumSupply = BigNumber(account.wei_.borrowed).times("1.5").plus("1").times(attoDaiPerWei).plus("1").toFixed(0);
    account.attoDai.supplied = BigNumber(minimumSupply).minus("1").toFixed();
    assert.equal(await daiFi.isCollateralisedForWei(account), false);
    account.attoDai.supplied = minimumSupply;
    assert.equal(await daiFi.isCollateralisedForWei(account), true);
    account.wei_.borrowed = MAX_UINT256;
    truffleAssert.reverts(daiFi.isCollateralisedForWei(account), "SafeMath: multiplication overflow");
    account.wei_.borrowed = "1";
    account.attoDai.supplied = MAX_UINT256;
    truffleAssert.reverts(daiFi.isCollateralisedForWei(account), "SafeMath: multiplication overflow");
  });

  it("should determine collateralised for attoDai only when sufficient Wei is supplied", async () => {
    const { daiFi, mockDaiPriceOracle } = await deployContracts();
    const attoDaiPerWei = BigNumber(await mockDaiPriceOracle.read()).div("1000000000000000000");
    const account = {wei_: {supplied: "0", borrowed: "0"}, attoDai:{supplied: "0", borrowed: "0"}};
    assert.equal(await daiFi.isCollateralisedForAttoDai(account), true);
    account.attoDai.borrowed = "1";
    assert.equal(await daiFi.isCollateralisedForAttoDai(account), false);
    let minimumSupply = BigNumber(account.attoDai.borrowed).toFixed(0);
    account.wei_.supplied = BigNumber(minimumSupply).minus("1").toFixed();
    assert.equal(await daiFi.isCollateralisedForAttoDai(account), false);
    account.wei_.supplied = minimumSupply;
    assert.equal(await daiFi.isCollateralisedForAttoDai(account), true);
    account.attoDai.borrowed = "1000000000000000000";
    assert.equal(await daiFi.isCollateralisedForAttoDai(account), false);
    minimumSupply = BigNumber(account.attoDai.borrowed).times("1.5").dividedBy(attoDaiPerWei).plus("1").toFixed(0);
    account.wei_.supplied = BigNumber(minimumSupply).minus("1").toFixed();
    assert.equal(await daiFi.isCollateralisedForAttoDai(account), false);
    account.wei_.supplied = minimumSupply;
    assert.equal(await daiFi.isCollateralisedForAttoDai(account), true);
    account.attoDai.borrowed = MAX_UINT256;
    truffleAssert.reverts(daiFi.isCollateralisedForAttoDai(account), "SafeMath: multiplication overflow");
    account.attoDai.borrowed = "1";
    account.wei_.supplied = MAX_UINT256;
    truffleAssert.reverts(daiFi.isCollateralisedForAttoDai(account), "SafeMath: multiplication overflow");
  });

  it("should determine can be liquidated if wei borrowed and insufficient attoDai supplied", async () => {
    const { daiFi, mockDaiPriceOracle } = await deployContracts();
    const attoDaiPerWei = BigNumber(await mockDaiPriceOracle.read()).div("1000000000000000000");
    const account = {wei_: {supplied: "0", borrowed: "0"}, attoDai:{supplied: "0", borrowed: "0"}};
    assert.equal(await daiFi.canBeLiquidated(account), false);
    account.wei_.borrowed = "1";
    assert.equal(await daiFi.canBeLiquidated(account), true);
    let minimumSupply = BigNumber(account.wei_.borrowed).times(attoDaiPerWei).plus("1").toFixed(0);
    account.attoDai.supplied = BigNumber(minimumSupply).minus("1").toFixed();
    assert.equal(await daiFi.canBeLiquidated(account), true);
    account.attoDai.supplied = minimumSupply;
    assert.equal(await daiFi.canBeLiquidated(account), false);
    account.wei_.borrowed = "1000000000000000000";
    assert.equal(await daiFi.canBeLiquidated(account), true);
    minimumSupply = BigNumber(account.wei_.borrowed).times("1.25").times(attoDaiPerWei).toFixed(0);
    account.attoDai.supplied = BigNumber(minimumSupply).minus("1").toFixed();
    assert.equal(await daiFi.canBeLiquidated(account), true);
    account.attoDai.supplied = minimumSupply;
    assert.equal(await daiFi.canBeLiquidated(account), false);
    account.wei_.borrowed = MAX_UINT256;
    truffleAssert.reverts(daiFi.canBeLiquidated(account), "SafeMath: multiplication overflow");
    account.wei_.borrowed = "1";
    account.attoDai.supplied = MAX_UINT256;
    truffleAssert.reverts(daiFi.canBeLiquidated(account), "SafeMath: multiplication overflow");
  });

  it("should determine can be liquidated if attoDai borrowed and insufficient wei supplied", async () => {
    const { daiFi, mockDaiPriceOracle } = await deployContracts();
    const attoDaiPerWei = BigNumber(await mockDaiPriceOracle.read()).div("1000000000000000000");
    const account = {wei_: {supplied: "0", borrowed: "0"}, attoDai:{supplied: "0", borrowed: "0"}};
    assert.equal(await daiFi.canBeLiquidated(account), false);
    account.attoDai.borrowed = "1";
    assert.equal(await daiFi.canBeLiquidated(account), true);
    let minimumSupply = BigNumber(account.attoDai.borrowed).toFixed(0);
    account.wei_.supplied = BigNumber(minimumSupply).minus("1").toFixed();
    assert.equal(await daiFi.canBeLiquidated(account), true);
    account.wei_.supplied = minimumSupply;
    assert.equal(await daiFi.canBeLiquidated(account), false);
    account.attoDai.borrowed = "1000000000000000000";
    assert.equal(await daiFi.canBeLiquidated(account), true);
    minimumSupply = BigNumber(account.attoDai.borrowed).times("1.25").dividedBy(attoDaiPerWei).plus("1").toFixed(0);
    account.wei_.supplied = BigNumber(minimumSupply).minus("1").toFixed();
    assert.equal(await daiFi.canBeLiquidated(account), true);
    account.wei_.supplied = minimumSupply;
    assert.equal(await daiFi.canBeLiquidated(account), false);
    account.attoDai.borrowed = MAX_UINT256;
    truffleAssert.reverts(daiFi.canBeLiquidated(account), "SafeMath: multiplication overflow");
    account.attoDai.borrowed = "1";
    account.wei_.supplied = MAX_UINT256;
    truffleAssert.reverts(daiFi.canBeLiquidated(account), "SafeMath: multiplication overflow");
  });

});
