var MySale = artifacts.require("./MySale.sol");
var MyCrowdsaleToken = artifacts.require("./MyCrowdsaleToken.sol");

var waitForBlock = require("./helpers/waitForBlock");

contract('MySale', function(accounts) {
  var initialEndBlock
  it("should not activate hardCap", async function() {
    var instance = await MySale.deployed();
    initialEndBlock = await instance.endBlock();

    instance.setHardCap(web3.toWei(6.0, 'ether'))
    var hardCap = await instance.hardCap()

    assert.equal(hardCap.valueOf(), 0, "hard cap was set")
  });

  it("will wait 40 blocks for presale end (please wait)", async function() {
    var instance = await MySale.deployed();
    var targetBlock = web3.eth.blockNumber+41;
    console.log("    ...advancing blocks, please wait...")
    await waitForBlock(targetBlock);
    assert.equal(targetBlock, web3.eth.blockNumber, "Blocks not elapsed");
  });

  it("should activate hardCap and not activate", async function() {
    var instance = await MySale.deployed();
    instance.setHardCap(web3.toWei(2.1, 'ether'))
    var endBlock = await instance.endBlock()
    assert.equal(endBlock.valueOf(), initialEndBlock.valueOf(), "final block was set")
  });

  it("should allow token pregeneration", async function() {
    var instance = await MySale.deployed();
    var address = await instance.pregenTokens(accounts[6], web3.toWei(0.002, 'ether'), web3.toWei(1000, 'ether'));
    
    var tokenAddress = await instance.token();
    var tokInstance = MyCrowdsaleToken.at(tokenAddress);

    var balance = await tokInstance.balanceOf(accounts[6]);

    assert.equal(balance.valueOf(), 1e+21, "token pregeneration failed");
  });

  it("should not allow token pregeneration if not owner", async function() {
    var instance = await MySale.deployed();
    var tokenAddress = await instance.token();
    var tokInstance = MyCrowdsaleToken.at(tokenAddress);

    instance.pregenTokens(accounts[6], web3.toWei(0.002, 'ether'), web3.toWei(1000, 'ether'), {from: accounts[1]}).then(function() {}, function() {});

    var balance = await tokInstance.balanceOf(accounts[6]);

    assert.equal(balance.valueOf(), 1e+21, "token pregeneration failed");
  });


  it("should put 2000 MySale in the first account", async function() {
    var account1 = accounts[1]
    var instance = await MySale.deployed();

    instance.sendTransaction({ from: account1, value: web3.toWei(2, "ether")})

    var tokenAddress = await instance.token()
    var tokInstance = MyCrowdsaleToken.at(tokenAddress)
    var balance = await tokInstance.balanceOf(account1)

    assert.equal(balance.valueOf(), 2e+21, "2000 wasn't in the first account");
  });

  it("should not allow token transfers", async function() {
    var account1 = accounts[1]
    var account2 = accounts[2]
    var instance = await MySale.deployed();
    var tokenAddress = await instance.token()
    var tokInstance = MyCrowdsaleToken.at(tokenAddress)

    tokInstance.transfer(account2, 2e+21, {from: account1}).then(function(){}, function(){});

    var balance = await tokInstance.balanceOf(account2)

    assert.equal(balance.valueOf(), 0, "0 wasn't in the second account");
  });

  it("should assign 1600 to the third account (soft cap test)", async function() {
    var account1 = accounts[3]
    var instance = await MySale.deployed();
    var tokenAddress = await instance.token()
    var tokInstance = MyCrowdsaleToken.at(tokenAddress)

    instance.sendTransaction({ from: account1, value: web3.toWei(2, "ether")})

    var balance = await tokInstance.balanceOf(account1)

    assert.equal(balance.valueOf(), 1.6e+21, "1600 wasn't in the third account");
  });

  it("should have activated hardCap", async function() {
    var instance = await MySale.deployed();
    var endBlock = await instance.endBlock()

    assert.notEqual(endBlock.toNumber(10), initialEndBlock.valueOf(), "hard cap was not activated")
  });

  it("should assign 1200 to the fourth account (hard cap test)", async function() {
    var account1 = accounts[4]
    var instance = await MySale.deployed();
    var tokenAddress = await instance.token()
    var tokInstance = MyCrowdsaleToken.at(tokenAddress)

    instance.sendTransaction({ from: account1, value: web3.toWei(2, "ether")})

    var balance = await tokInstance.balanceOf(account1)

    assert.equal(balance.valueOf(), 1.2e+21, "1200 wasn't in the fourth account");
  });

  it("will wait 700 blocks (please wait)", async function() {
    var instance = await MySale.deployed();
    var targetBlock = web3.eth.blockNumber+71;
    console.log("    ...advancing blocks, please wait...")

    await waitForBlock(targetBlock);

    assert.equal(targetBlock, web3.eth.blockNumber, "Blocks not elapsed");
  });


  it("should be finished", async function() {
    var instance = await MySale.deployed();
    var hasEnded = await instance.hasEnded()

    assert.equal(hasEnded, true, 'not finished');
  });

  it("should not allow further deposits", async function() {
    var account1 = accounts[3]
    var instance = await MySale.deployed();
    var tokenAddress = await instance.token()
    var tokInstance = MyCrowdsaleToken.at(tokenAddress)

    instance.sendTransaction({ from: account1, value: web3.toWei(2, "ether")}).then(
        function(){}, function(){});
    var balance = await tokInstance.balanceOf(account1)
    assert.equal(balance.valueOf(), 1.6e+21, "1600 wasn't in the third account");
  });

  it("should allow finalizing", async function() {
    var targetAccount = accounts[5];
    var instance = await MySale.deployed();
    var tokenAddress = await instance.token()
    var tokInstance = MyCrowdsaleToken.at(tokenAddress)

    var balance = await tokInstance.balanceOf(targetAccount)
    assert.equal(balance.toNumber(10), 0.0, 'destination doesnt have 0 tokens');

    instance.finalize()
    balance = await tokInstance.balanceOf(targetAccount)

    assert.equal(balance.valueOf(), 1.74e+21, 'destination doesnt have 1740 tokens');
    var totalSupply = await tokInstance.totalSupply()
    assert.equal(totalSupply.toNumber(10), 7.54e+21, 'total supply is not 7540');
  });

  it("should not finalize again", async function() {
    var targetAccount = accounts[5];
    var instance = await MySale.deployed();
    var tokenAddress = await instance.token()
    var tokInstance = MyCrowdsaleToken.at(tokenAddress)

    instance.finalize().then(function(){}, function(){});
    var balance = await tokInstance.balanceOf(targetAccount)

    assert.equal(balance.valueOf(), 1.74e+21, 'destination doesnt have 1740 tokens');
  });

  it("should allow token transfers", async function() {
    var account1 = accounts[1]
    var account2 = accounts[2]
    var instance = await MySale.deployed();
    var tokenAddress = await instance.token()
    var tokInstance = MyCrowdsaleToken.at(tokenAddress)

    tokInstance.transfer(account2, web3.toWei(1, "ether"), {from: account1});
    var balance = await tokInstance.balanceOf(account2)

    assert.equal(balance.valueOf(), 1e+18, "1000 wasn't in the second account");
  });

  it("should not allow token transfers beyond balance", async function() {
    var account1 = accounts[1]
    var account2 = accounts[2]
    var instance = await MySale.deployed();
    var tokenAddress = await instance.token()
    var tokInstance = MyCrowdsaleToken.at(tokenAddress)

    tokInstance.transfer(account2, web3.toWei(50000, "ether"), {from: account1}).then(
        function(){}, function(){});
    var balance = await tokInstance.balanceOf(account2)

    assert.equal(balance.valueOf(), 1e+18, "1000 wasn't in the second account");
  });

});
