const MockDai = artifacts.require("MockERC20");
const DaiFi = artifacts.require("DaiFi");

const BigNumber = require('bignumber.js');

function assertRevert(actualError, expectedErrorMessage) {
  assert(actualError, "No revert error");
  assert(actualError.message.startsWith("Returned error: VM Exception while processing transaction: revert " + expectedErrorMessage),
    "Expected '" + actualError.message + "' to contain '" + expectedErrorMessage + "'");
}

async function deployNewDaiFi() {
  return DaiFi.new("0x0000000000000000000000000000000000000000");
}

async function deployNewDaiFiAndSupplyWei(amount) {
  const daiFi = await deployNewDaiFi();
  await daiFi.supplyWei({value: amount});
  return daiFi;
}

async function deployNewDaiFiAndSupplyAndBorrowWei(amount) {
  const daiFi = await deployNewDaiFiAndSupplyWei(amount);
  await daiFi.borrowWei(amount);
  return daiFi;
}

async function deployNewDaiFiAndApproveDai(accounts, amount) {
  const mockDai = await MockDai.new();
  await mockDai.mint(accounts[0], amount);
  const daiFi = await DaiFi.new(mockDai.address);
  await mockDai.approve(daiFi.address, amount);
  return {daiFi, mockDai};
}

async function deployNewDaiFiAndApproveAndSupplyDai(accounts, amount) {
  const contracts = await deployNewDaiFiAndApproveDai(accounts, amount);
  await contracts.daiFi.supplyAttoDai(amount);
  return contracts;
}

async function deployNewDaiFiAndApproveAndSupplyAndBorrowDai(accounts, amount) {
  const contracts = await deployNewDaiFiAndApproveAndSupplyDai(accounts, amount);
  await contracts.daiFi.borrowAttoDai(amount);
  return contracts;
}

