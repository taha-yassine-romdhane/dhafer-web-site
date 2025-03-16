/**
 * Email utility functions
 * Note: This is a simplified implementation. In a production environment,
 * you would use a real email service like SendGrid, Mailgun, etc.
 */

// For now, we'll just log the emails to the console
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  // In a real implementation, you would use an email service API here
  console.log('------ EMAIL SENT ------');
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Content: ${html}`);
  console.log('------------------------');
  
  // Simulate a delay for sending email
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return Promise.resolve();
}

/**
 * Send a password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  baseUrl: string
): Promise<void> {
  const resetUrl = `${baseUrl}/reset-password/${resetToken}`;
  
  const subject = 'Reset your password';
  const html = `
    <h1>Reset Your Password</h1>
    <p>You requested a password reset for your account.</p>
    <p>Click the link below to reset your password:</p>
    <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #7c3f61; color: white; text-decoration: none; border-radius: 4px;">Reset Password</a>
    <p>This link will expire in 1 hour.</p>
    <p>If you didn't request this, please ignore this email.</p>
  `;
  
  return sendEmail({ to: email, subject, html });
}
