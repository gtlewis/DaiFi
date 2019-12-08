const { deployContracts, deployContractsWithZeroPriceOracle, deployContractsWithAboveMaxPriceOracle, MAX_UINT256 } = require("./setup");
const truffleAssert = require('truffle-assertions');
const BigNumber = require('bignumber.js');
BigNumber.set({ROUNDING_MODE: 1});

contract("DaiFiSystemTests", async accounts => {

  it("should pass all Wei system tests when price is valid", async () => {
    const { daiFi, mockDai } = await deployContracts();
    truffleAssert.passes(daiFi.supplyWei({value: "1"}));
    truffleAssert.passes(daiFi.withdrawWei("1"));
    truffleAssert.passes(daiFi.supplyWei({value: "1"}));
    truffleAssert.fails(daiFi.borrowAttoDai(MAX_UINT256), "SafeMath: multiplication overflow");
    truffleAssert.fails(daiFi.borrowAttoDai("1000"), "not enough collateral");
    truffleAssert.fails(daiFi.borrowAttoDai("100"), "ERC20: transfer amount exceeds balance");
    await mockDai.mint(daiFi.address, "100");
    truffleAssert.passes(daiFi.borrowAttoDai("100"));
    truffleAssert.fails(daiFi.withdrawWei("1"), "not enough collateral");
    const borrowedAttoDaiInterest = await daiFi.calculateBorrowedAttoDaiInterest(await daiFi.getAccount(accounts[0]));
    await mockDai.mint(accounts[0], borrowedAttoDaiInterest);
    await mockDai.approve(daiFi.address, BigNumber("101").plus(borrowedAttoDaiInterest));
    truffleAssert.fails(daiFi.repayAttoDai(BigNumber("101").plus(borrowedAttoDaiInterest)), "repaid more attoDai than borrowed");
    truffleAssert.passes(daiFi.repayAttoDai(BigNumber("100").plus(borrowedAttoDaiInterest)));
    truffleAssert.passes(daiFi.withdrawWei("1"));
  });

  it("should pass all attoDai system tests when price is valid", async () => {
    const { daiFi, mockDai } = await deployContracts();
    await mockDai.mint(accounts[0], "1");
    await mockDai.approve(daiFi.address, "1");
    truffleAssert.passes(daiFi.supplyAttoDai("1"));
    truffleAssert.passes(daiFi.withdrawAttoDai("1"));
    await mockDai.burn(accounts[0], "1");
    await mockDai.mint(accounts[0], MAX_UINT256);
    await mockDai.approve(daiFi.address, MAX_UINT256);
    truffleAssert.passes(daiFi.supplyAttoDai("1000"));
    truffleAssert.fails(daiFi.supplyAttoDai(MAX_UINT256), "SafeMath: addition overflow");
    truffleAssert.fails(daiFi.borrowWei(MAX_UINT256), "SafeMath: multiplication overflow");
    truffleAssert.fails(daiFi.borrowWei("10"), "not enough collateral");
    truffleAssert.fails(daiFi.borrowWei("1"), "revert");
    await daiFi.supplyWei({value: "1", from: accounts[1]});
    truffleAssert.passes(daiFi.borrowWei("1"));
    truffleAssert.fails(daiFi.withdrawAttoDai("1000"), "not enough collateral");
    const borrowedWeiInterest = await daiFi.calculateBorrowedWeiInterest(await daiFi.getAccount(accounts[0]));
    truffleAssert.fails(daiFi.repayWei({value: BigNumber("2").plus(borrowedWeiInterest)}), "repaid more Wei than borrowed");
    truffleAssert.passes(daiFi.repayWei({value: BigNumber("1").plus(borrowedWeiInterest)}));
    truffleAssert.passes(daiFi.withdrawAttoDai("1000"));
  });

  it("should fail at borrow attoDai when price is 0", async () => {
    const { daiFi } = await deployContractsWithZeroPriceOracle();
    truffleAssert.passes(daiFi.supplyWei({value: "1"}));
    truffleAssert.passes(daiFi.withdrawWei("1"));
    truffleAssert.passes(daiFi.supplyWei({value: "1"}));
    truffleAssert.fails(daiFi.borrowAttoDai(MAX_UINT256), "invalid Dai price");
  });

  it("should fail at borrow Wei when price is 0", async () => {
    const { daiFi, mockDai } = await deployContractsWithZeroPriceOracle();
    await mockDai.mint(accounts[0], "1");
    await mockDai.approve(daiFi.address, "1");
    truffleAssert.passes(daiFi.supplyAttoDai("1"));
    truffleAssert.passes(daiFi.withdrawAttoDai("1"));
    await mockDai.burn(accounts[0], "1");
    await mockDai.mint(accounts[0], MAX_UINT256);
    await mockDai.approve(daiFi.address, MAX_UINT256);
    truffleAssert.passes(daiFi.supplyAttoDai("1000"));
    truffleAssert.fails(daiFi.supplyAttoDai(MAX_UINT256), "SafeMath: addition overflow");
    truffleAssert.fails(daiFi.borrowWei(MAX_UINT256), "invalid Dai price");
  });

 it("should fail at borrow attoDai when price is greater than maximum price", async () => {
    const { daiFi } = await deployContractsWithAboveMaxPriceOracle();
    truffleAssert.passes(daiFi.supplyWei({value: "1"}));
    truffleAssert.passes(daiFi.withdrawWei("1"));
    truffleAssert.passes(daiFi.supplyWei({value: "1"}));
    truffleAssert.fails(daiFi.borrowAttoDai(MAX_UINT256), "invalid Dai price");
  });

  it("should fail at borrow Wei when price is greater than maximum price", async () => {
    const { daiFi, mockDai } = await deployContractsWithAboveMaxPriceOracle();
    await mockDai.mint(accounts[0], "1");
    await mockDai.approve(daiFi.address, "1");
    truffleAssert.passes(daiFi.supplyAttoDai("1"));
    truffleAssert.passes(daiFi.withdrawAttoDai("1"));
    await mockDai.burn(accounts[0], "1");
    await mockDai.mint(accounts[0], MAX_UINT256);
    await mockDai.approve(daiFi.address, MAX_UINT256);
    truffleAssert.passes(daiFi.supplyAttoDai("1000"));
    truffleAssert.fails(daiFi.supplyAttoDai(MAX_UINT256), "SafeMath: addition overflow");
    truffleAssert.fails(daiFi.borrowWei(MAX_UINT256), "invalid Dai price");
  });

});
