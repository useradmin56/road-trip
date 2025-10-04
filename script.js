// Tour Management System - Main JavaScript

// Data Storage
let tourData = {
    driver: {},
    dieselRecords: [],
    familyMembers: [],
    contributions: [],
    route: {},
    stops: [],
    expenses: [],
    locationHistory: []
};

// ==================== DATA LOADING & SAVING WITH SUPABASE ====================

// Load data from Supabase and localStorage
async function loadData() {
    try {
        console.log('📥 Loading data...');
        
        // Try to load from Supabase first
        if (window.loadFromSupabase) {
            const cloudData = await window.loadFromSupabase();
            if (cloudData) {
                tourData = cloudData;
                // Also save to localStorage as backup
                localStorage.setItem('tourManagementData', JSON.stringify(tourData));
                updateCloudStatus('connected', '☁️ Cloud Connected');
                console.log('✅ Loaded from Supabase');
                return;
            }
        }
        
        // Fallback to localStorage
        const savedData = localStorage.getItem('tourManagementData');
        if (savedData) {
            tourData = JSON.parse(savedData);
            console.log('✅ Loaded from localStorage');
        }
        updateCloudStatus('local', '💾 Offline Mode');
        
    } catch (error) {
        console.error('❌ Error loading data:', error);
        // Load from localStorage as fallback
        const savedData = localStorage.getItem('tourManagementData');
        if (savedData) {
            tourData = JSON.parse(savedData);
        }
        updateCloudStatus('error', '⚠️ Connection Error');
    }
}

// Save data to localStorage and Supabase
async function saveData() {
    try {
        console.log('💾 Saving data...');
        
        // Always save to localStorage first (instant backup)
        localStorage.setItem('tourManagementData', JSON.stringify(tourData));
        console.log('✅ Saved to localStorage');
        
        // Try to save to Supabase cloud
        if (window.saveToSupabase) {
            console.log('☁️ Syncing to Supabase...');
            const result = await window.saveToSupabase(tourData);
            if (result.success) {
                console.log('✅ Synced to Supabase cloud');
                updateCloudStatus('connected', '☁️ Synced to Cloud');
            } else {
                console.log('⚠️ Cloud sync failed, data saved locally');
                updateCloudStatus('local', '💾 Saved Locally Only');
            }
        } else {
            console.log('ℹ️ Supabase not loaded yet, using localStorage');
            updateCloudStatus('local', '💾 Saved Locally');
        }
        
    } catch (error) {
        console.error('❌ Error saving data:', error);
        updateCloudStatus('error', '⚠️ Save Error');
    }
}

// Update cloud status indicator
function updateCloudStatus(status, text) {
    const indicator = document.getElementById('cloudIndicator');
    const textElement = document.getElementById('cloudText');
    const statusContainer = document.getElementById('cloudStatus');
    
    if (!indicator || !textElement || !statusContainer) return;
    
    textElement.textContent = text;
    
    if (status === 'connected') {
        indicator.style.color = '#10b981'; // Green
        statusContainer.style.background = 'rgba(16, 185, 129, 0.1)';
        statusContainer.style.border = '1px solid rgba(16, 185, 129, 0.3)';
        statusContainer.style.color = '#10b981';
    } else if (status === 'local') {
        indicator.style.color = '#f59e0b'; // Orange
        statusContainer.style.background = 'rgba(245, 158, 11, 0.1)';
        statusContainer.style.border = '1px solid rgba(245, 158, 11, 0.3)';
        statusContainer.style.color = '#f59e0b';
    } else if (status === 'error') {
        indicator.style.color = '#ef4444'; // Red
        statusContainer.style.background = 'rgba(239, 68, 68, 0.1)';
        statusContainer.style.border = '1px solid rgba(239, 68, 68, 0.3)';
        statusContainer.style.color = '#ef4444';
    } else {
        indicator.style.color = '#6b7280'; // Gray
        statusContainer.style.background = 'rgba(107, 114, 128, 0.1)';
        statusContainer.style.border = '1px solid rgba(107, 114, 128, 0.3)';
        statusContainer.style.color = '#6b7280';
    }
}

// Manual sync button
function initSyncButton() {
    const syncBtn = document.getElementById('syncNow');
    if (syncBtn) {
        syncBtn.addEventListener('click', async function() {
            syncBtn.disabled = true;
            syncBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing...';
            
            try {
                await saveData();
                setTimeout(() => {
                    syncBtn.disabled = false;
                    syncBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Sync to Cloud';
                    alert('✅ Data synced to cloud successfully!\n\nYour data is now safely stored in Supabase.');
                }, 1000);
            } catch (error) {
                syncBtn.disabled = false;
                syncBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Sync to Cloud';
                alert('⚠️ Sync failed. Data is saved locally.\n\nPlease check your internet connection.');
            }
        });
    }
}

// Check cloud connection status
async function checkCloudConnection() {
    if (window.checkConnection) {
        const status = await window.checkConnection();
        if (status.connected) {
            updateCloudStatus('connected', '☁️ Cloud Connected');
        } else {
            updateCloudStatus('local', '💾 Offline Mode');
        }
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', async function() {
    // Show loading status
    updateCloudStatus('checking', '⏳ Loading...');
    
    // Load data from cloud/local
    await loadData();
    
    initTabs();
    initDriverForm();
    initDieselForm();
    initFamilyMembers();
    initContributionForm();
    initRouteForm();
    initStopForm();
    initExpenseForm();
    
    // Initialize map first
    setTimeout(function() {
        initMap();
        initLocationTracking();
    }, 100);
    
    // Initialize PDF report
    initPdfReport();
    
    // Initialize sync button
    initSyncButton();
    
    // Load existing data
    displayDieselRecords();
    displayContributions();
    displayStops();
    displayExpenses();
    displayLocationHistory();
    updateExpenseDashboard();
    populateMemberSelects();
    updateRouteSummary();
    
    // Check cloud connection
    setTimeout(async () => {
        await checkCloudConnection();
    }, 2000);
    
    // Auto-check connection every 30 seconds
    setInterval(checkCloudConnection, 30000);
});

// Tab Navigation
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remove active class from all tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
            
            // Fix map display when switching to location tab
            if (targetTab === 'location' && map) {
                setTimeout(function() {
                    map.invalidateSize();
                }, 100);
            }
        });
    });
}

// ==================== DRIVER SECTION ====================

