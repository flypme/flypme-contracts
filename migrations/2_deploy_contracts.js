const MySale = artifacts.require('FlypCrowdsale');
const SafeMath = artifacts.require('zeppelin-solidity/contracts/math/SafeMath.sol');

module.exports = function(deployer) {
  ts = web3.eth.getBlock(web3.eth.blockNumber).timestamp
  const startTime = ts+120
  const presaleEndTime = 1506610800
  const endTime = 1508598000
  const rate = new web3.BigNumber(4400)
  const rateDiff = new web3.BigNumber(200)
  const wallet = '0x0DA05f94Fc49F82e0D89CFCA6B33CE2441aD0c0a'
  const tokenWallet = '0x6c1175d3ACe18431C3274a710E6662713340414a'
  const softCap = new web3.BigNumber(web3.toWei(15000, 'ether'));
  const hardCap = web3.toAscii('0x3c11d870f0fc097ed9a45ae2a08b6557f80822501686b7376fef5590f1527599')
  const endBuffer = 21000;

  deployer.deploy(MySale, startTime, endTime, presaleEndTime, rate, rateDiff, softCap, wallet, hardCap, tokenWallet, endBuffer)
};
