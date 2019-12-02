const { deployContracts, deployContractsWithZeroPriceOracle, deployContractsWithAboveMaxPriceOracle, MAX_UINT256 } = require("./setup");
const truffleAssert = require('truffle-assertions');

async function mintAndApproveAttoDai(daiFi, mockDai, accounts, amount) {
}

contract("DaiFiSystemTests", async accounts => {

  it("should pass all Wei system tests when price is valid", async () => {
    const { daiFi, mockDai } = await deployContracts();
    truffleAssert.passes(daiFi.supplyWei({value: "1"}));
    truffleAssert.passes(daiFi.withdrawWei("1"));
    truffleAssert.passes(daiFi.supplyWei({value: "1"}));
    truffleAssert.fails(daiFi.borrowAttoDai(MAX_UINT256), "SafeMath: multiplication overflow");
    truffleAssert.fails(daiFi.borrowAttoDai("1000"), "not enough collateral");
    truffleAssert.fails(daiFi.borrowAttoDai("100"), "ERC20: transfer amount exceeds balance");
    await mockDai.mint(accounts[1], "100");
    await mockDai.approve(daiFi.address, "100", {from: accounts[1]});
    await daiFi.supplyAttoDai("100", {from: accounts[1]});
    truffleAssert.passes(daiFi.borrowAttoDai("100"));
    truffleAssert.fails(daiFi.withdrawWei("1"), "not enough collateral");
    await mockDai.approve(daiFi.address, "101");
    truffleAssert.fails(daiFi.repayAttoDai("101"), "repaid more attoDai than borrowed");
    truffleAssert.passes(daiFi.repayAttoDai("100"));
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
    truffleAssert.fails(daiFi.repayWei({value: "2"}), "repaid more Wei than borrowed");
    truffleAssert.passes(daiFi.repayWei({value: "1"}));
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
    await mintAndApproveAttoDai(daiFi, mockDai, accounts, MAX_UINT256);
    await mockDai.mint(accounts[0], MAX_UINT256);
    await mockDai.approve(daiFi.address, MAX_UINT256);
    truffleAssert.passes(daiFi.supplyAttoDai("1000"));
    truffleAssert.fails(daiFi.supplyAttoDai(MAX_UINT256), "SafeMath: addition overflow");
    truffleAssert.fails(daiFi.borrowWei(MAX_UINT256), "invalid Dai price");
  });

});
