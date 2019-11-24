const MockDai = artifacts.require("MockERC20");
const DaiFi = artifacts.require("DaiFi");

const BigNumber = require('bignumber.js');
BigNumber.set({ROUNDING_MODE: 1});

const WEI_ATTODAI_PRICE = "234.567890123456789012";

function assertRevert(actualError, expectedErrorMessage) {
  assert(actualError, "No revert error");
  assert(actualError.message.startsWith("Returned error: VM Exception while processing transaction: revert " + expectedErrorMessage),
    "Expected '" + actualError.message + "' to contain '" + expectedErrorMessage + "'");
}

async function deployNewDaiFi() {
  const mockDai = await MockDai.new();
  const daiFi = await DaiFi.new(mockDai.address);
  return {daiFi, mockDai};
}

//================ WEI HELPER FUNCTIONS ================

async function deployNewDaiFiAndSupplyWei(amount) {
  const contracts = await deployNewDaiFi();
  await contracts.daiFi.supplyWei({value: amount});
  return contracts;
}

async function deployNewDaiFiAndTransferAndCollateraliseWei(accounts, amount) {
  const contracts = await deployNewDaiFi();
  await transferWei(contracts, accounts, amount);
  await collateraliseWei(contracts, accounts, amount);
  return contracts;
}

async function deployNewDaiFiAndTransferAndCollateraliseAndBorrowWei(accounts, amount) {
  const contracts = await deployNewDaiFiAndTransferAndCollateraliseWei(accounts, amount);
  await contracts.daiFi.borrowWei(amount);
  return contracts;
}

async function transferWei(contracts, accounts, amount) {
  await contracts.daiFi.supplyWei({value: amount, from: accounts[1]});
}

async function collateraliseWei(contracts, accounts, amount) {
  const attoDaiAmount = BigNumber(amount).times("1.5").plus("1").times(WEI_ATTODAI_PRICE).toFixed(0);
  await contracts.mockDai.mint(accounts[0], attoDaiAmount);
  await contracts.mockDai.approve(contracts.daiFi.address, attoDaiAmount);
  await contracts.daiFi.supplyAttoDai(attoDaiAmount);
}

//================ ATTODAI HELPER FUNCTIONS ================

async function deployNewDaiFiAndApproveAttoDai(accounts, amount) {
  const contracts = await deployNewDaiFi();
  await contracts.mockDai.mint(accounts[0], amount);
  await contracts.mockDai.approve(contracts.daiFi.address, amount);
  return contracts;
}

async function deployNewDaiFiAndApproveAndSupplyAttoDai(accounts, amount) {
  const contracts = await deployNewDaiFiAndApproveAttoDai(accounts, amount);
  await contracts.daiFi.supplyAttoDai(amount);
  return contracts;
}

async function deployNewDaiFiAndTransferAndCollateraliseAttoDai(accounts, amount) {
  const contracts = await deployNewDaiFi();
  await transferAttoDai(contracts, accounts, amount);
  await collateraliseAttoDai(contracts, accounts, amount);
  return contracts;
}

async function deployNewDaiFiAndTransferAndCollateraliseAndBorrowAttoDai(accounts, amount) {
  const contracts = await deployNewDaiFiAndTransferAndCollateraliseAttoDai(accounts, amount);
  await contracts.daiFi.borrowAttoDai(amount);
  return contracts;
}

async function deployNewDaiFiAndTransferAndCollateraliseAndBorrowAndApproveAttoDai(accounts, amount) {
  const contracts = await deployNewDaiFiAndTransferAndCollateraliseAndBorrowAttoDai(accounts, amount);
  await contracts.mockDai.approve(contracts.daiFi.address, amount);
  return contracts;
}

async function transferAttoDai(contracts, accounts, amount) {
  await contracts.mockDai.mint(accounts[1], amount);
  await contracts.mockDai.approve(contracts.daiFi.address, amount, {from: accounts[1]});
  await contracts.daiFi.supplyAttoDai(amount, {from: accounts[1]});
}

