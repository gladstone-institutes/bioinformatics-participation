// Global variables
let workshops = [];
let certificateLog = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadWorkshops();
    loadCertificateLog();
    setupFormHandler();
});

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
    const form = document.getElementById('certificateForm');
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
        logCertificateGeneration(participantName, email, workshop);
        
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
        
        // Background border
        doc.setDrawColor(102, 126, 234);
        doc.setLineWidth(3);
        doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
        
        // Inner border
        doc.setLineWidth(1);
        doc.rect(15, 15, pageWidth - 30, pageHeight - 30);
        
        // Title
        doc.setFontSize(32);
        doc.setTextColor(102, 126, 234);
        doc.setFont(undefined, 'bold');
        doc.text('CERTIFICATE OF PARTICIPATION', pageWidth / 2, 40, { align: 'center' });
        
        // Subtitle
        doc.setFontSize(18);
        doc.setTextColor(118, 75, 162);
        doc.setFont(undefined, 'normal');
        doc.text('Gladstone Institutes - Bioinformatics Workshop Series', pageWidth / 2, 55, { align: 'center' });
        
        // Main text
        doc.setFontSize(16);
        doc.setTextColor(51, 51, 51);
        doc.text('This is to certify that', pageWidth / 2, 80, { align: 'center' });
        
        // Participant name
        doc.setFontSize(28);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(102, 126, 234);
        doc.text(participantName, pageWidth / 2, 100, { align: 'center' });
        
        // Completion text
        doc.setFontSize(16);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(51, 51, 51);
        doc.text('has successfully participated in the workshop', pageWidth / 2, 120, { align: 'center' });
        
        // Workshop title
        doc.setFontSize(20);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(118, 75, 162);
        
        // Handle long workshop titles by splitting them
        const maxWidth = pageWidth - 60;
        const workshopLines = doc.splitTextToSize(workshop, maxWidth);
        const startY = 140;
        workshopLines.forEach((line, index) => {
            doc.text(line, pageWidth / 2, startY + (index * 8), { align: 'center' });
        });
        
        // Date and signature area
        const currentDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(51, 51, 51);
        
        // Date
        doc.text(`Date: ${currentDate}`, 40, pageHeight - 40);
        
        // Signature line
        doc.text('_________________________', pageWidth - 80, pageHeight - 40);
        doc.text('Workshop Coordinator', pageWidth - 80, pageHeight - 30);
        
        // DNA helix decoration (simple representation)
        doc.setDrawColor(102, 126, 234);
        doc.setLineWidth(0.5);
        for (let i = 0; i < 20; i++) {
            const x = 25 + i * 2;
            const y1 = 25 + Math.sin(i * 0.5) * 3;
            const y2 = 25 - Math.sin(i * 0.5) * 3;
            doc.line(x, y1, x + 1, y1);
            doc.line(x, y2, x + 1, y2);
        }
        
        // Save the PDF
        const fileName = `${participantName.replace(/[^a-zA-Z0-9]/g, '_')}_Certificate.pdf`;
        doc.save(fileName);
        
        // Resolve after a short delay to show loading animation
        setTimeout(resolve, 1500);
    });
}

// Log certificate generation
function logCertificateGeneration(name, email, workshop) {
    const logEntry = {
        date: new Date().toISOString(),
        name: name,
        email: email,
        workshop: workshop,
        timestamp: Date.now()
    };
    
    certificateLog.push(logEntry);
    saveCertificateLog();
    
    // Also log to console for staff review
    console.log('Certificate Generated:', logEntry);
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

// Reset form to initial state
function resetForm() {
    document.getElementById('certificateForm').reset();
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