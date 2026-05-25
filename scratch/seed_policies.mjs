import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCsG6Gvtqz4Jwj2EQ2jImhEABVz794T-Ww",
  authDomain: "kj-swiftshop.firebaseapp.com",
  projectId: "kj-swiftshop",
  storageBucket: "kj-swiftshop.firebasestorage.app",
  messagingSenderId: "291854822667",
  appId: "1:291854822667:web:4aa37d992eb507e7db460e",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const privacyPolicy = `# Privacy Policy for Swift Shop

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

const termsAndConditions = `# Terms & Conditions for Swift Shop

**Effective Date:** May 25, 2026

Welcome to Swift Shop. These Terms & Conditions govern your use of our website, mobile application, products, and services. By accessing or using Swift Shop, you agree to comply with these terms.

If you do not agree with these Terms, please do not use our platform.

## 1. Definitions
In these Terms:
- “Swift Shop”, “we”, “our”, or “us” refers to Swift Shop.
- “User”, “customer”, “you”, or “your” refers to anyone using our platform.
- “Platform” refers to the Swift Shop website, mobile app, and services.

## 2. Eligibility
By using Swift Shop, you confirm that:
- You are legally capable of entering into binding agreements.
- The information provided by you is accurate and complete.
- You will use the platform only for lawful purposes.

## 3. Account Registration
To access certain services, users may need to create an account. You are responsible for:
- Maintaining account confidentiality
- Protecting login credentials
- All activities under your account

*Swift Shop reserves the right to suspend or terminate accounts involved in suspicious, fraudulent, or abusive activities.*

## 4. Products & Services
Swift Shop offers products across multiple categories including:
- Electronics
- Fashion
- Home & Kitchen
- Beauty & Personal Care
- Stationery
- Lifestyle Products
- Accessories
- Grocery and General Merchandise

*Product availability may change without notice.*

## 5. Pricing & Payments
- All prices are displayed in INR unless stated otherwise.
- Prices may change at any time without prior notice.
- Payments must be completed through approved payment methods.
- Orders may be canceled if payment fails or suspicious activity is detected.

We reserve the right to refuse or cancel any order at our discretion.

## 6. Shipping & Delivery
- Delivery timelines are estimated and may vary.
- Delays caused by logistics partners, weather, strikes, or unforeseen events are not fully under our control.
- Users must provide accurate delivery information.

*Risk of loss transfers to the customer upon successful delivery.*

## 7. Returns, Refunds & Cancellations
Returns and refunds are subject to our Return Policy. Generally:
- Damaged, defective, or incorrect products may qualify for return/replacement.
- Certain items may be non-returnable due to hygiene, safety, or legal reasons.
- Refund timelines may vary depending on payment methods.

*Swift Shop reserves the right to reject fraudulent or abusive return requests.*

## 8. User Conduct
Users agree not to:
- Violate any laws or regulations
- Use the platform for fraudulent activities
- Upload harmful, offensive, or illegal content
- Attempt unauthorized access to systems
- Interfere with platform security or operations
- Abuse discounts, offers, or referral systems

## 9. Intellectual Property
All content on Swift Shop including Logos, Branding, Designs, Images, Text, Software, and Product listings are protected by intellectual property laws and belong to Swift Shop or respective owners.

**Unauthorized use, copying, or reproduction is prohibited.**

## 10. Third-Party Services
Swift Shop may integrate with third-party providers including Payment gateways, Logistics partners, Analytics providers, and Marketing services. We are not responsible for third-party services, policies, or actions.

## 11. Limitation of Liability
To the maximum extent permitted by law, Swift Shop shall not be liable for:
- Indirect or consequential damages
- Loss of profits or data
- Delays or interruptions
- Third-party actions
- Technical issues beyond reasonable control

Use of the platform is at your own risk.

## 12. Disclaimer
Products and services are provided on an “as is” and “as available” basis. While we aim for accuracy, Swift Shop does not guarantee:
- Continuous platform availability
- Error-free operation
- Complete accuracy of listings, prices, or descriptions