async function collateraliseAttoDai(contracts, accounts, amount) {
  const weiAmount = BigNumber(amount).times("1.5").dividedBy(WEI_ATTODAI_PRICE).plus("1").toFixed(0);
  await contracts.daiFi.supplyWei({value: weiAmount});
}

//================ COMMON TESTS ================

contract("DaiFi", async accounts => {

  it("should initialise all supplied and borrowed balances as zero", async () => {
    const contracts = await deployNewDaiFi();
    assert.equal((await contracts.daiFi.getTotalWei()).supplied, "0");
    assert.equal((await contracts.daiFi.getTotalWei()).borrowed, "0");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["wei_"].supplied, "0");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["wei_"].borrowed, "0");

    assert.equal((await contracts.daiFi.getTotalAttoDai()).supplied, "0");
    assert.equal((await contracts.daiFi.getTotalAttoDai()).borrowed, "0");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["attoDai"].supplied, "0");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["attoDai"].borrowed, "0");
  });

  it("should emit events for all actions", async () => {
    let contracts = await deployNewDaiFi();
    await transferWei(contracts, accounts, "1");
    await collateraliseWei(contracts, accounts, "1");
    assert.equal((await contracts.daiFi.supplyWei({value: "1"})).logs[0].event, "WeiSupplied");
    assert.equal((await contracts.daiFi.withdrawWei("1")).logs[0].event, "WeiWithdrawn");
    assert.equal((await contracts.daiFi.borrowWei("1")).logs[0].event, "WeiBorrowed");
    assert.equal((await contracts.daiFi.repayWei({value: "1"})).logs[0].event, "WeiRepaid");

    contracts = await deployNewDaiFiAndApproveAttoDai(accounts, "2");
    await transferAttoDai(contracts, accounts, "1");
    await collateraliseAttoDai(contracts, accounts, "1");
    assert.equal((await contracts.daiFi.supplyAttoDai("1")).logs[0].event, "AttoDaiSupplied");
    assert.equal((await contracts.daiFi.withdrawAttoDai("1")).logs[0].event, "AttoDaiWithdrawn");
    assert.equal((await contracts.daiFi.borrowAttoDai("1")).logs[0].event, "AttoDaiBorrowed");
    assert.equal((await contracts.daiFi.repayAttoDai("1")).logs[0].event, "AttoDaiRepaid");
  });

//================ SUPPLY WEI ================

  it("should fail when supplying 0 Wei", async () => {
    const contracts = await deployNewDaiFi();
    try {
      await contracts.daiFi.supplyWei();
      throw null;
    } catch (error) {
      assertRevert(error, "supplied zero Wei");
    }
  });

  it("should increase own wei balance when supplying Wei", async () => {
    const contracts = await deployNewDaiFiAndSupplyWei("1");
    assert.equal(await web3.eth.getBalance(contracts.daiFi.address), "1");
    await contracts.daiFi.supplyWei({value: "1000000000000000000"});
    assert.equal(await web3.eth.getBalance(contracts.daiFi.address), "1000000000000000001");
  });

  it("should increase sender's Wei supply when supplying Wei", async () => {
    const contracts = await deployNewDaiFiAndSupplyWei("1");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["wei_"].supplied, "1");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["wei_"].borrowed, "0");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["attoDai"].supplied, "0");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["attoDai"].borrowed, "0");
    await contracts.daiFi.supplyWei({value: "1000000000000000000"});
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["wei_"].supplied, "1000000000000000001");
  });

  it("should increase total Wei supply when supplying Wei", async () => {
    const contracts = await deployNewDaiFiAndSupplyWei("1");
    assert.equal((await contracts.daiFi.getTotalWei()).supplied, "1");
    await contracts.daiFi.supplyWei({value: "1000000000000000000"});
    assert.equal((await contracts.daiFi.getTotalWei()).supplied, "1000000000000000001");
  });

