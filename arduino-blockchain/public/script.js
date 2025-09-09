
// Initialize Socket.IO connection
const socket = io();

// Debug mode
const DEBUG = true;

// DOM elements
const temperatureElement = document.getElementById('temperature');
const humidityElement = document.getElementById('humidity');
const tempStatusElement = document.getElementById('temp-status');
const humidityStatusElement = document.getElementById('humidity-status');
const connectionDot = document.getElementById('connection-dot');
const connectionText = document.getElementById('connection-text');
const healthFill = document.getElementById('health-fill');
const healthText = document.getElementById('health-text');
const refreshBtn = document.getElementById('refresh-btn');

// Debug: Check if elements exist
if (DEBUG) {
  console.log('DOM Elements found:');
  console.log('Temperature element:', temperatureElement);
  console.log('Humidity element:', humidityElement);
  console.log('Temp status element:', tempStatusElement);
  console.log('Humidity status element:', humidityStatusElement);
  console.log('Refresh button:', refreshBtn);
}

// Connection status management
let isConnected = false;
let lastDataTime = 0;

// Format number to 2 decimal places
function formatNumber(num) {
  return parseFloat(num).toFixed(2);
}

// Update connection status
function updateConnectionStatus(connected) {
  isConnected = connected;
  const connectionStatus = document.querySelector('.connection-status');
  
  if (connected) {
    connectionStatus.classList.add('connected');
    connectionText.textContent = 'Connected to Arduino';
  } else {
    connectionStatus.classList.remove('connected');
    connectionText.textContent = 'Disconnected from Arduino';
  }
  
  if (DEBUG) console.log('Connection status updated:', connected);
}

// Calculate crop health based on temperature and humidity
function calculateCropHealth(temperature, humidity) {
  // Ideal ranges for most crops
  const idealTemp = { min: 18, max: 28 };
  const idealHumidity = { min: 40, max: 70 };
  
  let tempScore = 100;
  let humidityScore = 100;
  
  // Temperature scoring
  if (temperature < idealTemp.min) {
    tempScore = Math.max(0, 100 - (idealTemp.min - temperature) * 5);
  } else if (temperature > idealTemp.max) {
    tempScore = Math.max(0, 100 - (temperature - idealTemp.max) * 5);
  }
  
  // Humidity scoring
  if (humidity < idealHumidity.min) {
    humidityScore = Math.max(0, 100 - (idealHumidity.min - humidity) * 2);
  } else if (humidity > idealHumidity.max) {
    humidityScore = Math.max(0, 100 - (humidity - idealHumidity.max) * 2);
  }
  
  // Overall health score (average of both)
  const overallHealth = Math.round((tempScore + humidityScore) / 2);
  
  return {
    score: overallHealth,
    tempScore,
    humidityScore,
    status: getHealthStatus(overallHealth)
  };
}

// Get health status text
function getHealthStatus(score) {
  if (score >= 90) return 'Optimal';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 40) return 'Poor';
  return 'Critical';
}

// Update health indicator
function updateHealthIndicator(health) {
  healthFill.style.width = `${health.score}%`;
  healthText.textContent = health.status;
  
  // Update health bar color based on score
  if (health.score >= 75) {
    healthFill.style.background = 'linear-gradient(90deg, #4ade80, #22c55e)';
  } else if (health.score >= 50) {
    healthFill.style.background = 'linear-gradient(90deg, #fbbf24, #f59e0b)';
  } else {
    healthFill.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
  }
  
  if (DEBUG) console.log('Health indicator updated:', health);
}

// Update sensor status indicators
function updateStatusIndicators(temperature, humidity) {
  // Temperature status
  if (temperature >= 18 && temperature <= 28) {
    tempStatusElement.style.background = '#4ade80';
    tempStatusElement.style.boxShadow = '0 0 20px rgba(74, 222, 128, 0.6)';
  } else if (temperature >= 15 && temperature <= 32) {
    tempStatusElement.style.background = '#fbbf24';
    tempStatusElement.style.boxShadow = '0 0 20px rgba(251, 191, 36, 0.6)';
  } else {
    tempStatusElement.style.background = '#ef4444';
    tempStatusElement.style.boxShadow = '0 0 20px rgba(239, 68, 68, 0.6)';
  }
  
  // Humidity status
  if (humidity >= 40 && humidity <= 70) {
    humidityStatusElement.style.background = '#4ade80';
    humidityStatusElement.style.boxShadow = '0 0 20px rgba(74, 222, 128, 0.6)';
  } else if (humidity >= 30 && humidity <= 80) {
    humidityStatusElement.style.background = '#fbbf24';
    humidityStatusElement.style.boxShadow = '0 0 20px rgba(251, 191, 36, 0.6)';
  } else {
    humidityStatusElement.style.background = '#ef4444';
    humidityStatusElement.style.boxShadow = '0 0 20px rgba(239, 68, 68, 0.6)';
  }
  
  if (DEBUG) console.log('Status indicators updated - Temp:', temperature, 'Humidity:', humidity);
}

