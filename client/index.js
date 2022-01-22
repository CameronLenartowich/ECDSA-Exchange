import "./index.scss";
import axios from "axios";

const server = "http://localhost:3042";

let loggedIn = false
let currentUserPublicKey = ""
let currentUserBalance = 0
let recipientPublicKey = ""
let transactionAmount = 0
let publicX = ""
let publicY = ""
let signatureR = ""
let signatureS = ""
let signatureMessage = ""

// login
document.getElementById("login-button").addEventListener('click', () => {
  axios.post(
    `${server}/login`,
    {
      publicKey: document.getElementById("public-key-input").value,
      pin: parseInt(document.getElementById("pin-input").value)
    }
  ).then((res) => {
    if(res.data.loggedIn === true) {
      currentUserBalance = res.data.currentUserBalance
      currentUserPublicKey = res.data.currentUserPublicKey
      loggedIn = true
      document.getElementById('login').style.display = 'none'
      document.getElementById('create-transaction').style.display = 'block'
      document.getElementById('current-user-public-key').innerHTML = currentUserPublicKey
      document.getElementById('current-user-balance').innerHTML = currentUserBalance
    } else {
      alert("Invalid Public Key or PIN")
    }
  }).catch((err) => {
    console.log(err)
    alert("An error occured while signing you in.")
  })
})

// logout
document.getElementsByClassName("logout-button").addEventListener('click', () => {
  loggedIn = false
  document.getElementById("login").style.display = "block"
  document.getElementById("create-transaction").style.display = "none"
  document.getElementById("confirm-transaction").style.display = "none"
})

// initiate transaction (create transaction signature)
document.getElementById("send-transaction-button").addEventListener('click', () => {
  axios.post(
    `${server}/send`,
    {
      currentUserPublicKey: currentUserPublicKey,
      recipientPublicKey: document.getElementById('recipient-public-key').value,
      transactionAmount: document.getElementById('transaction-amount').value
    }
  ).then((res) => {
    if(res.data.error === false) {
      publicX = res.data.publicX,
      publicY = res.data.publicY,
      signatureR = res.data.signatureR,
      signatureS = res.data.signatureS,
      transactionAmount = res.data.transactionAmount,
      recipientPublicKey = res.data.recipientPublicKey
    } else { alert(res.data.error) }
  }).catch((err) => { console.log(err) })
})

// confirm transaction (verify transaction signature)
document.getElementById("confirm-transaction-button").addEventListener('click', () => {
  axios.post(
    `${server}/confirm`,
    {
      publicX: publicX,
      publicY: publicY,
      signatureR: signatureR,
      signatureS: signatureS,
      signatureMessage: signatureMessage
    }
  ).then((res) => {
    if(res.data.transactionConfirmed === false) { alert("Transaction Denied") }
    else {
      alert("Transaction Confirmed")
      currentUserBalance = res.data.newBalance
    }
  }).catch((err) => { console.log(err) })
})