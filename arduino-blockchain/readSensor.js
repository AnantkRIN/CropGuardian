const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const Web3 = require('web3');

const web3 = new Web3('https://sepolia.infura.io/v3/46c9a910c4754a4c915ac43c8787601a');
const artifact = JSON.parse(fs.readFileSync('CropSensorABI.json', 'utf8'));
const abi = artifact.abi;
const contractAddress = '0xE344c6466B8f73d71c9E8af5A71518DF1A140BE5';
const contract = new web3.eth.Contract(abi, contractAddress);
const senderAddress = '0x47182e3f9adaf08dc0cba90519e6ac2b16f0e376';
const privateKey = '022c2b9cfb43788f1f78ccfc2bbd2346481fbc7ee28dd4682aa72dbb387aedfc';


const app = express();
const server = http.createServer(app);
const io = socketIo(server);


app.use(express.static(path.join(__dirname, 'public')));


const ensureSensorDataFile = () => {
  const filePath = 'sensorData.json';
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({ temperature: 0, humidity: 0 }));
    console.log(" Created empty sensorData.json");
  }
};
ensureSensorDataFile();


const port = new SerialPort({
  path: 'COM13',      
  baudRate: 9600,
});
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

let lastSentAt = 0;

parser.on('data', async (line) => {
  if (!line.includes(',')) return;

  const now = Date.now();
  if (now - lastSentAt < 10000) {
    console.log(" Waiting 10s before next transaction...");
    return;
  }
  lastSentAt = now;

  try {
    const [tempRaw, humRaw] = line.trim().split(',');
    const temperature = parseInt(tempRaw);
    const humidity = parseInt(humRaw);

    if (isNaN(temperature) || isNaN(humidity)) {
      console.warn(` Invalid data: ${line}`);
      return;
    }

    console.log(` Temp: ${temperature}°C |  Humidity: ${humidity}%`);

   
    const sensorData = { temperature, humidity };
    fs.writeFileSync('sensorData.json', JSON.stringify(sensorData));

    
    io.emit('sensorData', sensorData);

    const tx = contract.methods.updateSensorData(temperature, humidity);

    let gas;
    try {
      gas = await tx.estimateGas({ from: senderAddress });
    } catch (e) {
      console.error(" Gas estimate failed:", e.message);
      return;
    }

    const gasPrice = await web3.eth.getGasPrice();
    const data = tx.encodeABI();
    const nonce = await web3.eth.getTransactionCount(senderAddress, 'pending');

    const signedTx = await web3.eth.accounts.signTransaction({
      to: contractAddress,
      data,
      gas,
      gasPrice,
      nonce,
      chainId: 11155111, // Sepolia
    }, privateKey);

    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log(' Blockchain updated! Tx Hash:', receipt.transactionHash);

  } catch (err) {
    console.error(' Error:', err.message);
  }
});


const PORT = 3000;
server.listen(PORT, () => {
  console.log(` Server running at http://localhost:${PORT}`);
});
