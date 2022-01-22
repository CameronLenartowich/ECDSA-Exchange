# ECDSA EXCHANGE

## Solution

This solution consists of three steps:

1. Login
2. Initiate Transaction
3. Confirm Transaction

### Login

The user will sign in using the Public Key and PIN provided to their account. The PIN grants access to using their private key, however their private key never leaves the server to make sure that it is never leaked.

### Initiate Transaction

Once signed in, the user can initiate a transaction. Initiating a transaction will make a request to the server to create a signature for this transaction.

### Confirm Transaction

Once the client receives the transaction signature from the server, the client is shown the transaction amount and recipient that is embedded in the signature. The client can then confirm this transaction, where the client will then send the server the signature for validation. If the signature is valid, the transaction will be carried out.

### Summary

- The users private key never leaves the server
- The signature creation and signature validation are seperated into two different api calls. And the user can confirm the details of the transaction signature between these two steps (confirm the signature message: transaction amount and recipient).