contract("DaiFi", async accounts => {

  it("should initialise all supplied and borrowed balances as zero", async () => {
    const daiFi = await deployNewDaiFi();
    assert.equal((await daiFi.getTotalWei()).supplied, "0");
    assert.equal((await daiFi.getTotalWei()).borrowed, "0");
    assert.equal((await daiFi.getTotalAttoDai()).supplied, "0");
    assert.equal((await daiFi.getTotalAttoDai()).borrowed, "0");
    assert.equal((await daiFi.getAccount(accounts[0]))["wei_"].supplied, "0");
    assert.equal((await daiFi.getAccount(accounts[0]))["wei_"].borrowed, "0");
    assert.equal((await daiFi.getAccount(accounts[0]))["attoDai"].supplied, "0");
    assert.equal((await daiFi.getAccount(accounts[0]))["attoDai"].borrowed, "0");
  });

  it("should emit events for all actions", async () => {
    let contracts = await deployNewDaiFiAndApproveDai(accounts, "1");
    assert.equal((await contracts.daiFi.supplyWei({value: "1"})).logs[0].event, "WeiSupplied");
    assert.equal((await contracts.daiFi.withdrawWei("1")).logs[0].event, "WeiWithdrawn");
    assert.equal((await contracts.daiFi.supplyAttoDai("1")).logs[0].event, "AttoDaiSupplied");
    assert.equal((await contracts.daiFi.withdrawAttoDai("1")).logs[0].event, "AttoDaiWithdrawn");

    contracts = await deployNewDaiFiAndApproveAndSupplyDai(accounts, "1");
    await contracts.mockDai.approve(contracts.daiFi.address, "1");
    await contracts.daiFi.supplyWei({value: "1"});
    assert.equal((await contracts.daiFi.borrowWei("1")).logs[0].event, "WeiBorrowed");
    assert.equal((await contracts.daiFi.repayWei({value: "1"})).logs[0].event, "WeiRepaid");
    assert.equal((await contracts.daiFi.borrowAttoDai("1")).logs[0].event, "AttoDaiBorrowed");
    assert.equal((await contracts.daiFi.repayAttoDai("1")).logs[0].event, "AttoDaiRepaid");
  });

//================ SUPPLY WEI ================

  it("should fail when supplying 0 Wei", async () => {
    const daiFi = await deployNewDaiFi();
    try {
      await daiFi.supplyWei();
      throw null;
    } catch (error) {
      assertRevert(error, "supplied zero Wei");
    }
  });

  it("should increase own wei balance when supplying Wei", async () => {
    const daiFi = await deployNewDaiFiAndSupplyWei("1");
    assert.equal(await web3.eth.getBalance(daiFi.address), "1");
    await daiFi.supplyWei({value: "1000000000000000000"});
    assert.equal(await web3.eth.getBalance(daiFi.address), "1000000000000000001");
  });

  it("should increase sender's Wei supply when supplying Wei", async () => {
    const daiFi = await deployNewDaiFiAndSupplyWei("1");
    assert.equal((await daiFi.getAccount(accounts[0]))["wei_"].supplied, "1");
    assert.equal((await daiFi.getAccount(accounts[0]))["wei_"].borrowed, "0");
    assert.equal((await daiFi.getAccount(accounts[0]))["attoDai"].supplied, "0");
    assert.equal((await daiFi.getAccount(accounts[0]))["attoDai"].borrowed, "0");
    await daiFi.supplyWei({value: "1000000000000000000"});
    assert.equal((await daiFi.getAccount(accounts[0]))["wei_"].supplied, "1000000000000000001");
  });

  it("should increase total Wei supply when supplying Wei", async () => {
    const daiFi = await deployNewDaiFiAndSupplyWei("1");
    assert.equal((await daiFi.getTotalWei()).supplied, "1");
    await daiFi.supplyWei({value: "1000000000000000000"});
    assert.equal((await daiFi.getTotalWei()).supplied, "1000000000000000001");
  });

//================ WITHDRAW WEI ================

  it("should fail when withdrawing 0 Wei", async () => {
    const daiFi = await deployNewDaiFi();
    try {
      await daiFi.withdrawWei("0");
      throw null;
    } catch (error) {
      assertRevert(error, "withdrew zero Wei");
    }
  });

  it("should fail when withdrawing more Wei than supplied", async () => {
    const daiFi = await deployNewDaiFiAndSupplyWei("1");
    try {
      await daiFi.withdrawWei("2");
      throw null;
    } catch (error) {
      assertRevert(error, "withdrew more Wei than supplied");
    }
  });

  it("should increase sender's wei balance when withdrawing Wei", async () => {
    const daiFi = await deployNewDaiFiAndSupplyWei("1000000000000000001");
    const initialBalance = BigNumber(await web3.eth.getBalance(accounts[0]));
    await daiFi.withdrawWei("1", {gasPrice: "0"});
    assert.equal(await web3.eth.getBalance(accounts[0]), initialBalance.plus("1"));
    await daiFi.withdrawWei("1000000000000000000", {gasPrice: "0"});
    assert.equal(await web3.eth.getBalance(accounts[0]), initialBalance.plus("1000000000000000001"));
  });

  it("should decrease sender's Wei supply when withdrawing Wei", async () => {
    const daiFi = await deployNewDaiFiAndSupplyWei("1000000000000000001");
    await daiFi.withdrawWei("1");
    assert.equal((await daiFi.getAccount(accounts[0]))["wei_"].supplied, "1000000000000000000");
    assert.equal((await daiFi.getAccount(accounts[0]))["wei_"].borrowed, "0");
    assert.equal((await daiFi.getAccount(accounts[0]))["attoDai"].supplied, "0");
    assert.equal((await daiFi.getAccount(accounts[0]))["attoDai"].borrowed, "0");
    await daiFi.withdrawWei("1000000000000000000");
    assert.equal((await daiFi.getAccount(accounts[0]))["wei_"].supplied, "0");
  });

  it("should decrease total Wei supply when withdrawing Wei", async () => {
    const daiFi = await deployNewDaiFiAndSupplyWei("1000000000000000001");
    await daiFi.withdrawWei("1");
    assert.equal((await daiFi.getTotalWei()).supplied, "1000000000000000000");
    await daiFi.withdrawWei("1000000000000000000");
    assert.equal((await daiFi.getTotalWei()).supplied, "0");
  });

//================ SUPPLY ATTODAI ================

  it("should fail when supplying 0 attoDai", async () => {
    const daiFi = await deployNewDaiFi();
    try {
      await daiFi.supplyAttoDai("0");
      throw null;
    } catch (error) {
      assertRevert(error, "supplied zero attoDai");
    }
  });

  it("should fail when supplying unapproved attoDai", async () => {
    const mockDai = await MockDai.new();
    await mockDai.mint(accounts[0], "2");
    const daiFi = await DaiFi.new(mockDai.address);
    await mockDai.approve(daiFi.address, "1");
    try {
      await daiFi.supplyAttoDai("2");
      throw null;
    } catch (error) {
      assertRevert(error, "ERC20: transfer amount exceeds allowance");
    }
  });

  it("should increase own attoDai balance when supplying attoDai", async () => {
    const contracts = await deployNewDaiFiAndApproveDai(accounts, "1000000000000000001");
    await contracts.daiFi.supplyAttoDai("1");
    assert.equal(await contracts.mockDai.balanceOf(contracts.daiFi.address), "1");
    await contracts.daiFi.supplyAttoDai("1000000000000000000");
    assert.equal(await contracts.mockDai.balanceOf(contracts.daiFi.address), "1000000000000000001");
  });

  it("should increase sender's attoDai supply when supplying attoDai", async () => {
    const contracts = await deployNewDaiFiAndApproveDai(accounts, "1000000000000000001");
    await contracts.daiFi.supplyAttoDai("1");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["wei_"].supplied, "0");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["wei_"].borrowed, "0");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["attoDai"].supplied, "1");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["attoDai"].borrowed, "0");
    await contracts.daiFi.supplyAttoDai("1000000000000000000");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["attoDai"].supplied, "1000000000000000001");
  });

  it("should increase total attoDai supply when supplying attoDai", async () => {
    const contracts = await deployNewDaiFiAndApproveDai(accounts, "1000000000000000001");
    await contracts.daiFi.supplyAttoDai("1");
    assert.equal((await contracts.daiFi.getTotalAttoDai()).supplied, "1");
    await contracts.daiFi.supplyAttoDai("1000000000000000000");
    assert.equal((await contracts.daiFi.getTotalAttoDai()).supplied, "1000000000000000001");
  });

