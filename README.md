# Bioinformatics Workshop Certificate Generator

A simple, elegant web application for generating PDF certificates of participation for bioinformatics workshops. Designed to be hosted on GitHub Pages with no backend requirements.

## 🌟 Features

- **Simple Interface**: Clean, responsive design that works on all devices
- **Workshop Selection**: Dropdown menu populated from a customizable text file
- **PDF Generation**: Client-side PDF creation using jsPDF library
- **Activity Logging**: Tracks certificate generations for staff review
- **Professional Design**: Beautiful certificates with institutional branding
- **No Backend Required**: Runs entirely in the browser, perfect for GitHub Pages

## 🚀 Quick Start

### GitHub Pages Setup

1. **Enable GitHub Pages**:
   - Go to your repository settings
   - Scroll down to "Pages" section
   - Select "Deploy from a branch"
   - Choose "main" branch and "/ (root)" folder
   - Click "Save"

2. **Access Your Site**:
   - Your site will be available at: `https://[username].github.io/[repository-name]`
   - It may take a few minutes for the site to become available

### Local Development

1. **Clone the repository**:
   ```bash
   git clone [your-repo-url]
   cd bioinformatics-participation
   ```

2. **Serve locally** (optional):
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js (if you have http-server installed)
   npx http-server
   ```

3. **Open in browser**:
   - Navigate to `http://localhost:8000`

## 📁 File Structure

```
├── index.html          # Main application page
├── styles.css          # Styling and responsive design
├── script.js           # Application logic and PDF generation
├── workshops.txt       # List of workshop titles (one per line)
└── README.md          # This file
```

## 🎯 Usage

### For Participants

1. **Fill out the form**:
   - Enter your full name as you'd like it to appear on the certificate
   - Provide your email address for verification
   - Select the workshop you attended from the dropdown

2. **Generate certificate**:
   - Click "Generate Certificate"
   - Wait for the PDF to be created and downloaded
   - The certificate will be saved to your Downloads folder

### For Staff

#### Viewing Activity Logs
- Open browser developer tools (F12)
- Check the Console tab for real-time certificate generation logs
- Each entry includes: date, participant name, email, and workshop title

#### Exporting Activity Logs
- Use keyboard shortcut: `Ctrl+Shift+E` (or `Cmd+Shift+E` on Mac)
- This downloads a CSV file with all certificate generation records
- File includes: Date, Name, Email, Workshop columns

#### Managing Workshop List
- Edit the `workshops.txt` file to add, remove, or modify workshop titles
- Each workshop should be on a separate line
- Changes take effect immediately when the page is refreshed

## 🛠️ Customization

### Workshop Titles
Edit `workshops.txt` to modify the available workshops:
```
Introduction to Bioinformatics and Computational Biology
Python Programming for Biologists
R for Genomic Data Analysis
...
```

### Certificate Design
Modify the `generateCertificate()` function in `script.js` to customize:
- Colors and fonts
- Layout and spacing
- Institution name and branding
- Certificate text and formatting

### Styling
Edit `styles.css` to customize:
- Color scheme
- Typography
- Layout and spacing
- Responsive breakpoints

## 🔧 Technical Details

### Dependencies
- **jsPDF**: Client-side PDF generation (loaded from CDN)
- No other external dependencies required

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- Uses localStorage for activity logging

### Data Storage
- **Workshop List**: Loaded from `workshops.txt` file
- **Activity Log**: Stored in browser's localStorage
- **No server-side storage**: All data remains client-side

### Security Considerations
- No sensitive data is transmitted or stored
- Email addresses are only used for logging purposes
- All processing happens client-side

## 📱 Mobile Support

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- All screen sizes and orientations

## 🎨 Certificate Features

Generated certificates include:
- Professional layout with institutional branding
- Participant's name prominently displayed
- Workshop title (handles long titles gracefully)
- Current date
- Signature line for workshop coordinator
- Decorative DNA helix elements
- High-quality PDF format suitable for printing

## 🔍 Troubleshooting

### Common Issues

1. **Workshop dropdown is empty**:
   - Check that `workshops.txt` exists and contains workshop titles
   - Ensure each workshop is on a separate line
   - Check browser console for loading errors

2. **PDF not downloading**:
   - Ensure browser allows downloads
   - Check that jsPDF library is loading correctly
   - Try refreshing the page

3. **Site not loading on GitHub Pages**:
   - Verify GitHub Pages is enabled in repository settings
   - Check that all files are committed and pushed
   - Wait a few minutes for deployment to complete

### Browser Console
Open developer tools (F12) and check the Console tab for any error messages or debugging information.

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review browser console for error messages
3. Create an issue in the GitHub repository

## 🔐 Secure Certificate Logging Setup

To prevent fraudulent certificate usage and enable staff monitoring, the system logs all certificate generations to a Google Sheet that only authorized staff can access.

### Setup Instructions

#### 1. Create Google Apps Script
1. Go to [script.google.com](https://script.google.com)
2. Click "New Project"
3. Replace the default code with the contents of `google-apps-script.js`
4. Save the project with a name like "Certificate Logger"

#### 2. Deploy the Script
1. Click "Deploy" → "New deployment"
2. Choose type: "Web app"
3. Set execute as: "Me"
4. Set access: "Anyone" (this allows the website to send data)
5. Click "Deploy"
6. Copy the deployment URL

#### 3. Configure the Website
1. Open `script.js`
2. Replace `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE` with your deployment URL
3. Save and deploy your website

#### 4. Test the Setup
1. Generate a test certificate
2. Check your Google Drive for a new spreadsheet called "Bioinformatics Certificate Log"
3. Verify the entry appears in the sheet

### What Gets Logged

Each certificate generation records:
- **Timestamp**: When the certificate was generated
- **Name**: Participant's name
- **Email**: Participant's email
- **Workshop**: Full workshop title and date
- **User Agent**: Browser information (for fraud detection)

### Staff Monitoring

**Access the Log:**
- The Google Sheet is automatically created and shared with the Google account that deployed the script
- Only you (and accounts you explicitly share with) can view the log
- The sheet updates in real-time as certificates are generated

**Fraud Detection Features:**
- Timestamps help identify unusual generation patterns
- Email addresses can be cross-referenced with actual workshop attendance
- Browser information helps identify automated/bot activity
- Workshop dates help verify legitimate certificate requests

**Regular Monitoring:**
- Review the log weekly or after each workshop
- Look for duplicate names/emails for the same workshop
- Check for certificates generated outside of reasonable timeframes
- Verify email addresses match your workshop registration records

---

**Note**: This application runs entirely in the browser and requires no server-side components, making it perfect for GitHub Pages hosting. 