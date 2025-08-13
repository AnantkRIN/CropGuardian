const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve the frontend from /public
app.use(express.static('public'));

// Function to read sensor data from the shared file
const getSensorData = () => {
  try {
    const data = fs.readFileSync('sensorData.json', 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading sensor data:", err.message);
    return { temperature: 0, humidity: 0 }; // Default values if error occurs
  }
};

// Send sensor data to the frontend every 2 seconds
setInterval(() => {
  const sensorData = getSensorData();
  io.emit('sensorData', sensorData);
}, 2000);

// Start the server
server.listen(3000, () => {
  console.log('✅ Sensor dashboard running at http://localhost:3000');
});