## 13. Indemnification
You agree to indemnify and hold harmless Swift Shop, its employees, partners, and affiliates from claims, damages, liabilities, or expenses arising from your misuse of the platform or violation of these Terms.

## 14. Privacy
Your use of Swift Shop is also governed by our Privacy Policy.

## 15. Suspension & Termination
Swift Shop reserves the right to suspend or terminate accounts, restrict platform access, cancel orders, or remove content without prior notice if violations are detected.

## 16. Governing Law
These Terms shall be governed by the laws of India. Any disputes shall be subject to the jurisdiction of the competent courts in India.

## 17. Changes to Terms
Swift Shop may update these Terms & Conditions at any time. Continued use of the platform after updates constitutes acceptance of revised Terms.

## 18. Contact Information
For support or legal inquiries:
**Swift Shop Support**
Email: mail@swiftshop.shop
Website: Swift Shop

## 19. Acceptance of Terms
By accessing or using Swift Shop, you acknowledge that you have read, understood, and agreed to these Terms & Conditions.
`;

const returnCancellation = `# Return, Refund & Cancellation Policy for Swift Shop

**Effective Date:** May 25, 2026

Welcome to Swift Shop. At Swift Shop, customer satisfaction is important to us. This Return, Refund & Cancellation Policy explains the conditions under which orders may be canceled, returned, replaced, or refunded.

By placing an order on Swift Shop, you agree to this policy.

## 1. Order Cancellation Policy
### A. Cancellation Before Shipment
Customers may cancel an order before it is shipped by contacting our support team or through available cancellation options on the platform.
If the order is successfully canceled before dispatch:
- A full refund will be initiated.
- Refunds are usually processed within 5–10 business days depending on the payment method.

### B. Cancellation After Shipment
Once an order has been shipped:
- Cancellation requests may not be accepted.
- Customers may instead request a return after delivery if eligible.

### C. Seller or Platform Cancellation
Swift Shop reserves the right to cancel orders due to:
- Product unavailability
- Pricing or listing errors
- Payment issues
- Fraud detection
- Operational limitations
- Violation of platform policies

If canceled by us, eligible refunds will be processed automatically.

## 2. Return Policy
### A. Eligible Returns
Products may be eligible for return if:
- The item is damaged
- The item is defective
- Wrong product was delivered
- Product is missing parts/accessories
- Product significantly differs from description

### B. Return Request Timeline
Customers must request returns within **7 days from delivery** unless otherwise specified on the product page. Some categories may have different return windows.

### C. Conditions for Returns
Returned products must generally be:
- Unused and in original condition
- Returned with original packaging
- Returned with tags, manuals, invoices, and accessories
- Not physically damaged by customer misuse

Swift Shop may reject returns that do not meet these conditions.

## 3. Non-Returnable Items
Certain products may not be eligible for return including:
- Personal hygiene products
- Beauty and skincare items once opened
- Innerwear and intimate products
- Perishable goods
- Customized or personalized products
- Digital/downloadable products
- Gift cards
- Products marked as “Non-Returnable”

## 4. Refund Policy
### A. Refund Approval
Refunds are initiated after returned product inspection and verification of return eligibility. Refund approval is subject to successful quality checks.

### B. Refund Methods
Refunds are processed through:
- Original payment method
- Bank transfer
- Wallet/store credit (if applicable)

### C. Refund Timelines
Estimated refund timelines:
- **UPI/Wallets:** 2–5 business days
- **Bank Cards:** 5–10 business days
- **Net Banking:** 5–10 business days

Actual timelines may vary depending on banks or payment providers.

## 5. Replacement Policy
Eligible products may qualify for replacement instead of refund if replacement stock is available and the issue falls under eligible return conditions. If replacement is unavailable, a refund may be offered.

## 6. Return Pickup
Where available, Swift Shop may arrange pickup through delivery partners. In some cases, customers may need to self-ship the item. Customers should securely pack returned items to avoid transit damage.

## 7. Failed Delivery
Orders may be canceled if the customer is unavailable, incorrect address/contact details are provided, or delivery repeatedly fails. Applicable refunds will be processed after verification.

