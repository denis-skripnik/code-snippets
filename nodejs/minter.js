const minterWallet = require('minterjs-wallet')
const wallet = minterWallet.generateWallet();
const {Minter, prepareLink, TX_TYPE} = require("minter-js-sdk");
const minter = new Minter({apiType: 'node', baseURL: 'https://api.minter.one/v2'});
const axios = require('axios');
axios.defaults.baseURL = 'https://api.minter.one/v2';

async function getTransaction(txHash) {
    try {
    let response = await axios.get('/transaction/' + txHash);
if (response.data.code == 0) {
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
    const idTxParams = await minter.replaceCoinSymbol(txParams);
    console.log(idTxParams);
    return prepareLink(idTxParams);
}

async function createMinterLinkWithMultisend(list, memo) {
    let minGasPrice = await axios.get('/min_gas_price');
    let gasPrice = parseInt(minGasPrice.data.min_gas_price)
    const txParams = {
        type: TX_TYPE.MULTISEND,
        data: {
            list,
        },
        gasCoin: 'BIP',
        gasPrice,
        payload: memo,
    };
    const idTxParams = await minter.replaceCoinSymbol(txParams);
    console.log(idTxParams);
    return prepareLink(idTxParams);
}

async function send(frase, to, value, memo) {
const wallet2 = minterWallet.walletFromMnemonic(frase);
const wif = wallet2.getPrivateKeyString();
let minGasPrice = await axios.get('/min_gas_price');
let gasPrice = parseInt(minGasPrice.data.min_gas_price)    
const txParams = {
        chainId: 1,
        type: TX_TYPE.SEND,
        data: {
            to: to,
            value: value,
            coin: 'BIP',    
        },
        gasCoin: 'BIP',
        gasPrice,
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

async function multiSend(frase, list, memo) {
    const wallet2 = minterWallet.walletFromMnemonic(frase);
    const wif = wallet2.getPrivateKeyString();
    let minGasPrice = await axios.get('/min_gas_price');
    let gasPrice = parseInt(minGasPrice.data.min_gas_price)    
    const txParams = {
            chainId: 1,
            type: TX_TYPE.MULTISEND,
            data: {
                list,
            },
            gasCoin: 'BIP',
            gasPrice,
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
      return parseInt(response.data.latest_block_height);
    } catch(e) {
        console.log(JSON.stringify(e));
    return false;
    }
}

async function getBlockData(number) {
    try {
    let response = await axios.get('/block/' + number);
      let res = response.data;
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
        let response = await axios.get('/address/' + address);
        let balances = {};
        for (let token of response.data.balance) {
            let balance = parseFloat(token.value);
            balance = balance.toFixed(2)
            balances[token.coin.symbol] = balance;
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