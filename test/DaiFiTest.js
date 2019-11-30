const { deployContracts } = require("./setup");
const truffleAssert = require('truffle-assertions');

contract("DaiFi", async accounts => {

  it("should fail whenever value sent", async () => {
    const { daiFi } = await deployContracts();
    truffleAssert.reverts(daiFi.send("1"), "revert");
  });

});
