const { deployContracts } = require("./setup");
const truffleAssert = require('truffle-assertions');
const BigNumber = require('bignumber.js');
BigNumber.set({ROUNDING_MODE: 1});

//================ WEI HELPER FUNCTIONS ================

async function deployContractsAndSupplyWei(amount) {
  const contracts = await deployContracts();
  await contracts.daiFi.supplyWei({value: amount});
  return contracts;
}

async function deployContractsAndTransferAndCollateraliseWei(accounts, amount) {
  const contracts = await deployContracts();
  await transferWei(contracts, accounts, amount);
  await collateraliseWei(contracts, accounts, amount);
  return contracts;
}

async function deployContractsAndTransferAndCollateraliseAndBorrowWei(accounts, amount) {
  const contracts = await deployContractsAndTransferAndCollateraliseWei(accounts, amount);
  await contracts.daiFi.borrowWei(amount);
  return contracts;
}

async function transferWei(contracts, accounts, amount) {
  await contracts.daiFi.supplyWei({value: amount, from: accounts[1]});
}

async function collateraliseWei(contracts, accounts, amount) {
  const attoDaiPerWei = BigNumber(await contracts.mockDaiPriceOracle.read()).div("1000000000000000000");
  const attoDaiAmount = BigNumber(amount).times("1.5").plus("1").times(attoDaiPerWei).toFixed(0);
  await contracts.mockDai.mint(accounts[0], attoDaiAmount);
  await contracts.mockDai.approve(contracts.daiFi.address, attoDaiAmount);
  await contracts.daiFi.supplyAttoDai(attoDaiAmount);
}

//================ ATTODAI HELPER FUNCTIONS ================

async function deployContractsAndApproveAttoDai(accounts, amount) {
  const contracts = await deployContracts();
  await contracts.mockDai.mint(accounts[0], amount);
  await contracts.mockDai.approve(contracts.daiFi.address, amount);
  return contracts;
}

async function deployContractsAndApproveAndSupplyAttoDai(accounts, amount) {
  const contracts = await deployContractsAndApproveAttoDai(accounts, amount);
  await contracts.daiFi.supplyAttoDai(amount);
  return contracts;
}

async function deployContractsAndTransferAndCollateraliseAttoDai(accounts, amount) {
  const contracts = await deployContracts();
  await transferAttoDai(contracts, accounts, amount);
  await collateraliseAttoDai(contracts, accounts, amount);
  return contracts;
}

async function deployContractsAndTransferAndCollateraliseAndBorrowAttoDai(accounts, amount) {
  const contracts = await deployContractsAndTransferAndCollateraliseAttoDai(accounts, amount);
  await contracts.daiFi.borrowAttoDai(amount);
  return contracts;
}

async function deployContractsAndTransferAndCollateraliseAndBorrowAndApproveAttoDai(accounts, amount) {
  const contracts = await deployContractsAndTransferAndCollateraliseAndBorrowAttoDai(accounts, amount);
  await contracts.mockDai.approve(contracts.daiFi.address, amount);
  return contracts;
}

async function transferAttoDai(contracts, accounts, amount) {
  await contracts.mockDai.mint(accounts[1], amount);
  await contracts.mockDai.approve(contracts.daiFi.address, amount, {from: accounts[1]});
  await contracts.daiFi.supplyAttoDai(amount, {from: accounts[1]});
}

async function collateraliseAttoDai(contracts, accounts, amount) {
  const attoDaiPerWei = BigNumber(await contracts.mockDaiPriceOracle.read()).div("1000000000000000000");
  const weiAmount = BigNumber(amount).times("1.5").dividedBy(attoDaiPerWei).plus("1").toFixed(0);
  await contracts.daiFi.supplyWei({value: weiAmount});
}

//================ COMMON TESTS ================

