import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = 3000;

// Get __dirname for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve the index.html file at the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Nodemailer transporter setup with tls options to allow self-signed certificates
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

// API route to handle booking appointments
app.post('/api/book-appointment', (req, res) => {
    const { name, email, day, date, time, timezone } = req.body;
    console.log(`Appointment booked: ${name}, ${email}, ${day}, ${date}, ${time} ${timezone}`);

    // Email options
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: 'New Appointment Booked',
        text: `New appointment booked by ${name} (${email}) on ${day}, ${date} at ${time} ${timezone}.`
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ message: 'Error booking appointment' });
        }
        console.log('Email sent:', info.response);
        res.status(200).json({ message: 'Appointment booked successfully' });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
