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

// Debug mode
const DEBUG = true;

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

// Initialize with default values
let currentSensorData = { temperature: 25.00, humidity: 60.00 };

// Send initial data to frontend
setTimeout(() => {
  if (DEBUG) console.log("Sending initial sensor data to frontend:", currentSensorData);
  io.emit('sensorData', currentSensorData);
}, 1000);

const port = new SerialPort({
  path: 'COM3',      
  baudRate: 9600,
});

const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

let lastSentAt = 0;

// Handle serial port errors
port.on('error', (err) => {
  console.error('Serial port error:', err.message);
  if (DEBUG) console.log('Make sure Arduino is connected to COM3');
});

port.on('open', () => {
  console.log('Serial port opened successfully on COM3');
  if (DEBUG) console.log('Waiting for Arduino data...');
});

port.on('close', () => {
  console.log('Serial port closed');
});

parser.on('data', async (line) => {
  if (DEBUG) console.log('Raw data received:', line);
  
  // Handle both formats: "temp,humidity" and "temp, humidity"
  if (!line.includes(',')) {
    if (DEBUG) console.log('Invalid data format, expected: temperature,humidity');
    return;
  }

  const now = Date.now();
  if (now - lastSentAt < 10000) {
    console.log(" Waiting 10s before next transaction...");
    return;
  }
  lastSentAt = now;

  try {
    // Split by comma and trim whitespace to handle "24.90, 63.60" format
    const [tempRaw, humRaw] = line.trim().split(',').map(val => val.trim());
    const temperature = parseFloat(tempRaw);
    const humidity = parseFloat(humRaw);

    if (isNaN(temperature) || isNaN(humidity)) {
      console.warn(` Invalid data: ${line}`);
      return;
    }

    console.log(` Temp: ${temperature.toFixed(2)}°C |  Humidity: ${humidity.toFixed(2)}%`);

    // Update current sensor data
    currentSensorData = { temperature, humidity };
    
    // Save to file
    fs.writeFileSync('sensorData.json', JSON.stringify(currentSensorData));

    // Send to frontend immediately
    if (DEBUG) {
      console.log('=== ARDUINO DATA PROCESSED ===');
      console.log('Raw line:', line);
      console.log('Parsed temperature:', temperature);
      console.log('Parsed humidity:', humidity);
      console.log('Current sensor data:', currentSensorData);
      console.log('Sending to frontend:', currentSensorData);
      console.log('==============================');
    }
    
    io.emit('sensorData', currentSensorData);

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

// Send test data every 5 seconds if no Arduino data (for testing)
// DISABLED - Arduino is now sending real data
/*
setInterval(() => {
  if (DEBUG) {
    // Simulate some data changes for testing with decimal places
    currentSensorData.temperature = Math.round((Math.random() * 10 + 20) * 100) / 100; // 20.00-30.00°C
    currentSensorData.humidity = Math.round((Math.random() * 20 + 50) * 100) / 100; // 50.00-70.00%
    
    console.log('Sending test data:', currentSensorData);
    io.emit('sensorData', currentSensorData);
  }
}, 5000);
*/

// Handle refresh requests from frontend
io.on('connection', (socket) => {
  if (DEBUG) console.log('Client connected:', socket.id);
  
  socket.on('requestRefresh', () => {
    if (DEBUG) console.log('Refresh requested by client:', socket.id);
    
    // Send current sensor data immediately (real Arduino data)
    socket.emit('sensorData', currentSensorData);
    
    if (DEBUG) {
      console.log('Sending current real sensor data on refresh:', currentSensorData);
    }
  });
  
  socket.on('disconnect', () => {
    if (DEBUG) console.log('Client disconnected:', socket.id);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(` Server running at http://localhost:${PORT}`);
  console.log(` Frontend available at http://localhost:${PORT}`);
  if (DEBUG) console.log('Debug mode enabled - check console for detailed logs');
});