## 8. Fraud Prevention
Swift Shop reserves the right to reject suspicious return/refund claims, limit return privileges, and suspend accounts involved in fraudulent activities.

## 9. Damaged Package at Delivery
Customers are advised to check package condition at delivery, record unboxing videos for high-value products, and report issues immediately after delivery.

## 10. Contact Us
For return, refund, or cancellation support:
**Swift Shop Support**
Email: mail@swiftshop.shop
Website: Swift Shop

## 11. Policy Updates
Swift Shop may modify this policy at any time without prior notice. Updated versions will be posted on the platform with revised effective dates.

## 12. Acceptance of Policy
By placing an order on Swift Shop, you acknowledge that you have read, understood, and agreed to this Return, Refund & Cancellation Policy.
`;

const refundPolicy = `# Refund Policy for Swift Shop

**Effective Date:** May 25, 2026

Welcome to Swift Shop. This Refund Policy explains how refunds are processed for purchases made through Swift Shop.

By placing an order on our platform, you agree to this Refund Policy.

## 1. Eligibility for Refunds
Customers may be eligible for refunds in situations including:
- Damaged products received
- Defective or malfunctioning items
- Incorrect product delivered
- Missing items or accessories
- Order cancellation approved before shipment
- Failed or undelivered orders
- Eligible returns approved after inspection

Refund approval is subject to verification by Swift Shop.

## 2. Non-Refundable Situations
Refunds may not be provided for:
- Products damaged due to customer misuse
- Items returned without original packaging or accessories
- Products marked as non-returnable
- Opened hygiene or personal care products
- Customized or personalized products
- Digital/downloadable products
- Requests made after the allowed return period
- Fraudulent or abusive refund claims

## 3. Refund Process
### A. Cancellation Refunds
If an order is canceled before shipment:
- Refunds are generally initiated automatically.
- Processing may begin within 24–72 hours after cancellation approval.

### B. Return-Based Refunds
For returned products:
- Product is received and inspected.
- Eligibility and condition are verified.
- Refund is approved or rejected.
- Approved refunds are processed to the original payment method or store credit.

## 4. Refund Timelines
Estimated refund timelines after approval:
- **UPI & Wallets:** 2–5 Business Days
- **Debit/Credit Cards:** 5–10 Business Days
- **Net Banking:** 5–10 Business Days
- **Store Credit/Wallet:** Usually Instant

Actual timing may vary depending on banks, payment gateways, or financial institutions.

## 5. Partial Refunds
In certain cases, partial refunds may be issued, including missing accessories, open-box returns, damaged packaging caused by customer handling, or promotional discounts adjustments.

## 6. Failed Refunds
If a refund fails due to incorrect bank details, expired payment instruments, or technical banking issues, customers may be contacted for updated information.

## 7. Shipping Charges
Shipping charges may be non-refundable unless the error was caused by Swift Shop. COD handling fees, platform fees, or convenience charges may also be non-refundable where legally permitted.

## 8. Fraud Prevention
Swift Shop reserves the right to reject suspicious refund requests, conduct verification checks, suspend accounts involved in fraudulent activities, and take legal action where necessary.

## 9. Chargebacks
Customers are encouraged to contact Swift Shop support before initiating payment disputes or chargebacks with banks/payment providers. Fraudulent chargebacks may result in account restrictions.

## 10. Limitation of Liability
Refunds provided under this policy are the sole remedy available to customers for eligible refund claims. Swift Shop shall not be liable for indirect or consequential losses.

## 11. Contact Us
For refund-related assistance:
**Swift Shop Support**
Email: mail@swiftshop.shop
Website: Swift Shop

## 12. Changes to Refund Policy
Swift Shop reserves the right to modify this Refund Policy at any time. Updated policies will be published on the platform with revised effective dates.

## 13. Acceptance of Policy
By using Swift Shop and placing orders on the platform, you acknowledge that you have read, understood, and agreed to this Refund Policy.
`;

const contactUs = `# Contact Us – Swift Shop

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

