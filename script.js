// Global variables
let workshops = [];
let certificateLog = [];

// Configuration for Google Sheets logging
// This will be loaded from config.json (created by GitHub Actions from secrets)
let GOOGLE_SCRIPT_URL = '';

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    await loadConfig();
    loadWorkshops();
    loadCertificateLog();
    setupFormHandler();
});

// Try to load configuration from different sources
async function loadConfig() {
    // Method 1: Try to load from config.json (created by GitHub Actions from secrets)
    try {
        const response = await fetch('config.json');
        if (response.ok) {
            const config = await response.json();
            if (config.googleScriptUrl && config.googleScriptUrl !== 'YOUR_SCRIPT_ID_HERE') {
                GOOGLE_SCRIPT_URL = config.googleScriptUrl;
                console.log('✅ Configuration loaded from config.json');
                return;
            }
        }
    } catch (error) {
        // Config file doesn't exist or is invalid, continue to next method
        console.log('ℹ️ config.json not found or invalid, trying other methods...');
    }
    
    // Method 2: Check for environment variable (if using a build process)
    if (typeof process !== 'undefined' && process.env && process.env.GOOGLE_SCRIPT_URL) {
        GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;
        console.log('✅ Configuration loaded from environment variable');
        return;
    }
    
    // Method 3: Development fallback - uncomment for local testing
    // GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID_HERE/exec';
    
    if (!GOOGLE_SCRIPT_URL) {
        console.warn('⚠️ Google Apps Script URL not configured');
        console.warn('📋 For GitHub Pages: Add GOOGLE_SCRIPT_URL to repository secrets');
        console.warn('📋 For local development: Uncomment the fallback URL in script.js');
        console.warn('📋 Certificates will still generate, but logging to Google Sheets will be disabled');
    }
}

// Load workshops from the text file
async function loadWorkshops() {
    try {
        const response = await fetch('workshops.txt');
        const text = await response.text();
        workshops = text.split('\n').filter(line => line.trim() !== '');
        populateWorkshopDropdown();
    } catch (error) {
        console.error('Error loading workshops:', error);
        // Fallback workshops if file can't be loaded
        workshops = [
            'Introduction to Bioinformatics and Computational Biology',
            'Python Programming for Biologists',
            'R for Genomic Data Analysis',
            'Next-Generation Sequencing Data Analysis'
        ];
        populateWorkshopDropdown();
    }
}

// Populate the workshop dropdown
function populateWorkshopDropdown() {
    const select = document.getElementById('workshop');
    
    // Clear existing options except the first one
    while (select.children.length > 1) {
        select.removeChild(select.lastChild);
    }
    
    // Add workshop options
    workshops.forEach(workshop => {
        const option = document.createElement('option');
        option.value = workshop;
        option.textContent = workshop;
        select.appendChild(option);
    });
}

// Setup form submission handler
function setupFormHandler() {
    const form = document.getElementById('certificateFormElement');
    form.addEventListener('submit', handleFormSubmission);
}

// Handle form submission
async function handleFormSubmission(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const participantName = formData.get('participantName').trim();
    const email = formData.get('email').trim();
    const workshop = formData.get('workshop');
    
    // Validate form data
    if (!participantName || !email || !workshop) {
        alert('Please fill in all fields.');
        return;
    }
    
    // Show loading state
    showLoading();
    
    try {
        // Generate PDF certificate
        await generateCertificate(participantName, workshop);
        
        // Log the certificate generation
        await logCertificateGeneration(participantName, email, workshop);
        
        // Show success message
        showSuccess();
        
    } catch (error) {
        console.error('Error generating certificate:', error);
        alert('There was an error generating your certificate. Please try again.');
        hideLoading();
    }
}

// Generate PDF certificate
async function generateCertificate(participantName, workshop) {
    return new Promise((resolve) => {
        // Parse workshop title and date
        const workshopMatch = workshop.match(/^(.+?)\s*\((.+?)\)$/);
        const workshopTitle = workshopMatch ? workshopMatch[1].trim() : workshop;
        const workshopDate = workshopMatch ? workshopMatch[2].trim() : '';
        
        // Create new jsPDF instance
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });
        
        // Set up certificate design
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        // Background border (Primary dark blue)
        doc.setDrawColor(0, 42, 64); // #002A40
        doc.setLineWidth(3);
        doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
        
        // Inner border (Light blue-gray)
        doc.setDrawColor(213, 228, 229); // #D5E4E5
        doc.setLineWidth(1);
        doc.rect(15, 15, pageWidth - 30, pageHeight - 30);
        
        // Title
        doc.setFontSize(32);
        doc.setTextColor(0, 42, 64); // #002A40
        doc.setFont(undefined, 'bold');
        doc.text('CERTIFICATE OF PARTICIPATION', pageWidth / 2, 40, { align: 'center' });
        
        // Subtitle
        doc.setFontSize(18);
        doc.setTextColor(247, 105, 18); // #F76912 (Secondary orange)
        doc.setFont(undefined, 'normal');
        doc.text('Gladstone Institutes - Bioinformatics Workshop Series', pageWidth / 2, 55, { align: 'center' });
        
        // Main text
        doc.setFontSize(16);
        doc.setTextColor(138, 147, 148); // #8A9394
        doc.text('This is to certify that', pageWidth / 2, 80, { align: 'center' });
        
        // Participant name
        doc.setFontSize(28);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 42, 64); // #002A40
        doc.text(participantName, pageWidth / 2, 100, { align: 'center' });
        
        // Completion text
        doc.setFontSize(16);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(138, 147, 148); // #8A9394
        doc.text('has successfully participated in the workshop', pageWidth / 2, 120, { align: 'center' });
        
        // Workshop title
        doc.setFontSize(20);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 42, 64); // #002A40
        
        // Handle long workshop titles by splitting them
        const maxWidth = pageWidth - 60;
        const workshopLines = doc.splitTextToSize(workshopTitle, maxWidth);
        let startY = 140;
        workshopLines.forEach((line, index) => {
            doc.text(line, pageWidth / 2, startY + (index * 8), { align: 'center' });
        });
        
        
        // Date and signature area
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 42, 64); // #002A40
        
        // Date (use workshop date if available, otherwise current date)
        const displayDate = workshopDate || new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        doc.text(`Date: ${displayDate}`, 40, pageHeight - 40);
        
        // Coordinator name (no signature line)
        doc.text('Zainab Yusuf Sada', pageWidth - 80, pageHeight - 40);
        doc.text('Workshop Coordinator', pageWidth - 80, pageHeight - 30);
        
        // DNA helix decoration (using accent colors)
        doc.setDrawColor(0, 212, 230); // #00D4E6 (Secondary cyan)
        for (let i = 0; i < 15; i++) {
            const x = pageWidth - 45 + i * 1.5;
            const y1 = pageHeight - 70 + Math.cos(i * 0.7) * 2;
            const y2 = pageHeight - 70 - Math.cos(i * 0.7) * 2;
            doc.line(x, y1, x + 1, y1);
            doc.line(x, y2, x + 1, y2);
        }
        
        // Save the PDF
        const cleanName = participantName.replace(/[^a-zA-Z0-9]/g, '_');
        const cleanDate = workshopDate ? workshopDate.replace(/[^a-zA-Z0-9]/g, '_') : '';
        const fileName = cleanDate 
            ? `${cleanName}_${cleanDate}_Certificate.pdf`
            : `${cleanName}_Certificate.pdf`;
        doc.save(fileName);
        
        // Resolve after a short delay to show loading animation
        setTimeout(resolve, 1500);
    });
}

