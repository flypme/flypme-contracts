module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      gas:4700000,    //gas for deploy
      network_id: "*", // Match any network id
      from: '0x1C3A73709527d0B238467345cB6D0dd03a653215'
    }
  }
};