// Animate value updates
function animateValueUpdate(element) {
  element.classList.add('update');
  setTimeout(() => {
    element.classList.remove('update');
  }, 600);
}

// Format sensor data with units
function formatSensorData(value, unit) {
  return `${value} ${unit}`;
}

// Refresh button functionality
function handleRefresh() {
  if (DEBUG) console.log('Refresh button clicked');
  
  // Add refreshing state
  refreshBtn.classList.add('refreshing');
  refreshBtn.querySelector('.refresh-text').textContent = 'Refreshing...';
  
  // Request fresh data from server
  socket.emit('requestRefresh');
  
  // Simulate refresh delay and restore button
  setTimeout(() => {
    refreshBtn.classList.remove('refreshing');
    refreshBtn.querySelector('.refresh-text').textContent = 'Refresh Data';
  }, 2000);
}

// Socket event handlers
socket.on('connect', () => {
  console.log('Connected to server');
  if (DEBUG) console.log('Socket.IO connection established');
  updateConnectionStatus(true);
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
  if (DEBUG) console.log('Socket.IO connection lost');
  updateConnectionStatus(false);
});

socket.on('sensorData', (data) => {
  console.log('Received sensor data:', data);
  
  if (DEBUG) {
    console.log('Data received from server:', data);
    console.log('Temperature element:', temperatureElement);
    console.log('Humidity element:', humidityElement);
  }
  
  const { temperature, humidity } = data;
  
  // Update temperature display with 2 decimal places
  if (temperatureElement) {
    const formattedTemp = formatNumber(temperature);
    temperatureElement.textContent = formattedTemp;
    animateValueUpdate(temperatureElement);
    if (DEBUG) console.log('Temperature updated to:', formattedTemp);
  } else {
    console.error('Temperature element not found!');
  }
  
  // Update humidity display with 2 decimal places
  if (humidityElement) {
    const formattedHumidity = formatNumber(humidity);
    humidityElement.textContent = formattedHumidity;
    animateValueUpdate(humidityElement);
    if (DEBUG) console.log('Humidity updated to:', formattedHumidity);
  } else {
    console.error('Humidity element not found!');
  }
  
  // Update status indicators
  updateStatusIndicators(temperature, humidity);
  
  // Calculate and update crop health
  const health = calculateCropHealth(temperature, humidity);
  updateHealthIndicator(health);
  
  // Update last data time
  lastDataTime = Date.now();
  
  // Update connection status based on data freshness
  if (!isConnected) {
    updateConnectionStatus(true);
  }
});

// Connection monitoring
setInterval(() => {
  const now = Date.now();
  if (isConnected && (now - lastDataTime) > 30000) { // 30 seconds timeout
    updateConnectionStatus(false);
  }
}, 5000);

// Initial connection status
updateConnectionStatus(false);

// Add some ambient effects
document.addEventListener('DOMContentLoaded', () => {
  if (DEBUG) console.log('DOM loaded, setting up event listeners');
  
  // Add refresh button event listener
  if (refreshBtn) {
    refreshBtn.addEventListener('click', handleRefresh);
    if (DEBUG) console.log('Refresh button event listener added');
  } else {
    console.error('Refresh button not found!');
  }
  
  // Add subtle hover effects to cards
  const cards = document.querySelectorAll('.sensor-card');
  if (DEBUG) console.log('Found sensor cards:', cards.length);
  
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-8px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0) scale(1)';
    });
  });
  
  // Add click effects
  cards.forEach(card => {
    card.addEventListener('click', () => {
      card.style.transform = 'scale(0.98)';
      setTimeout(() => {
        card.style.transform = 'scale(1)';
      }, 150);
    });
  });
  
  // Set initial values for testing
  if (DEBUG) {
    console.log('Setting initial test values');
    if (temperatureElement) temperatureElement.textContent = '25.00';
    if (humidityElement) humidityElement.textContent = '60.00';
  }
});

// Error handling
socket.on('error', (error) => {
  console.error('Socket error:', error);
  if (DEBUG) console.log('Socket.IO error occurred:', error);
  updateConnectionStatus(false);
});

// Reconnection handling
socket.on('reconnect', () => {
  console.log('Reconnected to server');
  if (DEBUG) console.log('Socket.IO reconnected');
  updateConnectionStatus(true);
});

socket.on('reconnect_attempt', (attemptNumber) => {
  console.log(`Reconnection attempt ${attemptNumber}`);
  if (DEBUG) console.log('Socket.IO reconnection attempt:', attemptNumber);
});

// Add some ambient background music or sound effects (optional)
// You can add subtle nature sounds here if desired
