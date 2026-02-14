const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Send email function
async function sendEmail(to, subject, htmlBody, options = {}) {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"${options.fromName || 'E-Commerce Store'}" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: htmlBody,
      ...options
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return { 
      success: true, 
      messageId: info.messageId,
      to: to,
      subject: subject
    };
  } catch (error) {
    console.error('❌ Email sending error:', error.message);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

// Send order confirmation email
async function sendOrderConfirmation(order, user) {
  const subject = `Order Confirmation - #${order.trackingId}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .item { padding: 10px 0; border-bottom: 1px solid #eee; }
        .total { font-size: 20px; font-weight: bold; color: #7c3aed; margin-top: 20px; }
        .button { display: inline-block; background: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Order Confirmed!</h1>
          <p>Thank you for your purchase</p>
        </div>
        <div class="content">
          <h2>Hello ${user.name}!</h2>
          <p>Your order has been successfully placed and confirmed.</p>
          
          <div class="order-details">
            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> ${order.trackingId}</p>
            <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            
            <h4>Items:</h4>
            ${order.items.map(item => `
              <div class="item">
                <strong>${item.name}</strong><br>
                Quantity: ${item.quantity} × ₹${item.price} = ₹${item.quantity * item.price}
              </div>
            `).join('')}
            
            <p class="total">Total Amount: ₹${order.total}</p>
          </div>
          
          <p>We'll send you another email when your order ships.</p>
          
          <a href="#" class="button">Track Your Order</a>
          
          <div class="footer">
            <p>Thank you for shopping with us!</p>
            <p>© 2026 E-Commerce Store. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return await sendEmail(user.email, subject, html);
}

// Send order shipped email
async function sendOrderShipped(order, user, trackingInfo) {
  const subject = `Order Shipped - #${order.trackingId}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .tracking-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .tracking-id { font-size: 24px; font-weight: bold; color: #10b981; letter-spacing: 2px; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📦 Order Shipped!</h1>
          <p>Your package is on the way</p>
        </div>
        <div class="content">
          <h2>Hello ${user.name}!</h2>
          <p>Great news! Your order has been shipped and is on its way to you.</p>
          
          <div class="tracking-box">
            <p><strong>Tracking Number:</strong></p>
            <p class="tracking-id">${trackingInfo.trackingNumber}</p>
            <p><strong>Courier:</strong> ${trackingInfo.courier}</p>
            <p><strong>Expected Delivery:</strong> ${trackingInfo.expectedDelivery}</p>
          </div>
          
          <a href="#" class="button">Track Your Package</a>
          
          <p>You can track your package using the tracking number above.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return await sendEmail(user.email, subject, html);
}

// Send welcome email
async function sendWelcomeEmail(user) {
  const subject = `Welcome to E-Commerce Store, ${user.name}!`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>👋 Welcome!</h1>
        </div>
        <div class="content">
          <h2>Hello ${user.name}!</h2>
          <p>Welcome to E-Commerce Store! We're excited to have you join our community.</p>
          <p>Start exploring our amazing collection of products and enjoy exclusive deals.</p>
          <a href="#" class="button">Start Shopping</a>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return await sendEmail(user.email, subject, html);
}

// Send password reset email
async function sendPasswordReset(user, resetCode, resetLink) {
  const subject = 'Reset Your Password';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .code-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .code { font-size: 32px; font-weight: bold; color: #ef4444; letter-spacing: 5px; }
        .button { display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Password Reset</h1>
        </div>
        <div class="content">
          <h2>Hello ${user.name}!</h2>
          <p>We received a request to reset your password. Use the code below:</p>
          
          <div class="code-box">
            <p class="code">${resetCode}</p>
          </div>
          
          <p>Or click the button below:</p>
          <a href="${resetLink}" class="button">Reset Password</a>
          
          <p><small>If you didn't request this, please ignore this email.</small></p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return await sendEmail(user.email, subject, html);
}

// Send refund processed email
async function sendRefundProcessed(order, user, refundAmount) {
  const subject = `Refund Processed - Order #${order.trackingId}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .refund-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .amount { font-size: 32px; font-weight: bold; color: #10b981; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💰 Refund Processed</h1>
        </div>
        <div class="content">
          <h2>Hello ${user.name}!</h2>
          <p>Your refund has been processed successfully.</p>
          
          <div class="refund-box">
            <p><strong>Refund Amount:</strong></p>
            <p class="amount">₹${refundAmount}</p>
            <p><strong>Order ID:</strong> ${order.trackingId}</p>
          </div>
          
          <p>The amount will be credited to your original payment method within 5-7 business days.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return await sendEmail(user.email, subject, html);
}

module.exports = {
  sendEmail,
  sendOrderConfirmation,
  sendOrderShipped,
  sendWelcomeEmail,
  sendPasswordReset,
  sendRefundProcessed
};
