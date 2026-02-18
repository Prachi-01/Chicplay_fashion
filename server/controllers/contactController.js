const emailService = require('../services/emailService');

exports.submitContactForm = async (req, res) => {
    try {
        const { name, email, orderNumber, subject, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ message: 'Please fill in all required fields' });
        }

        const emailSent = await emailService.sendContactForm({
            name,
            email,
            orderNumber,
            subject,
            message
        });

        if (emailSent) {
            res.status(200).json({ message: 'Message sent successfully! Our team will get back to you soon. 🎀' });
        } else {
            res.status(500).json({ message: 'Failed to send message. Please try again later.' });
        }
    } catch (error) {
        console.error('Contact Controller Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
