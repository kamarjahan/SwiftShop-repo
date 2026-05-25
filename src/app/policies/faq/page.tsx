import MarkdownViewer from "@/components/MarkdownViewer";

const content = `# Frequently Asked Questions (FAQ) – Swift Shop

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

export default function FaqPage() {
  return <MarkdownViewer content={content} />;
}