// Log certificate generation to Google Sheets
async function logCertificateGeneration(name, email, workshop) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        name: name,
        email: email,
        workshop: workshop,
        ipAddress: 'N/A', // Could be enhanced with IP detection
        userAgent: navigator.userAgent.substring(0, 100) // Browser info for fraud detection
    };
    
    // Keep local log as backup
    certificateLog.push(logEntry);
    saveCertificateLog();
    
    // Log to console for immediate staff review
    console.log('Certificate Generated:', logEntry);
    
    // Check if Google Sheets logging is configured
    if (!GOOGLE_SCRIPT_URL) {
        console.warn('⚠️ Google Sheets logging not configured - certificate logged locally only');
        return;
    }
    
    console.log('Attempting to log to Google Sheets...');
    
    // Send to Google Sheets with better error handling
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain', // Changed from application/json
            },
            body: JSON.stringify(logEntry)
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        if (response.status === 401) {
            console.error('❌ Authentication error (401): Google Apps Script deployment needs to be reconfigured');
            console.error('📋 Fix: Redeploy with "Execute as: Me" and "Who has access: Anyone"');
            return;
        }
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const responseText = await response.text();
        console.log('Raw response:', responseText);
        
        try {
            const result = JSON.parse(responseText);
            if (result.success) {
                console.log('✅ Certificate logged to Google Sheets successfully');
                console.log('📊 Log entry details:', result);
            } else {
                console.error('❌ Google Sheets logging failed:', result.error);
            }
        } catch (parseError) {
            console.log('✅ Certificate logged (non-JSON response):', responseText);
        }
        
    } catch (error) {
        console.error('❌ Failed to log to Google Sheets:', error);
        
        // Try alternative method with FormData
        console.log('🔄 Trying alternative logging method...');
        try {
            const formData = new FormData();
            formData.append('data', JSON.stringify(logEntry));
            
            const fallbackResponse = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                body: formData
            });
            
            if (fallbackResponse.ok) {
                console.log('✅ Certificate logged via fallback method');
            } else {
                console.error('❌ Fallback method also failed:', fallbackResponse.status);
            }
        } catch (fallbackError) {
            console.error('❌ Both logging methods failed:', fallbackError);
        }
    }
}

// Load certificate log from localStorage
function loadCertificateLog() {
    try {
        const saved = localStorage.getItem('certificateLog');
        if (saved) {
            certificateLog = JSON.parse(saved);
        }
    } catch (error) {
        console.error('Error loading certificate log:', error);
        certificateLog = [];
    }
}

// Save certificate log to localStorage
function saveCertificateLog() {
    try {
        localStorage.setItem('certificateLog', JSON.stringify(certificateLog));
    } catch (error) {
        console.error('Error saving certificate log:', error);
    }
}

// Show loading state
function showLoading() {
    document.getElementById('certificateForm').classList.add('hidden');
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('success').classList.add('hidden');
}

// Show success state
function showSuccess() {
    document.getElementById('certificateForm').classList.add('hidden');
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('success').classList.remove('hidden');
}

// Hide loading state
function hideLoading() {
    document.getElementById('certificateForm').classList.remove('hidden');
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('success').classList.add('hidden');
}

// Function for staff to export certificate log
function exportCertificateLog() {
    if (certificateLog.length === 0) {
        alert('No certificate log data to export.');
        return;
    }
    
    // Create CSV content
    const headers = ['Date', 'Name', 'Email', 'Workshop'];
    const csvContent = [
        headers.join(','),
        ...certificateLog.map(entry => [
            new Date(entry.date).toLocaleString(),
            `"${entry.name}"`,
            entry.email,
            `"${entry.workshop}"`
        ].join(','))
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificate_log_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Add keyboard shortcut for staff to export log (Ctrl+Shift+E)
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.shiftKey && event.key === 'E') {
        event.preventDefault();
        exportCertificateLog();
    }
}); 