function initDriverForm() {
    const form = document.getElementById('driverForm');
    const imageInput = document.getElementById('driverImage');

    // Load existing driver data
    if (tourData.driver && tourData.driver.name) {
        document.getElementById('driverName').value = tourData.driver.name || '';
        document.getElementById('driverMobile').value = tourData.driver.mobile || '';
        document.getElementById('carNumber').value = tourData.driver.carNumber || '';
        document.getElementById('currentKm').value = tourData.driver.currentKm || '';
        document.getElementById('dieselAvailable').value = tourData.driver.dieselAvailable || '';
        
        // Show existing image if available
        if (tourData.driver.imageUrl) {
            showImagePreview(tourData.driver.imageUrl, tourData.driver.imagePublicId);
        }
    }

    // Image upload with Cloudinary
    imageInput.addEventListener('change', async function(e) {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                showImageUploadStatus('<i class="fas fa-exclamation-triangle"></i> File size must be less than 5MB', 'error');
                imageInput.value = '';
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                showImageUploadStatus('<i class="fas fa-exclamation-triangle"></i> Please select a valid image file', 'error');
                imageInput.value = '';
                return;
            }

            showImageUploadStatus('<i class="fas fa-spinner fa-spin"></i> Uploading image...', 'loading');

            try {
                const result = await uploadImageToCloudinary(file);
                
                if (result.success) {
                    showImageUploadStatus('<i class="fas fa-check-circle"></i> Image uploaded successfully!', 'success');
                    showImagePreview(result.url, result.publicId);
                    
                    // Store image data in tourData
                    tourData.driver.imageUrl = result.url;
                    tourData.driver.imagePublicId = result.publicId;
                    tourData.driver.imageWidth = result.width;
                    tourData.driver.imageHeight = result.height;
                    tourData.driver.imageFormat = result.format;
                    tourData.driver.imageBytes = result.bytes;
                    
                    // Auto-save the image data
                    saveData();
                    
                    // Dispatch event to notify other pages about driver info update
                    window.dispatchEvent(new CustomEvent('driverInfoUpdated', {
                        detail: { driver: tourData.driver }
                    }));
                } else {
                    showImageUploadStatus('<i class="fas fa-exclamation-triangle"></i> Upload failed. Please try again.', 'error');
                }
            } catch (error) {
                console.error('Image upload error:', error);
                showImageUploadStatus('<i class="fas fa-exclamation-triangle"></i> Upload failed. Please try again.', 'error');
            }
        }
    });

    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        saveDriverData();
    });
}

function saveDriverData() {
    tourData.driver = {
        name: document.getElementById('driverName').value,
        mobile: document.getElementById('driverMobile').value,
        carNumber: document.getElementById('carNumber').value,
        currentKm: parseFloat(document.getElementById('currentKm').value) || 0,
        dieselAvailable: parseFloat(document.getElementById('dieselAvailable').value) || 0,
        // Image data is already stored in tourData.driver when uploaded
        imageUrl: tourData.driver.imageUrl || '',
        imagePublicId: tourData.driver.imagePublicId || '',
        imageWidth: tourData.driver.imageWidth || 0,
        imageHeight: tourData.driver.imageHeight || 0,
        imageFormat: tourData.driver.imageFormat || '',
        imageBytes: tourData.driver.imageBytes || 0
    };
    
    saveData();
    showNotification('Driver information saved successfully!', 'success');
    
    // Dispatch event to notify other pages about driver info update
    window.dispatchEvent(new CustomEvent('driverInfoUpdated', {
        detail: { driver: tourData.driver }
    }));
}

function initDieselForm() {
    const form = document.getElementById('dieselForm');
    
    // Set current date/time
    const now = new Date();
    const dateTimeString = now.toISOString().slice(0, 16);
    document.getElementById('refillDate').value = dateTimeString;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const refillData = {
            id: Date.now(),
            km: parseFloat(document.getElementById('refillKm').value),
            amount: parseFloat(document.getElementById('refillAmount').value),
            cost: parseFloat(document.getElementById('refillCost').value),
            date: document.getElementById('refillDate').value
        };
        
        tourData.dieselRecords.push(refillData);
        
        // Update diesel available
        const currentDiesel = parseFloat(document.getElementById('dieselAvailable').value) || 0;
        document.getElementById('dieselAvailable').value = currentDiesel + refillData.amount;
        
        // Add to expenses
        tourData.expenses.push({
            id: Date.now(),
            category: 'Fuel',
            amount: refillData.cost,
            date: refillData.date.split('T')[0],
            description: `Diesel refill - ${refillData.amount}L at ${refillData.km}km`,
            paidBy: tourData.driver.name || 'Driver'
        });
        
        saveData();
        form.reset();
        document.getElementById('refillDate').value = dateTimeString;
        displayDieselRecords();
        updateExpenseDashboard();
        alert('Diesel refill record added!');
    });
}

