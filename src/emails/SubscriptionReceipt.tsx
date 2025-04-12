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
  Link,
  Column,
  Row
} from '@react-email/components';

interface SubscriptionReceiptProps {
  planName: string;
  userName: string;
  amount: string;
  date: string;
  nextBillingDate: string;
  invoiceId: string;
  companyName?: string;
  companyLogo?: string;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

export const SubscriptionReceipt = ({
  planName = 'Pro Plan',
  userName = 'User',
  amount = '$9.99',
  date = new Date().toLocaleDateString(),
  nextBillingDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
  invoiceId = 'INV-12345',
  companyName = 'SaaS Boilerplate',
  companyLogo = `${baseUrl}/logo.png`,
}: SubscriptionReceiptProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your {companyName} Subscription Receipt</Preview>
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
          <Heading style={heading}>Subscription Receipt</Heading>
          
          <Section style={section}>
            <Text style={text}>Hi {userName},</Text>
            <Text style={text}>
              Thank you for subscribing to {companyName}. This email confirms your subscription to our {planName}.
            </Text>
          </Section>
          
          <Section style={receiptBox}>
            <Row>
              <Column style={receiptBoxLeftColumn}>
                <Text style={receiptTitle}>Receipt</Text>
                <Text style={receiptDetail}>Date: {date}</Text>
                <Text style={receiptDetail}>Invoice ID: {invoiceId}</Text>
              </Column>
              <Column style={receiptBoxRightColumn}>
                <Text style={receiptAmount}>{amount}</Text>
                <Text style={receiptPlan}>{planName}</Text>
              </Column>
            </Row>
          </Section>
          
          <Section style={section}>
            <Text style={text}>
              Your subscription will automatically renew on {nextBillingDate}. You can manage your subscription from your account settings.
            </Text>
            <Text style={textCenter}>
              <Link href={`${baseUrl}/dashboard/billing`} style={button}>
                View Billing Details
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

const receiptBox = {
  backgroundColor: '#f9fafb',
  padding: '20px',
  borderRadius: '5px',
  border: '1px solid #e5e7eb',
  marginBottom: '30px',
};

const receiptBoxLeftColumn = {
  width: '60%',
};

const receiptBoxRightColumn = {
  width: '40%',
  textAlign: 'right' as const,
};

const receiptTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#0f172a',
  margin: '0 0 15px 0',
};

const receiptDetail = {
  fontSize: '14px',
  color: '#64748b',
  margin: '5px 0',
};

const receiptAmount = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#0f172a',
  margin: '0 0 5px 0',
};

const receiptPlan = {
  fontSize: '14px',
  color: '#64748b',
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
  width: '200px',
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

export default SubscriptionReceipt; 