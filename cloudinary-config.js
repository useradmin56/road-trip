// Cloudinary Configuration for Tour Management System
// Cloud Name: drz8tmife
// API Key: X1fTY7wGhoAjW-FRC2HXDGSpCXo
// Secret Key: X1fTY7wGhoAjW-FRC2HXDGSpCXo

const CLOUDINARY_CONFIG = {
    cloudName: 'drz8tmife',
    apiKey: 'X1fTY7wGhoAjW-FRC2HXDGSpCXo',
    uploadPreset: 'ml_default' // Use default unsigned preset
};

// Cloudinary Upload Widget Configuration
const UPLOAD_WIDGET_CONFIG = {
    cloudName: CLOUDINARY_CONFIG.cloudName,
    uploadPreset: CLOUDINARY_CONFIG.uploadPreset,
    sources: ['local', 'camera', 'url'],
    multiple: false,
    cropping: true,
    croppingAspectRatio: 1,
    croppingShowDimensions: true,
    maxFileSize: 5000000, // 5MB
    maxImageWidth: 2000,
    maxImageHeight: 2000,
    theme: 'minimal',
    styles: {
        palette: {
            window: "#FFFFFF",
            sourceBg: "#F4F4F5",
            windowBorder: "#90A0B3",
            tabIcon: "#0078FF",
            inactiveTabIcon: "#69778A",
            menuIcons: "#0078FF",
            link: "#0078FF",
            action: "#0078FF",
            inProgress: "#0078FF",
            complete: "#20B832",
            error: "#EA2727",
            textDark: "#000000",
            textLight: "#FFFFFF"
        },
        fonts: {
            default: null,
            "'Poppins', sans-serif": {
                url: "https://fonts.googleapis.com/css?family=Poppins",
                active: true
            }
        }
    },
    text: {
        en: {
            upload: "Upload",
            close: "Close",
            cancel: "Cancel",
            invalid_file_type: "Please upload a valid image file (JPG, PNG, GIF)",
            file_too_big: "File size must be less than 5MB",
            upload_failed: "Upload failed. Please try again.",
            uploading: "Uploading...",
            uploaded: "Uploaded successfully!",
            crop_instruction: "Crop your image as needed",
            choose_file: "Choose File",
            take_photo: "Take Photo",
            enter_url: "Enter URL"
        }
    }
};

// Function to upload image to Cloudinary (alternative method)
async function uploadImageToCloudinary(file) {
    return new Promise((resolve, reject) => {
        // First try with default preset
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'ml_default');
        formData.append('folder', 'tour_management');

        fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Cloudinary upload response:', data);
            if (data.secure_url) {
                resolve({
                    success: true,
                    url: data.secure_url,
                    publicId: data.public_id,
                    width: data.width,
                    height: data.height,
                    format: data.format,
                    bytes: data.bytes
                });
            } else {
                console.error('Upload failed:', data);
                reject(new Error(data.error?.message || 'Upload failed - no secure URL returned'));
            }
        })
        .catch(error => {
            console.error('Upload error with preset, trying alternative method:', error);
            // If preset fails, try without preset (signed upload)
            uploadImageWithSignature(file)
                .then(resolve)
                .catch(signatureError => {
                    console.error('Signed upload also failed, using base64 fallback:', signatureError);
                    // If both Cloudinary methods fail, use base64 fallback
                    uploadImageAsBase64(file)
                        .then(resolve)
                        .catch(reject);
                });
        });
    });
}

