const DaiFi = artifacts.require("DaiFi");

contract("DaiFi", async accounts => {

  it("should fail whenever value sent", async () => {
    const daiFi = await DaiFi.new("0x0000000000000000000000000000000000000000");
    try {
      await daiFi.send("1");
      throw null;
    } catch (error) {
      assert(error, "No revert error");
      assert.equal(error.message, "Returned error: VM Exception while processing transaction: revert");
    }
  });

});