//================ WITHDRAW WEI ================

  it("should fail when withdrawing 0 Wei", async () => {
    const contracts = await deployNewDaiFi();
    try {
      await contracts.daiFi.withdrawWei("0");
      throw null;
    } catch (error) {
      assertRevert(error, "withdrew zero Wei");
    }
  });

  it("should fail when withdrawing more Wei than supplied", async () => {
    const contracts = await deployNewDaiFiAndSupplyWei("1");
    try {
      await contracts.daiFi.withdrawWei("2");
      throw null;
    } catch (error) {
      assertRevert(error, "withdrew more Wei than supplied");
    }
  });

  it("should increase sender's wei balance when withdrawing Wei", async () => {
    const contracts = await deployNewDaiFiAndSupplyWei("1000000000000000001");
    const initialBalance = BigNumber(await web3.eth.getBalance(accounts[0]));
    await contracts.daiFi.withdrawWei("1", {gasPrice: "0"});
    assert.equal(await web3.eth.getBalance(accounts[0]), initialBalance.plus("1"));
    await contracts.daiFi.withdrawWei("1000000000000000000", {gasPrice: "0"});
    assert.equal(await web3.eth.getBalance(accounts[0]), initialBalance.plus("1000000000000000001"));
  });

  it("should decrease sender's Wei supply when withdrawing Wei", async () => {
    const contracts = await deployNewDaiFiAndSupplyWei("1000000000000000001");
    await contracts.daiFi.withdrawWei("1");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["wei_"].supplied, "1000000000000000000");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["wei_"].borrowed, "0");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["attoDai"].supplied, "0");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["attoDai"].borrowed, "0");
    await contracts.daiFi.withdrawWei("1000000000000000000");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["wei_"].supplied, "0");
  });

  it("should decrease total Wei supply when withdrawing Wei", async () => {
    const contracts = await deployNewDaiFiAndSupplyWei("1000000000000000001");
    await contracts.daiFi.withdrawWei("1");
    assert.equal((await contracts.daiFi.getTotalWei()).supplied, "1000000000000000000");
    await contracts.daiFi.withdrawWei("1000000000000000000");
    assert.equal((await contracts.daiFi.getTotalWei()).supplied, "0");
  });

//================ BORROW WEI ================

  it("should fail when borrowing 0 Wei", async () => {
    const contracts = await deployNewDaiFiAndTransferAndCollateraliseWei(accounts, "1");
    try {
      await contracts.daiFi.borrowWei("0");
      throw null;
    } catch (error) {
      assertRevert(error, "borrowed zero Wei");
    }
  });

  it("should increase sender's wei balance when borrowing Wei", async () => {
    const contracts = await deployNewDaiFiAndTransferAndCollateraliseWei(accounts, "1000000000000000001");
    const initialBalance = BigNumber(await web3.eth.getBalance(accounts[0]));
    await contracts.daiFi.borrowWei("1", {gasPrice: "0"});
    assert.equal(await web3.eth.getBalance(accounts[0]), initialBalance.plus("1"));
    await contracts.daiFi.borrowWei("1000000000000000000", {gasPrice: "0"});
    assert.equal(await web3.eth.getBalance(accounts[0]), initialBalance.plus("1000000000000000001"));
  });

  it("should increase sender's borrowed Wei when borrowing Wei", async () => {
    const contracts = await deployNewDaiFiAndTransferAndCollateraliseWei(accounts, "1000000000000000001");
    await contracts.daiFi.borrowWei("1");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["wei_"].supplied, "0");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["wei_"].borrowed, "1");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["attoDai"].supplied, BigNumber("1500000000000000002.5").times(WEI_ATTODAI_PRICE).toFixed(0));
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["attoDai"].borrowed, "0");
    await contracts.daiFi.borrowWei("1000000000000000000");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["wei_"].borrowed, "1000000000000000001");
  });

  it("should increase total Wei supply when borrowing Wei", async () => {
    const contracts = await deployNewDaiFiAndTransferAndCollateraliseWei(accounts, "1000000000000000001");
    await contracts.daiFi.borrowWei("1");
    assert.equal((await contracts.daiFi.getTotalWei()).borrowed, "1");
    await contracts.daiFi.borrowWei("1000000000000000000");
    assert.equal((await contracts.daiFi.getTotalWei()).borrowed, "1000000000000000001");
  });