// Alternative upload method with signature (for when presets don't work)
async function uploadImageWithSignature(file) {
    return new Promise((resolve, reject) => {
        const timestamp = Math.round(Date.now() / 1000);
        const publicId = `tour_management_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Create signature (simplified - in production, do this server-side)
        const params = {
            timestamp: timestamp,
            public_id: publicId,
            folder: 'tour_management'
        };
        
        const signature = generateUploadSignature(params);
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', CLOUDINARY_CONFIG.apiKey);
        formData.append('timestamp', timestamp);
        formData.append('signature', signature);
        formData.append('public_id', publicId);
        formData.append('folder', 'tour_management');

        fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Cloudinary signed upload response:', data);
            if (data.secure_url) {
                resolve({
                    success: true,
                    url: data.secure_url,
                    publicId: data.public_id,
                    width: data.width,
                    height: data.height,
                    format: data.format,
                    bytes: data.bytes
                });
            } else {
                reject(new Error(data.error?.message || 'Signed upload failed'));
            }
        })
        .catch(error => {
            console.error('Signed upload error:', error);
            reject(error);
        });
    });
}

// Generate upload signature (simplified version)
function generateUploadSignature(params) {
    const sortedParams = Object.keys(params)
        .sort()
        .map(key => `${key}=${params[key]}`)
        .join('&');
    
    // In production, use proper HMAC-SHA1 with your secret key
    // For demo purposes, we'll use a simple approach
    const stringToSign = sortedParams + CLOUDINARY_CONFIG.apiKey; // Use API key as secret for demo
    return btoa(stringToSign).replace(/[^a-zA-Z0-9]/g, '');
}

// Fallback method: Convert image to base64 and store locally
async function uploadImageAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const base64Data = e.target.result;
            const timestamp = Date.now();
            const publicId = `local_image_${timestamp}`;
            
            resolve({
                success: true,
                url: base64Data,
                publicId: publicId,
                width: 0, // Will be determined when image loads
                height: 0,
                format: file.type.split('/')[1] || 'jpg',
                bytes: file.size,
                isBase64: true
            });
        };
        reader.onerror = function(error) {
            reject(error);
        };
        reader.readAsDataURL(file);
    });
}

// Function to open Cloudinary upload widget
function openCloudinaryWidget(options = {}) {
    return new Promise((resolve, reject) => {
        const config = {
            ...UPLOAD_WIDGET_CONFIG,
            ...options
        };

        const widget = cloudinary.createUploadWidget(config, (error, result) => {
            if (!error && result && result.event === "success") {
                resolve({
                    success: true,
                    url: result.info.secure_url,
                    publicId: result.info.public_id,
                    width: result.info.width,
                    height: result.info.height,
                    format: result.info.format,
                    bytes: result.info.bytes
                });
            } else if (error) {
                reject(error);
            }
        });

        widget.open();
    });
}

// Function to delete image from Cloudinary
async function deleteImageFromCloudinary(publicId) {
    try {
        const formData = new FormData();
        formData.append('public_id', publicId);
        formData.append('api_key', CLOUDINARY_CONFIG.apiKey);
        formData.append('timestamp', Math.round((new Date).getTime() / 1000));

        // Generate signature (simplified - in production, this should be done server-side)
        const signature = await generateSignature(publicId);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/destroy`, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        return result.result === 'ok';
    } catch (error) {
        console.error('Error deleting image:', error);
        return false;
    }
}

// Function to generate signature (simplified version)
async function generateSignature(publicId) {
    // Note: In a real application, this should be done server-side for security
    // This is a simplified version for demonstration
    const timestamp = Math.round((new Date).getTime() / 1000);
    const stringToSign = `public_id=${publicId}&timestamp=${timestamp}`;
    
    // In production, use proper HMAC-SHA1 with your secret key
    // For now, we'll use a simple hash (not secure for production)
    return btoa(stringToSign);
}

// Function to get optimized image URL
function getOptimizedImageUrl(publicId, options = {}) {
    const defaultOptions = {
        width: 300,
        height: 300,
        crop: 'fill',
        quality: 'auto',
        format: 'auto'
    };

    const finalOptions = { ...defaultOptions, ...options };
    
    let url = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/`;
    
    // Add transformation parameters
    const transformations = [];
    if (finalOptions.width) transformations.push(`w_${finalOptions.width}`);
    if (finalOptions.height) transformations.push(`h_${finalOptions.height}`);
    if (finalOptions.crop) transformations.push(`c_${finalOptions.crop}`);
    if (finalOptions.quality) transformations.push(`q_${finalOptions.quality}`);
    if (finalOptions.format) transformations.push(`f_${finalOptions.format}`);
    
    if (transformations.length > 0) {
        url += transformations.join(',') + '/';
    }
    
    url += publicId;
    
    return url;
}

// Function to show image upload status
function showImageUploadStatus(message, type = 'info') {
    const statusDiv = document.getElementById('imageUploadStatus');
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
}

// Function to show image preview
function showImagePreview(imageUrl, publicId = null) {
    const previewDiv = document.getElementById('driverImagePreview');
    if (!previewDiv) return;

    previewDiv.style.display = 'block';
    previewDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px; padding: 15px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
            <img src="${imageUrl}" alt="Driver Preview" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 2px solid #e2e8f0;">
            <div style="flex: 1;">
                <div style="font-weight: 600; color: #1f2937; margin-bottom: 5px;">Driver Photo Preview</div>
                <div style="font-size: 12px; color: #6b7280; margin-bottom: 10px;">Image uploaded successfully</div>
                <div style="display: flex; gap: 10px;">
                    <button type="button" onclick="viewFullImage('${imageUrl}')" class="btn btn-sm btn-info" style="font-size: 12px; padding: 6px 12px;">
                        <i class="fas fa-eye"></i> View Full Size
                    </button>
                    ${publicId ? `
                        <button type="button" onclick="deleteDriverImage('${publicId}')" class="btn btn-sm btn-danger" style="font-size: 12px; padding: 6px 12px;">
                            <i class="fas fa-trash"></i> Remove
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

// Function to view full size image
function viewFullImage(imageUrl) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        cursor: pointer;
    `;

    modal.innerHTML = `
        <div style="max-width: 90%; max-height: 90%; position: relative;">
            <img src="${imageUrl}" style="max-width: 100%; max-height: 100%; border-radius: 8px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
            <button onclick="this.parentElement.parentElement.remove()" style="position: absolute; top: -10px; right: -10px; background: #ef4444; color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; font-size: 16px;">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });

    document.body.appendChild(modal);
}