function displayDieselRecords() {
    const container = document.getElementById('dieselRecords');
    
    if (tourData.dieselRecords.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-gas-pump"></i><p>No diesel refill records yet</p></div>';
        return;
    }
    
    let html = '';
    tourData.dieselRecords.reverse().forEach(record => {
        const date = new Date(record.date).toLocaleString();
        html += `
            <div class="record-item">
                <div class="record-info">
                    <p><strong>Date:</strong> ${date}</p>
                    <p><strong>Kilometer:</strong> ${record.km} km</p>
                    <p><strong>Amount:</strong> ${record.amount} Liters</p>
                    <p><strong>Cost:</strong> ₹${record.cost.toFixed(2)}</p>
                    <p><strong>Price per Liter:</strong> ₹${(record.cost / record.amount).toFixed(2)}</p>
                </div>
                <div class="record-actions">
                    <button class="delete-btn" onclick="deleteDieselRecord(${record.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function deleteDieselRecord(id) {
    if (confirm('Are you sure you want to delete this record?')) {
        tourData.dieselRecords = tourData.dieselRecords.filter(record => record.id !== id);
        saveData();
        displayDieselRecords();
    }
}

// ==================== FAMILY MEMBERS SECTION ====================
// Functions now loaded from family-members.js module

function initFamilyMembers() {
    if (window.familyMembersModule) {
        window.familyMembersModule.initFamilyMembers();
    }
}

function populateMemberSelects() {
    if (window.familyMembersModule) {
        window.familyMembersModule.populateMemberSelects();
    }
}

function initContributionForm() {
    if (window.familyMembersModule) {
        window.familyMembersModule.initContributionForm();
    }
}

function displayContributions() {
    if (window.familyMembersModule) {
        window.familyMembersModule.displayContributions();
    } else {
        // Fallback display
        const summaryContainer = document.getElementById('contributionSummary');
        const memberContributions = {};
        
        tourData.contributions.forEach(contribution => {
            if (!memberContributions[contribution.member]) {
                memberContributions[contribution.member] = 0;
            }
            memberContributions[contribution.member] += contribution.amount;
        });
        
        let summaryHtml = '';
        Object.keys(memberContributions).forEach(member => {
        summaryHtml += `
            <div class="summary-card">
                <h4>${member}</h4>
                <p>₹${memberContributions[member].toFixed(2)}</p>
            </div>
        `;
    });
    
    summaryContainer.innerHTML = summaryHtml || '<div class="empty-state"><p>No contributions yet</p></div>';
    
    // Display detailed records
    const recordsContainer = document.getElementById('contributionRecords');
    
    if (tourData.contributions.length === 0) {
        recordsContainer.innerHTML = '<div class="empty-state"><i class="fas fa-hand-holding-usd"></i><p>No contribution records yet</p></div>';
        return;
    }
    
    let recordsHtml = '';
    tourData.contributions.slice().reverse().forEach(contribution => {
        recordsHtml += `
            <div class="record-item">
                <div class="record-info">
                    <p><strong>Member:</strong> ${contribution.member}</p>
                    <p><strong>Amount:</strong> ₹${contribution.amount.toFixed(2)}</p>
                    <p><strong>Date:</strong> ${new Date(contribution.date).toLocaleDateString()}</p>
                    ${contribution.note ? `<p><strong>Note:</strong> ${contribution.note}</p>` : ''}
                </div>
                <div class="record-actions">
                    <button class="delete-btn" onclick="deleteContribution(${contribution.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    recordsContainer.innerHTML = recordsHtml;
}

function deleteContribution(id) {
    if (confirm('Are you sure you want to delete this contribution?')) {
        tourData.contributions = tourData.contributions.filter(c => c.id !== id);
        saveData();
        displayContributions();
        updateExpenseDashboard();
    }
}

// ==================== ROUTE & STOPS SECTION ====================

function initRouteForm() {
    const form = document.getElementById('routeForm');
    const useCurrentForStart = document.getElementById('useCurrentForStart');
    const useCurrentForEnd = document.getElementById('useCurrentForEnd');
    
    // Load existing route data
    if (tourData.route && tourData.route.start) {
        document.getElementById('routeStart').value = tourData.route.start || '';
        document.getElementById('routeEnd').value = tourData.route.end || '';
        document.getElementById('routeStartDate').value = tourData.route.startDate || '';
        document.getElementById('routeEndDate').value = tourData.route.endDate || '';
        
        if (tourData.route.startCoords) {
            document.getElementById('routeStartLat').value = tourData.route.startCoords[0];
            document.getElementById('routeStartLng').value = tourData.route.startCoords[1];
        }
        
        if (tourData.route.endCoords) {
            document.getElementById('routeEndLat').value = tourData.route.endCoords[0];
            document.getElementById('routeEndLng').value = tourData.route.endCoords[1];
        }
        
        updateRouteSummary();
    }
    
    // Use current location for start point
    useCurrentForStart.addEventListener('click', function() {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    document.getElementById('routeStartLat').value = position.coords.latitude.toFixed(6);
                    document.getElementById('routeStartLng').value = position.coords.longitude.toFixed(6);
                    alert('✅ Current location set as starting point!');
                },
                function(error) {
                    alert('Error getting location: ' + error.message);
                }
            );
        } else {
            alert('Geolocation not supported');
        }
    });
    
    // Use current location for end point
    useCurrentForEnd.addEventListener('click', function() {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    document.getElementById('routeEndLat').value = position.coords.latitude.toFixed(6);
                    document.getElementById('routeEndLng').value = position.coords.longitude.toFixed(6);
                    alert('✅ Current location set as destination!');
                },
                function(error) {
                    alert('Error getting location: ' + error.message);
                }
            );
        } else {
            alert('Geolocation not supported');
        }
    });
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const startLat = parseFloat(document.getElementById('routeStartLat').value);
        const startLng = parseFloat(document.getElementById('routeStartLng').value);
        const endLat = parseFloat(document.getElementById('routeEndLat').value);
        const endLng = parseFloat(document.getElementById('routeEndLng').value);
        
        tourData.route = {
            start: document.getElementById('routeStart').value,
            end: document.getElementById('routeEnd').value,
            startDate: document.getElementById('routeStartDate').value,
            endDate: document.getElementById('routeEndDate').value
        };
        
        // Add coordinates if provided
        if (!isNaN(startLat) && !isNaN(startLng)) {
            tourData.route.startCoords = [startLat, startLng];
        }
        
        if (!isNaN(endLat) && !isNaN(endLng)) {
            tourData.route.endCoords = [endLat, endLng];
        }
        
        // Calculate total route distance
        const totalDist = calculateCompleteRouteDistance();
        if (totalDist > 0) {
            tourData.route.calculatedDistance = totalDist;
        }
        
        saveData();
        updateRouteSummary();
        
        // Update map if available
        if (map) {
            calculateAndDisplayRoute();
        }
        
        alert('✅ Route information saved successfully!');
    });
}

// Calculate complete route distance (start → stops → end)
function calculateCompleteRouteDistance() {
    const points = [];
    
    // Add start point
    if (tourData.route && tourData.route.startCoords) {
        points.push(tourData.route.startCoords);
    }
    
    // Add all stops with coordinates
    if (tourData.stops) {
        tourData.stops.forEach(stop => {
            if (stop.coords) {
                points.push(stop.coords);
            }
        });
    }
    
    // Add end point
    if (tourData.route && tourData.route.endCoords) {
        points.push(tourData.route.endCoords);
    }
    
    // Calculate total distance
    if (points.length < 2) return 0;
    
    let totalDistance = 0;
    for (let i = 0; i < points.length - 1; i++) {
        totalDistance += calculateDistance(
            points[i][0], points[i][1],
            points[i + 1][0], points[i + 1][1]
        );
    }
    
    return totalDistance;
}

// Update route summary display
function updateRouteSummary() {
    const summaryDiv = document.getElementById('routeSummary');
    
    if (!tourData.route || !tourData.route.start) {
        summaryDiv.style.display = 'none';
        return;
    }
    
    summaryDiv.style.display = 'block';
    
    document.getElementById('summaryStart').textContent = tourData.route.start;
    document.getElementById('summaryEnd').textContent = tourData.route.end || 'Not set';
    document.getElementById('summaryStops').textContent = tourData.stops ? tourData.stops.length : 0;
    
    const totalDist = calculateCompleteRouteDistance();
    document.getElementById('summaryDistance').textContent = totalDist > 0 ? totalDist.toFixed(2) : '0';
}

function initStopForm() {
    const form = document.getElementById('stopForm');
    const useCurrentLocationBtn = document.getElementById('useCurrentLocationForStop');
    
    // Use current location for stop
    useCurrentLocationBtn.addEventListener('click', function() {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    document.getElementById('stopLatitude').value = position.coords.latitude.toFixed(6);
                    document.getElementById('stopLongitude').value = position.coords.longitude.toFixed(6);
                    alert('✅ Current location coordinates added!');
                },
                function(error) {
                    alert('Error getting location: ' + error.message);
                }
            );
        } else {
            alert('Geolocation not supported');
        }
    });
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const lat = parseFloat(document.getElementById('stopLatitude').value);
        const lng = parseFloat(document.getElementById('stopLongitude').value);
        
        const stop = {
            id: Date.now(),
            name: document.getElementById('stopName').value,
            location: document.getElementById('stopLocation').value,
            arrival: document.getElementById('stopArrival').value,
            departure: document.getElementById('stopDeparture').value,
            notes: document.getElementById('stopNotes').value
        };
        
        // Add coordinates if provided
        if (!isNaN(lat) && !isNaN(lng)) {
            stop.coords = [lat, lng];
        }
        
        tourData.stops.push(stop);
        saveData();
        
        form.reset();
        displayStops();
        
        // Recalculate and display route
        if (map) {
            calculateAndDisplayRoute();
        }
        
        // Update route summary
        updateRouteSummary();
        
        alert('Stop added successfully!');
    });
}

