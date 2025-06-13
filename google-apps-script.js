/**
 * Google Apps Script for Certificate Generation Logging
 * 
 * Setup Instructions:
 * 1. Go to script.google.com
 * 2. Create a new project
 * 3. Replace the default code with this script
 * 4. Create a Google Sheet for logging (or let the script create one)
 * 5. Deploy as a web app with execute permissions for "Anyone"
 * 6. Copy the deployment URL to your website's GOOGLE_SCRIPT_URL
 */

// Configuration
const SHEET_NAME = 'Certificate Log';
const SPREADSHEET_ID = ''; // Leave empty to create new, or add your sheet ID

function doPost(e) {
  try {
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    
    // Get or create the spreadsheet
    let sheet = getOrCreateSheet();
    
    // Add headers if this is the first entry
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, 6).setValues([[
        'Timestamp', 'Name', 'Email', 'Workshop', 'IP Address', 'User Agent'
      ]]);
      
      // Format headers
      const headerRange = sheet.getRange(1, 1, 1, 6);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('white');
    }
    
    // Add the new log entry
    const newRow = [
      new Date(data.timestamp),
      data.name,
      data.email,
      data.workshop,
      data.ipAddress || 'N/A',
      data.userAgent || 'N/A'
    ];
    
    sheet.appendRow(newRow);
    
    // Auto-resize columns for better readability
    sheet.autoResizeColumns(1, 6);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error logging certificate:', error);
    
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet() {
  let spreadsheet;
  
  if (SPREADSHEET_ID) {
    // Use existing spreadsheet
    spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  } else {
    // Create new spreadsheet
    spreadsheet = SpreadsheetApp.create('Bioinformatics Certificate Log');
    console.log('Created new spreadsheet:', spreadsheet.getUrl());
  }
  
  // Get or create the sheet
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }
  
  return sheet;
}

// Test function to verify setup
function testLogging() {
  const testData = {
    timestamp: new Date().toISOString(),
    name: 'Test User',
    email: 'test@example.com',
    workshop: 'Test Workshop (January 1-2, 2024)',
    ipAddress: '127.0.0.1',
    userAgent: 'Test Browser'
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  const result = doPost(mockEvent);
  console.log('Test result:', result.getContent());
}

// Function to get certificate statistics (optional)
function getCertificateStats() {
  const sheet = getOrCreateSheet();
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    return {total: 0, workshops: {}, recent: []};
  }
  
  const stats = {
    total: data.length - 1, // Exclude header
    workshops: {},
    recent: data.slice(-10).reverse() // Last 10 entries
  };
  
  // Count by workshop
  for (let i = 1; i < data.length; i++) {
    const workshop = data[i][3]; // Workshop column
    stats.workshops[workshop] = (stats.workshops[workshop] || 0) + 1;
  }
  
  return stats;
} 