# Bioinformatics Workshop Certificate Generator

A simple, elegant web application for generating PDF certificates of participation for bioinformatics workshops. Designed to be hosted on GitHub Pages with no backend requirements.

## 🌟 Features

- **Simple Interface**: Clean, responsive design that works on all devices
- **Workshop Selection**: Dropdown menu populated from a customizable text file
- **PDF Generation**: Client-side PDF creation using jsPDF library
- **Activity Logging**: Tracks certificate generations for staff review
- **Professional Design**: Beautiful certificates with institutional branding
- **No Backend Required**: Runs entirely in the browser, perfect for GitHub Pages

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
- Refer to the team's Google Sheet called Certification Log

#### Managing Workshop List
- Edit the `workshops.txt` file to add, remove, or modify workshop titles
- Each workshop should be on a separate line with date in parentheses
- Changes take effect immediately when the page is refreshed

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
- **Activity Log**: Stored in Google Sheets
- **No server-side storage**: All data remains client-side

### Security Considerations
- No sensitive data is transmitted or stored
- Email addresses are only used for logging purposes
- All processing happens client-side

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

## 🔐 Secure Certificate Logging Setup (GitHub Pages)

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
3. **Critical settings:**
   - ✅ **Execute as:** "Me"
   - ✅ **Who has access:** "Anyone" (not "Anyone with Google account")
4. Click "Deploy"
5. **Copy the deployment URL** (you'll need this for the next step)

#### 3. Configure GitHub Secrets (Recommended for GitHub Pages)
1. **Go to your GitHub repository**
2. **Click Settings → Secrets and variables → Actions**
3. **Click "New repository secret"**
4. **Name:** `GOOGLE_SCRIPT_URL`
5. **Value:** Your Google Apps Script deployment URL
6. **Click "Add secret"**

#### 4. Enable GitHub Pages with Actions
1. **Go to Settings → Pages**
2. **Source:** "GitHub Actions"
3. **The workflow will automatically deploy when you push to main**

#### 5. Manual Deployment (When Updating Secrets)
If you update the `GOOGLE_SCRIPT_URL` secret, you can manually trigger a new deployment:
1. **Go to the Actions tab in your repository**
2. **Click "Deploy to GitHub Pages" workflow**
3. **Click "Run workflow" button**
4. **Select the main branch and click "Run workflow"**
5. **Wait for the deployment to complete**

#### 6. Test the Setup
1. **Push your changes to trigger deployment** (or use manual trigger)
2. **Generate a test certificate on your live site**
3. **Check your Google Drive for "Bioinformatics Certificate Log"**
4. **Verify the entry appears in the sheet**

### 🔧 How It Works

1. **GitHub Actions** reads the `GOOGLE_SCRIPT_URL` secret during deployment
2. **Creates `config.json`** with the URL during the build process
3. **Website loads** the URL from `config.json` at runtime
4. **Logging works** seamlessly without exposing sensitive data

### 📊 What Gets Logged

Each certificate generation records:
- **Timestamp**: When the certificate was generated
- **Name**: Participant's name
- **Email**: Participant's email
- **Workshop**: Full workshop title and date
- **User Agent**: Browser information (for fraud detection)

**If logging isn't working:**
1. Check browser console for error messages
2. Verify the GitHub Secret is set correctly
3. Ensure GitHub Actions deployment completed successfully
4. Test the Google Apps Script directly using the `testLogging` function

**Common issues:**
- **401 errors**: Redeploy Google Apps Script with correct permissions
- **No config.json**: GitHub Actions may have failed - check the Actions tab
- **Secret not found**: Verify the secret name is exactly `GOOGLE_SCRIPT_URL`

---

**Note**: This application runs entirely in the browser and requires no server-side components, making it perfect for GitHub Pages hosting. 
