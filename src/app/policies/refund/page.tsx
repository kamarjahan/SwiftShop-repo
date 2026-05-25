import MarkdownViewer from "@/components/MarkdownViewer";

const content = `# Refund Policy for Swift Shop

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

export default function RefundPolicyPage() {
  return <MarkdownViewer content={content} />;
}