//================ WITHDRAW ATTODAI ================

  it("should fail when withdrawing 0 attoDai", async () => {
    const daiFi = await deployNewDaiFi();
    try {
      await daiFi.withdrawAttoDai("0");
      throw null;
    } catch (error) {
      assertRevert(error, "withdrew zero attoDai");
    }
  });

  it("should fail when withdrawing more attoDai than supplied", async () => {
    const contracts = await deployNewDaiFiAndApproveAndSupplyDai(accounts, "1");
    try {
      await contracts.daiFi.withdrawAttoDai("2");
      throw null;
    } catch (error) {
      assertRevert(error, "withdrew more attoDai than supplied");
    }
  });

  it("should increase sender's attoDai balance when withdrawing attoDai", async () => {
    const contracts = await deployNewDaiFiAndApproveAndSupplyDai(accounts, "1000000000000000001");
    assert.equal(await contracts.mockDai.balanceOf(accounts[0]), "0");
    await contracts.daiFi.withdrawAttoDai("1");
    assert.equal(await contracts.mockDai.balanceOf(accounts[0]), "1");
    await contracts.daiFi.withdrawAttoDai("1000000000000000000");
    assert.equal(await contracts.mockDai.balanceOf(accounts[0]), "1000000000000000001");
  });

  it("should decrease sender's attoDai supply when withdrawing attoDai", async () => {
    const contracts = await deployNewDaiFiAndApproveAndSupplyDai(accounts, "1000000000000000001");
    await contracts.daiFi.withdrawAttoDai("1");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["wei_"].supplied, "0");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["wei_"].borrowed, "0");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["attoDai"].supplied, "1000000000000000000");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["attoDai"].borrowed, "0");
    await contracts.daiFi.withdrawAttoDai("1000000000000000000");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["attoDai"].supplied, "0");
  });

  it("should decrease total attoDai supply when withdrawing attoDai", async () => {
    const contracts = await deployNewDaiFiAndApproveAndSupplyDai(accounts, "1000000000000000001");
    await contracts.daiFi.withdrawAttoDai("1");
    assert.equal((await contracts.daiFi.getTotalAttoDai()).supplied, "1000000000000000000");
    await contracts.daiFi.withdrawAttoDai("1000000000000000000");
    assert.equal((await contracts.daiFi.getTotalAttoDai()).supplied, "0");
  });

