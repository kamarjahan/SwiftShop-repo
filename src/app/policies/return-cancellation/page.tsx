import MarkdownViewer from "@/components/MarkdownViewer";

const content = `# Return, Refund & Cancellation Policy for Swift Shop

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

export default function ReturnPolicyPage() {
  return <MarkdownViewer content={content} />;
}