function displayStops() {
    const container = document.getElementById('stopsList');
    
    if (tourData.stops.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-map-pin"></i><p>No stops added yet</p></div>';
        return;
    }
    
    let html = '';
    let totalDistance = 0;
    
    tourData.stops.forEach((stop, index) => {
        // Calculate distance from previous stop
        let distanceFromPrev = 0;
        if (index > 0 && stop.coords && tourData.stops[index - 1].coords) {
            const prevStop = tourData.stops[index - 1];
            distanceFromPrev = calculateDistance(
                prevStop.coords[0], prevStop.coords[1],
                stop.coords[0], stop.coords[1]
            );
            totalDistance += distanceFromPrev;
        }
        
        html += `
            <div class="record-item">
                <div class="record-info">
                    <p><strong>Stop ${index + 1}:</strong> ${stop.name}</p>
                    ${stop.location ? `<p><strong>Location:</strong> ${stop.location}</p>` : ''}
                    ${stop.coords ? `<p><strong>Coordinates:</strong> ${stop.coords[0].toFixed(6)}, ${stop.coords[1].toFixed(6)}</p>` : ''}
                    ${distanceFromPrev > 0 ? `<p><strong>Distance from previous:</strong> ${distanceFromPrev.toFixed(2)} km</p>` : ''}
                    ${stop.arrival ? `<p><strong>Arrival:</strong> ${new Date(stop.arrival).toLocaleString()}</p>` : ''}
                    ${stop.departure ? `<p><strong>Departure:</strong> ${new Date(stop.departure).toLocaleString()}</p>` : ''}
                    ${stop.notes ? `<p><strong>Notes:</strong> ${stop.notes}</p>` : ''}
                </div>
                <div class="record-actions">
                    ${stop.coords ? `<button class="btn btn-info" onclick="viewStopOnMap(${index})" style="margin-right: 10px;"><i class="fas fa-map-marker-alt"></i></button>` : ''}
                    <button class="delete-btn" onclick="deleteStop(${stop.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    if (totalDistance > 0) {
        html = `<div class="location-info"><p><strong>Total Route Distance:</strong> ${totalDistance.toFixed(2)} km</p></div>` + html;
    }
    
    container.innerHTML = html;
}

// View stop on map
function viewStopOnMap(index) {
    const stop = tourData.stops[index];
    if (stop.coords && map) {
        // Switch to location tab
        document.querySelector('[data-tab="location"]').click();
        
        // Center map on stop
        map.setView(stop.coords, 15);
        
        // Add/update marker
        L.marker(stop.coords)
            .addTo(map)
            .bindPopup(`<strong>${stop.name}</strong><br>${stop.location || ''}`)
            .openPopup();
    }
}

function deleteStop(id) {
    if (confirm('Are you sure you want to delete this stop?')) {
        tourData.stops = tourData.stops.filter(stop => stop.id !== id);
        saveData();
        displayStops();
        
        // Update route display and summary
        if (map) {
            calculateAndDisplayRoute();
        }
        updateRouteSummary();
    }
}

// ==================== LOCATION TRACKING ====================
// Functions now loaded from location-tracking.js module

function initMap() {
    if (window.locationTrackingModule) {
        window.locationTrackingModule.initMap();
    }
}

function initLocationTracking() {
    if (window.locationTrackingModule) {
        window.locationTrackingModule.initLocationTracking();
    }
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    if (window.locationTrackingModule) {
        return window.locationTrackingModule.calculateDistance(lat1, lon1, lat2, lon2);
    }
    // Fallback Haversine formula
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function calculateTotalDistance() {
    if (window.locationTrackingModule) {
        return window.locationTrackingModule.calculateTotalDistance();
    }
    return 0;
}

function updateRouteSummary() {
    if (window.locationTrackingModule) {
        window.locationTrackingModule.updateRouteSummary();
    }
}

function displayLocationHistory() {
    if (window.locationTrackingModule) {
        window.locationTrackingModule.displayLocationHistory();
    }
}

// Old implementation removed - now handled by location-tracking.js module
// Keeping wrapper functions for backwards compatibility

function oldInitMap() {
    // Old code - Initialize Leaflet map with default location (Delhi, India)
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
    if (tourData.locationHistory.length > 0) {
        locationPath = tourData.locationHistory.map(loc => [loc.lat, loc.lng]);
        polyline.setLatLngs(locationPath);
        
        const lastLocation = tourData.locationHistory[tourData.locationHistory.length - 1];
        const position = [lastLocation.lat, lastLocation.lng];
        marker.setLatLng(position);
        map.setView(position, 13);
        
        // Add markers for all locations
        tourData.locationHistory.forEach((loc, index) => {
            const histMarker = L.circleMarker([loc.lat, loc.lng], {
                radius: 5,
                color: '#2563eb',
                fillColor: '#60a5fa',
                fillOpacity: 0.8
            }).addTo(map);
            
            histMarker.bindPopup(`
                <strong>Point ${index + 1}</strong><br>
                Time: ${new Date(loc.timestamp).toLocaleString()}<br>
                Accuracy: ${loc.accuracy.toFixed(2)}m
            `);
        });
    }
    
    // Calculate and display route if stops exist
    calculateAndDisplayRoute();
}

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance; // returns distance in kilometers
}

// Calculate total distance of location history
function calculateTotalDistance() {
    if (locationPath.length < 2) return 0;
    
    let totalDistance = 0;
    for (let i = 0; i < locationPath.length - 1; i++) {
        const [lat1, lon1] = locationPath[i];
        const [lat2, lon2] = locationPath[i + 1];
        totalDistance += calculateDistance(lat1, lon1, lat2, lon2);
    }
    
    return totalDistance;
}

// Calculate and display route from stops
function calculateAndDisplayRoute() {
    if (!map) return;
    
    // Clear existing route markers
    routeMarkers.forEach(marker => map.removeLayer(marker));
    routeMarkers = [];
    
    // Build complete route points
    const routePoints = [];
    const pointLabels = [];
    
    // Add start point
    if (tourData.route && tourData.route.startCoords) {
        routePoints.push(tourData.route.startCoords);
        pointLabels.push({
            label: 'START',
            name: tourData.route.start || 'Starting Point',
            color: '#3b82f6'
        });
    }
    
    // Add all stops with coordinates
    if (tourData.stops) {
        tourData.stops.forEach((stop, index) => {
            if (stop.coords) {
                routePoints.push(stop.coords);
                pointLabels.push({
                    label: (index + 1).toString(),
                    name: stop.name,
                    color: '#10b981'
                });
            }
        });
    }
    
    // Add end point
    if (tourData.route && tourData.route.endCoords) {
        routePoints.push(tourData.route.endCoords);
        pointLabels.push({
            label: 'END',
            name: tourData.route.end || 'Destination',
            color: '#ef4444'
        });
    }
    
    if (routePoints.length > 0) {
        // Draw route on map
        routePolyline.setLatLngs(routePoints);
        
        // Add markers for each route point
        routePoints.forEach((point, index) => {
            const label = pointLabels[index];
            const routeMarker = L.marker(point, {
                icon: L.divIcon({
                    className: 'route-marker',
                    html: `<div style="background: ${label.color}; color: white; border-radius: 50%; width: 35px; height: 35px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); font-size: ${label.label.length > 2 ? '10px' : '14px'};">${label.label}</div>`,
                    iconSize: [35, 35]
                })
            }).addTo(map);
            
            routeMarker.bindPopup(`<strong>${label.name}</strong><br>Point ${index + 1} of ${routePoints.length}`);
            routeMarkers.push(routeMarker);
        });
        
        // Calculate total distance
        let totalDist = 0;
        for (let i = 0; i < routePoints.length - 1; i++) {
            totalDist += calculateDistance(
                routePoints[i][0], routePoints[i][1],
                routePoints[i + 1][0], routePoints[i + 1][1]
            );
        }
        
        // Update route info display
        document.getElementById('routeInfo').style.display = 'block';
        document.getElementById('routeDistance').textContent = totalDist.toFixed(2);
        document.getElementById('routePoints').textContent = routePoints.length;
        
        // Fit map to show all route points
        if (routePoints.length > 0) {
            map.fitBounds(routePolyline.getBounds(), { padding: [50, 50] });
        }
    } else {
        // Hide route info if no points
        document.getElementById('routeInfo').style.display = 'none';
        routePolyline.setLatLngs([]);
    }
}

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
    
    // Check initial permission status
    checkLocationPermission();
    
    // Request location permission
    requestPermissionBtn.addEventListener('click', async function() {
        if ('geolocation' in navigator) {
            try {
                // Request permission by trying to get current position
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
    
    startBtn.addEventListener('click', function() {
        if ('geolocation' in navigator) {
            startBtn.disabled = true;
            stopBtn.disabled = false;
            
            trackingInterval = setInterval(() => {
                getCurrentPosition();
            }, 30000); // Update every 30 seconds
            
            getCurrentPosition();
            alert('📍 Location tracking started! Updates every 30 seconds.');
        } else {
            alert('❌ Geolocation is not supported by your browser');
        }
    });
    
    stopBtn.addEventListener('click', function() {
        clearInterval(trackingInterval);
        startBtn.disabled = false;
        stopBtn.disabled = true;
        alert('🛑 Location tracking stopped!');
    });
    
    getCurrentBtn.addEventListener('click', getCurrentPosition);
    
    // Open in Google Maps
    openInMapsBtn.addEventListener('click', function() {
        if (tourData.locationHistory.length > 0) {
            const lastLocation = tourData.locationHistory[tourData.locationHistory.length - 1];
            const url = `https://www.google.com/maps?q=${lastLocation.lat},${lastLocation.lng}`;
            window.open(url, '_blank');
        } else {
            alert('No location data available yet. Please get your current location first.');
        }
    });
    
    // Clear route
    clearRouteBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to clear the route?')) {
            // Clear route polyline
            if (routePolyline) {
                routePolyline.setLatLngs([]);
            }
            
            // Clear route markers
            routeMarkers.forEach(marker => map.removeLayer(marker));
            routeMarkers = [];
            
            // Clear route data
            if (tourData.route) {
                delete tourData.route.startCoords;
                delete tourData.route.endCoords;
            }
            tourData.stops.forEach(stop => {
                delete stop.coords;
            });
            
            saveData();
            
            // Hide route info
            document.getElementById('routeInfo').style.display = 'none';
            
            alert('Route cleared!');
        }
    });
    
    // Export route data
    exportRouteBtn.addEventListener('click', function() {
        const totalDist = calculateTotalDistance();
        
        const routeData = {
            route: tourData.route,
            stops: tourData.stops,
            locationHistory: tourData.locationHistory,
            totalDistance: totalDist.toFixed(2) + ' km',
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(routeData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `route-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        alert('Route data exported successfully!');
    });
    
    // Clear all location history
    clearHistoryBtn.addEventListener('click', function() {
        if (confirm('⚠️ Are you sure you want to clear ALL location history?\n\nThis will delete:\n• All recorded GPS points\n• Location tracking data\n• Travel path on map\n\nThis action cannot be undone!')) {
            // Clear location history data
            tourData.locationHistory = [];
            locationPath = [];
            
            // Clear map elements
            if (map && polyline) {
                polyline.setLatLngs([]);
                
                // Remove all circle markers (blue dots)
                map.eachLayer(function(layer) {
                    if (layer instanceof L.CircleMarker) {
                        map.removeLayer(layer);
                    }
                });
            }
            
            // Clear current location info
            document.getElementById('currentLocationInfo').innerHTML = '';
            
            // Disable "Open in Maps" button
            document.getElementById('openInMaps').disabled = true;
            
            // Save and update display
            saveData();
            displayLocationHistory();
            
            alert('✅ All location history has been cleared!');
        }
    });
    
    // Remove last point
    clearLastPointBtn.addEventListener('click', function() {
        if (tourData.locationHistory.length === 0) {
            alert('No location points to remove!');
            return;
        }
        
        if (confirm('Remove the most recent location point?')) {
            // Remove last point from history
            tourData.locationHistory.pop();
            
            // Update location path
            if (locationPath.length > 0) {
                locationPath.pop();
            }
            
            // Update map
            if (map && polyline) {
                polyline.setLatLngs(locationPath);
                
                // Remove last circle marker
                let circleMarkers = [];
                map.eachLayer(function(layer) {
                    if (layer instanceof L.CircleMarker) {
                        circleMarkers.push(layer);
                    }
                });
                
                if (circleMarkers.length > 0) {
                    map.removeLayer(circleMarkers[circleMarkers.length - 1]);
                }
            }
            
            // Update display
            saveData();
            displayLocationHistory();
            
            // Update current location info if no points left
            if (tourData.locationHistory.length === 0) {
                document.getElementById('currentLocationInfo').innerHTML = '';
                document.getElementById('openInMaps').disabled = true;
            }
            
            alert('✅ Last location point removed!');
        }
    });
}

function checkLocationPermission() {
    if ('permissions' in navigator) {
        navigator.permissions.query({ name: 'geolocation' }).then(function(result) {
            showPermissionStatus(result.state);
            
            result.addEventListener('change', function() {
                showPermissionStatus(result.state);
            });
        }).catch(function(error) {
            console.log('Permission API not supported:', error);
        });
    }
}

function showPermissionStatus(status) {
    const permissionStatus = document.getElementById('permissionStatus');
    const permissionText = document.getElementById('permissionText');
    const requestPermissionBtn = document.getElementById('requestPermission');
    
    permissionStatus.style.display = 'block';
    
    if (status === 'granted') {
        permissionText.textContent = '✅ Granted';
        permissionText.style.color = '#10b981';
        requestPermissionBtn.style.display = 'none';
    } else if (status === 'denied') {
        permissionText.textContent = '❌ Denied';
        permissionText.style.color = '#ef4444';
        requestPermissionBtn.style.display = 'inline-flex';
        permissionStatus.innerHTML += '<p style="color: #ef4444; margin-top: 10px;">Please enable location access in your browser settings.</p>';
    } else {
        permissionText.textContent = '⚠️ Not granted yet';
        permissionText.style.color = '#f59e0b';
        requestPermissionBtn.style.display = 'inline-flex';
    }
}

function getCurrentPosition() {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const timestamp = new Date().toISOString();
                
                // Update map
                const currentPos = [lat, lng];
                if (map) {
                    marker.setLatLng(currentPos).update();
                    marker.bindPopup(`<strong>Current Location</strong><br>Time: ${new Date(timestamp).toLocaleString()}`).openPopup();
                    map.setView(currentPos, 15);
                    
                    locationPath.push(currentPos);
                    polyline.setLatLngs(locationPath);
                    
                    // Add a small marker for this point
                    L.circleMarker(currentPos, {
                        radius: 5,
                        color: '#2563eb',
                        fillColor: '#60a5fa',
                        fillOpacity: 0.8
                    }).addTo(map).bindPopup(`
                        <strong>Point ${locationPath.length}</strong><br>
                        Time: ${new Date(timestamp).toLocaleString()}
                    `);
                }
                
                // Save to history
                tourData.locationHistory.push({
                    lat: lat,
                    lng: lng,
                    timestamp: timestamp,
                    accuracy: position.coords.accuracy
                });
                
                saveData();
                
                // Enable "Open in Google Maps" button
                document.getElementById('openInMaps').disabled = false;
                
                // Calculate total distance traveled
                const totalDist = calculateTotalDistance();
                
                // Display current location info
                document.getElementById('currentLocationInfo').innerHTML = `
                    <p><strong>📍 Current Location</strong></p>
                    <p><strong>Latitude:</strong> ${lat.toFixed(6)}</p>
                    <p><strong>Longitude:</strong> ${lng.toFixed(6)}</p>
                    <p><strong>Accuracy:</strong> ${position.coords.accuracy.toFixed(2)} meters</p>
                    <p><strong>Time:</strong> ${new Date(timestamp).toLocaleString()}</p>
                    <p><strong>Total Distance Traveled:</strong> ${totalDist.toFixed(2)} km</p>
                    <a href="https://www.google.com/maps?q=${lat},${lng}" target="_blank" class="btn btn-info" style="margin-top: 10px; display: inline-flex; text-decoration: none;">
                        <i class="fas fa-external-link-alt"></i> Open This Location in Google Maps
                    </a>
                `;
                
                displayLocationHistory();
            },
            function(error) {
                let errorMessage = 'Error getting location: ';
                if (error.code === error.PERMISSION_DENIED) {
                    errorMessage += 'Location permission denied. Please click "Enable Location Permission" button.';
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    errorMessage += 'Location information unavailable.';
                } else if (error.code === error.TIMEOUT) {
                    errorMessage += 'Request timeout. Please try again.';
                } else {
                    errorMessage += error.message;
                }
                alert(errorMessage);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    }
}

function displayLocationHistory() {
    const container = document.getElementById('locationHistory');
    
    if (tourData.locationHistory.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-history"></i><p>No location history yet</p></div>';
        return;
    }
    
    const totalDist = calculateTotalDistance();
    let html = `<div class="location-info" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
        <h4 style="color: white; margin-bottom: 10px;"><i class="fas fa-route"></i> Journey Summary</h4>
        <p><strong>Total Distance Traveled:</strong> ${totalDist.toFixed(2)} km</p>
        <p><strong>Total Points Recorded:</strong> ${tourData.locationHistory.length}</p>
        <p><strong>Start Time:</strong> ${new Date(tourData.locationHistory[0].timestamp).toLocaleString()}</p>
        <p><strong>Last Update:</strong> ${new Date(tourData.locationHistory[tourData.locationHistory.length - 1].timestamp).toLocaleString()}</p>
    </div>`;
    
    tourData.locationHistory.slice().reverse().forEach((location, revIndex) => {
        const index = tourData.locationHistory.length - 1 - revIndex;
        
        // Calculate distance from previous point
        let distFromPrev = 0;
        if (index > 0) {
            const prevLoc = tourData.locationHistory[index - 1];
            distFromPrev = calculateDistance(
                prevLoc.lat, prevLoc.lng,
                location.lat, location.lng
            );
        }
        
        html += `
            <div class="record-item">
                <div class="record-info">
                    <p><strong>Point ${index + 1}</strong> ${index === tourData.locationHistory.length - 1 ? '<span style="color: #10b981; font-weight: bold;">(Current)</span>' : ''}</p>
                    <p><strong>Time:</strong> ${new Date(location.timestamp).toLocaleString()}</p>
                    <p><strong>Coordinates:</strong> ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}</p>
                    <p><strong>Accuracy:</strong> ${location.accuracy.toFixed(2)}m</p>
                    ${distFromPrev > 0 ? `<p><strong>Distance from previous:</strong> ${distFromPrev.toFixed(3)} km</p>` : ''}
                    <a href="https://www.google.com/maps?q=${location.lat},${location.lng}" target="_blank" class="btn btn-info" style="margin-top: 10px;">
                        <i class="fas fa-external-link-alt"></i> View on Google Maps
                    </a>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// ==================== EXPENSES SECTION ====================

function initExpenseForm() {
    const form = document.getElementById('expenseForm');
    
    // Set current date
    document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const expense = {
            id: Date.now(),
            category: document.getElementById('expenseCategory').value,
            amount: parseFloat(document.getElementById('expenseAmount').value),
            date: document.getElementById('expenseDate').value,
            paidBy: document.getElementById('expensePaidBy').value || 'Unknown',
            description: document.getElementById('expenseDescription').value
        };
        
        tourData.expenses.push(expense);
        saveData();
        
        form.reset();
        document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
        
        displayExpenses();
        updateExpenseDashboard();
        alert('Expense added successfully!');
    });
}

function displayExpenses() {
    const container = document.getElementById('expensesList');
    
    if (tourData.expenses.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-receipt"></i><p>No expenses recorded yet</p></div>';
        return;
    }
    
    let html = '';
    tourData.expenses.slice().reverse().forEach(expense => {
        html += `
            <div class="record-item">
                <div class="record-info">
                    <p><strong>Category:</strong> ${expense.category}</p>
                    <p><strong>Amount:</strong> ₹${expense.amount.toFixed(2)}</p>
                    <p><strong>Date:</strong> ${new Date(expense.date).toLocaleDateString()}</p>
                    <p><strong>Paid By:</strong> ${expense.paidBy}</p>
                    ${expense.description ? `<p><strong>Description:</strong> ${expense.description}</p>` : ''}
                </div>
                <div class="record-actions">
                    <button class="delete-btn" onclick="deleteExpense(${expense.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Display breakdown by category
    displayExpenseBreakdown();
}

function displayExpenseBreakdown() {
    const container = document.getElementById('expenseBreakdown');
    const categoryTotals = {};
    
    tourData.expenses.forEach(expense => {
        if (!categoryTotals[expense.category]) {
            categoryTotals[expense.category] = 0;
        }
        categoryTotals[expense.category] += expense.amount;
    });
    
    let html = '';
    Object.keys(categoryTotals).forEach(category => {
        html += `
            <div class="expense-category">
                <span class="category-name">
                    <i class="fas fa-circle" style="color: var(--primary-color); font-size: 0.6rem;"></i>
                    ${category}
                </span>
                <span class="category-amount">₹${categoryTotals[category].toFixed(2)}</span>
            </div>
        `;
    });
    
    container.innerHTML = html || '<div class="empty-state"><p>No expenses yet</p></div>';
}

function deleteExpense(id) {
    if (confirm('Are you sure you want to delete this expense?')) {
        tourData.expenses = tourData.expenses.filter(expense => expense.id !== id);
        saveData();
        displayExpenses();
        updateExpenseDashboard();
    }
}

function updateExpenseDashboard() {
    // Calculate total contributions
    const totalContributions = tourData.contributions.reduce((sum, contribution) => {
        return sum + contribution.amount;
    }, 0);
    
    // Calculate total expenses
    const totalExpenses = tourData.expenses.reduce((sum, expense) => {
        return sum + expense.amount;
    }, 0);
    
    // Calculate balance
    const balance = totalContributions - totalExpenses;
    
    // Update dashboard
    document.getElementById('totalContributions').textContent = `₹${totalContributions.toFixed(2)}`;
    document.getElementById('totalExpenses').textContent = `₹${totalExpenses.toFixed(2)}`;
    document.getElementById('balanceAmount').textContent = `₹${balance.toFixed(2)}`;
    
    // Change color based on balance
    const balanceCard = document.querySelector('.dashboard-card.balance');
    if (balance < 0) {
        balanceCard.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
    } else {
        balanceCard.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
    }
}

// Export data function (can be called from console)
function exportData() {
    const dataStr = JSON.stringify(tourData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tour-management-data.json';
    link.click();
}

// Import data function (can be called from console)
function importData(jsonData) {
    try {
        tourData = JSON.parse(jsonData);
        saveData();
        location.reload();
    } catch (error) {
        alert('Error importing data: ' + error.message);
    }
}

// ==================== PDF REPORT GENERATION ====================

function initPdfReport() {
    const generateBtn = document.getElementById('generatePdfReport');
    
    if (generateBtn) {
        generateBtn.addEventListener('click', generateTripPdfReport);
    }
}

function generateTripPdfReport() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        let yPosition = 20;
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 15;
        
        // Helper function to check and add new page
        function checkPageBreak(neededSpace) {
            if (yPosition + neededSpace > pageHeight - 20) {
                doc.addPage();
                yPosition = 20;
                return true;
            }
            return false;
        }
        
        // Title
        doc.setFontSize(22);
        doc.setTextColor(102, 126, 234);
        doc.text('TOUR MANAGEMENT REPORT', pageWidth / 2, yPosition, { align: 'center' });
        
        yPosition += 10;
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, yPosition, { align: 'center' });
        
        yPosition += 15;
        
        // Calculate all statistics
        const totalContributions = tourData.contributions.reduce((sum, c) => sum + c.amount, 0);
        const totalExpenses = tourData.expenses.reduce((sum, e) => sum + e.amount, 0);
        const balance = totalContributions - totalExpenses;
        const totalDistance = calculateTotalDistance();
        const totalDieselCost = tourData.dieselRecords.reduce((sum, d) => sum + d.cost, 0);
        const totalDieselLiters = tourData.dieselRecords.reduce((sum, d) => sum + d.amount, 0);
        
        // ========== TRIP SUMMARY ==========
        doc.setFillColor(102, 126, 234);
        doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.text('TRIP SUMMARY', margin + 5, yPosition + 5.5);
        yPosition += 12;
        
        doc.setFontSize(10);
        doc.setTextColor(0);
        
        if (tourData.route && tourData.route.start) {
            doc.text(`Route: ${tourData.route.start || 'N/A'} → ${tourData.route.end || 'N/A'}`, margin, yPosition);
            yPosition += 6;
        }
        
        if (tourData.route && tourData.route.startDate) {
            doc.text(`Start Date: ${tourData.route.startDate || 'N/A'}`, margin, yPosition);
            doc.text(`End Date: ${tourData.route.endDate || 'N/A'}`, pageWidth / 2, yPosition);
            yPosition += 6;
        }
        
        doc.text(`Total Distance Traveled: ${totalDistance.toFixed(2)} km`, margin, yPosition);
        yPosition += 6;
        doc.text(`Total Stops: ${tourData.stops ? tourData.stops.length : 0}`, margin, yPosition);
        yPosition += 10;
        
        // ========== DRIVER INFORMATION ==========
        checkPageBreak(30);
        doc.setFillColor(52, 152, 219);
        doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.text('DRIVER INFORMATION', margin + 5, yPosition + 5.5);
        yPosition += 12;
        
        doc.setFontSize(10);
        doc.setTextColor(0);
        
        if (tourData.driver && tourData.driver.name) {
            // Driver image (if available)
            if (tourData.driver.imageUrl) {
                try {
                    // Add driver image (small thumbnail)
                    const imgWidth = 30;
                    const imgHeight = 30;
                    doc.addImage(tourData.driver.imageUrl, 'JPEG', pageWidth - margin - imgWidth, yPosition, imgWidth, imgHeight);
                } catch (error) {
                    console.log('Could not add driver image to PDF:', error);
                }
            }
            
            doc.text(`Driver Name: ${tourData.driver.name || 'N/A'}`, margin, yPosition);
            yPosition += 6;
            doc.text(`Mobile: ${tourData.driver.mobile || 'N/A'}`, margin, yPosition);
            doc.text(`Car Number: ${tourData.driver.carNumber || 'N/A'}`, pageWidth / 2, yPosition);
            yPosition += 10;
        }
        
        // ========== FINANCIAL SUMMARY ==========
        checkPageBreak(50);
        doc.setFillColor(16, 185, 129);
        doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.text('FINANCIAL SUMMARY', margin + 5, yPosition + 5.5);
        yPosition += 12;
        
        doc.setFontSize(11);
        doc.setTextColor(0);
        
        // Financial boxes
        const boxWidth = (pageWidth - 2 * margin - 10) / 3;
        const boxHeight = 20;
        
        // Total Contributions Box
        doc.setFillColor(16, 185, 129);
        doc.roundedRect(margin, yPosition, boxWidth, boxHeight, 3, 3, 'F');
        doc.setTextColor(255);
        doc.setFontSize(9);
        doc.text('Total Contributions', margin + boxWidth / 2, yPosition + 7, { align: 'center' });
        doc.setFontSize(14);
        doc.text(`₹${totalContributions.toFixed(2)}`, margin + boxWidth / 2, yPosition + 15, { align: 'center' });
        
        // Total Expenses Box
        doc.setFillColor(239, 68, 68);
        doc.roundedRect(margin + boxWidth + 5, yPosition, boxWidth, boxHeight, 3, 3, 'F');
        doc.setFontSize(9);
        doc.text('Total Expenses', margin + boxWidth + 5 + boxWidth / 2, yPosition + 7, { align: 'center' });
        doc.setFontSize(14);
        doc.text(`₹${totalExpenses.toFixed(2)}`, margin + boxWidth + 5 + boxWidth / 2, yPosition + 15, { align: 'center' });
        
        // Balance Box
        doc.setFillColor(balance >= 0 ? 245, 158, 11 : 220, 38, 38);
        doc.roundedRect(margin + 2 * (boxWidth + 5), yPosition, boxWidth, boxHeight, 3, 3, 'F');
        doc.setFontSize(9);
        doc.text('Balance', margin + 2 * (boxWidth + 5) + boxWidth / 2, yPosition + 7, { align: 'center' });
        doc.setFontSize(14);
        doc.text(`₹${balance.toFixed(2)}`, margin + 2 * (boxWidth + 5) + boxWidth / 2, yPosition + 15, { align: 'center' });
        
        yPosition += boxHeight + 10;
        
        // ========== DIESEL SUMMARY ==========
        checkPageBreak(30);
        doc.setFillColor(245, 158, 11);
        doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.text('DIESEL SUMMARY', margin + 5, yPosition + 5.5);
        yPosition += 12;
        
        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.text(`Total Diesel Cost: ₹${totalDieselCost.toFixed(2)}`, margin, yPosition);
        yPosition += 6;
        doc.text(`Total Diesel Quantity: ${totalDieselLiters.toFixed(2)} Liters`, margin, yPosition);
        yPosition += 6;
        
        if (totalDieselLiters > 0) {
            const avgPrice = totalDieselCost / totalDieselLiters;
            doc.text(`Average Price per Liter: ₹${avgPrice.toFixed(2)}`, margin, yPosition);
            yPosition += 6;
        }
        
        if (totalDistance > 0 && totalDieselLiters > 0) {
            const fuelEfficiency = totalDistance / totalDieselLiters;
            doc.text(`Fuel Efficiency: ${fuelEfficiency.toFixed(2)} km/L`, margin, yPosition);
            yPosition += 6;
        }
        
        doc.text(`Number of Refills: ${tourData.dieselRecords.length}`, margin, yPosition);
        yPosition += 10;
        
        // ========== FAMILY CONTRIBUTIONS ==========
        if (tourData.contributions && tourData.contributions.length > 0) {
            checkPageBreak(60);
            doc.setFillColor(139, 92, 246);
            doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(14);
            doc.text('MEMBER CONTRIBUTIONS', margin + 5, yPosition + 5.5);
            yPosition += 12;
            
            // Calculate contributions by member
            const memberContributions = {};
            tourData.contributions.forEach(c => {
                if (!memberContributions[c.member]) {
                    memberContributions[c.member] = 0;
                }
                memberContributions[c.member] += c.amount;
            });
            
            // Create table data
            const contributionData = Object.keys(memberContributions).map(member => [
                member,
                `₹${memberContributions[member].toFixed(2)}`
            ]);
            
            doc.autoTable({
                startY: yPosition,
                head: [['Member Name', 'Total Contribution']],
                body: contributionData,
                theme: 'grid',
                headStyles: { fillColor: [139, 92, 246], textColor: 255 },
                margin: { left: margin, right: margin },
                styles: { fontSize: 10 }
            });
            
            yPosition = doc.lastAutoTable.finalY + 10;
        }
        
        // ========== EXPENSE BREAKDOWN ==========
        if (tourData.expenses && tourData.expenses.length > 0) {
            checkPageBreak(60);
            doc.setFillColor(236, 72, 153);
            doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(14);
            doc.text('EXPENSE BREAKDOWN BY CATEGORY', margin + 5, yPosition + 5.5);
            yPosition += 12;
            
            // Calculate expenses by category
            const categoryExpenses = {};
            tourData.expenses.forEach(e => {
                if (!categoryExpenses[e.category]) {
                    categoryExpenses[e.category] = 0;
                }
                categoryExpenses[e.category] += e.amount;
            });
            
            // Create table data
            const expenseData = Object.keys(categoryExpenses).map(category => [
                category,
                `₹${categoryExpenses[category].toFixed(2)}`,
                `${((categoryExpenses[category] / totalExpenses) * 100).toFixed(1)}%`
            ]);
            
            doc.autoTable({
                startY: yPosition,
                head: [['Category', 'Amount', 'Percentage']],
                body: expenseData,
                theme: 'grid',
                headStyles: { fillColor: [236, 72, 153], textColor: 255 },
                margin: { left: margin, right: margin },
                styles: { fontSize: 10 }
            });
            
            yPosition = doc.lastAutoTable.finalY + 10;
        }
        
        // ========== DETAILED DIESEL RECORDS ==========
        if (tourData.dieselRecords && tourData.dieselRecords.length > 0) {
            checkPageBreak(60);
            doc.addPage();
            yPosition = 20;
            
            doc.setFillColor(245, 158, 11);
            doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(14);
            doc.text('DETAILED DIESEL RECORDS', margin + 5, yPosition + 5.5);
            yPosition += 12;
            
            const dieselData = tourData.dieselRecords.map(d => [
                new Date(d.date).toLocaleDateString(),
                `${d.km} km`,
                `${d.amount} L`,
                `₹${d.cost.toFixed(2)}`,
                `₹${(d.cost / d.amount).toFixed(2)}/L`
            ]);
            
            doc.autoTable({
                startY: yPosition,
                head: [['Date', 'Km Reading', 'Quantity', 'Cost', 'Price/L']],
                body: dieselData,
                theme: 'striped',
                headStyles: { fillColor: [245, 158, 11], textColor: 255 },
                margin: { left: margin, right: margin },
                styles: { fontSize: 9 }
            });
            
            yPosition = doc.lastAutoTable.finalY + 10;
        }
        
        // ========== STOPS INFORMATION ==========
        if (tourData.stops && tourData.stops.length > 0) {
            checkPageBreak(60);
            if (yPosition > pageHeight - 80) {
                doc.addPage();
                yPosition = 20;
            }
            
            doc.setFillColor(59, 130, 246);
            doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(14);
            doc.text('TRIP STOPS', margin + 5, yPosition + 5.5);
            yPosition += 12;
            
            const stopsData = tourData.stops.map((stop, index) => [
                `${index + 1}`,
                stop.name,
                stop.location || 'N/A',
                stop.arrival ? new Date(stop.arrival).toLocaleString() : 'N/A'
            ]);
            
            doc.autoTable({
                startY: yPosition,
                head: [['#', 'Stop Name', 'Location', 'Arrival Time']],
                body: stopsData,
                theme: 'grid',
                headStyles: { fillColor: [59, 130, 246], textColor: 255 },
                margin: { left: margin, right: margin },
                styles: { fontSize: 9 }
            });
            
            yPosition = doc.lastAutoTable.finalY + 10;
        }
        
        // ========== FOOTER ==========
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(
                `Page ${i} of ${pageCount}`,
                pageWidth / 2,
                pageHeight - 10,
                { align: 'center' }
            );
            doc.text(
                'Generated by Tour Management System',
                pageWidth - margin,
                pageHeight - 10,
                { align: 'right' }
            );
        }
        
        // Save the PDF
        const fileName = `Trip_Report_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        
        alert('✅ PDF Report generated successfully!');
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('❌ Error generating PDF report: ' + error.message);
    }
}

