// ================================================================================
// FAMILY MEMBERS MODULE
// Handles all family member management functionality
// ================================================================================

// Initialize family members section
function initFamilyMembers() {
    const memberCountInput = document.getElementById('memberCount');
    const generateBtn = document.getElementById('generateMemberForms');
    const memberCountSection = document.getElementById('memberCountSection');
    const familyForm = document.getElementById('familyForm');
    const container = document.getElementById('familyMembersContainer');
    const changeMemberCountBtn = document.getElementById('changeMemberCount');
    const memberCountDisplay = document.getElementById('memberCountDisplay');
    
    // Check if members already exist
    if (tourData.familyMembers && tourData.familyMembers.length > 0) {
        // Show existing members
        memberCountInput.value = tourData.familyMembers.length;
        generateMemberForms(tourData.familyMembers.length);
    }
    
    // Generate member forms button
    generateBtn.addEventListener('click', function() {
        const count = parseInt(memberCountInput.value);
        
        if (!count || count < 1 || count > 50) {
            alert('⚠️ Please enter a valid number between 1 and 50');
            return;
        }
        
        generateMemberForms(count);
    });
    
    // Change member count button
    changeMemberCountBtn.addEventListener('click', function() {
        if (confirm('⚠️ Changing the number of members will reset all member data. Continue?')) {
            memberCountSection.style.display = 'block';
            familyForm.style.display = 'none';
            container.innerHTML = '';
            memberCountInput.value = '';
        }
    });
    
    // Generate member forms
    function generateMemberForms(count) {
        container.innerHTML = '';
        memberCountDisplay.textContent = count;
        
        for (let i = 0; i < count; i++) {
            const member = tourData.familyMembers[i] || { id: i + 1, name: '', mobile: '' };
            
            const memberCard = document.createElement('div');
            memberCard.className = 'member-card';
            memberCard.innerHTML = `
                <h4><i class="fas fa-user"></i> Member ${i + 1}</h4>
                <div class="form-grid">
                    <div class="form-group">
                        <label for="member${i}_name">Full Name *</label>
                        <input type="text" id="member${i}_name" value="${member.name}" 
                               placeholder="Enter full name" required>
                    </div>
                    <div class="form-group">
                        <label for="member${i}_mobile">Mobile Number *</label>
                        <input type="tel" id="member${i}_mobile" value="${member.mobile}" 
                               placeholder="Enter 10-digit mobile number" 
                               pattern="[0-9]{10}" 
                               title="Please enter a 10-digit mobile number"
                               required>
                    </div>
                </div>
            `;
            container.appendChild(memberCard);
        }
        
        memberCountSection.style.display = 'none';
        familyForm.style.display = 'block';
    }
    
    // Form submission
    familyForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const count = container.children.length;
        tourData.familyMembers = [];
        
        // Validate all inputs
        let allValid = true;
        for (let i = 0; i < count; i++) {
            const nameInput = document.getElementById(`member${i}_name`);
            const mobileInput = document.getElementById(`member${i}_mobile`);
            
            if (!nameInput.value.trim()) {
                alert(`⚠️ Please enter name for Member ${i + 1}`);
                nameInput.focus();
                allValid = false;
                break;
            }
            
            if (!mobileInput.value.trim()) {
                alert(`⚠️ Please enter mobile number for Member ${i + 1}`);
                mobileInput.focus();
                allValid = false;
                break;
            }
            
            // Validate mobile number (10 digits)
            if (!/^[0-9]{10}$/.test(mobileInput.value.trim())) {
                alert(`⚠️ Please enter a valid 10-digit mobile number for Member ${i + 1}`);
                mobileInput.focus();
                allValid = false;
                break;
            }
        }
        
        if (!allValid) return;
        
        // Save all members
        for (let i = 0; i < count; i++) {
            tourData.familyMembers.push({
                id: i + 1,
                name: document.getElementById(`member${i}_name`).value.trim(),
                mobile: document.getElementById(`member${i}_mobile`).value.trim()
            });
        }
        
        await saveData();
        populateMemberSelects();
        
        alert(`✅ Successfully saved ${count} family member${count > 1 ? 's' : ''}!\n\n` +
              `You can now:\n` +
              `• Add their contributions\n` +
              `• View them on the dashboard\n` +
              `• Generate trip reports`);
    });
}

// Populate member select dropdowns
function populateMemberSelects() {
    const selects = [
        document.getElementById('contributorSelect'),
        document.getElementById('expensePaidBy')
    ];
    
    selects.forEach(select => {
        if (!select) return;
        
        const currentValue = select.value;
        select.innerHTML = '<option value="">-- Select Member --</option>';
        
        tourData.familyMembers.forEach(member => {
            if (member.name) {
                const option = document.createElement('option');
                option.value = member.name;
                option.textContent = member.name;
                select.appendChild(option);
            }
        });
        
        if (currentValue) {
            select.value = currentValue;
        }
    });
}

// Initialize contribution form
function initContributionForm() {
    const form = document.getElementById('contributionForm');
    if (!form) return;
    
    // Set current date
    const dateInput = document.getElementById('contributionDate');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const contribution = {
            id: Date.now(),
            member: document.getElementById('contributorSelect').value,
            amount: parseFloat(document.getElementById('contributionAmount').value),
            date: document.getElementById('contributionDate').value,
            note: document.getElementById('contributionNote').value
        };
        
        tourData.contributions.push(contribution);
        await saveData();
        
        form.reset();
        document.getElementById('contributionDate').value = new Date().toISOString().split('T')[0];
        
        displayContributions();
        updateExpenseDashboard();
        alert('Contribution added successfully!');
    });
}

// Display contributions
function displayContributions() {
    // Display summary cards
    const summaryContainer = document.getElementById('contributionSummary');
    const recordsContainer = document.getElementById('contributionRecords');
    
    if (!summaryContainer || !recordsContainer) return;
    
    const memberContributions = {};
    
    tourData.contributions.forEach(contribution => {
        if (!memberContributions[contribution.member]) {
            memberContributions[contribution.member] = 0;
        }
        memberContributions[contribution.member] += contribution.amount;
    });
    
    // Summary cards
    let summaryHtml = '';
    Object.keys(memberContributions).forEach(member => {
        summaryHtml += `
            <div class="summary-card">
                <div class="summary-label">${member}</div>
                <div class="summary-value">₹${memberContributions[member].toFixed(2)}</div>
            </div>
        `;
    });
    summaryContainer.innerHTML = summaryHtml || '<p style="color: #6b7280;">No contributions recorded yet</p>';
    
    // Detailed records
    let recordsHtml = '';
    tourData.contributions.slice().reverse().forEach(contribution => {
        recordsHtml += `
            <div class="record-item">
                <div class="record-header">
                    <strong>${contribution.member}</strong>
                    <span class="record-amount">₹${contribution.amount.toFixed(2)}</span>
                </div>
                <div class="record-details">
                    <span><i class="fas fa-calendar"></i> ${new Date(contribution.date).toLocaleDateString()}</span>
                    ${contribution.note ? `<span><i class="fas fa-sticky-note"></i> ${contribution.note}</span>` : ''}
                </div>
            </div>
        `;
    });
    recordsContainer.innerHTML = recordsHtml || '<p style="color: #6b7280;">No contribution records</p>';
}

// ================================================================================
// Export functions for use in main script
// ================================================================================

// Make functions available globally
window.familyMembersModule = {
    initFamilyMembers,
    populateMemberSelects,
    initContributionForm,
    displayContributions
};

console.log('✅ Family Members module loaded');