contract("DaiFiActions", async accounts => {

  it("should initialise all supplied and borrowed balances as zero", async () => {
    const contracts = await deployContracts();
    const account = await contracts.daiFi.getAccount(accounts[0]);
    assert.equal((await contracts.daiFi.getTotalWei()).supplied, "0");
    assert.equal((await contracts.daiFi.getTotalWei()).borrowed, "0");
    assert.equal(account.wei_.supplied, "0");
    assert.equal(account.wei_.borrowed, "0");

    assert.equal((await contracts.daiFi.getTotalAttoDai()).supplied, "0");
    assert.equal((await contracts.daiFi.getTotalAttoDai()).borrowed, "0");
    assert.equal(account.attoDai.supplied, "0");
    assert.equal(account.attoDai.borrowed, "0");
  });

  it("should emit events for all actions", async () => {
    let contracts = await deployContracts();
    await transferWei(contracts, accounts, "1");
    await collateraliseWei(contracts, accounts, "1");
    let result = await contracts.daiFi.supplyWei({value: "1"});
    truffleAssert.eventEmitted(result, "WeiSupplied");
    truffleAssert.eventEmitted(result, "SuppliedWeiInterestApplied");
    result = await contracts.daiFi.withdrawWei("1");
    truffleAssert.eventEmitted(result, "WeiWithdrawn");
    truffleAssert.eventEmitted(result, "SuppliedWeiInterestApplied");
    truffleAssert.eventEmitted(result, "BorrowedAttoDaiInterestApplied");
    result = await contracts.daiFi.borrowWei("1");
    truffleAssert.eventEmitted(result, "WeiBorrowed");
    truffleAssert.eventEmitted(result, "BorrowedWeiInterestApplied");
    truffleAssert.eventEmitted(result, "SuppliedAttoDaiInterestApplied");
    result = await contracts.daiFi.repayWei({value: "1"});
    truffleAssert.eventEmitted(result, "WeiRepaid");
    truffleAssert.eventEmitted(result, "BorrowedWeiInterestApplied");

    contracts = await deployContractsAndApproveAttoDai(accounts, "2");
    await transferAttoDai(contracts, accounts, "1");
    await collateraliseAttoDai(contracts, accounts, "1");
    result = await contracts.daiFi.supplyAttoDai("1");
    truffleAssert.eventEmitted(result, "AttoDaiSupplied");
    truffleAssert.eventEmitted(result, "SuppliedAttoDaiInterestApplied");
    result = await contracts.daiFi.withdrawAttoDai("1");
    truffleAssert.eventEmitted(result, "AttoDaiWithdrawn");
    truffleAssert.eventEmitted(result, "SuppliedAttoDaiInterestApplied");
    truffleAssert.eventEmitted(result, "BorrowedWeiInterestApplied");
    result = await contracts.daiFi.borrowAttoDai("1");
    truffleAssert.eventEmitted(result, "AttoDaiBorrowed");
    truffleAssert.eventEmitted(result, "BorrowedAttoDaiInterestApplied");
    truffleAssert.eventEmitted(result, "SuppliedWeiInterestApplied");
    result = await contracts.daiFi.repayAttoDai("1");
    truffleAssert.eventEmitted(result, "AttoDaiRepaid");
    truffleAssert.eventEmitted(result, "BorrowedAttoDaiInterestApplied");
  });

//================ SUPPLY WEI ================

  it("should fail when supplying 0 Wei", async () => {
    const contracts = await deployContracts();
    truffleAssert.reverts(contracts.daiFi.supplyWei(), "supplied zero Wei");
  });

  it("should increase own wei balance when supplying Wei", async () => {
    const contracts = await deployContractsAndSupplyWei("1");
    assert.equal(await web3.eth.getBalance(contracts.daiFi.address), "1");
    await contracts.daiFi.supplyWei({value: "1000000000000000000"});
    assert.equal(await web3.eth.getBalance(contracts.daiFi.address), "1000000000000000001");
  });

  it("should increase sender's Wei supply when supplying Wei", async () => {
    const contracts = await deployContractsAndSupplyWei("1");
    const accountBlock0 = await contracts.daiFi.getAccount(accounts[0]);
    assert.equal(accountBlock0.wei_.supplied, "1");
    assert.equal(accountBlock0.wei_.borrowed, "0");
    assert.equal(accountBlock0.attoDai.supplied, "0");
    assert.equal(accountBlock0.attoDai.borrowed, "0");
    await contracts.daiFi.supplyWei({value: "1000000000000000000"});
    const suppliedWeiInterestBlock1 = await contracts.daiFi.calculateSuppliedWeiInterest(accountBlock0);
    const accountBlock1 = await contracts.daiFi.getAccount(accounts[0]);
    assert.equal(accountBlock1.wei_.supplied, BigNumber("1000000000000000001").plus(suppliedWeiInterestBlock1));
  });

  it("should increase total Wei supply when supplying Wei", async () => {
    const contracts = await deployContractsAndSupplyWei("1");
    const accountBlock0 = await contracts.daiFi.getAccount(accounts[0]);
    assert.equal((await contracts.daiFi.getTotalWei()).supplied, "1");
    await contracts.daiFi.supplyWei({value: "1000000000000000000"});
    const suppliedWeiInterestBlock1 = await contracts.daiFi.calculateSuppliedWeiInterest(accountBlock0);
    assert.equal((await contracts.daiFi.getTotalWei()).supplied, BigNumber("1000000000000000001").plus(suppliedWeiInterestBlock1));
  });

//================ WITHDRAW WEI ================

  it("should fail when withdrawing 0 Wei", async () => {
    const contracts = await deployContracts();
    truffleAssert.reverts(contracts.daiFi.withdrawWei("0"), "withdrew zero Wei");
  });

  it("should fail when withdrawing more Wei than supplied", async () => {
    const contracts = await deployContractsAndSupplyWei("1");
    truffleAssert.reverts(contracts.daiFi.withdrawWei("2"), "withdrew more Wei than supplied");
  });

  it("should fail when withdrawing Wei required as collateral", async () => {
    const contracts = await deployContractsAndTransferAndCollateraliseAndBorrowAttoDai(accounts, "1");
    truffleAssert.reverts(contracts.daiFi.withdrawWei("1"), "not enough collateral");
  });

  it("should increase sender's wei balance when withdrawing Wei", async () => {
    const contracts = await deployContractsAndSupplyWei("1000000000000000001");
    const initialBalance = BigNumber(await web3.eth.getBalance(accounts[0]));
    await contracts.daiFi.withdrawWei("1", {gasPrice: "0"});
    assert.equal(await web3.eth.getBalance(accounts[0]), initialBalance.plus("1"));
    await contracts.daiFi.withdrawWei("1000000000000000000", {gasPrice: "0"});
    assert.equal(await web3.eth.getBalance(accounts[0]), initialBalance.plus("1000000000000000001"));
  });

  it("should decrease sender's Wei supply when withdrawing Wei", async () => {
    const contracts = await deployContractsAndSupplyWei("1000000000000000001");
    const accountBlock0 = await contracts.daiFi.getAccount(accounts[0]);
    await contracts.daiFi.withdrawWei("1");
    const suppliedWeiInterestBlock1 = await contracts.daiFi.calculateSuppliedWeiInterest(accountBlock0);
    const accountBlock1 = await contracts.daiFi.getAccount(accounts[0]);
    assert.equal(accountBlock1.wei_.supplied, BigNumber("1000000000000000000").plus(suppliedWeiInterestBlock1));
    assert.equal(accountBlock1.wei_.borrowed, "0");
    assert.equal(accountBlock1.attoDai.supplied, "0");
    assert.equal(accountBlock1.attoDai.borrowed, "0");
    await contracts.daiFi.withdrawWei("1000000000000000000");
    const suppliedWeiInterestBlock2 = await contracts.daiFi.calculateSuppliedWeiInterest(accountBlock1);
    const accountBlock2 = await contracts.daiFi.getAccount(accounts[0]);
    assert.equal(accountBlock2.wei_.supplied, BigNumber("0").plus(suppliedWeiInterestBlock1).plus(suppliedWeiInterestBlock2));
  });

  it("should decrease total Wei supply when withdrawing Wei", async () => {
    const contracts = await deployContractsAndSupplyWei("1000000000000000001");
    const accountBlock0 = await contracts.daiFi.getAccount(accounts[0]);
    await contracts.daiFi.withdrawWei("1");
    const suppliedWeiInterestBlock1 = await contracts.daiFi.calculateSuppliedWeiInterest(accountBlock0);
    const accountBlock1 = await contracts.daiFi.getAccount(accounts[0]);
    assert.equal((await contracts.daiFi.getTotalWei()).supplied, BigNumber("1000000000000000000").plus(suppliedWeiInterestBlock1));
    await contracts.daiFi.withdrawWei("1000000000000000000");
    const suppliedWeiInterestBlock2 = await contracts.daiFi.calculateSuppliedWeiInterest(accountBlock1);
    assert.equal((await contracts.daiFi.getTotalWei()).supplied, BigNumber("0").plus(suppliedWeiInterestBlock1).plus(suppliedWeiInterestBlock2));
  });

//================ BORROW WEI ================

  it("should fail when borrowing 0 Wei", async () => {
    const contracts = await deployContractsAndTransferAndCollateraliseWei(accounts, "1");
    truffleAssert.reverts(contracts.daiFi.borrowWei("0"), "borrowed zero Wei");
  });

  it("should fail when borrowing Wei if insufficient collateral", async () => {
    const contracts = await deployContracts();
    await transferWei(contracts, accounts, "1");
    truffleAssert.reverts(contracts.daiFi.borrowWei("1"), "not enough collateral");
  });

  it("should increase sender's wei balance when borrowing Wei", async () => {
    const contracts = await deployContractsAndTransferAndCollateraliseWei(accounts, "1000000000000000001");
    const initialBalance = BigNumber(await web3.eth.getBalance(accounts[0]));
    await contracts.daiFi.borrowWei("1", {gasPrice: "0"});
    assert.equal(await web3.eth.getBalance(accounts[0]), initialBalance.plus("1"));
    await contracts.daiFi.borrowWei("1000000000000000000", {gasPrice: "0"});
    assert.equal(await web3.eth.getBalance(accounts[0]), initialBalance.plus("1000000000000000001"));
  });

  it("should increase sender's borrowed Wei when borrowing Wei", async () => {
    const contracts = await deployContractsAndTransferAndCollateraliseWei(accounts, "1000000000000000001");
    const attoDaiPerWei = BigNumber(await contracts.mockDaiPriceOracle.read()).div("1000000000000000000");
    const accountBlock0 = await contracts.daiFi.getAccount(accounts[0]);
    await contracts.daiFi.borrowWei("1");
    const borrowedWeiInterestBlock1 = await contracts.daiFi.calculateBorrowedWeiInterest(accountBlock0);
    const suppliedAttoDaiInterestBlock1 = await contracts.daiFi.calculateSuppliedAttoDaiInterest(accountBlock0);
    const accountBlock1 = await contracts.daiFi.getAccount(accounts[0]);
    assert.equal(accountBlock1.wei_.supplied, "0");
    assert.equal(accountBlock1.wei_.borrowed, BigNumber("1").plus(borrowedWeiInterestBlock1));
    assert.equal(accountBlock1.attoDai.supplied, BigNumber("1500000000000000002.5").times(attoDaiPerWei).plus(suppliedAttoDaiInterestBlock1).toFixed(0));
    assert.equal(accountBlock1.attoDai.borrowed, "0");
    await contracts.daiFi.borrowWei("1000000000000000000");
    const borrowedWeiInterestBlock2 = await contracts.daiFi.calculateBorrowedWeiInterest(accountBlock1);
    const accountBlock2 = await contracts.daiFi.getAccount(accounts[0]);
    assert.equal(accountBlock2.wei_.borrowed, BigNumber("1000000000000000001").plus(borrowedWeiInterestBlock1).plus(borrowedWeiInterestBlock2));
  });

  it("should increase total Wei supply when borrowing Wei", async () => {
    const contracts = await deployContractsAndTransferAndCollateraliseWei(accounts, "1000000000000000001");
    const accountBlock0 = await contracts.daiFi.getAccount(accounts[0]);
    await contracts.daiFi.borrowWei("1");
    const borrowedWeiInterestBlock1 = await contracts.daiFi.calculateBorrowedWeiInterest(accountBlock0);
    const accountBlock1 = await contracts.daiFi.getAccount(accounts[0]);
    assert.equal((await contracts.daiFi.getTotalWei()).borrowed, BigNumber("1").plus(borrowedWeiInterestBlock1));
    await contracts.daiFi.borrowWei("1000000000000000000");
    const borrowedWeiInterestBlock2 = await contracts.daiFi.calculateBorrowedWeiInterest(accountBlock1);
    assert.equal((await contracts.daiFi.getTotalWei()).borrowed, BigNumber("1000000000000000001").plus(borrowedWeiInterestBlock1).plus(borrowedWeiInterestBlock2));
  });

//================ REPAY WEI ================

  it("should fail when repaying 0 Wei", async () => {
    const contracts = await deployContracts();
    truffleAssert.reverts(contracts.daiFi.repayWei(), "repaid zero Wei");
  });

  it("should fail when repaying more Wei than borrowed", async () => {
    const contracts = await deployContractsAndTransferAndCollateraliseAndBorrowWei(accounts, "1");
    truffleAssert.reverts(contracts.daiFi.repayWei({value: "2"}), "repaid more Wei than borrowed");
  });

  it("should increase own wei balance when repaying Wei", async () => {
    const contracts = await deployContractsAndTransferAndCollateraliseAndBorrowWei(accounts, "1000000000000000001");
    assert.equal(await web3.eth.getBalance(contracts.daiFi.address), "0");
    await contracts.daiFi.repayWei({value: "1"});
    assert.equal(await web3.eth.getBalance(contracts.daiFi.address), "1");
    await contracts.daiFi.repayWei({value: "1000000000000000000"});
    assert.equal(await web3.eth.getBalance(contracts.daiFi.address), "1000000000000000001");
  });

  it("should decrease sender's borrowed Wei when repaying Wei", async () => {
    const contracts = await deployContractsAndTransferAndCollateraliseAndBorrowWei(accounts, "1000000000000000001");
    const accountBlock0 = await contracts.daiFi.getAccount(accounts[0]);
    await contracts.daiFi.repayWei({value: "1"});
    const borrowedWeiInterestBlock1 = await contracts.daiFi.calculateBorrowedWeiInterest(accountBlock0);
    const accountBlock1 = await contracts.daiFi.getAccount(accounts[0]);
    assert.equal(accountBlock1.wei_.supplied, "0");
    assert.equal(accountBlock1.wei_.borrowed, BigNumber("1000000000000000000").plus(borrowedWeiInterestBlock1));
    assert.equal(accountBlock1.attoDai.supplied, accountBlock0.attoDai.supplied);
    assert.equal(accountBlock1.attoDai.borrowed, "0");
    await contracts.daiFi.repayWei({value: "1000000000000000000"});
    const borrowedWeiInterestBlock2 = await contracts.daiFi.calculateBorrowedWeiInterest(accountBlock1);
    const accountBlock2 = await contracts.daiFi.getAccount(accounts[0]);
    assert.equal(accountBlock2.wei_.borrowed, BigNumber("0").plus(borrowedWeiInterestBlock1).plus(borrowedWeiInterestBlock2));
  });

  it("should decrease total borrowed Wei when repaying Wei", async () => {
    const contracts = await deployContractsAndTransferAndCollateraliseAndBorrowWei(accounts, "1000000000000000001");
    const accountBlock0 = await contracts.daiFi.getAccount(accounts[0]);
    await contracts.daiFi.repayWei({value: "1"});
    const borrowedWeiInterestBlock1 = await contracts.daiFi.calculateBorrowedWeiInterest(accountBlock0);
    const accountBlock1 = await contracts.daiFi.getAccount(accounts[0]);
    assert.equal((await contracts.daiFi.getTotalWei()).borrowed, BigNumber("1000000000000000000").plus(borrowedWeiInterestBlock1));
    await contracts.daiFi.repayWei({value: "1000000000000000000"});
    const borrowedWeiInterestBlock2 = await contracts.daiFi.calculateBorrowedWeiInterest(accountBlock1);
    assert.equal((await contracts.daiFi.getTotalWei()).borrowed, BigNumber("0").plus(borrowedWeiInterestBlock1).plus(borrowedWeiInterestBlock2));
  });

//================ SUPPLY ATTODAI ================

  it("should fail when supplying 0 attoDai", async () => {
    const contracts = await deployContracts();
    truffleAssert.reverts(contracts.daiFi.supplyAttoDai("0"), "supplied zero attoDai");
  });

  it("should fail when supplying unapproved attoDai", async () => {
    const contracts = await deployContracts();
    await contracts.mockDai.mint(accounts[0], "2");
    await contracts.mockDai.approve(contracts.daiFi.address, "1");
    truffleAssert.reverts(contracts.daiFi.supplyAttoDai("2"), "ERC20: transfer amount exceeds allowance");
  });

  it("should increase own attoDai balance when supplying attoDai", async () => {
    const contracts = await deployContractsAndApproveAttoDai(accounts, "1000000000000000001");
    await contracts.daiFi.supplyAttoDai("1");
    assert.equal(await contracts.mockDai.balanceOf(contracts.daiFi.address), "1");
    await contracts.daiFi.supplyAttoDai("1000000000000000000");
    assert.equal(await contracts.mockDai.balanceOf(contracts.daiFi.address), "1000000000000000001");
  });

  it("should increase sender's attoDai supply when supplying attoDai", async () => {
    const contracts = await deployContractsAndApproveAttoDai(accounts, "1000000000000000001");
    await contracts.daiFi.supplyAttoDai("1");
    const accountBlock0 = await contracts.daiFi.getAccount(accounts[0]);
    assert.equal(accountBlock0.wei_.supplied, "0");
    assert.equal(accountBlock0.wei_.borrowed, "0");
    assert.equal(accountBlock0.attoDai.supplied, "1");
    assert.equal(accountBlock0.attoDai.borrowed, "0");
    await contracts.daiFi.supplyAttoDai("1000000000000000000");
    const suppliedAttoDaiInterestBlock1 = await contracts.daiFi.calculateSuppliedAttoDaiInterest(accountBlock0);
    const accountBlock1 = await contracts.daiFi.getAccount(accounts[0]);
    assert.equal(accountBlock1.attoDai.supplied, BigNumber("1000000000000000001").plus(suppliedAttoDaiInterestBlock1));
  });

  it("should increase total attoDai supply when supplying attoDai", async () => {
    const contracts = await deployContractsAndApproveAttoDai(accounts, "1000000000000000001");
    await contracts.daiFi.supplyAttoDai("1");
    const accountBlock0 = await contracts.daiFi.getAccount(accounts[0]);
    assert.equal((await contracts.daiFi.getTotalAttoDai()).supplied, "1");
    await contracts.daiFi.supplyAttoDai("1000000000000000000");
    const suppliedAttoDaiInterestBlock1 = await contracts.daiFi.calculateSuppliedAttoDaiInterest(accountBlock0);
    assert.equal((await contracts.daiFi.getTotalAttoDai()).supplied, BigNumber("1000000000000000001").plus(suppliedAttoDaiInterestBlock1));
  });

//================ WITHDRAW ATTODAI ================

  it("should fail when withdrawing 0 attoDai", async () => {
    const contracts = await deployContracts();
    truffleAssert.reverts(contracts.daiFi.withdrawAttoDai("0"), "withdrew zero attoDai");
  });

  it("should fail when withdrawing more attoDai than supplied", async () => {
    const contracts = await deployContractsAndApproveAndSupplyAttoDai(accounts, "1");
    truffleAssert.reverts(contracts.daiFi.withdrawAttoDai("2"), "withdrew more attoDai than supplied");
  });

  it("should fail when withdrawing attoDai required as collateral", async () => {
    const contracts = await deployContractsAndTransferAndCollateraliseAndBorrowWei(accounts, "1");
    const attoDaiPerWei = BigNumber(await contracts.mockDaiPriceOracle.read()).div("1000000000000000000");
    truffleAssert.reverts(contracts.daiFi.withdrawAttoDai(attoDaiPerWei.times("1").toFixed(0)), "not enough collateral");
  });

  it("should increase sender's attoDai balance when withdrawing attoDai", async () => {
    const contracts = await deployContractsAndApproveAndSupplyAttoDai(accounts, "1000000000000000001");
    assert.equal(await contracts.mockDai.balanceOf(accounts[0]), "0");
    await contracts.daiFi.withdrawAttoDai("1");
    assert.equal(await contracts.mockDai.balanceOf(accounts[0]), "1");
    await contracts.daiFi.withdrawAttoDai("1000000000000000000");
    assert.equal(await contracts.mockDai.balanceOf(accounts[0]), "1000000000000000001");
  });

  it("should decrease sender's attoDai supply when withdrawing attoDai", async () => {
    const contracts = await deployContractsAndApproveAndSupplyAttoDai(accounts, "1000000000000000001");
    const accountBlock0 = await contracts.daiFi.getAccount(accounts[0]);
    await contracts.daiFi.withdrawAttoDai("1");
    const suppliedAttoDaiInterestBlock1 = await contracts.daiFi.calculateSuppliedAttoDaiInterest(accountBlock0);
    const accountBlock1 = await contracts.daiFi.getAccount(accounts[0]);
    assert.equal(accountBlock1.wei_.supplied, "0");
    assert.equal(accountBlock1.wei_.borrowed, "0");
    assert.equal(accountBlock1.attoDai.supplied, BigNumber("1000000000000000000").plus(suppliedAttoDaiInterestBlock1));
    assert.equal(accountBlock1.attoDai.borrowed, "0");
    await contracts.daiFi.withdrawAttoDai("1000000000000000000");
    const suppliedAttoDaiInterestBlock2 = await contracts.daiFi.calculateSuppliedAttoDaiInterest(accountBlock1);
    const accountBlock2 = await contracts.daiFi.getAccount(accounts[0]);
    assert.equal(accountBlock2.attoDai.supplied, BigNumber("0").plus(suppliedAttoDaiInterestBlock1).plus(suppliedAttoDaiInterestBlock2));
  });

  it("should decrease total attoDai supply when withdrawing attoDai", async () => {
    const contracts = await deployContractsAndApproveAndSupplyAttoDai(accounts, "1000000000000000001");
    const accountBlock0 = await contracts.daiFi.getAccount(accounts[0]);
    await contracts.daiFi.withdrawAttoDai("1");
    const suppliedAttoDaiInterestBlock1 = await contracts.daiFi.calculateSuppliedAttoDaiInterest(accountBlock0);
    const accountBlock1 = await contracts.daiFi.getAccount(accounts[0]);
    assert.equal((await contracts.daiFi.getTotalAttoDai()).supplied, BigNumber("1000000000000000000").plus(suppliedAttoDaiInterestBlock1));
    await contracts.daiFi.withdrawAttoDai("1000000000000000000");
    const suppliedAttoDaiInterestBlock2 = await contracts.daiFi.calculateSuppliedAttoDaiInterest(accountBlock1);
    assert.equal((await contracts.daiFi.getTotalAttoDai()).supplied, BigNumber("0").plus(suppliedAttoDaiInterestBlock1).plus(suppliedAttoDaiInterestBlock2));
  });

//================ BORROW ATTODAI ================

  it("should fail when borrowing 0 attoDai", async () => {
    const contracts = await deployContractsAndTransferAndCollateraliseAttoDai(accounts, "1");
    truffleAssert.reverts(contracts.daiFi.borrowAttoDai("0"), "borrowed zero attoDai");
  });

  it("should fail when borrowing attoDai if insufficient collateral", async () => {
    const contracts = await deployContracts();
    await transferAttoDai(contracts, accounts, "1");
    truffleAssert.reverts(contracts.daiFi.borrowAttoDai("1"), "not enough collateral");
  });

  it("should increase sender's attoDai balance when borrowing attoDai", async () => {
    const contracts = await deployContractsAndTransferAndCollateraliseAttoDai(accounts, "1000000000000000001");
    assert.equal(await contracts.mockDai.balanceOf(accounts[0]), "0");
    await contracts.daiFi.borrowAttoDai("1");
    assert.equal(await contracts.mockDai.balanceOf(accounts[0]), "1");
    await contracts.daiFi.borrowAttoDai("1000000000000000000");
    assert.equal(await contracts.mockDai.balanceOf(accounts[0]), "1000000000000000001");
  });

  it("should increase sender's borrowed attoDai when borrowing attoDai", async () => {
    const contracts = await deployContractsAndTransferAndCollateraliseAttoDai(accounts, "1000000000000000001");
    const attoDaiPerWei = BigNumber(await contracts.mockDaiPriceOracle.read()).div("1000000000000000000");
    const accountBlock0 = await contracts.daiFi.getAccount(accounts[0]);
    await contracts.daiFi.borrowAttoDai("1");
    const borrowedAttoDaiInterestBlock1 = await contracts.daiFi.calculateBorrowedAttoDaiInterest(accountBlock0);
    const suppliedWeiInterestBlock1 = await contracts.daiFi.calculateSuppliedWeiInterest(accountBlock0);
    const accountBlock1 = await contracts.daiFi.getAccount(accounts[0]);
    assert.equal(accountBlock1.wei_.supplied, BigNumber("1500000000000000200").dividedBy(attoDaiPerWei).plus(suppliedWeiInterestBlock1).toFixed(0));
    assert.equal(accountBlock1.wei_.borrowed, "0");
    assert.equal(accountBlock1.attoDai.supplied, "0");
    assert.equal(accountBlock1.attoDai.borrowed, BigNumber("1").plus(borrowedAttoDaiInterestBlock1));
    await contracts.daiFi.borrowAttoDai("1000000000000000000");
    const borrowedAttoDaiInterestBlock2 = await contracts.daiFi.calculateBorrowedAttoDaiInterest(accountBlock1);
    const accountBlock2 = await contracts.daiFi.getAccount(accounts[0]);
    assert.equal(accountBlock2.attoDai.borrowed, BigNumber("1000000000000000001").plus(borrowedAttoDaiInterestBlock1).plus(borrowedAttoDaiInterestBlock2));
  });

  it("should increase total attoDai borrowed when borrowing attoDai", async () => {
    const contracts = await deployContractsAndTransferAndCollateraliseAttoDai(accounts, "1000000000000000001");
    const accountBlock0 = await contracts.daiFi.getAccount(accounts[0]);
    await contracts.daiFi.borrowAttoDai("1");
    const borrowedAttoDaiInterestBlock1 = await contracts.daiFi.calculateBorrowedAttoDaiInterest(accountBlock0);
    const accountBlock1 = await contracts.daiFi.getAccount(accounts[0]);
    assert.equal((await contracts.daiFi.getTotalAttoDai()).borrowed, BigNumber("1").plus(borrowedAttoDaiInterestBlock1));
    await contracts.daiFi.borrowAttoDai("1000000000000000000");
    const borrowedAttoDaiInterestBlock2 = await contracts.daiFi.calculateBorrowedAttoDaiInterest(accountBlock1);
    assert.equal((await contracts.daiFi.getTotalAttoDai()).borrowed, BigNumber("1000000000000000001").plus(borrowedAttoDaiInterestBlock1).plus(borrowedAttoDaiInterestBlock2));
  });

//================ REPAY ATTODAI ================

  it("should fail when repaying 0 attoDai", async () => {
    const contracts = await deployContracts();
    truffleAssert.reverts(contracts.daiFi.repayAttoDai("0"), "repaid zero attoDai");
  });

  it("should fail when repaying unapproved attoDai", async () => {
    const contracts = await deployContractsAndTransferAndCollateraliseAndBorrowAttoDai(accounts, "2");
    await contracts.mockDai.approve(contracts.daiFi.address, "1");
    truffleAssert.reverts(contracts.daiFi.repayAttoDai("2"), "ERC20: transfer amount exceeds allowance");
  });

  it("should fail when repaying more attoDai than borrowed", async () => {
    const contracts = await deployContractsAndTransferAndCollateraliseAndBorrowAttoDai(accounts, "1");
    await contracts.mockDai.mint(accounts[0], "1");
    await contracts.mockDai.approve(contracts.daiFi.address, "2");
    truffleAssert.reverts(contracts.daiFi.repayAttoDai("2"), "repaid more attoDai than borrowed");
  });

  it("should increase own attoDai balance when repaying attoDai", async () => {
    const contracts = await deployContractsAndTransferAndCollateraliseAndBorrowAndApproveAttoDai(accounts, "1000000000000000001");
    assert.equal(await contracts.mockDai.balanceOf(contracts.daiFi.address), "0");
    await contracts.daiFi.repayAttoDai("1");
    assert.equal(await contracts.mockDai.balanceOf(contracts.daiFi.address), "1");
    await contracts.daiFi.repayAttoDai("1000000000000000000");
    assert.equal(await contracts.mockDai.balanceOf(contracts.daiFi.address), "1000000000000000001");
  });

  it("should decrease sender's borrowed attoDai when repaying attoDai", async () => {
    const contracts = await deployContractsAndTransferAndCollateraliseAndBorrowAndApproveAttoDai(accounts, "1000000000000000001");
    const accountBlock0 = await contracts.daiFi.getAccount(accounts[0]);
    await contracts.daiFi.repayAttoDai("1");
    const borrowedAttoDaiInterestBlock1 = await contracts.daiFi.calculateBorrowedAttoDaiInterest(accountBlock0);
    const accountBlock1 = await contracts.daiFi.getAccount(accounts[0]);
    assert.equal(accountBlock1.wei_.supplied, accountBlock0.wei_.supplied);
    assert.equal(accountBlock1.wei_.borrowed, "0");
    assert.equal(accountBlock1.attoDai.supplied, "0");
    assert.equal(accountBlock1.attoDai.borrowed, BigNumber("1000000000000000000").plus(borrowedAttoDaiInterestBlock1));
    await contracts.daiFi.repayAttoDai("1000000000000000000");
    const borrowedAttoDaiInterestBlock2 = await contracts.daiFi.calculateBorrowedAttoDaiInterest(accountBlock1);
    const accountBlock2 = await contracts.daiFi.getAccount(accounts[0]);
    assert.equal(accountBlock2.attoDai.borrowed, BigNumber("0").plus(borrowedAttoDaiInterestBlock1).plus(borrowedAttoDaiInterestBlock2));
  });

  it("should decrease total attoDai borrowed when repaying attoDai", async () => {
    const contracts = await deployContractsAndTransferAndCollateraliseAndBorrowAndApproveAttoDai(accounts, "1000000000000000001");
    const accountBlock0 = await contracts.daiFi.getAccount(accounts[0]);
    await contracts.daiFi.repayAttoDai("1");
    const borrowedAttoDaiInterestBlock1 = await contracts.daiFi.calculateBorrowedAttoDaiInterest(accountBlock0);
    const accountBlock1 = await contracts.daiFi.getAccount(accounts[0]);
    assert.equal((await contracts.daiFi.getTotalAttoDai()).borrowed, BigNumber("1000000000000000000").plus(borrowedAttoDaiInterestBlock1));
    await contracts.daiFi.repayAttoDai("1000000000000000000");
    const borrowedAttoDaiInterestBlock2 = await contracts.daiFi.calculateBorrowedAttoDaiInterest(accountBlock1);
    assert.equal((await contracts.daiFi.getTotalAttoDai()).borrowed, BigNumber("0").plus(borrowedAttoDaiInterestBlock1).plus(borrowedAttoDaiInterestBlock2));
  });

});
