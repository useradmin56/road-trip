// Driver Information Module for Tour Management System

// Driver Info Module
const driverInfoModule = {
    
    // Initialize real-time updates
    initRealTimeUpdates() {
        // Listen for storage changes (when data is updated in other tabs/pages)
        window.addEventListener('storage', (e) => {
            if (e.key === 'tourManagementData') {
                try {
                    const newData = JSON.parse(e.newValue);
                    if (newData && newData.driver) {
                        this.showUpdateIndicator();
                        tourData = newData;
                        this.displayDriverProfile();
                        this.displayDriverStats();
                        console.log('🔄 Driver info updated from storage');
                    }
                } catch (error) {
                    console.error('Error updating driver info from storage:', error);
                }
            }
        });

        // Listen for custom driver update events
        window.addEventListener('driverInfoUpdated', (e) => {
            console.log('🔄 Driver info updated from event');
            this.showUpdateIndicator();
            this.displayDriverProfile();
            this.displayDriverStats();
        });

        // Periodic check for data changes (every 2 seconds)
        setInterval(() => {
            this.checkForUpdates();
        }, 2000);
    },

    // Check for updates in tourData
    checkForUpdates() {
        try {
            const savedData = localStorage.getItem('tourManagementData');
            if (savedData) {
                const currentData = JSON.parse(savedData);
                if (currentData && currentData.driver) {
                    // Check if driver data has changed
                    const currentDriverString = JSON.stringify(currentData.driver);
                    const previousDriverString = JSON.stringify(tourData.driver);
                    
                    if (currentDriverString !== previousDriverString) {
                        this.showUpdateIndicator();
                        tourData = currentData;
                        this.displayDriverProfile();
                        this.displayDriverStats();
                        console.log('🔄 Driver info updated from periodic check');
                    }
                }
            }
        } catch (error) {
            console.error('Error checking for driver updates:', error);
        }
    },

    // Force refresh driver data
    refreshDriverData() {
        this.checkForUpdates();
    },

    // Show update indicator
    showUpdateIndicator() {
        const container = document.getElementById('driverProfileSection');
        if (!container) return;

        // Add update indicator
        let indicator = document.getElementById('updateIndicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'updateIndicator';
            indicator.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #3b82f6;
                color: white;
                padding: 10px 15px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 600;
                z-index: 1000;
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
                display: flex;
                align-items: center;
                gap: 8px;
            `;
            document.body.appendChild(indicator);
        }

        indicator.innerHTML = `
            <i class="fas fa-sync-alt fa-spin"></i>
            Updating driver info...
        `;
        indicator.style.display = 'flex';

        // Hide after 2 seconds
        setTimeout(() => {
            indicator.style.display = 'none';
        }, 2000);
    },

    // Display driver profile
    displayDriverProfile() {
        const container = document.getElementById('driverProfileSection');
        
        if (!tourData.driver || !tourData.driver.name) {
            container.innerHTML = this.getNoDriverState();
            return;
        }

        const driver = tourData.driver;
        
        container.innerHTML = `
            <div class="driver-profile-card">
                <div class="driver-image-container">
                    ${driver.imageUrl ? `
                        <img src="${driver.imageUrl}" alt="Driver Photo" class="driver-image" id="driverImage">
                        <div class="image-actions">
                            <button class="image-action-btn view" onclick="openImageModal('${driver.imageUrl}')" title="View Full Size">
                                <i class="fas fa-eye"></i>
                            </button>
                            ${driver.imagePublicId ? `
                                <button class="image-action-btn delete" onclick="deleteDriverImage('${driver.imagePublicId}')" title="Remove Image">
                                    <i class="fas fa-trash"></i>
                                </button>
                            ` : ''}
                        </div>
                    ` : `
                        <div class="driver-image" style="background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%); display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-user" style="font-size: 60px; color: #9ca3af;"></i>
                        </div>
                    `}
                </div>
                
                <div class="driver-name">${driver.name}</div>
                <div class="driver-role">
                    <i class="fas fa-car"></i> Driver & Vehicle Operator
                </div>
                
                <div class="driver-info-grid">
                    <div class="info-card">
                        <h4><i class="fas fa-phone"></i> Contact Information</h4>
                        <p>${driver.mobile || 'Not provided'}</p>
                    </div>
                    
                    <div class="info-card">
                        <h4><i class="fas fa-car"></i> Vehicle Details</h4>
                        <p>${driver.carNumber || 'Not provided'}</p>
                    </div>
                    
                    <div class="info-card">
                        <h4><i class="fas fa-tachometer-alt"></i> Current KM Reading</h4>
                        <p>${driver.currentKm ? driver.currentKm.toLocaleString() + ' km' : 'Not recorded'}</p>
                    </div>
                    
                    <div class="info-card">
                        <h4><i class="fas fa-gas-pump"></i> Diesel Available</h4>
                        <p>${driver.dieselAvailable ? driver.dieselAvailable + ' L' : 'Not recorded'}</p>
                    </div>
                </div>
                
                <div class="action-buttons">
                    <button onclick="window.driverInfoModule.editDriverInfo()" class="btn-large btn-primary">
                        <i class="fas fa-edit"></i> Edit Driver Info
                    </button>
                    <a href="dashboard.html" class="btn-large btn-secondary">
                        <i class="fas fa-chart-line"></i> View Dashboard
                    </a>
                </div>
            </div>
        `;
    },

    // Display driver statistics
    displayDriverStats() {
        const statsContainer = document.getElementById('driverStatsSection');
        if (!statsContainer) return;

        if (!tourData.driver || !tourData.driver.name) {
            statsContainer.innerHTML = '';
            return;
        }

        const driver = tourData.driver;
        const dieselRecords = tourData.dieselRecords || [];
        const totalDieselCost = dieselRecords.reduce((sum, record) => sum + (record.cost || 0), 0);
        const totalDieselAmount = dieselRecords.reduce((sum, record) => sum + (record.amount || 0), 0);
        const lastRefill = dieselRecords.length > 0 ? dieselRecords[dieselRecords.length - 1] : null;

        statsContainer.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <i class="fas fa-tachometer-alt"></i>
                    <h3>${driver.currentKm ? driver.currentKm.toLocaleString() : '0'}</h3>
                    <p>Current KM Reading</p>
                </div>
                
                <div class="stat-card">
                    <i class="fas fa-gas-pump"></i>
                    <h3>${driver.dieselAvailable || '0'}</h3>
                    <p>Diesel Available (L)</p>
                </div>
                
                <div class="stat-card">
                    <i class="fas fa-rupee-sign"></i>
                    <h3>₹${totalDieselCost.toLocaleString()}</h3>
                    <p>Total Diesel Cost</p>
                </div>
                
                <div class="stat-card">
                    <i class="fas fa-oil-can"></i>
                    <h3>${totalDieselAmount.toFixed(1)}</h3>
                    <p>Total Diesel Refilled (L)</p>
                </div>
                
                <div class="stat-card">
                    <i class="fas fa-history"></i>
                    <h3>${dieselRecords.length}</h3>
                    <p>Refill Records</p>
                </div>
                
                <div class="stat-card">
                    <i class="fas fa-calendar"></i>
                    <h3>${lastRefill ? new Date(lastRefill.date).toLocaleDateString() : 'N/A'}</h3>
                    <p>Last Refill Date</p>
                </div>
            </div>
        `;
    },

    // Get no driver state HTML
    getNoDriverState() {
        return `
            <div class="no-driver-state">
                <i class="fas fa-user-slash"></i>
                <h3>No Driver Information Available</h3>
                <p>Please add driver information to view the profile</p>
                <div class="action-buttons">
                    <a href="index.html#driver" class="btn-large btn-primary">
                        <i class="fas fa-plus"></i> Add Driver Information
                    </a>
                    <a href="dashboard.html" class="btn-large btn-secondary">
                        <i class="fas fa-chart-line"></i> View Dashboard
                    </a>
                </div>
            </div>
        `;
    },

    // Get driver image info
    getDriverImageInfo() {
        const driver = tourData.driver;
        if (!driver || !driver.imageUrl) {
            return null;
        }

        return {
            url: driver.imageUrl,
            publicId: driver.imagePublicId,
            width: driver.imageWidth,
            height: driver.imageHeight,
            format: driver.imageFormat,
            bytes: driver.imageBytes
        };
    },

    // Update driver image
    updateDriverImage(imageData) {
        if (!tourData.driver) {
            tourData.driver = {};
        }

        tourData.driver.imageUrl = imageData.url;
        tourData.driver.imagePublicId = imageData.publicId;
        tourData.driver.imageWidth = imageData.width;
        tourData.driver.imageHeight = imageData.height;
        tourData.driver.imageFormat = imageData.format;
        tourData.driver.imageBytes = imageData.bytes;

        // Save data
        if (typeof saveData === 'function') {
            saveData();
        }

        // Refresh display
        this.displayDriverProfile();
    },

    // Remove driver image
    removeDriverImage() {
        if (!tourData.driver) return;

        delete tourData.driver.imageUrl;
        delete tourData.driver.imagePublicId;
        delete tourData.driver.imageWidth;
        delete tourData.driver.imageHeight;
        delete tourData.driver.imageFormat;
        delete tourData.driver.imageBytes;

        // Save data
        if (typeof saveData === 'function') {
            saveData();
        }

        // Refresh display
        this.displayDriverProfile();
    },

    // Get driver summary for dashboard
    getDriverSummary() {
        const driver = tourData.driver;
        if (!driver || !driver.name) {
            return {
                hasDriver: false,
                name: null,
                mobile: null,
                carNumber: null,
                currentKm: null,
                dieselAvailable: null,
                imageUrl: null,
                totalDieselCost: 0,
                totalDieselAmount: 0,
                refillCount: 0
            };
        }

        const dieselRecords = tourData.dieselRecords || [];
        const totalDieselCost = dieselRecords.reduce((sum, record) => sum + (record.cost || 0), 0);
        const totalDieselAmount = dieselRecords.reduce((sum, record) => sum + (record.amount || 0), 0);

        return {
            hasDriver: true,
            name: driver.name,
            mobile: driver.mobile,
            carNumber: driver.carNumber,
            currentKm: driver.currentKm,
            dieselAvailable: driver.dieselAvailable,
            imageUrl: driver.imageUrl,
            imagePublicId: driver.imagePublicId,
            totalDieselCost: totalDieselCost,
            totalDieselAmount: totalDieselAmount,
            refillCount: dieselRecords.length
        };
    },

    // Validate driver data
    validateDriverData() {
        const driver = tourData.driver;
        if (!driver) return false;

        const required = ['name', 'mobile', 'carNumber'];
        return required.every(field => driver[field] && driver[field].trim() !== '');
    },

    // Get driver completion percentage
    getDriverCompletionPercentage() {
        const driver = tourData.driver;
        if (!driver) return 0;

        const fields = [
            'name',
            'mobile', 
            'carNumber',
            'currentKm',
            'dieselAvailable',
            'imageUrl'
        ];

        const completedFields = fields.filter(field => {
            const value = driver[field];
            return value !== undefined && value !== null && value !== '';
        });

        return Math.round((completedFields.length / fields.length) * 100);
    },

    // Export driver data
    exportDriverData() {
        const driver = tourData.driver;
        if (!driver || !driver.name) {
            return null;
        }

        const dieselRecords = tourData.dieselRecords || [];
        const totalDieselCost = dieselRecords.reduce((sum, record) => sum + (record.cost || 0), 0);
        const totalDieselAmount = dieselRecords.reduce((sum, record) => sum + (record.amount || 0), 0);

        return {
            driver: {
                ...driver,
                // Remove image data for export (too large)
                imageUrl: driver.imageUrl ? 'Image available' : null,
                imagePublicId: null,
                imageWidth: null,
                imageHeight: null,
                imageFormat: null,
                imageBytes: null
            },
            statistics: {
                totalDieselCost: totalDieselCost,
                totalDieselAmount: totalDieselAmount,
                refillCount: dieselRecords.length,
                completionPercentage: this.getDriverCompletionPercentage()
            },
            dieselRecords: dieselRecords,
            exportedAt: new Date().toISOString()
        };
    },

    // Edit driver information
    editDriverInfo() {
        const driver = tourData.driver;
        if (!driver) {
            tourData.driver = {};
        }

        // Populate edit form with current data
        document.getElementById('editDriverName').value = driver.name || '';
        document.getElementById('editDriverMobile').value = driver.mobile || '';
        document.getElementById('editCarNumber').value = driver.carNumber || '';
        document.getElementById('editCurrentKm').value = driver.currentKm || '';
        document.getElementById('editDieselAvailable').value = driver.dieselAvailable || '';

        // Show edit form and hide profile
        document.getElementById('driverProfileSection').style.display = 'none';
        document.getElementById('editDriverForm').style.display = 'block';

        // Scroll to edit form
        document.getElementById('editDriverForm').scrollIntoView({ behavior: 'smooth' });
    },

    // Cancel edit
    cancelEdit() {
        document.getElementById('editDriverForm').style.display = 'none';
        document.getElementById('driverProfileSection').style.display = 'block';
        
        // Clear any image preview
        document.getElementById('editDriverImagePreview').style.display = 'none';
        document.getElementById('editImageUploadStatus').style.display = 'none';
        document.getElementById('editDriverImage').value = '';
    },

    // Initialize edit form
    initEditForm() {
        const editForm = document.getElementById('driverEditForm');
        const cancelBtn = document.getElementById('cancelEdit');
        const imageInput = document.getElementById('editDriverImage');

        // Form submission
        editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEditedDriverInfo();
        });

        // Cancel button
        cancelBtn.addEventListener('click', () => {
            this.cancelEdit();
        });

        // Image upload
        imageInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                await this.handleEditImageUpload(file);
            }
        });
    },

    // Handle image upload in edit form
    async handleEditImageUpload(file) {
        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            this.showEditImageUploadStatus('<i class="fas fa-exclamation-triangle"></i> File size must be less than 5MB', 'error');
            document.getElementById('editDriverImage').value = '';
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showEditImageUploadStatus('<i class="fas fa-exclamation-triangle"></i> Please select a valid image file', 'error');
            document.getElementById('editDriverImage').value = '';
            return;
        }

        this.showEditImageUploadStatus('<i class="fas fa-spinner fa-spin"></i> Uploading image...', 'loading');

        try {
            const result = await uploadImageToCloudinary(file);
            
            if (result.success) {
                this.showEditImageUploadStatus('<i class="fas fa-check-circle"></i> Image uploaded successfully!', 'success');
                this.showEditImagePreview(result.url, result.publicId);
                
                // Store image data temporarily for saving
                this.tempImageData = {
                    url: result.url,
                    publicId: result.publicId,
                    width: result.width,
                    height: result.height,
                    format: result.format,
                    bytes: result.bytes
                };
            } else {
                this.showEditImageUploadStatus('<i class="fas fa-exclamation-triangle"></i> Upload failed. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Image upload error:', error);
            this.showEditImageUploadStatus('<i class="fas fa-exclamation-triangle"></i> Upload failed. Please try again.', 'error');
        }
    },

    // Show edit image upload status
    showEditImageUploadStatus(message, type = 'info') {
        const statusDiv = document.getElementById('editImageUploadStatus');
        if (!statusDiv) return;

        statusDiv.style.display = 'block';
        statusDiv.style.padding = '10px';
        statusDiv.style.borderRadius = '6px';
        statusDiv.style.fontSize = '14px';
        statusDiv.style.fontWeight = '500';

        switch(type) {
            case 'success':
                statusDiv.style.background = '#d1fae5';
                statusDiv.style.color = '#065f46';
                statusDiv.style.border = '1px solid #10b981';
                break;
            case 'error':
                statusDiv.style.background = '#fee2e2';
                statusDiv.style.color = '#991b1b';
                statusDiv.style.border = '1px solid #ef4444';
                break;
            case 'info':
                statusDiv.style.background = '#fef3c7';
                statusDiv.style.color = '#92400e';
                statusDiv.style.border = '1px solid #f59e0b';
                break;
            case 'loading':
                statusDiv.style.background = '#e0f2fe';
                statusDiv.style.color = '#075985';
                statusDiv.style.border = '1px solid #0284c7';
                break;
        }

        statusDiv.innerHTML = message;
    },

    // Show edit image preview
    showEditImagePreview(imageUrl, publicId = null) {
        const previewDiv = document.getElementById('editDriverImagePreview');
        if (!previewDiv) return;

        previewDiv.style.display = 'block';
        previewDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px; padding: 15px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                <img src="${imageUrl}" alt="Driver Preview" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 2px solid #e2e8f0;">
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: #1f2937; margin-bottom: 5px;">New Driver Photo Preview</div>
                    <div style="font-size: 12px; color: #6b7280; margin-bottom: 10px;">Image uploaded successfully</div>
                    <div style="display: flex; gap: 10px;">
                        <button type="button" onclick="openImageModal('${imageUrl}')" class="btn btn-sm btn-info" style="font-size: 12px; padding: 6px 12px;">
                            <i class="fas fa-eye"></i> View Full Size
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    // Save edited driver information
    async saveEditedDriverInfo() {
        try {
            // Update driver data
            tourData.driver = {
                name: document.getElementById('editDriverName').value,
                mobile: document.getElementById('editDriverMobile').value,
                carNumber: document.getElementById('editCarNumber').value,
                currentKm: parseFloat(document.getElementById('editCurrentKm').value) || 0,
                dieselAvailable: parseFloat(document.getElementById('editDieselAvailable').value) || 0,
                // Keep existing image data or use new upload
                imageUrl: this.tempImageData?.url || tourData.driver.imageUrl || '',
                imagePublicId: this.tempImageData?.publicId || tourData.driver.imagePublicId || '',
                imageWidth: this.tempImageData?.width || tourData.driver.imageWidth || 0,
                imageHeight: this.tempImageData?.height || tourData.driver.imageHeight || 0,
                imageFormat: this.tempImageData?.format || tourData.driver.imageFormat || '',
                imageBytes: this.tempImageData?.bytes || tourData.driver.imageBytes || 0
            };

            // Save data
            await this.saveData();
            
            // Clear temp image data
            this.tempImageData = null;

            // Show success notification
            this.showNotification('Driver information updated successfully!', 'success');

            // Hide edit form and show updated profile
            document.getElementById('editDriverForm').style.display = 'none';
            document.getElementById('driverProfileSection').style.display = 'block';

            // Refresh the profile display
            this.displayDriverProfile();
            this.displayDriverStats();

            // Dispatch event to notify other pages
            window.dispatchEvent(new CustomEvent('driverInfoUpdated', {
                detail: { driver: tourData.driver }
            }));

        } catch (error) {
            console.error('Error saving driver info:', error);
            this.showNotification('Error saving driver information. Please try again.', 'error');
        }
    },

    // Save data function
    async saveData() {
        try {
            localStorage.setItem('tourManagementData', JSON.stringify(tourData));
            
            if (window.saveToSupabase) {
                await window.saveToSupabase(tourData);
            }
        } catch (error) {
            console.error('Error saving data:', error);
        }
    },

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 1000;
            max-width: 300px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        `;
        
        switch(type) {
            case 'success':
                notification.style.background = '#10b981';
                break;
            case 'error':
                notification.style.background = '#ef4444';
                break;
            case 'warning':
                notification.style.background = '#f59e0b';
                break;
            default:
                notification.style.background = '#3b82f6';
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
};

// Export module
window.driverInfoModule = driverInfoModule;

console.log('✅ Driver Info module loaded successfully');
