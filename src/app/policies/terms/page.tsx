import MarkdownViewer from "@/components/MarkdownViewer";

const content = `# 📜 Terms & Conditions for Swift Shop

**📅 Effective Date:** May 25, 2026

Welcome to **Swift Shop**. These Terms & Conditions govern your use of our website, mobile application, products, and services. By accessing or using Swift Shop, you agree to comply with these terms. 

If you do not agree with these Terms, please do not use our platform. 🛑

---

## 📖 1. Definitions
In these Terms:
- **“Swift Shop”, “we”, “our”, or “us”** refers to Swift Shop.
- **“User”, “customer”, “you”, or “your”** refers to anyone using our platform.
- **“Platform”** refers to the Swift Shop website, mobile app, and services.

---

## ✅ 2. Eligibility
By using Swift Shop, you confirm that:
- 🧑‍⚖️ You are legally capable of entering into binding agreements.
- 📝 The information provided by you is accurate and complete.
- ⚖️ You will use the platform only for lawful purposes.

---

## 🔐 3. Account Registration
To access certain services, users may need to create an account. You are responsible for:
- 🤐 Maintaining account confidentiality
- 🛡️ Protecting login credentials
- 👤 All activities under your account

> 🚨 **Warning:** Swift Shop reserves the right to suspend or terminate accounts involved in suspicious, fraudulent, or abusive activities.

---

## 🛍️ 4. Products & Services
Swift Shop offers products across multiple categories including:
- 💻 Electronics
- 👗 Fashion
- 🏠 Home & Kitchen
- 💄 Beauty & Personal Care
- ✏️ Stationery
- 🌿 Lifestyle Products
- 👜 Accessories
- 🛒 Grocery and General Merchandise

*Note: Product availability may change without notice.*

---

## 💳 5. Pricing & Payments
- 💰 All prices are displayed in **INR** unless stated otherwise.
- 📉 Prices may change at any time without prior notice.
- ✅ Payments must be completed through approved payment methods.
- ❌ Orders may be canceled if payment fails or suspicious activity is detected.

*We reserve the right to refuse or cancel any order at our discretion.*

---

## 🚚 6. Shipping & Delivery
- ⏳ Delivery timelines are estimated and may vary.
- ⛈️ Delays caused by logistics partners, weather, strikes, or unforeseen events are not fully under our control.
- 📍 Users must provide accurate delivery information.

*Risk of loss transfers to the customer upon successful delivery.*

---

## 🔄 7. Returns, Refunds & Cancellations
Returns and refunds are subject to our **Return Policy**. Generally:
- 📦 Damaged, defective, or incorrect products may qualify for return/replacement.
- 🛑 Certain items may be non-returnable due to hygiene, safety, or legal reasons.
- ⏱️ Refund timelines may vary depending on payment methods.

*Swift Shop reserves the right to reject fraudulent or abusive return requests.*

---

## 🚫 8. User Conduct
Users agree **not** to:
- ⚖️ Violate any laws or regulations
- 🕵️ Use the platform for fraudulent activities
- 🤬 Upload harmful, offensive, or illegal content
- 🔓 Attempt unauthorized access to systems
- 💥 Interfere with platform security or operations
- 🎟️ Abuse discounts, offers, or referral systems

---

## ©️ 9. Intellectual Property
All content on Swift Shop including Logos, Branding, Designs, Images, Text, Software, and Product listings are protected by intellectual property laws and belong to Swift Shop or respective owners.

> 🛑 **Unauthorized use, copying, or reproduction is strictly prohibited.**

---

## 🤝 10. Third-Party Services
Swift Shop may integrate with third-party providers including:
- 💳 Payment gateways
- 🚚 Logistics partners
- 📊 Analytics providers
- 📢 Marketing services

*We are not responsible for third-party services, policies, or actions.*

---

## ⚖️ 11. Limitation of Liability
To the maximum extent permitted by law, Swift Shop shall not be liable for:
- 📉 Indirect or consequential damages
- 💾 Loss of profits or data
- ⏳ Delays or interruptions
- 👤 Third-party actions
- ⚙️ Technical issues beyond reasonable control

*Use of the platform is at your own risk.*

---

## ⚠️ 12. Disclaimer
Products and services are provided on an **“as is”** and **“as available”** basis. While we aim for accuracy, Swift Shop does not guarantee:
- 🟢 Continuous platform availability
- ✅ Error-free operation
- 🎯 Complete accuracy of listings, prices, or descriptions

---

## 🛡️ 13. Indemnification
You agree to indemnify and hold harmless Swift Shop, its employees, partners, and affiliates from claims, damages, liabilities, or expenses arising from your misuse of the platform or violation of these Terms.

---

## 🔒 14. Privacy
Your use of Swift Shop is also governed by our **Privacy Policy**.

---

## 🛑 15. Suspension & Termination
Swift Shop reserves the right to suspend or terminate accounts, restrict platform access, cancel orders, or remove content without prior notice if violations are detected.

---

## 🏛️ 16. Governing Law
These Terms shall be governed by the laws of India. Any disputes shall be subject to the jurisdiction of the competent courts in India.

---

## 🔄 17. Changes to Terms
Swift Shop may update these Terms & Conditions at any time. Continued use of the platform after updates constitutes acceptance of revised Terms.

---

## 📞 18. Contact Information
For support or legal inquiries:

**Swift Shop Support**
- ✉️ **Email:** mail@swiftshop.shop
- 🌐 **Website:** [Swift Shop](/)

---

## ✅ 19. Acceptance of Terms
By accessing or using Swift Shop, you acknowledge that you have read, understood, and agreed to these Terms & Conditions.
`;

export default function TermsPage() {
  return <MarkdownViewer content={content} />;
}
