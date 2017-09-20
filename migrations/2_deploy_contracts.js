const MySale = artifacts.require('MySale');
const SafeMath = artifacts.require('zeppelin-solidity/contracts/math/SafeMath.sol');
//const Crowdsale = artifacts.require('zeppelin-solidity/contracts/crowdsale/Crowdsale.sol');

module.exports = function(deployer) {
  const startBlock = web3.eth.blockNumber + 2 // blockchain block number where the crowdsale will commence. Here I just taking the current block that the contract and setting that the crowdsale starts two block after
  const presaleEndBlock = web3.eth.blockNumber + 40 // blockchain block number where the crowdsale will commence. Here I just taking the current block that the contract and setting that the crowdsale starts two block after
  const endBlock = startBlock + 30000  // blockchain block number where it will end. 300 is little over an hour.
  const rate = new web3.BigNumber(1000) // inital rate of ether to tokens in wei
  const rateDiff = new web3.BigNumber(200) // rate of ether to tokens in wei (after soft cap)
  const wallet = web3.eth.accounts[0] // the address that will hold the fund. Recommended to use a multisig one for security.
  const tokenWallet = web3.eth.accounts[5] // the address that will hold the final tokens
  const softCap = new web3.BigNumber(web3.toWei(1, 'ether'));
  // secret hard cap 2.1 ether
  const hardCap = web3.toAscii('0xb316befd43ac2f3c4d30fa8065777d9c13fd498da13bd5c2556bb48a5bccbce2');

  deployer.deploy(MySale, startBlock, endBlock, presaleEndBlock, rate, rateDiff, softCap, wallet, hardCap, tokenWallet)
};