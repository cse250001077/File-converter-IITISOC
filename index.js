const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const cron = require('node-cron');

const app = express();
const PORT = 5000;

// ==========================================
// PILLAR 1: MULTER INGESTION PIPELINE
// ==========================================

// 1. Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'temp_uploads/'); // Saves to the secure, temporary directory
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + ext); // Prevents accidental overwrites
    }
});

// 2. Security Filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/pdf', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
        'text/plain', 
        'image/jpeg', 
        'image/png'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file type. Only PDF, DOCX, TXT, JPG, and PNG are allowed.'));
    }
};

// 3. Multer Initialization with 10MB Limit
const upload = multer({ 
    storage: storage, 
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // Enforces a strict 10MB maximum limit
});


// ==========================================
// PILLAR 2: CORE CONVERSION PROCESSING
// ==========================================

app.post('/api/convert', upload.single('userFile'), (req, res) => {
    // Check if Multer rejected the file
    if (!req.file) {
        return res.status(400).json({ error: 'File upload failed or file type not supported.' });
    }

    const inputFilePath = req.file.path;
    const originalName = req.file.originalname;
    const fileExt = path.extname(originalName).toLowerCase();
    
    // Determine target format dynamically (Simplified for the prototype)
    // In a final app, the user would select this via the frontend.
    let targetFormat = '';
    let command = '';
    let outputFilePath = '';

    // Logic for Images (ImageMagick)
    if (fileExt === '.jpg' || fileExt === '.jpeg') {
        targetFormat = '.png';
        outputFilePath = `temp_uploads/${path.parse(originalName).name}${targetFormat}`;
        command = `magick "${inputFilePath}" "${outputFilePath}"`;
    } 
    // Logic for Documents (Pandoc)
    else if (fileExt === '.docx' || fileExt === '.txt') {
        targetFormat = '.pdf';
        outputFilePath = `temp_uploads/${path.parse(originalName).name}${targetFormat}`;
        command = `pandoc "${inputFilePath}" -o "${outputFilePath}"`;
        return res.status(400).json({ error: 'Conversion for this specific workflow is not set up in the prototype yet.' });
    }

    console.log(`Starting conversion: ${command}`);

    // Trigger the background process
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Conversion error: ${error.message}`);
            return res.status(500).json({ error: 'Internal Server Error during conversion.' });
        }

        // Send Success Response
        res.status(200).json({
            message: 'File converted successfully!',
            originalFile: req.file.filename,
            downloadLink: `/${outputFilePath}`
        });
    });
});


// ==========================================
// PILLAR 3: AUTOMATED SECURITY CLEANUP
// ==========================================

cron.schedule('* * * * *', () => {
    const directory = 'temp_uploads/';
    
    fs.readdir(directory, (err, files) => {
        if (err) return console.error('Unable to scan directory: ' + err);
        
        files.forEach(file => {
            const filePath = path.join(directory, file);
            
            fs.stat(filePath, (err, stats) => {
                if (err) return console.error('Unable to read file stats: ' + err);
                
                const fileAgeInMs = Date.now() - stats.birthtimeMs;
                const thirtyMinutesInMs = 30 * 60 * 1000;
                
                // Enforce data erasure rule after 30 minutes
                if (fileAgeInMs > thirtyMinutesInMs) {
                    fs.unlink(filePath, err => {
                        if (err) console.error('Error deleting file: ' + err);
                        else console.log(`Security Cleanup: Deleted old file ${file}`);
                    });
                }
            });
        });
    });
});


// ==========================================
// SERVER INITIALIZATION
// ==========================================

app.listen(PORT, () => {
    console.log(`Server is running securely on http://localhost:${PORT}`);
});

