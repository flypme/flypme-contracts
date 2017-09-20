#!/usr/bin/env node
const fs = require('fs');
const { exec } = require('child_process');

const truffleBuildTemplate = {
  contract_name: null,
  abi: null,
  unlinked_binary: null,
  networks: {},
  schema_version: "0.0.5",
  updated_at: null
};

exec(`solc --optimize --abi --bin ${process.argv[2]}`, { maxBuffer: 1024 * 10000 }, (err, stdout, stderr) => {
  if (err) {
    console.error(`exec error: ${err}`);
    return;
  }

  let parts = stdout.split('=======');

  for (let pos = 1; pos < parts.length; pos += 2) {
    let [contractPath, contractName] = parts[pos].trim().split(':');
    console.log(contractName);

    let [, , binary, , abi] = parts[pos + 1].split("\n");
    let truffleBuildFile = `./build/contracts/${contractName}.json`;
    let truffleBuild;
    
    if (fs.existsSync(truffleBuildFile)) {
      truffleBuild = require(truffleBuildFile);
      console.log('build exists, updated at ', (new Date (truffleBuild.updated_at)));
    }
    else truffleBuild = Object.assign({}, truffleBuildTemplate);

    truffleBuild.contract_name = contractName;
    truffleBuild.abi = JSON.parse(abi);
    truffleBuild.unlinked_binary = binary;
    truffleBuild.updated_at = Date.now();

    fs.writeFileSync(truffleBuildFile, JSON.stringify(truffleBuild, null, 2));
  }
});



