// ================================================================================
// LOCATION TRACKING MODULE
// Handles all map and GPS location tracking functionality
// ================================================================================

// Map variables
let map;
let marker;
let locationWatchId;
let locationPath = [];
let polyline;
let routeMarkers = [];
let routePolyline;

// Initialize Leaflet map
function initMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) {
        console.warn('Map element not found');
        return;
    }
    
    // Initialize Leaflet map with default location (Delhi, India)
    const defaultLocation = [28.6139, 77.2090];
    
    map = L.map('map').setView(defaultLocation, 12);
    
    // Add OpenStreetMap tiles (works offline if cached)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);
    
    // Create custom icons
    const currentIcon = L.icon({
        iconUrl: 'leaflet/dist/images/marker-icon.png',
        iconRetinaUrl: 'leaflet/dist/images/marker-icon-2x.png',
        shadowUrl: 'leaflet/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
    
    // Add marker for current location
    marker = L.marker(defaultLocation, { icon: currentIcon })
        .addTo(map)
        .bindPopup('Current Location');
    
    // Create polyline for location history
    polyline = L.polyline([], {
        color: '#2563eb',
        weight: 3,
        opacity: 0.8
    }).addTo(map);
    
    // Create polyline for route
    routePolyline = L.polyline([], {
        color: '#10b981',
        weight: 4,
        opacity: 0.8,
        dashArray: '10, 10'
    }).addTo(map);
    
    // Load location history
    if (tourData.locationHistory && tourData.locationHistory.length > 0) {
        locationPath = tourData.locationHistory.map(loc => [loc.lat, loc.lng]);
        polyline.setLatLngs(locationPath);
        
        const lastLocation = tourData.locationHistory[tourData.locationHistory.length - 1];
        const position = [lastLocation.lat, lastLocation.lng];
        marker.setLatLng(position);
        map.setView(position, 13);
    }
    
    // Update route on map
    updateRouteSummary();
    
    console.log('✅ Map initialized');
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Calculate total distance from all location points
function calculateTotalDistance() {
    if (!tourData.locationHistory || tourData.locationHistory.length < 2) {
        return 0;
    }
    
    let totalDistance = 0;
    for (let i = 0; i < tourData.locationHistory.length - 1; i++) {
        const loc1 = tourData.locationHistory[i];
        const loc2 = tourData.locationHistory[i + 1];
        totalDistance += calculateDistance(loc1.lat, loc1.lng, loc2.lat, loc2.lng);
    }
    return totalDistance;
}

// Update route summary display
function updateRouteSummary() {
    const routeInfo = document.getElementById('routeInfo');
    if (!routeInfo || !tourData.route) return;
    
    // Clear existing route markers
    routeMarkers.forEach(marker => map.removeLayer(marker));
    routeMarkers = [];
    
    const route = tourData.route;
    const stops = tourData.stops || [];
    const routePoints = [];
    
    // Add start point
    if (route.start && route.startLat && route.startLng) {
        const startLatLng = [parseFloat(route.startLat), parseFloat(route.startLng)];
        routePoints.push(startLatLng);
        
        const startMarker = L.marker(startLatLng)
            .bindPopup(`<strong>Start:</strong> ${route.start}`)
            .addTo(map);
        routeMarkers.push(startMarker);
    }
    
    // Add stops
    stops.forEach((stop, index) => {
        if (stop.lat && stop.lng) {
            const stopLatLng = [parseFloat(stop.lat), parseFloat(stop.lng)];
            routePoints.push(stopLatLng);
            
            const stopMarker = L.marker(stopLatLng)
                .bindPopup(`<strong>Stop ${index + 1}:</strong> ${stop.name}`)
                .addTo(map);
            routeMarkers.push(stopMarker);
        }
    });
    
    // Add end point
    if (route.end && route.endLat && route.endLng) {
        const endLatLng = [parseFloat(route.endLat), parseFloat(route.endLng)];
        routePoints.push(endLatLng);
        
        const endMarker = L.marker(endLatLng)
            .bindPopup(`<strong>End:</strong> ${route.end}`)
            .addTo(map);
        routeMarkers.push(endMarker);
    }
    
    // Draw route polyline
    if (routePoints.length > 0) {
        routePolyline.setLatLngs(routePoints);
        
        // Calculate route distance
        let routeDistance = 0;
        for (let i = 0; i < routePoints.length - 1; i++) {
            routeDistance += calculateDistance(
                routePoints[i][0], routePoints[i][1],
                routePoints[i + 1][0], routePoints[i + 1][1]
            );
        }
        
        routeInfo.innerHTML = `
            <div class="info-box info-success">
                <h4><i class="fas fa-route"></i> Route Overview</h4>
                <p><strong>From:</strong> ${route.start || 'Not set'}</p>
                <p><strong>To:</strong> ${route.end || 'Not set'}</p>
                <p><strong>Stops:</strong> ${stops.length}</p>
                <p><strong>Estimated Distance:</strong> ${routeDistance.toFixed(2)} km</p>
            </div>
        `;
        routeInfo.style.display = 'block';
        
        // Fit map to show all route points
        if (routePoints.length > 0) {
            map.fitBounds(routePoints);
        }
    } else {
        routeInfo.style.display = 'none';
        routePolyline.setLatLngs([]);
    }
}

// Initialize location tracking controls
function initLocationTracking() {
    const requestPermissionBtn = document.getElementById('requestPermission');
    const startBtn = document.getElementById('startTracking');
    const stopBtn = document.getElementById('stopTracking');
    const getCurrentBtn = document.getElementById('getCurrentLocation');
    const openInMapsBtn = document.getElementById('openInMaps');
    const clearRouteBtn = document.getElementById('clearRoute');
    const exportRouteBtn = document.getElementById('exportRoute');
    const clearHistoryBtn = document.getElementById('clearLocationHistory');
    const clearLastPointBtn = document.getElementById('clearLastPoint');
    
    if (!requestPermissionBtn) {
        console.warn('Location tracking controls not found');
        return;
    }
    
    // Check initial permission status
    checkLocationPermission();
    
    // Request location permission
    requestPermissionBtn.addEventListener('click', async function() {
        if ('geolocation' in navigator) {
            try {
                navigator.geolocation.getCurrentPosition(
                    function(position) {
                        showPermissionStatus('granted');
                        alert('✅ Location permission granted! You can now use location features.');
                        getCurrentPosition();
                    },
                    function(error) {
                        if (error.code === error.PERMISSION_DENIED) {
                            showPermissionStatus('denied');
                            alert('❌ Location permission denied. Please enable location access in your browser settings.');
                        } else {
                            alert('Error getting location: ' + error.message);
                        }
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0
                    }
                );
            } catch (error) {
                alert('Error requesting permission: ' + error.message);
            }
        } else {
            alert('❌ Geolocation is not supported by your browser');
        }
    });
    
    // Start tracking
    startBtn.addEventListener('click', function() {
        if ('geolocation' in navigator) {
            startBtn.disabled = true;
            stopBtn.disabled = false;
            
            locationWatchId = navigator.geolocation.watchPosition(
                function(position) {
                    updateLocation(position.coords.latitude, position.coords.longitude);
                },
                function(error) {
                    console.error('Error watching location:', error);
                    alert('Error tracking location: ' + error.message);
                },
                {
                    enableHighAccuracy: true,
                    maximumAge: 5000,
                    timeout: 10000
                }
            );
            
            alert('✅ Location tracking started!');
        }
    });
    
    // Stop tracking
    stopBtn.addEventListener('click', function() {
        if (locationWatchId) {
            navigator.geolocation.clearWatch(locationWatchId);
            startBtn.disabled = false;
            stopBtn.disabled = true;
            alert('🛑 Location tracking stopped.');
        }
    });
    
    // Get current location
    getCurrentBtn.addEventListener('click', getCurrentPosition);
    
    // Open in Google Maps
    if (openInMapsBtn) {
        openInMapsBtn.addEventListener('click', function() {
            if (tourData.locationHistory.length > 0) {
                const lastLocation = tourData.locationHistory[tourData.locationHistory.length - 1];
                const url = `https://www.google.com/maps?q=${lastLocation.lat},${lastLocation.lng}`;
                window.open(url, '_blank');
            } else {
                alert('No location data available');
            }
        });
    }
    
    // Clear route
    if (clearRouteBtn) {
        clearRouteBtn.addEventListener('click', function() {
            if (confirm('Clear the planned route from the map?')) {
                routeMarkers.forEach(marker => map.removeLayer(marker));
                routeMarkers = [];
                routePolyline.setLatLngs([]);
                document.getElementById('routeInfo').style.display = 'none';
                alert('Route cleared from map');
            }
        });
    }
    
    // Export route
    if (exportRouteBtn) {
        exportRouteBtn.addEventListener('click', function() {
            const dataStr = JSON.stringify(tourData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `tour-data-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            URL.revokeObjectURL(url);
        });
    }
    
    // Clear location history
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', async function() {
            if (confirm('⚠️ Are you sure you want to clear ALL location history?\n\nThis action cannot be undone!')) {
                tourData.locationHistory = [];
                locationPath = [];
                polyline.setLatLngs([]);
                await saveData();
                displayLocationHistory();
                alert('✅ All location history cleared!');
            }
        });
    }
    
    // Clear last point
    if (clearLastPointBtn) {
        clearLastPointBtn.addEventListener('click', async function() {
            if (tourData.locationHistory.length === 0) {
                alert('⚠️ No location points to remove');
                return;
            }
            
            if (confirm('Remove the last recorded location point?')) {
                tourData.locationHistory.pop();
                locationPath = tourData.locationHistory.map(loc => [loc.lat, loc.lng]);
                polyline.setLatLngs(locationPath);
                
                if (tourData.locationHistory.length > 0) {
                    const lastLocation = tourData.locationHistory[tourData.locationHistory.length - 1];
                    marker.setLatLng([lastLocation.lat, lastLocation.lng]);
                }
                
                await saveData();
                displayLocationHistory();
                alert('✅ Last location point removed!');
            }
        });
    }
    
    console.log('✅ Location tracking controls initialized');
}

// Check location permission
function checkLocationPermission() {
    if ('permissions' in navigator) {
        navigator.permissions.query({ name: 'geolocation' }).then(function(result) {
            showPermissionStatus(result.state);
        });
    }
}

// Show permission status
function showPermissionStatus(status) {
    const statusElement = document.getElementById('permissionStatus');
    if (!statusElement) return;
    
    if (status === 'granted') {
        statusElement.className = 'permission-status granted';
        statusElement.innerHTML = '<i class="fas fa-check-circle"></i> Location permission granted';
    } else if (status === 'denied') {
        statusElement.className = 'permission-status denied';
        statusElement.innerHTML = '<i class="fas fa-times-circle"></i> Location permission denied';
    } else {
        statusElement.className = 'permission-status prompt';
        statusElement.innerHTML = '<i class="fas fa-question-circle"></i> Location permission not set';
    }
}

// Get current position
function getCurrentPosition() {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                updateLocation(position.coords.latitude, position.coords.longitude, true);
                alert('✅ Current location captured!');
            },
            function(error) {
                alert('Error getting location: ' + error.message);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    }
}

// Update location on map
function updateLocation(lat, lng, saveToHistory = true) {
    const position = [lat, lng];
    
    // Update marker
    marker.setLatLng(position);
    marker.bindPopup(`Current Location<br>Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(6)}`);
    map.setView(position, 15);
    
    if (saveToHistory) {
        // Add to path
        locationPath.push(position);
        polyline.setLatLngs(locationPath);
        
        // Calculate distance from previous point
        let distance = 0;
        if (tourData.locationHistory.length > 0) {
            const prevLocation = tourData.locationHistory[tourData.locationHistory.length - 1];
            distance = calculateDistance(prevLocation.lat, prevLocation.lng, lat, lng);
        }
        
        // Save to history
        tourData.locationHistory.push({
            lat: lat,
            lng: lng,
            timestamp: new Date().toISOString(),
            distance: distance
        });
        
        saveData();
        displayLocationHistory();
    }
}

// Display location history
function displayLocationHistory() {
    const container = document.getElementById('locationHistoryList');
    if (!container) return;
    
    if (tourData.locationHistory.length === 0) {
        container.innerHTML = '<p style="color: #6b7280;">No location history yet. Start tracking to record locations.</p>';
        return;
    }
    
    let totalDistance = calculateTotalDistance();
    
    let html = `
        <div class="info-box info-primary" style="margin-bottom: 15px;">
            <strong>📍 Total Points:</strong> ${tourData.locationHistory.length}<br>
            <strong>🛣️ Total Distance:</strong> ${totalDistance.toFixed(2)} km
        </div>
    `;
    
    tourData.locationHistory.slice().reverse().forEach((location, index) => {
        const actualIndex = tourData.locationHistory.length - 1 - index;
        const date = new Date(location.timestamp);
        
        html += `
            <div class="record-item">
                <div class="record-header">
                    <strong>Point ${actualIndex + 1}</strong>
                    <span class="record-time">${date.toLocaleString()}</span>
                </div>
                <div class="record-details">
                    <span><i class="fas fa-map-marker-alt"></i> ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}</span>
                    ${location.distance > 0 ? `<span><i class="fas fa-road"></i> +${location.distance.toFixed(2)} km</span>` : ''}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// ================================================================================
// Export functions for use in main script
// ================================================================================

// Make functions available globally
window.locationTrackingModule = {
    initMap,
    initLocationTracking,
    calculateDistance,
    calculateTotalDistance,
    updateRouteSummary,
    displayLocationHistory
};

console.log('✅ Location Tracking module loaded');

