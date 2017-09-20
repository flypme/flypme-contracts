# SETUP LOCAL TEST NODE:

```sh
npm install -g ethereumjs-testrpc
testrpc
```

# PREPARE:

```sh
git clone https://github.com/flypme/flypme-contracts
cd flypme-contracts
npm install -g truffle
# you might need the following to be able to compile dependencies
export PYTHON=/usr/bin/python2.7
npm install
```

# COMPILE AND DEPLOY:

```sh
truffle compile
truffle migrate
```

# TEST:

See [test-ico.js](examples/test-ico.js)

for automatic tests you can run:

```sh
truffle test
```

# VERIFY:

To verify you will need to merge source files with sol-merger and then fill all the details taking the construction arguments from the transaction that created the first contract instance.

```sh
npm i -g sol-merger
# runs merger and leaves result file at build/MySale.sol
npm run-script merge
```


# VERSIONS:

- truffle: 3.4.9
- zeppelin-solidity: 1.2.0

## License
Code released under the [MIT License]

---

- Flyp.me Team