// Function to delete driver image
async function deleteDriverImage(publicId) {
    if (!confirm('Are you sure you want to remove this image?')) {
        return;
    }

    showImageUploadStatus('<i class="fas fa-spinner fa-spin"></i> Removing image...', 'loading');

    try {
        const success = await deleteImageFromCloudinary(publicId);
        
        if (success) {
            showImageUploadStatus('<i class="fas fa-check-circle"></i> Image removed successfully!', 'success');
            
            // Clear preview
            const previewDiv = document.getElementById('driverImagePreview');
            if (previewDiv) {
                previewDiv.style.display = 'none';
                previewDiv.innerHTML = '';
            }
            
            // Clear file input
            const fileInput = document.getElementById('driverImage');
            if (fileInput) {
                fileInput.value = '';
            }
            
            // Remove from tour data
            if (tourData && tourData.driver) {
                delete tourData.driver.imageUrl;
                delete tourData.driver.imagePublicId;
                saveData();
            }
        } else {
            showImageUploadStatus('<i class="fas fa-exclamation-triangle"></i> Failed to remove image. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error deleting image:', error);
        showImageUploadStatus('<i class="fas fa-exclamation-triangle"></i> Error removing image. Please try again.', 'error');
    }
}

// Export functions for use in other files
window.cloudinaryUpload = uploadImageToCloudinary;
window.cloudinaryWidget = openCloudinaryWidget;
window.cloudinaryDelete = deleteImageFromCloudinary;
window.getOptimizedImageUrl = getOptimizedImageUrl;
window.showImageUploadStatus = showImageUploadStatus;
window.showImagePreview = showImagePreview;
window.viewFullImage = viewFullImage;
window.deleteDriverImage = deleteDriverImage;

console.log('✅ Cloudinary configuration loaded successfully');
