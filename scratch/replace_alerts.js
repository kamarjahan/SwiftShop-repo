const fs = require('fs');
const path = require('path');

const files = [
  "src/app/account/page.tsx",
  "src/app/admin/coupons/new/page.tsx",
  "src/app/admin/coupons/page.tsx",
  "src/app/admin/home-customization/page.tsx",
  "src/app/admin/orders/[id]/page.tsx",
  "src/app/admin/products/[id]/edit/page.tsx",
  "src/app/admin/products/new/page.tsx",
  "src/app/admin/products/page.tsx",
  "src/app/admin/settings/page.tsx",
  "src/app/checkout/page.tsx",
  "src/app/orders/page.tsx",
  "src/components/account/SupportTab.tsx",
  "src/components/cart/RazorpayCheckout.tsx",
  "src/components/product/ProductDetailsClient.tsx"
];

files.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (!fs.existsSync(fullPath)) return;
  let content = fs.readFileSync(fullPath, 'utf8');

  // Add import if not present
  if (!content.includes('import toast')) {
    // find first import and add it after
    content = content.replace(/(import [^;]+;?\r?\n)/, "$1import toast from 'react-hot-toast';\n");
  }

  // Replace alert("...") and alert('...') and alert(`...`)
  content = content.replace(/alert\((['"`])(.*?)(['"`])\)/g, (match, p1, p2, p3) => {
    const text = p2.toLowerCase();
    if (text.includes('success') || text.includes('placed')) return `toast.success(${p1}${p2}${p3})`;
    if (text.includes('fail') || text.includes('error') || text.includes('not found') || text.includes('required')) return `toast.error(${p1}${p2}${p3})`;
    return `toast(${p1}${p2}${p3})`;
  });

  // Replace alert(variable) with toast.error(variable)
  content = content.replace(/alert\(([^'"`)]+)\)/g, (match, p1) => `toast.error(${p1})`);

  fs.writeFileSync(fullPath, content);
});

console.log('Replaced alerts successfully');
