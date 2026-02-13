const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // Use App Password if 2FA is enabled
    }
});

exports.sendOTP = async (email, otp) => {
    const mailOptions = {
        from: `"ChicPlay Fashion" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your Password Reset OTP - ChicPlay',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #e11d48; text-align: center;">ChicPlay Fashion</h2>
                <p>Hello,</p>
                <p>You requested to reset your password. Use the following One-Time Password (OTP) to proceed:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #e11d48; background: #fff1f2; padding: 10px 20px; border-radius: 5px; border: 1px dashed #e11d48;">
                        ${otp}
                    </span>
                </div>
                <p>This code will expire in 10 minutes. If you didn't request this, please ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #888; text-align: center;">
                    &copy; 2026 ChicPlay Fashion Studio. Stay Stylish.
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Email Send Error:', error);
        return false;
    }
};
