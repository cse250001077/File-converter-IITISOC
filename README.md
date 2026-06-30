# Universal File Type Converter

## 📌 Abstract
Format incompatibility is a universal frustration.Users frequently struggle with restrictive paywalls, intrusive advertisements, and data privacy concerns when using online file converters. Our project, FileMorph, addresses these issues by providing a secure, efficient, and ad-free platform for multi-format document and image conversions. 

Driven by the need for absolute data privacy, our platform implements strict server-side cleanup routines that automatically delete user assets exactly 30 minutes post-conversion.

## ✨ Core Features
* **Multi-Format Processing:** Support for document (PDF, DOCX, TXT) and image (JPG, PNG) conversions.
* **Drag-and-Drop Interface:** Responsive upload zone for quick file selection.
* **Real-Time Feedback:** Progress indicators for user request states (Uploading → Processing → Ready).
* **Secure File Handling:** Strict 10MB file size limit validation via Multer[cite: 91].
* **Automated Privacy Cleanup:** Backend cron jobs automatically purge files within 30 minutes.

## 🛠 Technology Stack
* **Frontend:** React.js, Tailwind CSS.
* **Backend:** Node.js, Express.js.
* **File Parser:** Multer.
* **Conversion Utilities:** ImageMagick (Images), Pandoc (Documents).
* **Task Scheduler:** Node-cron.
* **Deployment & Isolation:** Docker.

## 🚀 Local Setup Instructions

### Prerequisites
Ensure you have the following installed on your local machine:
* [Node.js](https://nodejs.org/)
* [ImageMagick](https://imagemagick.org/)
* [Pandoc](https://pandoc.org/)
* [Docker](https://www.docker.com/) (Optional, for containerized environments)

### 1. Clone the Repository
\`\`\`bash
git clone https://github.com/cse250001077/File-converter-IITISOC.git
cd File-converter-IITISOC
\`\`\`

### 2. Backend Setup
The backend runs an Express server and handles the core conversion and security logic.
\`\`\`bash
# Install backend dependencies
npm install express multer node-cron

# Start the server (runs securely on http://localhost:3000)
node index.js
\`\`\`
*Note: Ensure the `temp_uploads/` directory exists in the root folder with correct write permissions for the automated node-cron job to successfully purge files.*

### 3. Frontend Setup
The frontend is a React application styled with Tailwind CSS.
\`\`\`bash
# Navigate to the client directory
cd client

# Install frontend dependencies
npm install axios

# Start the React development server
npm start
\`\`\`

## 📂 System Architecture
The system follows a modular client-server architecture. 
1. **Ingestion:** The user interacts with the React frontend to upload files via a drag-and-drop workspace. 
2. **Validation:** Multi-part form payloads are sent to the Express.js backend where Multer validates extensions and enforces a strict 10MB size limit. 
3.**Processing:** The backend triggers isolated background processes using Pandoc or ImageMagick depending on the MIME type. 
4.**Security:** Processed files are mapped to download links, and a functional Node-cron job continuously monitors the storage path, purging any files older than 30 minutes.

## 👥 Team Members (IITISOC 2026 - PS-3)
* **Vidadala Kalyani** (250001077) - Backend / APIs (Team Leader) 
* **Vithanala Anushka** (250001080) - Frontend UI
* **Kondamuri Tathwik** (250021010) - DevOps / Security