const faq = `# Frequently Asked Questions (FAQ) – Swift Shop

Welcome to the FAQ section of Swift Shop. Here are answers to some of the most common questions about orders, payments, shipping, returns, refunds, and account support.

### 1. What is Swift Shop?
Swift Shop is an online e-commerce platform offering products across multiple categories including electronics, fashion, home essentials, accessories, beauty products, stationery, lifestyle items, and more.

### 2. How do I place an order?
To place an order:
- Browse products on Swift Shop
- Add items to your cart
- Proceed to checkout
- Enter shipping details
- Choose a payment method
- Confirm your order

You will receive order confirmation after successful payment or order placement.

### 3. Do I need an account to order?
Yes, users may need to create or log into an account to place orders, track shipments, manage returns, and access customer support features.

### 4. Which payment methods are accepted?
Swift Shop may support:
- UPI
- Debit/Credit Cards
- Net Banking
- Wallets
- Cash on Delivery (if available)
- EMI options (where applicable)

Available payment methods may vary by location and product.

### 5. How can I track my order?
You can track your order from:
**My Orders → Order Details → Track Order**
Tracking updates are usually available after shipment.

### 6. How long does delivery take?
Delivery timelines depend on product availability, delivery location, and courier partner operations. Estimated delivery dates are shown during checkout.

### 7. Can I cancel my order?
Yes, orders may be canceled before shipment through the My Orders section, customer support, or in-app support chat. Once shipped, cancellation may not be possible.

### 8. What is the return policy?
Eligible products may be returned if the product is damaged, wrong item delivered, product is defective, or item significantly differs from description. Return eligibility and timelines may vary by product category.

### 9. How do refunds work?
Approved refunds are usually processed to the original payment method. Estimated refund timelines:
- **UPI/Wallets:** 2–5 business days
- **Cards/Net Banking:** 5–10 business days

### 10. Are all products returnable?
No. Some items may be non-returnable including personal hygiene products, opened beauty products, customized items, digital products, or clearance items.

### 11. How can I contact customer support?
You can contact Swift Shop through:
- In-app Support Chat inside your profile/account section
- Email support: **mail@swiftshop.shop**

### 12. Where is the support chat available?
The support chat system is available inside:
**Profile / My Account → Support Chat**

### 13. Is my payment information secure?
Yes. Swift Shop uses industry-standard security measures and trusted payment gateways to help protect customer transactions. However, users should never share OTPs, passwords, or sensitive banking details with anyone.

### 14. Why was my order canceled?
Orders may be canceled due to product unavailability, payment failure, pricing errors, fraud detection, or logistics limitations. Eligible refunds will be processed automatically.

### 15. Can I change my delivery address after ordering?
Address changes may be possible before shipment depending on order status. Please contact support immediately if changes are required.

### 16. What should I do if I receive a damaged package?
Customers are advised to take photos/videos during unboxing, report the issue immediately, and contact support through chat or email.

### 17. Does Swift Shop offer Cash on Delivery (COD)?
COD availability depends on delivery location, product category, seller policies, and order value. COD options will appear during checkout if available.

### 18. How do I become a seller or partner?
For seller registrations, partnerships, or business inquiries, email **mail@swiftshop.shop**.

### 19. Are there fake support scams?
Yes, online scams exist. Please note Swift Shop never asks for OTPs or passwords. Only use official support channels.

### 20. How can I stay updated?
Follow Swift Shop through official website and social media channels for offers, discounts, and updates.

### Need More Help?
If your question is not listed here, contact our support team through the in-app support chat or email: **ztenkammu@gmail.com**.
`;

async function upload() {
  try {
    const docRef = doc(db, "settings", "legal_pages");
    await setDoc(docRef, {
      privacyPolicy,
      termsAndConditions,
      returnCancellation,
      refundPolicy,
      contactUs,
      faq,
      updatedAt: serverTimestamp()
    });
    console.log("Successfully uploaded formatted legal pages to Firestore.");
    process.exit(0);
  } catch (error) {
    console.error("Error uploading to Firestore:", error);
    process.exit(1);
  }
}

upload();
