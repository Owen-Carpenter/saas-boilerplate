import { Resend } from 'resend';
import { renderAsync } from '@react-email/render';
import SubscriptionReceipt from '@/emails/SubscriptionReceipt';
import SubscriptionCanceled from '@/emails/SubscriptionCanceled';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Company details for emails
const COMPANY_NAME = 'SaaS Boilerplate';
const COMPANY_LOGO = 'https://yourdomain.com/logo.png'; // Update with your actual logo URL

// Use a specific Resend-verified sending domain
// This must be a domain you've verified in your Resend dashboard
// For development, you can use the resend.dev domain which is pre-verified
const FROM_EMAIL = 'onboarding@resend.dev';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Send an email using Resend
 */
export async function sendEmail({ to, subject, html, from = FROM_EMAIL }: SendEmailOptions) {
  try {
    console.log(`📧 Attempting to send email from ${from} to ${to}`);
    console.log(`📧 Email subject: ${subject}`);
    console.log(`📧 Using Resend API key: ${process.env.RESEND_API_KEY?.substring(0, 5)}...`);
    
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('❌ Error sending email:', error);
      return { success: false, error };
    }

    console.log(`✅ Email sent successfully! Response:`, data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Exception sending email:', error);
    return { success: false, error };
  }
}

/**
 * Send a subscription receipt email
 */
export async function sendSubscriptionReceiptEmail({
  to,
  userName,
  planName,
  amount,
  invoiceId,
}: {
  to: string;
  userName: string;
  planName: string;
  amount: string;
  invoiceId: string;
}) {
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const nextBillingDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Render the React component to HTML
  const html = await renderAsync(
    SubscriptionReceipt({
      userName,
      planName,
      amount,
      date,
      nextBillingDate,
      invoiceId,
      companyName: COMPANY_NAME,
      companyLogo: COMPANY_LOGO,
    })
  );

  return sendEmail({
    to,
    subject: `Your ${COMPANY_NAME} Subscription Receipt`,
    html,
  });
}

/**
 * Send a subscription canceled email
 */
export async function sendSubscriptionCanceledEmail({
  to,
  userName,
  planName,
}: {
  to: string;
  userName: string;
  planName: string;
}) {
  const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Render the React component to HTML
  const html = await renderAsync(
    SubscriptionCanceled({
      userName,
      planName,
      endDate,
      companyName: COMPANY_NAME,
      companyLogo: COMPANY_LOGO,
    })
  );

  return sendEmail({
    to,
    subject: `Your ${COMPANY_NAME} Subscription Has Been Canceled`,
    html,
  });
}

/**
 * Test the email system with a simple message
 * This can be called from an API route to verify email delivery
 */
export async function sendTestEmail(to: string) {
  try {
    console.log(`📧 Sending test email to ${to}`);
    
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Test Email from SaaS Boilerplate',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h1 style="color: #333;">Test Email</h1>
          <p>This is a test email from your SaaS application.</p>
          <p>If you're receiving this, email delivery is working correctly!</p>
          <p>Sent at: ${new Date().toLocaleString()}</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
          <p style="color: #777; font-size: 12px;">© ${new Date().getFullYear()} ${COMPANY_NAME}</p>
        </div>
      `,
    });

    if (error) {
      console.error('❌ Error sending test email:', error);
      return { success: false, error };
    }

    console.log(`✅ Test email sent successfully! Response:`, data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Exception sending test email:', error);
    return { success: false, error };
  }
} 