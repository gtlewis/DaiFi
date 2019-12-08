const { deployContracts, MAX_UINT256 } = require("./setup");
const truffleAssert = require('truffle-assertions');

contract("DaiFiInterest", async accounts => {

  it("should correctly calculate supplied Wei interest when supplied Wei is valid", async () => {
    const { daiFi } = await deployContracts();
    const account = {wei_: {supplied: "0", borrowed: "0"}, attoDai: {supplied: "0", borrowed: "0"}};
    assert.equal(await daiFi.calculateSuppliedWeiInterest(account), "0");
    account.wei_.supplied = "1000000000000000000";
    assert.equal(await daiFi.calculateSuppliedWeiInterest(account), "10000000000000000");
    account.wei_.supplied = MAX_UINT256;
    truffleAssert.reverts(daiFi.calculateSuppliedWeiInterest(account), "SafeMath: multiplication overflow");
  });

  it("should correctly calculate borrowed Wei interest when borrowed Wei is valid", async () => {
    const { daiFi } = await deployContracts();
    const account = {wei_: {supplied: "0", borrowed: "0"}, attoDai: {supplied: "0", borrowed: "0"}};
    assert.equal(await daiFi.calculateBorrowedWeiInterest(account), "0");
    account.wei_.borrowed = "1000000000000000000";
    assert.equal(await daiFi.calculateBorrowedWeiInterest(account), "10000000000000000");
    account.wei_.borrowed = MAX_UINT256;
    truffleAssert.reverts(daiFi.calculateBorrowedWeiInterest(account), "SafeMath: multiplication overflow");
  });

  it("should correctly calculate supplied attoDai interest when supplied attoDai is valid", async () => {
    const { daiFi } = await deployContracts();
    const account = {wei_: {supplied: "0", borrowed: "0"}, attoDai: {supplied: "0", borrowed: "0"}};
    assert.equal(await daiFi.calculateSuppliedAttoDaiInterest(account), "0");
    account.attoDai.supplied = "1000000000000000000";
    assert.equal(await daiFi.calculateSuppliedAttoDaiInterest(account), "10000000000000000");
    account.attoDai.supplied = MAX_UINT256;
    truffleAssert.reverts(daiFi.calculateSuppliedAttoDaiInterest(account), "SafeMath: multiplication overflow");
  });

  it("should correctly calculate borrowed attoDai interest when borrowed attoDai is valid", async () => {
    const { daiFi } = await deployContracts();
    const account = {wei_: {supplied: "0", borrowed: "0"}, attoDai: {supplied: "0", borrowed: "0"}};
    assert.equal(await daiFi.calculateBorrowedAttoDaiInterest(account), "0");
    account.attoDai.borrowed = "1000000000000000000";
    assert.equal(await daiFi.calculateBorrowedAttoDaiInterest(account), "10000000000000000");
    account.attoDai.borrowed = MAX_UINT256;
    truffleAssert.reverts(daiFi.calculateBorrowedAttoDaiInterest(account), "SafeMath: multiplication overflow");
  });

});
