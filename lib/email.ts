import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendPasswordResetEmailParams {
  to: string;
  resetUrl: string;
}

export async function sendPasswordResetEmail({ to, resetUrl }: SendPasswordResetEmailParams) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'DevMate <noreply@devmate.app>',
      to: [to],
      subject: 'Reset Your DevMate Password',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password</title>
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                max-width: 600px; 
                margin: 0 auto; 
                padding: 20px; 
              }
              .container { 
                background: #f8f9fa; 
                padding: 30px; 
                border-radius: 8px; 
                margin: 20px 0; 
              }
              .button { 
                display: inline-block; 
                padding: 12px 24px; 
                background: #000; 
                color: #fff; 
                text-decoration: none; 
                border-radius: 6px; 
                margin: 20px 0; 
              }
              .footer { 
                color: #666; 
                font-size: 14px; 
                margin-top: 30px; 
                padding-top: 20px; 
                border-top: 1px solid #ddd; 
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>Reset Your DevMate Password</h2>
              <p>Hello,</p>
              <p>You requested a password reset for your DevMate account. Click the button below to reset your password:</p>
              <a href="${resetUrl}" class="button">Reset Password</a>
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p><a href="${resetUrl}">${resetUrl}</a></p>
              <p><strong>This link will expire in 1 hour.</strong></p>
              <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
            </div>
            <div class="footer">
              <p>Best regards,<br>The DevMate Team</p>
              <p>This is an automated email. Please do not reply to this message.</p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      if (process.env.NODE_ENV === "development") { console.error('Email sending error:', error); }
      throw new Error('Failed to send password reset email');
    }

    return { success: true, data };
  } catch (error) {
    if (process.env.NODE_ENV === "development") { console.error('Password reset email error:', error); }
    throw error;
  }
}
