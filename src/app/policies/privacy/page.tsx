import MarkdownViewer from "@/components/MarkdownViewer";

const content = `# Privacy Policy for Swift Shop

**Effective Date:** May 25, 2026

Welcome to Swift Shop. Your privacy matters to us. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our website, mobile application, and related services.

By using Swift Shop, you agree to this Privacy Policy.

## 1. Who We Are
Swift Shop is an online e-commerce platform that sells products across multiple categories including electronics, fashion, home essentials, accessories, stationery, beauty products, lifestyle products, and more.

## 2. Information We Collect

### A. Information You Provide
When you use Swift Shop, we may collect:
- Full name
- Mobile number
- Email address
- Shipping and billing address
- Payment information
- Account login details
- Order and transaction details
- Customer support messages
- Reviews and ratings

### B. Automatically Collected Information
When you visit our platform, we may automatically collect:
- IP address
- Browser type
- Device information
- Operating system
- Location data
- App usage data
- Cookies and tracking information
- Pages viewed and browsing activity

### C. Information from Third Parties
We may receive information from:
- Payment gateways
- Delivery partners
- Marketing platforms
- Social login providers
- Fraud prevention services

## 3. How We Use Your Information
We use your information to:
- Process and deliver orders
- Provide customer support
- Manage your account
- Improve our services and user experience
- Send order updates and notifications
- Detect fraud and unauthorized activity
- Comply with legal obligations
- Offer promotions, discounts, and recommendations
- Analyze platform performance and trends

## 4. Payment Information
Payments on Swift Shop may be processed through trusted third-party payment providers such as:
- UPI
- Credit/Debit Cards
- Net Banking
- Wallets
- EMI providers

We do not store full card details on our servers unless required by law or authorized payment compliance standards.

## 5. Cookies & Tracking Technologies
Swift Shop uses cookies and similar technologies to:
- Keep users logged in
- Remember preferences
- Improve website performance
- Analyze traffic
- Personalize shopping experiences
- Deliver relevant advertisements

*You may disable cookies through your browser settings, though some features may not function properly.*

## 6. Sharing of Information
We may share your information with:
- Logistics and delivery partners
- Payment processors
- Technical service providers
- Marketing and analytics partners
- Government authorities when legally required

**We do not sell your personal information to third parties.**

## 7. Data Security
We implement industry-standard security measures including:
- SSL encryption
- Secure payment processing
- Restricted data access
- Firewall and malware protection
- Regular security monitoring

However, no online platform can guarantee absolute security.

## 8. User Rights
Depending on applicable laws, you may have the right to:
- Access your personal data
- Correct inaccurate information
- Delete your account and data
- Withdraw marketing consent
- Request data portability
- File complaints with authorities

To exercise these rights, contact us using the details below.

## 9. Data Retention
We retain information:
- As long as your account remains active
- To fulfill legal and tax obligations
- For fraud prevention and dispute resolution
- For legitimate business purposes

After retention is no longer necessary, data may be securely deleted.

## 10. Children's Privacy
Swift Shop does not knowingly collect information from children under the age required by applicable laws without parental consent.

## 11. Third-Party Links
Our platform may contain links to third-party websites or services. We are not responsible for their privacy practices or content.

## 12. International Users
If you access Swift Shop from outside India, your data may be processed and stored in India or other countries where our service providers operate.

## 13. Changes to This Privacy Policy
We may update this Privacy Policy periodically. Updated versions will be posted on this page with a revised effective date.

## 14. Contact Us
For privacy-related concerns or requests, contact:
**Swift Shop Support**
Email: mail@swiftshop.shop
Website: Swift Shop

## 15. Consent
By accessing or using Swift Shop, you consent to the collection, use, and sharing of your information as described in this Privacy Policy.
`;

export default function PrivacyPolicyPage() {
  return <MarkdownViewer content={content} />;
}
