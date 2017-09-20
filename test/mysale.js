var MySale = artifacts.require("./MySale.sol");
var MyCrowdsaleToken = artifacts.require("./MyCrowdsaleToken.sol");

var waitForBlock = require("./helpers/waitForBlock");

contract('MySale', function(accounts) {
  var initialEndBlock
  it("should not activate hardCap", function() {
    return MySale.deployed().then(function(instance) {
      instance.endBlock().then(function (res) {initialEndBlock = res})
      instance.setHardCap(web3.toWei(6.0, 'ether'))
      return instance.hardCap.call()
    }).then(function(hardCap) {
       assert.equal(hardCap.valueOf(), 0, "hard cap was set")
    });
  });

  it("will wait 40 blocks for presale end (please wait)", function() {
    var targetBlock;
    return MySale.deployed().then(function(instance) {
      targetBlock = web3.eth.blockNumber+41;
      console.log("    ...advancing blocks, please wait...")
      return waitForBlock(targetBlock);
    }).then(function() {
      assert.equal(targetBlock, web3.eth.blockNumber, "Blocks not elapsed");
    })
  });

  it("should activate hardCap and not activate", function() {
    var currentBlock;
    return MySale.deployed().then(function(instance) {
      currentBlock = web3.eth.blockNumber;
      instance.setHardCap(web3.toWei(2.1, 'ether'))
      return instance.endBlock.call()
    }).then(function(endBlock) {
       assert.equal(endBlock.valueOf(), initialEndBlock.valueOf(), "final block was set")
    });
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
    instance.pregenTokens(accounts[6], web3.toWei(0.002, 'ether'), web3.toWei(1000, 'ether'), {from: accounts[1]}).then(function() {}, function() {});
    
    var tokenAddress = await instance.token();
    var tokInstance = MyCrowdsaleToken.at(tokenAddress);

    var balance = await tokInstance.balanceOf(accounts[6]);

    assert.equal(balance.valueOf(), 1e+21, "token pregeneration failed");
  });


  it("should put 2000 MySale in the first account", function() {
    var account1 = accounts[1]
    return MySale.deployed().then(function(instance) {
      instance.sendTransaction({ from: account1, value: web3.toWei(2, "ether")})
      return instance.token.call()
    }).then(function(tokenAddress) {
      var tokInstance = MyCrowdsaleToken.at(tokenAddress)
      return tokInstance.balanceOf.call(account1)
    }).then(function(balance) {
      assert.equal(balance.valueOf(), 2e+21, "2000 wasn't in the first account");
    });
  });

  it("should not allow token transfers", function() {
    var account1 = accounts[1]
    var account2 = accounts[2]
    return MySale.deployed().then(function(instance) {
      return instance.token.call()
    }).then(function(tokenAddress) {
      var tokInstance = MyCrowdsaleToken.at(tokenAddress)
      tokInstance.transfer(account2, 2e+21, {from: account1}).then(function(){}, function(){});
      return tokInstance.balanceOf.call(account2)
    }).then(function(balance) {
      assert.equal(balance.valueOf(), 0, "0 wasn't in the second account");
    });

  });

  it("should assign 1600 to the third account (soft cap test)", function() {
    var account1 = accounts[3]
    return MySale.deployed().then(function(instance) {
      instance.sendTransaction({ from: account1, value: web3.toWei(2, "ether")})
      //instance.sendTransaction({ from: account1, value: web3.toWei(2, "ether")})
      return instance.token.call()
    }).then(function(tokenAddress) {
      var tokInstance = MyCrowdsaleToken.at(tokenAddress)
      return tokInstance.balanceOf.call(account1)
    }).then(function(balance) {
      assert.equal(balance.valueOf(), 1.6e+21, "1600 wasn't in the third account");
    });
  });

  it("should have activated hardCap", function() {
    return MySale.deployed().then(function(instance) {
      return instance.endBlock.call()
    }).then(function(endBlock) {
       assert.notEqual(endBlock.toNumber(10), initialEndBlock.valueOf(), "hard cap was not activated")
    });
  });

  it("should assign 1200 to the fourth account (hard cap test)", function() {
    var account1 = accounts[4]
    return MySale.deployed().then(function(instance) {
      instance.sendTransaction({ from: account1, value: web3.toWei(2, "ether")})
      //instance.sendTransaction({ from: account1, value: web3.toWei(2, "ether")})
      return instance.token.call()
    }).then(function(tokenAddress) {
      var tokInstance = MyCrowdsaleToken.at(tokenAddress)
      return tokInstance.balanceOf.call(account1)
    }).then(function(balance) {
      assert.equal(balance.valueOf(), 1.2e+21, "1200 wasn't in the fourth account");
    });
  });

  it("will wait 700 blocks (please wait)", function() {
    var targetBlock;
    return MySale.deployed().then(function(instance) {
      targetBlock = web3.eth.blockNumber+71;
      console.log("    ...advancing blocks, please wait...")
      return waitForBlock(targetBlock);
    }).then(function() {
      assert.equal(targetBlock, web3.eth.blockNumber, "Blocks not elapsed");
    })
  });


  it("should be finished", function() {
    var targetBlock;
    return MySale.deployed().then(function(instance) {
      return instance.hasEnded.call()
    }).then(function(hasEnded) {
      assert.equal(hasEnded, true, 'not finished');
    })
  });

  it("should not allow further deposits", function() {
    var account1 = accounts[3]
    return MySale.deployed().then(function(instance) {
      instance.sendTransaction({ from: account1, value: web3.toWei(2, "ether")}).then(
        function(){}, function(){});
      return instance.token.call()
    }).then(function(tokenAddress) {
      var tokInstance = MyCrowdsaleToken.at(tokenAddress)
      return tokInstance.balanceOf.call(account1)
    }).then(function(balance) {
      assert.equal(balance.valueOf(), 1.6e+21, "1600 wasn't in the third account");
    });
  });

  it("should allow finalizing", function() {
    var targetAccount = accounts[5];
    var tokenAddress;
    return MySale.deployed().then(function(instance) {
      return instance.token.call();
    }).then(function(_tokenAddress) {
      tokenAddress = _tokenAddress;
      tokInstance = MyCrowdsaleToken.at(tokenAddress)
      return tokInstance.balanceOf.call(targetAccount)
    }).then(function(balance) {
      assert.equal(balance.toNumber(10), 0.0, 'destination doesnt have 0 tokens');
      return MySale.deployed()
    }).then(function(instance) {
      instance.finalize()
      tokInstance = MyCrowdsaleToken.at(tokenAddress)
      return tokInstance.balanceOf.call(targetAccount)
    }).then(function(balance) {
      assert.equal(balance.valueOf(), 1.74e+21, 'destination doesnt have 1740 tokens');
      tokInstance = MyCrowdsaleToken.at(tokenAddress)
      return tokInstance.totalSupply.call()
    }).then(function(totalSupply) {
      assert.equal(totalSupply.toNumber(10), 7.54e+21, 'total supply is not 7540');
    })
  });

  it("should not finalize again", function() {
    var targetAccount = accounts[5];
    return MySale.deployed().then(function(instance) {
      instance.finalize().then(
        function(){}, function(){});
      return instance.token.call();
    }).then(function(_tokenAddress) {
      var tokenAddress = _tokenAddress;
      tokInstance = MyCrowdsaleToken.at(tokenAddress)
      return tokInstance.balanceOf.call(targetAccount)
    }).then(function(balance) {
      assert.equal(balance.valueOf(), 1.74e+21, 'destination doesnt have 1740 tokens');
    })
  });

  it("should allow token transfers", function() {
    var account1 = accounts[1]
    var account2 = accounts[2]
    return MySale.deployed().then(function(instance) {
      return instance.token.call()
    }).then(function(tokenAddress) {
      var tokInstance = MyCrowdsaleToken.at(tokenAddress)
      tokInstance.transfer(account2, web3.toWei(1, "ether"), {from: account1});
      return tokInstance.balanceOf.call(account2)
    }).then(function(balance) {
      assert.equal(balance.valueOf(), 1e+18, "1000 wasn't in the second account");
    });

  });

  it("should not allow token transfers beyond balance", function() {
    var account1 = accounts[1]
    var account2 = accounts[2]
    return MySale.deployed().then(function(instance) {
      return instance.token.call()
    }).then(function(tokenAddress) {
      var tokInstance = MyCrowdsaleToken.at(tokenAddress)
      tokInstance.transfer(account2, web3.toWei(50000, "ether"), {from: account1}).then(
        function(){}, function(){});
      return tokInstance.balanceOf.call(account2)
    }).then(function(balance) {
      assert.equal(balance.valueOf(), 1e+18, "1000 wasn't in the second account");
    });

  });

});
