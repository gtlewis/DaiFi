const DaiFi = artifacts.require("DaiFi");

contract("DaiFi", async accounts => {
// TODO: test edge cases - 0, 1 and MAX
  it("should determine collateralised for Wei when more attoDai is supplied", async () => {
    const daiFi = await DaiFi.deployed();
    const account = {wei_: {supplied: 0, borrowed: 0}, attoDai:{supplied: 0, borrowed: 0}};
    assert.equal(await daiFi.isCollateralisedForWei(account), true);
    account["attoDai"].supplied = 1;
    assert.equal(await daiFi.isCollateralisedForWei(account), true);
    account["attoDai"].supplied = 400;
    account["wei_"].borrowed = 1;
    assert.equal(await daiFi.isCollateralisedForWei(account), true);
    account["attoDai"].supplied = 30200;
    account["wei_"].borrowed = 100;
    assert.equal(await daiFi.isCollateralisedForWei(account), true);
  });
*/
  it("should determine not collateralised for Wei when less or equal attoDai is supplied", async () => {
    const daiFi = await DaiFi.deployed();
    const account = {wei_: {supplied: 0, borrowed: 0}, attoDai:{supplied: 0, borrowed: 0}};
    account["wei_"].borrowed = 1;
    assert.equal(await daiFi.isCollateralisedForWei(account), false);
    account["attoDai"].supplied = 1;
    account["wei_"].borrowed = 1;
    assert.equal(await daiFi.isCollateralisedForWei(account), false);
  });

  it("should determine collateralised for attoDai when more Wei is supplied", async () => {
    const daiFi = await DaiFi.deployed();
    const account = {wei_: {supplied: 0, borrowed: 0}, attoDai:{supplied: 0, borrowed: 0}};
    assert.equal(await daiFi.isCollateralisedForAttoDai(account), true);
    account["wei_"].supplied = 1;
    assert.equal(await daiFi.isCollateralisedForAttoDai(account), true);
    account["wei_"].supplied = 2;
    account["attoDai"].borrowed = 1;
    assert.equal(await daiFi.isCollateralisedForAttoDai(account), true);
  });

  it("should determine not collateralised for attoDai when less or equal Wei is supplied", async () => {
    const daiFi = await DaiFi.deployed();
    const account = {wei_: {supplied: 0, borrowed: 0}, attoDai:{supplied: 0, borrowed: 0}};
    account["attoDai"].borrowed = 1;
    assert.equal(await daiFi.isCollateralisedForAttoDai(account), false);
    account["wei_"].supplied = 1;
    account["attoDai"].borrowed = 1;
    assert.equal(await daiFi.isCollateralisedForAttoDai(account), false);
  });

  it("should determine can be liquidated if supplied less than borrowed", async () => {
    const daiFi = await DaiFi.deployed();
    let account = {wei_: {supplied: 0, borrowed: 1}, attoDai:{supplied: 0, borrowed: 0}};
    assert.equal(await daiFi.canBeLiquidated(account), true);
    account = {wei_: {supplied: 0, borrowed: 0}, attoDai:{supplied: 0, borrowed: 1}};
    assert.equal(await daiFi.canBeLiquidated(account), true);
    account = {wei_: {supplied: 1, borrowed: 0}, attoDai:{supplied: 0, borrowed: 2}};
    assert.equal(await daiFi.canBeLiquidated(account), true);
    account = {wei_: {supplied: 0, borrowed: 2}, attoDai:{supplied: 1, borrowed: 0}};
    assert.equal(await daiFi.canBeLiquidated(account), true);
  });

  it("should determine can not be liquidated if supplied greater than or equal to borrowed", async () => {
    const daiFi = await DaiFi.deployed();
    let account = {wei_: {supplied: 0, borrowed: 0}, attoDai:{supplied: 0, borrowed: 0}};
    assert.equal(await daiFi.canBeLiquidated(account), false);
    account = {wei_: {supplied: 0, borrowed: 0}, attoDai:{supplied: 1, borrowed: 0}};
    assert.equal(await daiFi.canBeLiquidated(account), false);
    account = {wei_: {supplied: 1, borrowed: 0}, attoDai:{supplied: 0, borrowed: 0}};
    assert.equal(await daiFi.canBeLiquidated(account), false);
    account = {wei_: {supplied: 1, borrowed: 0}, attoDai:{supplied: 0, borrowed: 1}};
    assert.equal(await daiFi.canBeLiquidated(account), false);
    account = {wei_: {supplied: 0, borrowed: 1}, attoDai:{supplied: 1, borrowed: 0}};
    assert.equal(await daiFi.canBeLiquidated(account), false);
    account = {wei_: {supplied: 2, borrowed: 0}, attoDai:{supplied: 0, borrowed: 1}};
    assert.equal(await daiFi.canBeLiquidated(account), false);
    account = {wei_: {supplied: 0, borrowed: 1}, attoDai:{supplied: 2, borrowed: 0}};
    assert.equal(await daiFi.canBeLiquidated(account), false);
  });
*/
});