//================ BORROW WEI ================

  it("should fail when borrowing 0 Wei", async () => {
    const daiFi = await deployNewDaiFi();
    try {
      await daiFi.borrowWei("0");
      throw null;
    } catch (error) {
      assertRevert(error, "borrowed zero Wei");
    }
  });

  it("should increase sender's wei balance when borrowing Wei", async () => {
    const daiFi = await deployNewDaiFiAndSupplyWei("1000000000000000001");
    const initialBalance = BigNumber(await web3.eth.getBalance(accounts[0]));
    await daiFi.borrowWei("1", {gasPrice: "0"});
    assert.equal(await web3.eth.getBalance(accounts[0]), initialBalance.plus("1"));
    await daiFi.borrowWei("1000000000000000000", {gasPrice: "0"});
    assert.equal(await web3.eth.getBalance(accounts[0]), initialBalance.plus("1000000000000000001"));
  });

  it("should increase sender's borrowed Wei when borrowing Wei", async () => {
    const daiFi = await deployNewDaiFiAndSupplyWei("1000000000000000001");
    await daiFi.borrowWei("1");
    assert.equal((await daiFi.getAccount(accounts[0]))["wei_"].supplied, "1000000000000000001");
    assert.equal((await daiFi.getAccount(accounts[0]))["wei_"].borrowed, "1");
    assert.equal((await daiFi.getAccount(accounts[0]))["attoDai"].supplied, "0");
    assert.equal((await daiFi.getAccount(accounts[0]))["attoDai"].borrowed, "0");
    await daiFi.borrowWei("1000000000000000000");
    assert.equal((await daiFi.getAccount(accounts[0]))["wei_"].borrowed, "1000000000000000001");
  });

  it("should increase total Wei supply when borrowing Wei", async () => {
    const daiFi = await deployNewDaiFiAndSupplyWei("1000000000000000001");
    await daiFi.borrowWei("1");
    assert.equal((await daiFi.getTotalWei()).borrowed, "1");
    await daiFi.borrowWei("1000000000000000000");
    assert.equal((await daiFi.getTotalWei()).borrowed, "1000000000000000001");
  });

//================ REPAY WEI ================

  it("should fail when repaying 0 Wei", async () => {
    const daiFi = await deployNewDaiFi();
    try {
      await daiFi.repayWei();
      throw null;
    } catch (error) {
      assertRevert(error, "repaid zero Wei");
    }
  });

  it("should fail when repaying more Wei than borrowed", async () => {
    const daiFi = await deployNewDaiFiAndSupplyAndBorrowWei("1");
    try {
      await daiFi.repayWei({value: "2"});
      throw null;
    } catch (error) {
      assertRevert(error, "repaid more Wei than borrowed");
    }
  });

  it("should increase own wei balance when repaying Wei", async () => {
    const daiFi = await deployNewDaiFiAndSupplyAndBorrowWei("1000000000000000001");
    assert.equal(await web3.eth.getBalance(daiFi.address), "0");
    await daiFi.repayWei({value: "1"});
    assert.equal(await web3.eth.getBalance(daiFi.address), "1");
    await daiFi.repayWei({value: "1000000000000000000"});
    assert.equal(await web3.eth.getBalance(daiFi.address), "1000000000000000001");
  });

  it("should decrease sender's borrowed Wei when repaying Wei", async () => {
    const daiFi = await deployNewDaiFiAndSupplyAndBorrowWei("1000000000000000001");
    await daiFi.repayWei({value: "1"});
    assert.equal((await daiFi.getAccount(accounts[0]))["wei_"].supplied, "1000000000000000001");
    assert.equal((await daiFi.getAccount(accounts[0]))["wei_"].borrowed, "1000000000000000000");
    assert.equal((await daiFi.getAccount(accounts[0]))["attoDai"].supplied, "0");
    assert.equal((await daiFi.getAccount(accounts[0]))["attoDai"].borrowed, "0");
    await daiFi.repayWei({value: "1000000000000000000"});
    assert.equal((await daiFi.getAccount(accounts[0]))["wei_"].borrowed, "0");
  });

  it("should decrease total borrowed Wei when repaying Wei", async () => {
    const daiFi = await deployNewDaiFiAndSupplyAndBorrowWei("1000000000000000001");
    await daiFi.repayWei({value: "1"});
    assert.equal((await daiFi.getTotalWei()).borrowed, "1000000000000000000");
    await daiFi.repayWei({value: "1000000000000000000"});
    assert.equal((await daiFi.getTotalWei()).borrowed, "0");
  });

