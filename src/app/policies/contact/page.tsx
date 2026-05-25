import MarkdownViewer from "@/components/MarkdownViewer";

const content = `# Contact Us – Swift Shop

Welcome to Swift Shop Support. We’re here to help you with orders, payments, returns, refunds, account issues, technical support, and general inquiries.

## Customer Support

### In-App Support Chat
Customers can directly contact our support team through the Support Chat System available inside the **My Profile / Account** section of Swift Shop.

The support chat system allows users to:
- Chat with customer support executives
- Track complaint status
- Share screenshots and order details
- Get help for returns, refunds, and cancellations
- Receive faster issue resolution

*Support chat availability may vary depending on support hours and agent availability.*

### Email Support
📧 **mail@swiftshop.shop**

For:
- Order-related issues
- Refund and return requests
- Payment problems
- Technical support
- Account assistance
- General customer inquiries

### Business & Partnership Inquiries
📧 **ztenkammu@gmail.com**

For:
- Brand collaborations
- Seller partnerships
- Advertising opportunities
- Wholesale and business inquiries

## Working Hours
🕒 **Monday – Saturday**
10:00 AM – 7:00 PM IST

*Response times may vary during weekends, holidays, festivals, or high-support traffic periods.*

## Website
🌐 [Swift Shop](#)

## Customer Support Guidelines
To help us resolve your issue faster, please provide:
- Order ID
- Registered email or mobile number
- Detailed issue description
- Relevant screenshots/photos if applicable

## Security Notice
Swift Shop will never ask for your OTP, passwords, CVV, or confidential banking information. Please avoid sharing sensitive payment details through chat or email.

## Social Media
Follow Swift Shop on official social media platforms for updates, offers, announcements, and customer engagement.

**Thank you for choosing Swift Shop. We appreciate your trust and are committed to providing a smooth and secure shopping experience.**
`;

export default function ContactPage() {
  return <MarkdownViewer content={content} />;
}