//================ REPAY WEI ================

  it("should fail when repaying 0 Wei", async () => {
    const contracts = await deployNewDaiFi();
    try {
      await contracts.daiFi.repayWei();
      throw null;
    } catch (error) {
      assertRevert(error, "repaid zero Wei");
    }
  });

  it("should fail when repaying more Wei than borrowed", async () => {
    const contracts = await deployNewDaiFiAndTransferAndCollateraliseAndBorrowWei(accounts, "1");
    try {
      await contracts.daiFi.repayWei({value: "2"});
      throw null;
    } catch (error) {
      assertRevert(error, "repaid more Wei than borrowed");
    }
  });

  it("should increase own wei balance when repaying Wei", async () => {
    const contracts = await deployNewDaiFiAndTransferAndCollateraliseAndBorrowWei(accounts, "1000000000000000001");
    assert.equal(await web3.eth.getBalance(contracts.daiFi.address), "0");
    await contracts.daiFi.repayWei({value: "1"});
    assert.equal(await web3.eth.getBalance(contracts.daiFi.address), "1");
    await contracts.daiFi.repayWei({value: "1000000000000000000"});
    assert.equal(await web3.eth.getBalance(contracts.daiFi.address), "1000000000000000001");
  });

  it("should decrease sender's borrowed Wei when repaying Wei", async () => {
    const contracts = await deployNewDaiFiAndTransferAndCollateraliseAndBorrowWei(accounts, "1000000000000000001");
    await contracts.daiFi.repayWei({value: "1"});
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["wei_"].supplied, "0");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["wei_"].borrowed, "1000000000000000000");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["attoDai"].supplied, BigNumber("1500000000000000002.5").times(WEI_ATTODAI_PRICE).toFixed(0));
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["attoDai"].borrowed, "0");
    await contracts.daiFi.repayWei({value: "1000000000000000000"});
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["wei_"].borrowed, "0");
  });

  it("should decrease total borrowed Wei when repaying Wei", async () => {
    const contracts = await deployNewDaiFiAndTransferAndCollateraliseAndBorrowWei(accounts, "1000000000000000001");
    await contracts.daiFi.repayWei({value: "1"});
    assert.equal((await contracts.daiFi.getTotalWei()).borrowed, "1000000000000000000");
    await contracts.daiFi.repayWei({value: "1000000000000000000"});
    assert.equal((await contracts.daiFi.getTotalWei()).borrowed, "0");
  });

//================ SUPPLY ATTODAI ================

  it("should fail when supplying 0 attoDai", async () => {
    const contracts = await deployNewDaiFi();
    try {
      await contracts.daiFi.supplyAttoDai("0");
      throw null;
    } catch (error) {
      assertRevert(error, "supplied zero attoDai");
    }
  });

  it("should fail when supplying unapproved attoDai", async () => {
    const contracts = await deployNewDaiFi();
    await contracts.mockDai.mint(accounts[0], "2");
    await contracts.mockDai.approve(contracts.daiFi.address, "1");
    try {
      await contracts.daiFi.supplyAttoDai("2");
      throw null;
    } catch (error) {
      assertRevert(error, "ERC20: transfer amount exceeds allowance");
    }
  });

  it("should increase own attoDai balance when supplying attoDai", async () => {
    const contracts = await deployNewDaiFiAndApproveAttoDai(accounts, "1000000000000000001");
    await contracts.daiFi.supplyAttoDai("1");
    assert.equal(await contracts.mockDai.balanceOf(contracts.daiFi.address), "1");
    await contracts.daiFi.supplyAttoDai("1000000000000000000");
    assert.equal(await contracts.mockDai.balanceOf(contracts.daiFi.address), "1000000000000000001");
  });

  it("should increase sender's attoDai supply when supplying attoDai", async () => {
    const contracts = await deployNewDaiFiAndApproveAttoDai(accounts, "1000000000000000001");
    await contracts.daiFi.supplyAttoDai("1");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["wei_"].supplied, "0");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["wei_"].borrowed, "0");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["attoDai"].supplied, "1");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["attoDai"].borrowed, "0");
    await contracts.daiFi.supplyAttoDai("1000000000000000000");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["attoDai"].supplied, "1000000000000000001");
  });

  it("should increase total attoDai supply when supplying attoDai", async () => {
    const contracts = await deployNewDaiFiAndApproveAttoDai(accounts, "1000000000000000001");
    await contracts.daiFi.supplyAttoDai("1");
    assert.equal((await contracts.daiFi.getTotalAttoDai()).supplied, "1");
    await contracts.daiFi.supplyAttoDai("1000000000000000000");
    assert.equal((await contracts.daiFi.getTotalAttoDai()).supplied, "1000000000000000001");
  });

