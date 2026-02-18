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

exports.sendContactForm = async (formData) => {
    const { name, email, orderNumber, subject, message } = formData;

    const mailOptions = {
        from: `"ChicPlay Contact Form" <${process.env.EMAIL_USER}>`,
        to: process.env.SUPPORT_RECEIVER_EMAIL, // Send TO the support email
        replyTo: email, // Reply to the user
        subject: `[Contact Form] ${subject} - from ${name}`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 20px;">
                <h2 style="color: #ff4d6d; border-bottom: 2px solid #ff4d6d; padding-bottom: 10px;">New Message from ChicPlay Support Hub</h2>
                
                <div style="margin: 20px 0;">
                    <p><strong>From:</strong> ${name} (${email})</p>
                    <p><strong>Order Number:</strong> ${orderNumber || 'N/A'}</p>
                    <p><strong>Subject:</strong> ${subject}</p>
                </div>

                <div style="background: #fdf2f2; padding: 20px; border-radius: 15px; margin: 20px 0;">
                    <p style="margin-top: 0; font-weight: bold; color: #ff4d6d;">Message:</p>
                    <p style="white-space: pre-wrap;">${message}</p>
                </div>

                <p style="font-size: 12px; color: #999; text-align: center; margin-top: 40px;">
                    This message was sent from the ChicPlay Contact Us page. 🎀
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Contact Form Email Error:', error);
        return false;
    }
};

exports.sendOrderConfirmation = async (email, order, items) => {
    const estDate = new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    const itemsHtml = items.map(item => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">
                <img src="${item.imageUrl}" alt="${item.productName}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover; vertical-align: middle; margin-right: 10px;">
                <span style="font-weight: bold;">${item.productName}</span>
                <br><small style="color: #666; margin-left: 60px;">Size: ${item.size} | Color: ${item.color}</small>
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toLocaleString()}</td>
        </tr>
    `).join('');

    const mailOptions = {
        from: `"ChicPlay Fashion" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Order Confirmed! #${order.id.split('-')[0].toUpperCase()} - ChicPlay`,
        html: `
            <div style="font-family: 'Outfit', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a1a;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #ff4d6d; margin: 0;">CHICPLAY</h1>
                    <p style="text-transform: uppercase; letter-spacing: 2px; font-weight: bold; font-size: 12px; color: #666;">Order Confirmation</p>
                </div>

                <div style="background: #fdf2f2; border-radius: 20px; padding: 30px; text-align: center; margin-bottom: 30px;">
                    <h2 style="margin-top: 0;">Thanks for your order! ✨</h2>
                    <p>We're getting your haul ready. It's estimated to arrive by <strong>${estDate}</strong>.</p>
                    <div style="display: inline-block; padding: 10px 20px; background: white; border-radius: 10px; font-weight: bold; color: #ff4d6d;">
                        Order #${order.id.split('-')[0].toUpperCase()}
                    </div>
                </div>

                <h3 style="border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">Order Summary</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th style="text-align: left; padding: 10px; color: #666; font-size: 12px; text-transform: uppercase;">Item</th>
                            <th style="text-align: center; padding: 10px; color: #666; font-size: 12px; text-transform: uppercase;">Qty</th>
                            <th style="text-align: right; padding: 10px; color: #666; font-size: 12px; text-transform: uppercase;">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="2" style="padding: 20px 10px 10px; text-align: right; font-weight: bold;">Total</td>
                            <td style="padding: 20px 10px 10px; text-align: right; font-weight: bold; color: #ff4d6d; font-size: 18px;">₹${order.totalAmount.toLocaleString()}</td>
                        </tr>
                    </tfoot>
                </table>

                <div style="margin-top: 30px; padding: 20px; background: #f8f8f8; border-radius: 15px;">
                    <h4 style="margin-top: 0; text-transform: uppercase; font-size: 11px; color: #666;">Shipping To:</h4>
                    <p style="margin-bottom: 0; font-weight: bold;">${order.shippingAddress}</p>
                </div>

                <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px;">
                    <p>Have questions? Reply to this email or visit our <a href="http://localhost:5173/contact" style="color: #ff4d6d; text-decoration: none;">Support Hub</a>.</p>
                    <p>&copy; 2026 ChicPlay Fashion Studio. Stay Stylish. 🎀</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Order Confirmation Email Error:', error);
        return false;
    }
};
