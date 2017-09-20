function waitOneBlock() {
    return new Promise( (resolve, reject) => {
        web3.currentProvider.sendAsync({
            jsonrpc: '2.0',
            method: 'evm_mine',
            id: Date.now(),
        }, function(err, res) {
            return err ? reject(err) : resolve(res)
        });
    });
}

function waitForBlock(blockNumber) {
    var currentBlock;
    return new Promise( (resolve, reject) => {
            setTimeout(function () {
                currentBlock = web3.eth.blockNumber;
                if( currentBlock < blockNumber ) {
                    waitOneBlock().then(function() {
                        waitForBlock(blockNumber).then(function(err, res) {
                            return err ? reject(err) : resolve(res);
                        });
                    });
                } else {
                    resolve();
                }
            }, 10);
    });

} // waitForBlock()

module.exports = waitForBlock;
