const xrpl = require('xrpl');
const { derive, utils, signAndSubmit } = require("xrpl-accountlib");

const seed = 'your_seed';
const network = "wss://xahau-test.net";

const crypto = require('crypto');

// Function to convert account address to ObjectID format using proper keylet calculation
function accountToObjectID(address) {
  try {
    // Step 1: Get the account ID from the address
    const accountID = xrpl.decodeAccountID(address);
    
    // Step 2: Create the keylet using space key 0x0061 for AccountRoot
    const spaceKey = Buffer.from([0x00, 0x61]); // 2-byte space key for AccountRoot
    const keyletData = Buffer.concat([spaceKey, accountID]);
    
    // Step 3: Calculate SHA-512Half (first 32 bytes of SHA-512 hash)
    const hash = crypto.createHash('sha512').update(keyletData).digest();
    const keylet = hash.slice(0, 32).toString('hex').toUpperCase();
    
    return keylet;
  } catch (error) {
    console.error('Error converting account to ObjectID:', error);
    throw error;
  }
}

async function connectAndQuery() {
  const client = new xrpl.Client('wss://xahau-test.net');
  const account = derive.familySeed(seed, { algorithm: "secp256k1" });
  console.log(`Account: ${JSON.stringify(account)}`);

  try {
    await client.connect();
    console.log('Connected to Xahau');
    const my_wallet = xrpl.Wallet.fromSeed(seed);
    const networkInfo = await utils.txNetworkAndAccountValues(network, account);

    // Derive account address from seed automatically
    const accountAddress = account.address;
    const objectID = accountToObjectID(accountAddress);
    
    console.log(`Derived account address: ${accountAddress}`);
    console.log(`Converted ObjectID: ${objectID}`);

    const prepared = {
      "TransactionType": "SetRemarks",
      "ObjectID": objectID,
      "Remarks": [
        {
          "Remark": {
            "RemarkName": Buffer.from("Status", 'utf8').toString('hex').toUpperCase(),
            "RemarkValue": Buffer.from("Open", 'utf8').toString('hex').toUpperCase(),
            "Flags": 0 // 1 Inmutable, 0 Mutable
          }
        }
      ], 
      ...networkInfo.txValues,
    };

    console.log("Prepared transaction:", JSON.stringify(prepared, null, 2));
    
    const tx = await signAndSubmit(prepared, network, account);
    console.log("Transaction result:", JSON.stringify(tx, null, 2)); 
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.disconnect();
    console.log('Disconnecting from Xahau');
  }
}

connectAndQuery();