# Tour Management System

A comprehensive web application for managing family trips, tracking expenses, monitoring vehicle details, and recording location history.

## Features

### 1. Driver Information Management
- Record driver name, mobile number, and car details
- Upload driver image
- Track current kilometer reading
- Monitor diesel availability
- Record diesel refill history with cost tracking

### 2. Family Members Management
- Add details for up to 12 family members
- Track individual contributions to the trip
- View contribution summary for each member
- Monitor who paid for what

### 3. Route & Stops Management
- Define trip route (start and destination)
- Add multiple stops with detailed information
- Record arrival and departure times
- Add notes for each stop

### 4. Live Location Tracking
- Real-time GPS location tracking
- Location history with timestamps
- Google Maps integration for visualization
- View location trail on the map

### 5. Expense Tracker
- Record all trip expenses by category
- Categories: Fuel, Food, Accommodation, Transportation, Entertainment, Shopping, Medical, Other
- Auto-calculate balance from contributions
- View expense breakdown by category
- Track who paid for each expense

## Setup Instructions

### 1. Google Maps API Key Setup

To enable location tracking features, you need a Google Maps API key:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Geolocation API
4. Create credentials (API Key)
5. Copy your API key
6. Open `index.html` and replace `YOUR_GOOGLE_MAPS_API_KEY` with your actual API key:

```html
<script async defer
    src="https://maps.googleapis.com/maps/api/js?key=YOUR_ACTUAL_API_KEY&callback=initMap">
</script>
```

**Note:** For testing without Google Maps, the application will still work but the map will show a placeholder.

### 2. Running the Application

1. Simply open `index.html` in a modern web browser (Chrome, Firefox, Edge, Safari)
2. No server setup required - runs completely in the browser
3. All data is stored locally in your browser's localStorage

### 3. Browser Requirements

- Modern web browser with JavaScript enabled
- LocalStorage support
- Geolocation API support (for location tracking)

## Usage Guide

### Getting Started

1. **Add Driver Information**
   - Go to "Driver Info" tab
   - Fill in driver details and car number
   - Upload a photo if desired
   - Save the information

2. **Add Family Members**
   - Go to "Family Members" tab
   - Fill in details for participating family members
   - Save all members
   - Add contributions as members contribute money

3. **Record Diesel Refills**
   - In "Driver Info" tab, scroll to "Diesel Refill Records"
   - Enter kilometer reading, amount, and cost
   - Refills are automatically added to expenses

4. **Plan Your Route**
   - Go to "Route & Stops" tab
   - Enter starting point and destination
   - Add stops along the way with details

5. **Track Location**
   - Go to "Live Location" tab
   - Click "Start Tracking" for continuous updates
   - Or "Get Current Location" for one-time update
   - View location history with timestamps

6. **Manage Expenses**
   - Go to "Expenses" tab
   - Add expenses by category
   - View real-time balance calculation
   - See expense breakdown by category

## Data Management

### Data Storage
- All data is stored locally in your browser's localStorage
- Data persists between sessions
- No data is sent to any server

### Export Data
Open browser console (F12) and run:
```javascript
exportData()
```
This downloads a JSON file with all your trip data.

### Import Data
1. Open browser console (F12)
2. Copy your JSON data
3. Run:
```javascript
importData('paste-your-json-here')
```

### Clear All Data
To start fresh, clear browser localStorage:
```javascript
localStorage.removeItem('tourManagementData');
location.reload();
```

## Tips

1. **Regular Backups**: Export your data regularly to avoid loss
2. **Multiple Devices**: Export from one device and import to another
3. **Offline Use**: Application works offline (except Google Maps)
4. **Mobile Friendly**: Responsive design works on mobile devices
5. **Print Ready**: Use browser print (Ctrl+P) to print records

## Troubleshooting

### Location Not Working
- Ensure browser has location permission
- Check if HTTPS is used (required for geolocation on some browsers)
- Try "Get Current Location" button first

### Map Not Loading
- Verify Google Maps API key is correct
- Check browser console for errors
- Ensure Maps JavaScript API is enabled in Google Cloud Console

### Data Not Saving
- Check browser localStorage is not full
- Ensure cookies/localStorage are not disabled
- Try different browser

## Browser Compatibility

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

## Security Note

This application stores all data locally in your browser. No data is transmitted to any server. For sensitive information, ensure your device is secure and consider regular backups.

## Future Enhancements

Potential features that could be added:
- Cloud sync capabilities
- PDF export for reports
- Multi-trip support
- Expense split calculator
- Budget planning
- Weather integration
- Nearby attractions finder

## Support

For issues or questions, refer to the code comments in `script.js` or modify the code to suit your needs.

## License

Free to use and modify for personal and commercial projects.