//================ WITHDRAW ATTODAI ================

  it("should fail when withdrawing 0 attoDai", async () => {
    const contracts = await deployNewDaiFi();
    try {
      await contracts.daiFi.withdrawAttoDai("0");
      throw null;
    } catch (error) {
      assertRevert(error, "withdrew zero attoDai");
    }
  });

  it("should fail when withdrawing more attoDai than supplied", async () => {
    const contracts = await deployNewDaiFiAndApproveAndSupplyAttoDai(accounts, "1");
    try {
      await contracts.daiFi.withdrawAttoDai("2");
      throw null;
    } catch (error) {
      assertRevert(error, "withdrew more attoDai than supplied");
    }
  });

  it("should increase sender's attoDai balance when withdrawing attoDai", async () => {
    const contracts = await deployNewDaiFiAndApproveAndSupplyAttoDai(accounts, "1000000000000000001");
    assert.equal(await contracts.mockDai.balanceOf(accounts[0]), "0");
    await contracts.daiFi.withdrawAttoDai("1");
    assert.equal(await contracts.mockDai.balanceOf(accounts[0]), "1");
    await contracts.daiFi.withdrawAttoDai("1000000000000000000");
    assert.equal(await contracts.mockDai.balanceOf(accounts[0]), "1000000000000000001");
  });

  it("should decrease sender's attoDai supply when withdrawing attoDai", async () => {
    const contracts = await deployNewDaiFiAndApproveAndSupplyAttoDai(accounts, "1000000000000000001");
    await contracts.daiFi.withdrawAttoDai("1");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["wei_"].supplied, "0");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["wei_"].borrowed, "0");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["attoDai"].supplied, "1000000000000000000");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["attoDai"].borrowed, "0");
    await contracts.daiFi.withdrawAttoDai("1000000000000000000");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["attoDai"].supplied, "0");
  });

  it("should decrease total attoDai supply when withdrawing attoDai", async () => {
    const contracts = await deployNewDaiFiAndApproveAndSupplyAttoDai(accounts, "1000000000000000001");
    await contracts.daiFi.withdrawAttoDai("1");
    assert.equal((await contracts.daiFi.getTotalAttoDai()).supplied, "1000000000000000000");
    await contracts.daiFi.withdrawAttoDai("1000000000000000000");
    assert.equal((await contracts.daiFi.getTotalAttoDai()).supplied, "0");
  });

