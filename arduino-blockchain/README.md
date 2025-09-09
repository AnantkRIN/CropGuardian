# 🌱 EcoSense - Smart Agriculture Monitor

A futuristic, minimalistic web dashboard for monitoring environmental data from your Arduino sensors. This application reads temperature and humidity data from COM3 and displays it in a beautiful, environmentally-themed interface.

## ✨ Features

- **Real-time Data Display**: Live temperature and humidity readings from Arduino
- **Futuristic UI**: Modern, glassmorphism design with environmental color palette
- **Crop Health Monitoring**: Intelligent analysis of environmental conditions
- **Connection Status**: Real-time Arduino connection monitoring
- **Responsive Design**: Works perfectly on all devices
- **Animated Background**: Subtle star field and twinkling effects
- **Interactive Elements**: Hover effects and smooth animations

## 🎨 Design Features

- **Environmental Color Palette**: Greens, earth tones, and nature-inspired colors
- **Glassmorphism Effects**: Translucent cards with backdrop blur
- **Animated Elements**: Smooth transitions and hover effects
- **Status Indicators**: Color-coded status dots for temperature and humidity
- **Health Bar**: Visual representation of crop health based on sensor data

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Arduino connected to COM3 with temperature and humidity sensors
- Serial communication working between Arduino and computer

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Application**
   ```bash
   npm start
   ```

3. **Open in Browser**
   Navigate to `http://localhost:3000`

### Development Mode

For development with auto-restart:
```bash
npm run dev
```

## 🔧 Configuration

### Arduino Setup

Ensure your Arduino is sending data in the format:
```
temperature,humidity
```

Example: `25,65` (25°C, 65% humidity)

### COM Port

The application is configured to read from COM3. To change this, edit `readSensor.js`:

```javascript
const port = new SerialPort({
  path: 'COM3',  // Change this to your port
  baudRate: 9600,
});
```

## 📊 Data Interpretation

### Temperature Ranges
- **Optimal**: 18°C - 28°C (Green)
- **Acceptable**: 15°C - 32°C (Yellow)
- **Critical**: <15°C or >32°C (Red)

### Humidity Ranges
- **Optimal**: 40% - 70% (Green)
- **Acceptable**: 30% - 80% (Yellow)
- **Critical**: <30% or >80% (Red)

### Crop Health Score
The system calculates an overall health score based on both temperature and humidity readings, providing real-time feedback on environmental conditions.

## 🎯 Usage

1. **Connect Arduino**: Ensure your Arduino is connected to COM3
2. **Start Application**: Run `npm start`
3. **Monitor Data**: Watch real-time updates in your browser
4. **Check Health**: Monitor crop health status and recommendations

## 🛠️ Technical Details

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js with Express
- **Real-time Communication**: Socket.IO
- **Serial Communication**: SerialPort library
- **Blockchain Integration**: Web3.js for Ethereum integration

## 🌟 Customization

### Colors
The color scheme can be customized in `styles.css`:
- Primary Green: `#4ade80`
- Secondary Green: `#22c55e`
- Temperature Orange: `#fb923c`
- Humidity Blue: `#3b82f6`

### Animations
Animation speeds and effects can be adjusted in the CSS animations section.

## 🔍 Troubleshooting

### Common Issues

1. **Port Not Found**
   - Check if Arduino is connected
   - Verify COM port in Device Manager
   - Ensure no other application is using the port

2. **No Data Displayed**
   - Check Arduino serial output
   - Verify baud rate (9600)
   - Check browser console for errors

3. **Connection Issues**
   - Restart the application
   - Check firewall settings
   - Verify Socket.IO connection

### Debug Mode

Enable debug logging by adding to `readSensor.js`:
```javascript
const debug = true;
if (debug) console.log('Debug info:', data);
```

## 📱 Mobile Support

The dashboard is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## 🔮 Future Enhancements

- [ ] Data logging and history
- [ ] Charts and graphs
- [ ] Alert notifications
- [ ] Multiple sensor support
- [ ] Weather integration
- [ ] Export functionality

## 📄 License

This project is licensed under the ISC License.

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

---

**Built with ❤️ for Smart Agriculture**


