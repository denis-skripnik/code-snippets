const conf = require('./config.json');
const minterWallet = require('minterjs-wallet')
const wallet = minterWallet.generateWallet();
const {Minter, prepareLink, TX_TYPE} = require("minter-js-sdk");
const minter = new Minter({apiType: 'node', baseURL: conf.minter_api});
const axios = require('axios');
axios.defaults.baseURL = conf.minter_api;

async function getTransaction(txHash) {
    try {
    let response = await axios.get('/transaction?hash=' + txHash);
if (response.data.result.code) {
    return false;
} else {
    return true;
}
    } catch(e) {
        console.log(JSON.stringify(e));
    return false;
    }
}

async function createMinterLinkWithSend(to, value, coin, memo) {
    const txParams = {
        type: TX_TYPE.SEND,
        data: {
            to,
            value,
            coin,
        },
        gasCoin: coin,
        payload: memo,
    };
    const idTxParams = await Minter.replaceCoinSymbol(txParams);
    console.log(idTxParams);
    return prepareLink(idTxParams);
}

async function createMinterLinkWithMultisend(list, memo) {
    const txParams = {
        type: TX_TYPE.MULTISEND,
        data: {
            list,
        },
        gasCoin: 'BIP',
        gasPrice: 1,
        payload: memo,
    };
    const idTxParams = await Minter.replaceCoinSymbol(txParams);
    console.log(idTxParams);
    return prepareLink(idTxParams);
}

async function send(frase, to, value, memo) {
const wallet2 = minterWallet.walletFromMnemonic(frase);
const wif = wallet2.getPrivateKeyString();
    const txParams = {
        chainId: 1,
        type: TX_TYPE.SEND,
        data: {
            to: to,
            value: value,
            coin: 'BIP',    
        },
        gasCoin: 'BIP',
        gasPrice: 1,
        payload: memo,
    };
    const idTxParams = await Minter.replaceCoinSymbol(txParams);
    console.log(idTxParams);
    minter.postTx(idTxParams, {privateKey: wif})
        .then((txHash) => {
            let res = await getTransaction(txHash);
            if (res === true) {
                return `Ok. Tx created and sended: ${txHash}`;
            } else {
                return 'Error. Tx with error.';
            }
        }).catch((error) => {
            const errorMessage = error.response.data.error.message
return `Error: ${errorMessage}`;
        });
}

async function multiSend(frase, list, memo) {
    const wallet2 = minterWallet.walletFromMnemonic(frase);
    const wif = wallet2.getPrivateKeyString();
        const txParams = {
            chainId: 1,
            type: TX_TYPE.MULTISEND,
            data: {
                list,
            },
            gasCoin: 'BIP',
            gasPrice: 1,
            payload: memo,
        };
        const idTxParams = await minter.replaceCoinSymbol(txParams);
        console.log(idTxParams);
        minter.postTx(idTxParams, {privateKey: wif})
            .then((txHash) => {
                let res = await getTransaction(txHash);
                if (res === true) {
                    return `Ok. Tx created and sended: ${txHash}`;
                } else {
                    return 'Error. Tx with error.';
                }
            }).catch((error) => {
                const errorMessage = error.response.data.error.message
    return `Error: ${errorMessage}`;
            });
    
    }

async function getBlockNum() {
    try {
    let response = await axios.get('/status');
      return parseInt(response.data.result.latest_block_height);
    } catch(e) {
        console.log(JSON.stringify(e));
    return false;
    }
}

async function getBlockData(number) {
    try {
    let response = await axios.get('/block?height=' + number);
      let res = response.data.result;
      let ret = {};
    ret.num = res.height;
    ret.hash = res.hash;
    ret.timestamp = res.time;
    ret.transactions = [];
for (let transaction of res.transactions) {
    if (transaction.type === 1) {
     let data = transaction.data;
     data.value /= (10**18);
     ret.transactions.push({from: transaction.from, data, memo: transaction.payload})
    }
}
          return ret;
    } catch(e) {
        console.log(JSON.stringify(e));
    return false;
    }
}

async function getBalance(address) {
    try {
    let response = await axios.get('/address?address=' + address);
    let balances = response.data.result.balance;
    for (let token in balances) {
        balances[token] = parseInt(balances[token]);
        balances[token] /= (10**18);
    }
    return {address, balances};
    } catch(e) {
        console.log(JSON.stringify(e));
    return false;
    }
}

module.exports.createMinterLinkWithSend = createMinterLinkWithSend;
module.exports.createMinterLinkWithMultisend = createMinterLinkWithMultisend;
module.exports.send = send;
module.exports.multiSend = multiSend;
module.exports.getBlockNum = getBlockNum;
module.exports.getBlockData = getBlockData;
module.exports.getBalance = getBalance;