//================ BORROW ATTODAI ================

  it("should fail when borrowing 0 attoDai", async () => {
    const contracts = await deployNewDaiFiAndTransferAndCollateraliseAttoDai(accounts, "1");
    try {
      await contracts.daiFi.borrowAttoDai("0");
      throw null;
    } catch (error) {
      assertRevert(error, "borrowed zero attoDai");
    }
  });

  it("should increase sender's attoDai balance when borrowing attoDai", async () => {
    const contracts = await deployNewDaiFiAndTransferAndCollateraliseAttoDai(accounts, "1000000000000000001");
    assert.equal(await contracts.mockDai.balanceOf(accounts[0]), "0");
    await contracts.daiFi.borrowAttoDai("1");
    assert.equal(await contracts.mockDai.balanceOf(accounts[0]), "1");
    await contracts.daiFi.borrowAttoDai("1000000000000000000");
    assert.equal(await contracts.mockDai.balanceOf(accounts[0]), "1000000000000000001");
  });

  it("should increase sender's borrowed attoDai when borrowing attoDai", async () => {
    const contracts = await deployNewDaiFiAndTransferAndCollateraliseAttoDai(accounts, "1000000000000000001");
    await contracts.daiFi.borrowAttoDai("1");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["wei_"].supplied, BigNumber("1500000000000000200").dividedBy(WEI_ATTODAI_PRICE).toFixed(0));
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["wei_"].borrowed, "0");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["attoDai"].supplied, "0");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["attoDai"].borrowed, "1");
    await contracts.daiFi.borrowAttoDai("1000000000000000000");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["attoDai"].borrowed, "1000000000000000001");
  });

  it("should increase total attoDai borrowed when borrowing attoDai", async () => {
    const contracts = await deployNewDaiFiAndTransferAndCollateraliseAttoDai(accounts, "1000000000000000001");
    await contracts.daiFi.borrowAttoDai("1");
    assert.equal((await contracts.daiFi.getTotalAttoDai()).borrowed, "1");
    await contracts.daiFi.borrowAttoDai("1000000000000000000");
    assert.equal((await contracts.daiFi.getTotalAttoDai()).borrowed, "1000000000000000001");
  });

//================ REPAY ATTODAI ================

  it("should fail when repaying 0 attoDai", async () => {
    const contracts = await deployNewDaiFi();
    try {
      await contracts.daiFi.repayAttoDai("0");
      throw null;
    } catch (error) {
      assertRevert(error, "repaid zero attoDai");
    }
  });

  it("should fail when repaying unapproved attoDai", async () => {
    const contracts = await deployNewDaiFiAndTransferAndCollateraliseAndBorrowAttoDai(accounts, "2");
    await contracts.mockDai.approve(contracts.daiFi.address, "1");
    try {
      await contracts.daiFi.repayAttoDai("2");
      throw null;
    } catch (error) {
      assertRevert(error, "ERC20: transfer amount exceeds allowance");
    }
  });

  it("should fail when repaying more attoDai than borrowed", async () => {
    const contracts = await deployNewDaiFiAndTransferAndCollateraliseAndBorrowAttoDai(accounts, "1");
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
    const contracts = await deployNewDaiFiAndTransferAndCollateraliseAndBorrowAndApproveAttoDai(accounts, "1000000000000000001");
    assert.equal(await contracts.mockDai.balanceOf(contracts.daiFi.address), "0");
    await contracts.daiFi.repayAttoDai("1");
    assert.equal(await contracts.mockDai.balanceOf(contracts.daiFi.address), "1");
    await contracts.daiFi.repayAttoDai("1000000000000000000");
    assert.equal(await contracts.mockDai.balanceOf(contracts.daiFi.address), "1000000000000000001");
  });

  it("should decrease sender's borrowed attoDai when repaying attoDai", async () => {
    const contracts = await deployNewDaiFiAndTransferAndCollateraliseAndBorrowAndApproveAttoDai(accounts, "1000000000000000001");
    await contracts.daiFi.repayAttoDai("1");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["wei_"].supplied, BigNumber("1500000000000000200").dividedBy(WEI_ATTODAI_PRICE).toFixed(0));
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["wei_"].borrowed, "0");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["attoDai"].supplied, "0");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["attoDai"].borrowed, "1000000000000000000");
    await contracts.daiFi.repayAttoDai("1000000000000000000");
    assert.equal((await contracts.daiFi.getAccount(accounts[0]))["attoDai"].borrowed, "0");
  });

  it("should decrease total attoDai borrowed when repaying attoDai", async () => {
    const contracts = await deployNewDaiFiAndTransferAndCollateraliseAndBorrowAndApproveAttoDai(accounts, "1000000000000000001");
    await contracts.daiFi.repayAttoDai("1");
    assert.equal((await contracts.daiFi.getTotalAttoDai()).borrowed, "1000000000000000000");
    await contracts.daiFi.repayAttoDai("1000000000000000000");
    assert.equal((await contracts.daiFi.getTotalAttoDai()).borrowed, "0");
  });

});
