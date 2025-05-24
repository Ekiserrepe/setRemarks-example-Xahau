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
    console.log('Conectado a Xahau');
    const my_wallet = xrpl.Wallet.fromSeed(seed);
    const networkInfo = await utils.txNetworkAndAccountValues(network, account);

    const prepared = {
    "TransactionType": "URITokenMint",
    "Flags": 1,
    "URI": "697066733A2F2F4445414442454546",
    "Digest": "697066733A2F2F4445414442454546697066733A2F2F44454144424545467878",
    "Destination": "rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe",
    "Amount": {
      "issuer": "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn",
      "currency": "USD",
      "value": "100",
    }, ...networkInfo.txValues,
};

    const tx = await signAndSubmit(prepared, network, account);
    console.log("Info tx:", JSON.stringify(tx, null, 2)); 
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.disconnect();
    console.log('Disconnecting from Xahau');
  }
}

connectAndQuery();
