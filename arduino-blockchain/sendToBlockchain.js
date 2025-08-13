const Web3 = require('web3');
const fs = require('fs');


const abi = JSON.parse(fs.readFileSync('CropSensorABI.json', 'utf8'));

const web3 = new Web3('http://127.0.0.1:8545'); 


const contractAddress = '0x7EF2e0048f5bAeDe046f6BF797943daF4ED8CB47';


const contract = new web3.eth.Contract(abi, contractAddress);


const senderAddress = '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4'; 


async function sendDataToBlockchain(temp, humidity) {
  try {
    const result = await contract.methods.storeSensorData(temp, humidity).send({ from: senderAddress });
    console.log('Transaction successful:', result.transactionHash);
  } catch (err) {
    console.error('Error sending data to contract:', err.message);
  }
}
