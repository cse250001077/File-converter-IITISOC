const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const cron = require('node-cron'); // ADDED: For the security cleanup
const { exec } = require('child_process'); // ADDED: To run ImageMagick CLI

const app = express();
const PORT = 3000;

// Force wide-open CORS for local testing
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug Logging Middleware
app.use((req, res, next) => { 
  console.log(`Incoming request: ${req.method} ${req.url}`); 
  next(); 
});

const uploadDir = path.join(__dirname, 'temp_uploads');
if (!fs.existsSync(uploadDir)) { 
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ---------------------------------------------------------
// FIX 1: THE STRICT 10MB SIZE LIMIT
// ---------------------------------------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage, 
  limits: { fileSize: 10 * 1024 * 1024 } // Changed from 50MB to exactly 10MB to match report
});

// ---------------------------------------------------------
// FIX 2: THE 30-MINUTE SECURITY CLEANUP CRON JOB
// ---------------------------------------------------------
// This runs every 5 minutes to check for files older than 30 mins
cron.schedule('*/5 * * * *', () => {
  console.log('Running security cleanup cron job...');
  fs.readdir(uploadDir, (err, files) => {
    if (err) return console.error('Error reading temp_uploads:', err);
    
    const now = Date.now();
    files.forEach(file => {
      const filePath = path.join(uploadDir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) return;
        // Check if file is older than 30 minutes (30 mins * 60 secs * 1000 ms)
        if (now - stats.mtime.getTime() > 30 * 60 * 1000) {
          fs.unlink(filePath, err => {
            if (!err) console.log(`Security Protocol: Purged old asset -> ${file}`);
          });
        }
      });
    });
  });
});

// ---------------------------------------------------------
// FIX 3: IMAGEMAGICK CORE CONVERSION
// ---------------------------------------------------------
app.post('/api/convert', upload.single('userFile'), (req, res) => {
  console.log("File received successfully, starting processing...");
  
  if (!req.file) {
    console.error("No file found in request payload.");
    return res.status(400).json({ error: 'File upload failed or exceeded 10MB limit.' });
  }

  // Assuming the frontend sends a target format (e.g., 'png', 'jpg')
  const targetFormat = req.body.targetFormat || 'png'; 
  const inputPath = req.file.path;
  
  // Create a new filename for the converted file
  const outputFileName = req.file.filename.split('.')[0] + '_converted.' + targetFormat;
  const outputPath = path.join(uploadDir, outputFileName);

  // Execute the ImageMagick CLI command
  // Note: on Windows, the command is usually 'magick', on Linux/Mac it might be 'convert'
  const command = `magick "${inputPath}" "${outputPath}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('ImageMagick execution error:', error);
      return res.status(500).json({ error: 'File conversion failed.' });
    }
    
    console.log(`Conversion successful: ${outputFileName}`);
    // Send back the download URL to the frontend
    res.json({ 
      message: 'Conversion successful', 
      downloadUrl: `/api/download/${outputFileName}` 
    });
  });
});

// Download API route
app.get('/api/download/:filename', (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).send('File not found or has been purged by security protocol.');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`=============================================`);
  console.log(`Backend server actively running on port ${PORT}`);
  console.log(`Listening on http://127.0.0.1:${PORT}`);
  console.log(`Security Cron Job: ACTIVE`);
  console.log(`=============================================`);
});