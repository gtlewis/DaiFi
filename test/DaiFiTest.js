const setup = require("./setup");
const truffleAssert = require('truffle-assertions');

contract("DaiFi", async accounts => {

  it("should fail whenever value sent", async () => {
    const contracts = await setup.deployContracts();
    truffleAssert.reverts(contracts.daiFi.send("1"), "revert");
  });

});
