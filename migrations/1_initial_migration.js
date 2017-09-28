var Migrations = artifacts.require("./Migrations.sol");

module.exports = function(deployer) {

  const ownerAgent = '0x1C3A73709527d0B238467345cB6D0dd03a653215'
  deployer.deploy(Migrations, {from: ownerAgent});
};
