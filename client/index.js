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

// Login
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
      document.getElementById('current-user-balance').innerHTML = currentUserBalance + ' ETH'
    } else {
      alert("Invalid Public Key or PIN")
    }

  }).catch((err) => {
    console.log(err)
    alert("An error occured while signing you in.")
  })

})

// Logout
document.getElementById("logout-button").addEventListener('click', () => {

  loggedIn = false
  document.getElementById("login").style.display = "block"
  document.getElementById("create-transaction").style.display = "none"
  document.getElementById("confirm-transaction").style.display = "none"
  document.getElementById("public-key-input").value = ""
  document.getElementById("pin-input").value = ""

})

// Initiate transaction (create transaction signature)
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

      publicX = res.data.publicX
      publicY = res.data.publicY
      signatureR = res.data.signatureR
      signatureS = res.data.signatureS
      signatureMessage = res.data.signatureMessage

      transactionAmount = signatureMessage.split("_")[0]
      recipientPublicKey = signatureMessage.split("_")[4]

      document.getElementById("create-transaction").style.display = "none"
      document.getElementById("confirm-transaction").style.display = "block"
      document.getElementById("confirm-amount").innerHTML = transactionAmount + " ETH"
      document.getElementById("confirm-recipient").innerHTML = recipientPublicKey

    } else { alert(res.data.error) }
  }).catch((err) => { console.log(err) })
})

// Confirm transaction (verify transaction signature)
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

    if(res.data.transactionConfirmed === false) { 

      document.getElementById("create-transaction").style.display = "block"
      document.getElementById("confirm-transaction").style.display = "none"
      alert("Transaction Denied") 
    
    } else {

      currentUserBalance = res.data.newBalance
      document.getElementById("current-user-balance").innerHTML = currentUserBalance + ' ETH'
      document.getElementById("create-transaction").style.display = "block"
      document.getElementById("confirm-transaction").style.display = "none"
      document.getElementById("recipient-public-key").value = ""
      document.getElementById("transaction-amount").value = 0
      alert("Transaction Successful")

    }
  }).catch((err) => { console.log(err); alert("Transaction Denied") })
})

// Cancel Transaction
document.getElementById("cancel-transaction-button").addEventListener('click', () => {

  document.getElementById("create-transaction").style.display = "block"
  document.getElementById("confirm-transaction").style.display = "none"
  document.getElementById("transaction-amount").value = 0
  document.getElementById("recipient-public-key").value = ""

})