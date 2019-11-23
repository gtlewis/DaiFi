const DaiFi = artifacts.require("DaiFi");

const BigNumber = require('bignumber.js');

const WEI_ATTODAI_PRICE = "200";
const MAX_UINT256 = "115792089237316195423570985008687907853269984665640564039457584007913129639935";

function assertRevert(actualError, expectedErrorMessage) {
  assert(actualError, "No revert error");
  assert(actualError.message.startsWith("Returned error: VM Exception while processing transaction: revert " + expectedErrorMessage),
    "Expected '" + actualError.message + "' to contain '" + expectedErrorMessage + "'");
}

contract("DaiFi", async accounts => {

  it("should determine collateralised for Wei only when sufficient attoDai is supplied", async () => {
    const daiFi = await DaiFi.deployed();
    const account = {wei_: {supplied: "0", borrowed: "0"}, attoDai:{supplied: "0", borrowed: "0"}};
    assert.equal(await daiFi.isCollateralisedForWei(account), true);
    account["wei_"].borrowed = "1";
    assert.equal(await daiFi.isCollateralisedForWei(account), false);
    let minimumSupply = BigNumber("1").plus("1").times(WEI_ATTODAI_PRICE);
    account["attoDai"].supplied = minimumSupply.minus("1").toFixed();
    assert.equal(await daiFi.isCollateralisedForWei(account), false);
    account["attoDai"].supplied = minimumSupply.toFixed();
    assert.equal(await daiFi.isCollateralisedForWei(account), true);
    account["wei_"].borrowed = "1000000000000000000";
    assert.equal(await daiFi.isCollateralisedForWei(account), false);
    minimumSupply = BigNumber("1500000000000000000").plus("1").times(WEI_ATTODAI_PRICE);
    account["attoDai"].supplied = minimumSupply.minus("1").toFixed();
    assert.equal(await daiFi.isCollateralisedForWei(account), false);
    account["attoDai"].supplied = minimumSupply.toFixed();
    assert.equal(await daiFi.isCollateralisedForWei(account), true);
    account["wei_"].borrowed = MAX_UINT256;
    try {
      await daiFi.isCollateralisedForWei(account);
      throw null;
    } catch (error) {
      assertRevert(error, "SafeMath: multiplication overflow");
    }
    account["wei_"].borrowed = "1";
    account["attoDai"].supplied = MAX_UINT256;
    assert.equal(await daiFi.isCollateralisedForWei(account), true);
  });

  it("should determine collateralised for attoDai only when sufficient Wei is supplied", async () => {
    const daiFi = await DaiFi.deployed();
    const account = {wei_: {supplied: "0", borrowed: "0"}, attoDai:{supplied: "0", borrowed: "0"}};
    assert.equal(await daiFi.isCollateralisedForAttoDai(account), true);
    account["attoDai"].borrowed = "1";
    assert.equal(await daiFi.isCollateralisedForAttoDai(account), false);
    let minimumSupply = BigNumber("200").dividedBy(WEI_ATTODAI_PRICE);
    account["wei_"].supplied = minimumSupply.minus("1").toFixed();
    assert.equal(await daiFi.isCollateralisedForAttoDai(account), false);
    account["wei_"].supplied = minimumSupply.toFixed();
    assert.equal(await daiFi.isCollateralisedForAttoDai(account), true);
    account["attoDai"].borrowed = "1000000000000000000";
    assert.equal(await daiFi.isCollateralisedForAttoDai(account), false);
    minimumSupply = BigNumber("1500000000000000000").dividedBy(WEI_ATTODAI_PRICE).plus("1");
    account["wei_"].supplied = minimumSupply.minus("1").toFixed();
    assert.equal(await daiFi.isCollateralisedForAttoDai(account), false);
    account["wei_"].supplied = minimumSupply.toFixed();
    assert.equal(await daiFi.isCollateralisedForAttoDai(account), true);
    account["attoDai"].borrowed = MAX_UINT256;
    try {
      await daiFi.isCollateralisedForAttoDai(account);
      throw null;
    } catch (error) {
      assertRevert(error, "SafeMath: multiplication overflow");
    }
    account["attoDai"].borrowed = "1";
    account["wei_"].supplied = MAX_UINT256;
    try {
      await daiFi.isCollateralisedForAttoDai(account);
      throw null;
    } catch (error) {
      assertRevert(error, "SafeMath: multiplication overflow");
    }
  });

  it("should determine can be liquidated if wei borrowed and insufficient attoDai supplied", async () => {
    const daiFi = await DaiFi.deployed();
    const account = {wei_: {supplied: "0", borrowed: "0"}, attoDai:{supplied: "0", borrowed: "0"}};
    assert.equal(await daiFi.canBeLiquidated(account), false);
    account["wei_"].borrowed = "1";
    assert.equal(await daiFi.canBeLiquidated(account), true);
    let minimumSupply = BigNumber("1").times(WEI_ATTODAI_PRICE);
    account["attoDai"].supplied = minimumSupply.minus("1").toFixed();
    assert.equal(await daiFi.canBeLiquidated(account), true);
    account["attoDai"].supplied = minimumSupply.toFixed();
    assert.equal(await daiFi.canBeLiquidated(account), false);
    account["wei_"].borrowed = "1000000000000000000";
    assert.equal(await daiFi.canBeLiquidated(account), true);
    minimumSupply = BigNumber("1250000000000000000").times(WEI_ATTODAI_PRICE);
    account["attoDai"].supplied = minimumSupply.minus("1").toFixed();
    assert.equal(await daiFi.canBeLiquidated(account), true);
    account["attoDai"].supplied = minimumSupply.toFixed();
    assert.equal(await daiFi.canBeLiquidated(account), false);
    account["wei_"].borrowed = MAX_UINT256;
    assert.equal(await daiFi.canBeLiquidated(account), true);
    account["wei_"].borrowed = "1";
    account["attoDai"].supplied = MAX_UINT256;
    assert.equal(await daiFi.canBeLiquidated(account), false);
  });

  it("should determine can be liquidated if attoDai borrowed and insufficient wei supplied", async () => {
    const daiFi = await DaiFi.deployed();
    const account = {wei_: {supplied: "0", borrowed: "0"}, attoDai:{supplied: "0", borrowed: "0"}};
    assert.equal(await daiFi.canBeLiquidated(account), false);
    account["attoDai"].borrowed = "1";
    assert.equal(await daiFi.canBeLiquidated(account), true);
    let minimumSupply = BigNumber("200").dividedBy(WEI_ATTODAI_PRICE);
    account["wei_"].supplied = minimumSupply.minus("1").toFixed();
    assert.equal(await daiFi.canBeLiquidated(account), true);
    account["wei_"].supplied = minimumSupply.toFixed();
    assert.equal(await daiFi.canBeLiquidated(account), false);
    account["attoDai"].borrowed = "1000000000000000000";
    assert.equal(await daiFi.canBeLiquidated(account), true);
    minimumSupply = BigNumber("1250000000000000000").dividedBy(WEI_ATTODAI_PRICE);
    account["wei_"].supplied = minimumSupply.minus("1").toFixed();
    assert.equal(await daiFi.canBeLiquidated(account), true);
    account["wei_"].supplied = minimumSupply.toFixed();
    assert.equal(await daiFi.canBeLiquidated(account), false);
    account["attoDai"].borrowed = MAX_UINT256;
    assert.equal(await daiFi.canBeLiquidated(account), true);
    account["attoDai"].borrowed = "1";
    account["wei_"].supplied = MAX_UINT256;
    try {
      await daiFi.canBeLiquidated(account);
      throw null;
    } catch (error) {
      assertRevert(error, "SafeMath: multiplication overflow");
    }
  });

});
