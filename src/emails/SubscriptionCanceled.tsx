import * as React from 'react';
import { 
  Html, 
  Body, 
  Container, 
  Head, 
  Heading, 
  Hr, 
  Img, 
  Preview, 
  Section, 
  Text,
  Link
} from '@react-email/components';

interface SubscriptionCanceledProps {
  userName: string;
  planName: string;
  endDate: string;
  companyName?: string;
  companyLogo?: string;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

export const SubscriptionCanceled = ({
  userName = 'User',
  planName = 'Pro Plan',
  endDate = new Date().toLocaleDateString(),
  companyName = 'SaaS Boilerplate',
  companyLogo = `${baseUrl}/logo.png`,
}: SubscriptionCanceledProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your {companyName} Subscription Has Been Canceled</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img
              src={companyLogo}
              width="40"
              height="40"
              alt={companyName}
              style={logo}
            />
          </Section>
          <Heading style={heading}>Subscription Canceled</Heading>
          
          <Section style={section}>
            <Text style={text}>Hi {userName},</Text>
            <Text style={text}>
              We're sorry to see you go. This email confirms that your subscription to our {planName} has been canceled.
            </Text>
          </Section>
          
          <Section style={infoBox}>
            <Text style={infoTitle}>What This Means:</Text>
            <Text style={infoDetail}>• Your subscription has been canceled</Text>
            <Text style={infoDetail}>• You will have access to premium features until {endDate}</Text>
            <Text style={infoDetail}>• After that date, your account will be downgraded to the Free plan</Text>
            <Text style={infoDetail}>• You can resubscribe anytime from your account settings</Text>
          </Section>
          
          <Section style={section}>
            <Text style={text}>
              We hope to see you back soon. If you have feedback on how we could improve our service, please let us know.
            </Text>
            <Text style={textCenter}>
              <Link href={`${baseUrl}/dashboard/billing`} style={button}>
                Reactivate Subscription
              </Link>
            </Text>
          </Section>
          
          <Hr style={hr} />
          
          <Section style={footerSection}>
            <Text style={footerText}>
              © {new Date().getFullYear()} {companyName}. All rights reserved.
            </Text>
            <Text style={footerText}>
              If you have any questions, please contact our support team.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: 'Helvetica,Arial,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px',
  maxWidth: '600px',
  borderRadius: '5px',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
};

const logoContainer = {
  marginBottom: '24px',
};

const logo = {
  margin: '0 auto',
};

const heading = {
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '30px 0',
  color: '#0f172a',
};

const section = {
  marginBottom: '30px',
};

const text = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#3c4149',
};

const textCenter = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#3c4149',
  textAlign: 'center' as const,
};

const infoBox = {
  backgroundColor: '#f9fafb',
  padding: '20px',
  borderRadius: '5px',
  border: '1px solid #e5e7eb',
  marginBottom: '30px',
};

const infoTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#0f172a',
  margin: '0 0 15px 0',
};

const infoDetail = {
  fontSize: '16px',
  color: '#3c4149',
  margin: '5px 0',
};

const button = {
  backgroundColor: '#0ff0fc',
  borderRadius: '5px',
  color: '#0f172a',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 20px',
  margin: '20px auto 0',
  width: '250px',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '30px 0',
};

const footerSection = {
  textAlign: 'center' as const,
};

const footerText = {
  fontSize: '14px',
  lineHeight: '24px',
  color: '#64748b',
  margin: '5px 0',
};

export default SubscriptionCanceled; 