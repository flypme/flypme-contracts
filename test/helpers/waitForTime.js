function increaseTime(duration) {
    const id = Date.now()

    return new Promise( (resolve, reject) => {
        web3.currentProvider.sendAsync({
            jsonrpc: '2.0',
            method: 'evm_increaseTime',
            params: [duration],
            id: id,
        }, function(err1) {
            if (err1) return reject(err1)
            web3.currentProvider.sendAsync({
              jsonrpc: '2.0',
              method: 'evm_mine',
              id: id+1,
            }, function(err2, res) {
              return err2 ? reject(err2) : resolve(res)
            })

        });
    });
}


function waitForTime(blockTime) {
    var currentBlockTime;
    return new Promise( (resolve, reject) => {
            setTimeout(function () {
                currentBlockTime = web3.eth.getBlock(web3.eth.blockNumber).timestamp;
                if( currentBlockTime < blockTime ) {
                    increaseTime(blockTime-currentBlockTime).then(function(res, err) {
                        return err ? reject(err) : resolve(res);
                    });
                } else {
                    resolve();
                }
            }, 10);
    });

} // waitForTime()

module.exports = waitForTime;