//================ BORROW ATTODAI ================

  it("should fail when borrowing 0 attoDai", async () => {
    const daiFi = await deployNewDaiFi();
    try {
      await daiFi.borrowAttoDai("0");
      throw null;
    } catch (error) {
      assertRevert(error, "borrowed zero attoDai");
    }
  });

  it("should increase sender's attoDai balance when borrowing attoDai", async () => {
    const contracts = await deployNewDaiFiAndApproveAndSupplyDai(accounts, "1000000000000000001");
    assert.equal(await contracts.mockDai.balanceOf(accounts[0]), "0");
    await contracts.daiFi.borrowAttoDai("1");
    assert.equal(await contracts.mockDai.balanceOf(accounts[0]), "1");
    await contracts.daiFi.borrowAttoDai("1000000000000000000");
    assert.equal(await contracts.mockDai.balanceOf(accounts[0]), "1000000000000000001");
  });

  it("should increase sender's borrowed attoDai when borrowing attoDai", async () => {
    const contracts = await deployNewDaiFiAndApproveAndSupplyDai(accounts, "1000000000000000001");
    await contracts.daiFi.borrowAttoDai("1");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["wei_"].supplied, "0");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["wei_"].borrowed, "0");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["attoDai"].supplied, "1000000000000000001");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["attoDai"].borrowed, "1");
    await contracts.daiFi.borrowAttoDai("1000000000000000000");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["attoDai"].borrowed, "1000000000000000001");
  });

  it("should increase total attoDai borrowed when borrowing attoDai", async () => {
    const contracts = await deployNewDaiFiAndApproveAndSupplyDai(accounts, "1000000000000000001");
    await contracts.daiFi.borrowAttoDai("1");
    assert.equal((await contracts.daiFi.getTotalAttoDai()).borrowed, "1");
    await contracts.daiFi.borrowAttoDai("1000000000000000000");
    assert.equal((await contracts.daiFi.getTotalAttoDai()).borrowed, "1000000000000000001");
  });

//================ REPAY ATTODAI ================

  it("should fail when repaying 0 attoDai", async () => {
    const daiFi = await deployNewDaiFi();
    try {
      await daiFi.repayAttoDai("0");
      throw null;
    } catch (error) {
      assertRevert(error, "repaid zero attoDai");
    }
  });

  it("should fail when repaying unapproved attoDai", async () => {
    const contracts = await deployNewDaiFiAndApproveAndSupplyAndBorrowDai(accounts, "2");
    await contracts.mockDai.approve(contracts.daiFi.address, "1");
    try {
      await contracts.daiFi.repayAttoDai("2");
      throw null;
    } catch (error) {
      assertRevert(error, "ERC20: transfer amount exceeds allowance");
    }
  });

  it("should fail when repaying more attoDai than borrowed", async () => {
    const contracts = await deployNewDaiFiAndApproveAndSupplyAndBorrowDai(accounts, "1");
    await contracts.mockDai.mint(accounts[0], "1");
    await contracts.mockDai.approve(contracts.daiFi.address, "2");
    try {
      await contracts.daiFi.repayAttoDai("2");
      throw null;
    } catch (error) {
      assertRevert(error, "repaid more attoDai than borrowed");
    }
  });

  it("should increase own attoDai balance when repaying attoDai", async () => {
    const contracts = await deployNewDaiFiAndApproveAndSupplyAndBorrowDai(accounts, "1000000000000000001");
    await contracts.mockDai.approve(contracts.daiFi.address, "1000000000000000001");
    assert.equal(await contracts.mockDai.balanceOf(contracts.daiFi.address), "0");
    await contracts.daiFi.repayAttoDai("1");
    assert.equal(await contracts.mockDai.balanceOf(contracts.daiFi.address), "1");
    await contracts.daiFi.repayAttoDai("1000000000000000000");
    assert.equal(await contracts.mockDai.balanceOf(contracts.daiFi.address), "1000000000000000001");
  });

  it("should decrease sender's borrowed attoDai when repaying attoDai", async () => {
    const contracts = await deployNewDaiFiAndApproveAndSupplyAndBorrowDai(accounts, "1000000000000000001");
    await contracts.mockDai.approve(contracts.daiFi.address, "1000000000000000001");
    await contracts.daiFi.repayAttoDai("1");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["wei_"].supplied, "0");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["wei_"].borrowed, "0");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["attoDai"].supplied, "1000000000000000001");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["attoDai"].borrowed, "1000000000000000000");
    await contracts.daiFi.repayAttoDai("1000000000000000000");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["attoDai"].borrowed, "0");
  });

  it("should decrease total attoDai borrowed when repaying attoDai", async () => {
    const contracts = await deployNewDaiFiAndApproveAndSupplyAndBorrowDai(accounts, "1000000000000000001");
    await contracts.mockDai.approve(contracts.daiFi.address, "1000000000000000001");
    await contracts.daiFi.repayAttoDai("1");
    assert.equal((await contracts.daiFi.getTotalAttoDai()).borrowed, "1000000000000000000");
    await contracts.daiFi.repayAttoDai("1000000000000000000");
    assert.equal((await contracts.daiFi.getTotalAttoDai()).borrowed, "0");
  });

});
