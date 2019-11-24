const DaiFi = artifacts.require("DaiFi");

const truffleAssert = require('truffle-assertions');

contract("DaiFi", async accounts => {

  it("should fail whenever value sent", async () => {
    const daiFi = await DaiFi.new("0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000");
    truffleAssert.reverts(daiFi.send("1"), "revert");
  });

});
