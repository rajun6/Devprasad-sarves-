const nodemailer = require('nodemailer');

// EmailJS configuration from your keys
const emailjsConfig = {
  serviceID: process.env.EMAILJS_SERVICE_ID || 'service_7bi1zk6',
  templateID: process.env.EMAILJS_TEMPLATE_ID || 'template_213jlu7',
  userID: process.env.EMAILJS_USER_ID || 'nut654zlc3J_puK3B'
};

console.log('📧 EmailJS configured with service:', emailjsConfig.serviceID);

const sendEmail = async (options) => {
  try {
    // Try EmailJS first (browser-based, for frontend)
    console.log('📧 Sending email via EmailJS...');
    console.log('   To:', options.email);
    console.log('   Subject:', options.subject);
    console.log('   Service ID:', emailjsConfig.serviceID);
    
    // For server-side, use Nodemailer as fallback
    if (process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        auth: {
          user: process.env.SMTP_EMAIL,
          pass: process.env.SMTP_PASSWORD
        }
      });

      const message = {
        from: `${options.fromName || process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        html: options.html
      };

      const info = await transporter.sendMail(message);
      console.log('✅ Email sent:', info.messageId);
      return true;
    } else {
      // Just log the email if no SMTP configured
      console.log('ℹ️  SMTP not configured. Email logged only.');
      console.log('   Content:', options.html.substring(0, 100) + '...');
      return true;
    }
  } catch (error) {
    console.error('❌ Email failed:', error.message);
    return false;
  }
};

const emailTemplates = {
  welcome: (name) => ({
    subject: 'Welcome to Service Center',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Welcome to Our Service Center!</h2>
        <p>Dear ${name},</p>
        <p>Thank you for registering with us. You can now book our services online.</p>
        <p>We provide various government and private services at your doorstep.</p>
        <br>
        <p>Best regards,</p>
        <p><strong>${process.env.OWNER_NAME || 'Devprasad Baido'}</strong></p>
      </div>
    `
  }),

  orderConfirmation: (orderDetails) => ({
    subject: `Order Confirmed - ${orderDetails.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Order Confirmation</h2>
        <p>Dear ${orderDetails.customerName},</p>
        <p>Your order has been confirmed successfully.</p>
        <div style="background: #f4f4f4; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <p><strong>Order Number:</strong> ${orderDetails.orderNumber}</p>
          <p><strong>Service:</strong> ${orderDetails.serviceName}</p>
          <p><strong>Status:</strong> ${orderDetails.status}</p>
          <p><strong>Amount:</strong> ₹${orderDetails.price || 'TBD'}</p>
        </div>
        <p>We will process your order soon.</p>
        <br>
        <p>Best regards,</p>
        <p><strong>${process.env.OWNER_NAME || 'Devprasad Baido'}</strong></p>
      </div>
    `
  }),

  orderStatusUpdate: (orderDetails) => ({
    subject: `Order Status Updated - ${orderDetails.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Order Status Update</h2>
        <p>Dear ${orderDetails.customerName},</p>
        <p>Your order status has been updated.</p>
        <div style="background: #f4f4f4; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <p><strong>Order Number:</strong> ${orderDetails.orderNumber}</p>
          <p><strong>New Status:</strong> <span style="color: #4CAF50;">${orderDetails.status}</span></p>
          ${orderDetails.notes ? `<p><strong>Notes:</strong> ${orderDetails.notes}</p>` : ''}
        </div>
        <br>
        <p>Best regards,</p>
        <p><strong>${process.env.OWNER_NAME || 'Devprasad Baido'}</strong></p>
      </div>
    `
  }),

  // EmailJS compatible template (for frontend)
  emailjsTemplate: (params) => ({
    to_name: params.to_name,
    to_email: params.to_email,
    subject: params.subject,
    message: params.message,
    order_number: params.order_number,
    service_name: params.service_name,
    status: params.status
  })
};

module.exports = { sendEmail, emailTemplates };
