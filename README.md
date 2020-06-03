# HACK ERC20

The contract has been deployed at [](https://etherscan.io/address/).

## Install dependencies

Prefer node.js v12.16.2

```bash
yarn
```

## Deploy

```bash
source ./env_example
truffle migrate --network ropsten
```

## Verify on Etherscan

```bash
truffle run verify HACKToken --network ropsten
```

## Approve MultiSend.co

```bash
truffle console --network ropsten
```

Then in the console:

```js
hack = await HACKToken.deployed()
UNIT = new web3.utils.BN('1000000000000000000')
await hack.approve('', UNIT.muln(10000))
```
