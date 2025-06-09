const WebSocket = require('ws');

// Xahau Testnet WebSocket endpoint
const XAHAU_TESTNET_WS = 'wss://xahau-test.net';

// Object ID to query
const OBJECT_ID = '22BE1B2BD530B853AC40DC77A289FE2B6CC025806B337DFCB3E757C47978337F';

// Function to convert hexadecimal to text
function hexToText(hex) {
    let text = '';
    for (let i = 0; i < hex.length; i += 2) {
        const hexPair = hex.substr(i, 2);
        const charCode = parseInt(hexPair, 16);
        text += String.fromCharCode(charCode);
    }
    return text;
}

async function getXahauObjectInfo() {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(XAHAU_TESTNET_WS);
        
        ws.on('open', () => {
            console.log('Connected to Xahau Testnet');
            
            // Send ledger_entry request to get object information
            const request = {
                id: 1,
                command: 'ledger_entry',
                index: OBJECT_ID
            };
            
            console.log('Sending request for object:', OBJECT_ID);
            ws.send(JSON.stringify(request));
        });
        
        ws.on('message', (data) => {
            try {
                const response = JSON.parse(data.toString());
                
                if (response.id === 1) {
                    if (response.result && response.result.node) {
                        const objectData = response.result.node;
                        
                        console.log('=== DECODED REMARKS ===\n');
                        
                        // Search and decode remarks
                        if (objectData.Remarks && objectData.Remarks.length > 0) {
                            objectData.Remarks.forEach((remarkObj, index) => {
                                const remark = remarkObj.Remark;
                                const name = hexToText(remark.RemarkName);
                                const value = hexToText(remark.RemarkValue);
                                
                                console.log(`${name}: ${value}`);
                            });
                        } else {
                            console.log('No remarks found in this object.');
                        }
                        
                        resolve(objectData);
                    } else if (response.error) {
                        console.error('Error:', response.error);
                        console.error('Error Message:', response.error_message);
                        reject(new Error(response.error_message));
                    } else {
                        console.log('Object not found or no data returned');
                        resolve(null);
                    }
                    
                    ws.close();
                }
            } catch (error) {
                console.error('Error parsing response:', error);
                reject(error);
            }
        });
        
        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
            reject(error);
        });
        
        ws.on('close', () => {
            console.log('Connection closed');
        });
    });
}

// Execute the function
async function main() {
    try {
        console.log('Fetching object remarks from Xahau Testnet...\n');
        const result = await getXahauObjectInfo();
        
        if (result) {
            console.log('\n=== OPERATION COMPLETED ===');
        } else {
            console.log('\n=== OBJECT NOT FOUND ===');
        }
    } catch (error) {
        console.error('\n=== ERROR ===');
        console.error('Error details:', error.message);
    }
}

main();