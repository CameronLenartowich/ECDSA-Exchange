const express = require('express');
const app = express();
const cors = require('cors');
const EC = require('elliptic').ec;
const SHA256 = require('crypto-js/sha256');
const port = 3042;

app.use(cors());
app.use(express.json());

// Create and log accounts

let amountOfAccounts = 3
let accounts = {}

const generateAccounts = () => {
  const ec = new EC('secp256k1');
  for(let i = 0 ; i < amountOfAccounts ; i++) {
    let ecKey = ec.genKeyPair();
    let thisPublicKey = ecKey.getPublic().encode('hex');
    thisPublicKey = '0x' + thisPublicKey.substring(thisPublicKey.length - 40);
    accounts[thisPublicKey] = {
      privateKey: ecKey.getPrivate().toString(16),
      publicX: ecKey.getPublic().x.toString(16),
      publicY: ecKey.getPublic().y.toString(16),
      balance: Math.floor(Math.random() * 999),
      pin: Math.floor(Math.random() * (9999 - 1001) + 1001)
    }
  }
}

const logAccounts = () => {
  console.log("\n Available Accounts\n", "==================")
  let logAccountsIndex = 1
  for(property in accounts) {
    console.log('(' + logAccountsIndex + ')', { 
      publicKey: property, 
      PIN: accounts[property].pin,
      balance: accounts[property].balance + ' ETH'
    })
    logAccountsIndex++
  }
  console.log("\n Private Keys\n", "============")
  logAccountsIndex = 1
  for(property in accounts) {
    console.log('(' + logAccountsIndex + ') ' + accounts[property].privateKey)
    logAccountsIndex++
  }
  console.log('\n')
}

generateAccounts();
logAccounts();

// Routes

// Login
app.post('/login', (req, res) => {
  if(accounts[req.body.publicKey] === undefined) { res.send({loggedIn: false}) }
  else if(accounts[req.body.publicKey].pin === req.body.pin) {
    res.send({
      currentUserBalance: accounts[req.body.publicKey].balance,
      currentUserPublicKey: req.body.publicKey,
      loggedIn: true
    })
  } else { res.send({loggedIn: false}) }
})

// Sign Transaction (Initiate Transaction)
app.post('/send', (req, res) => {
  if(req.body.transactionAmount > accounts[req.currentUserPublicKey].balance) {
    res.send({ error: "Insufficient ETH" })
  } else if(accounts[req.body.recipientPublicKey] === undefined) {
    res.send({ error: "Invalid Recipient" })
  } else {
    const ec = new EC('secp256k1');
    const key = ec.keyFromPrivate(accounts[req.currentUserPublicKey].privateKey);
    const signatureMessage = req.body.transactionAmount + '_to_' + req.body.recipientPublicKey;
    const msgHash = SHA256(signatureMessage);
    const signature = key.sign(msgHash.toString());
    res.send({
      error: false,
      signatureR: signature.r.toString(16),
      signatureS: signature.s.toString(16),
      signatureMessage: signatureMessage,
      publicX: accounts[req.body.currentUserPublicKey].publicX,
      publicY: accounts[req.body.currentUserPublicKey].publicY,
    })
  }
})

// Verify Transaction Signature (Confirm Transaction)
app.post('/confirm', (req, res) => {
  const ec = new EC('secp256k1');
  const publicKey = {
    x: req.body.publicX,
    y: req.body.publicY
  }
  const key = ec.keyFromPublic(publicKey, 'hex');
  const msgHash = SHA256(req.body.signatureMessage).toString();
  const signature = {
    r: req.body.signatureR,
    s: req.body.signatureS
  };
  if(key.verify(msgHash, signature) === true) {
    //calculate new balances
    let newBalance = 0;
    res.send({
      transactionConfirmed: true,
      newBalance: newBalance
    })
  } else {
    res.send({ transactionConfirmed: false })
  }
})

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
