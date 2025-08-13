
const socket = io();


socket.on('sensorData', (data) => {
  console.log("Received sensor data:", data);

 
  document.getElementById('temperature').textContent = `${data.temperature} °C`;
  document.getElementById('humidity').textContent = `${data.humidity} %`;

  
  document.getElementById('temperature').classList.add('fadeIn');
  document.getElementById('humidity').classList.add('fadeIn');

  
  setTimeout(() => {
    document.getElementById('temperature').classList.remove('fadeIn');
    document.getElementById('humidity').classList.remove('fadeIn');
  }, 1000);
});
