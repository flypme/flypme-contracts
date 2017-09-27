account1 = web3.eth.accounts[1]
account2 = web3.eth.accounts[2]

MySale.deployed().then(inst => { crowdsale = inst })
crowdsale.token().then(addr => { tokenAddress = addr } )

tokInstance = MyCrowdsaleToken.at(tokenAddress)
tokInstance.balanceOf(account1).then(balance => balance.toString(10))

crowdsale.sendTransaction({ from: account1, value: web3.toWei(5, "ether")})


tokInstance.balanceOf(account1).then(balance => account1tokenBalance = balance.toString(10))
web3.fromWei(account1tokenBalance, "ether")

// publish hard cap
crowdsale.setHardCap(web3.toWei(2.1, 'ether'))

// run the finalization routine to generate flyp.me tokens
crowdsale.finalize()

tokInstance.transfer(account2, web3.toWei(1,'ether'), {from: account1})

crowdsale.setHardCap2(web3.toWei(2.1), 9156321319845432351361).then(function(a){console.log(a.logs)})
