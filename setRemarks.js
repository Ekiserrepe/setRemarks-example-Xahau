const xrpl = require('xrpl');
const { derive, utils, signAndSubmit } = require("xrpl-accountlib");

const seed = 'your_seed';
const network = "wss://xahau-test.net";


async function connectAndQuery() {
  const client = new xrpl.Client('wss://xahau-test.net');
  const account = derive.familySeed(seed, { algorithm: "secp256k1" });
  console.log(`Account: ${JSON.stringify(account)}`);

  try {
    await client.connect();
    console.log('Connected to Xahau');
    const my_wallet = xrpl.Wallet.fromSeed(seed);
    const networkInfo = await utils.txNetworkAndAccountValues(network, account);

    const prepared = {
    "TransactionType": "SetRemarks",
    "Flags": 0,
    "ObjectID": "yourObjectID",
          "Remarks": [
        {
          "Remark": {
            "RemarkName": Buffer.from("MyName1", 'utf8').toString('hex').toUpperCase(),
            "RemarkValue": Buffer.from("MyValue1", 'utf8').toString('hex').toUpperCase(),
            "Flags": 0
          }
        }
      ], ...networkInfo.txValues,
};

    const tx = await signAndSubmit(prepared, network, account);
    console.log("Info tx:", JSON.stringify(tx, null, 2)); 
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.disconnect();
    console.log('Disconnecting de Xahau');
  }
}


connectAndQuery();
