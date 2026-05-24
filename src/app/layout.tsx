import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import PageWrapper from "@/components/layout/PageWrapper";
import { AuthProvider } from "@/contexts/AuthContext";
import CartDrawer from "@/components/cart/CartDrawer";
import MaintenanceWrapper from "@/components/layout/MaintenanceWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SwiftShop",
  description: "Curated premium goods delivered with speed. Experience the future of e-commerce.",
  openGraph: {
    title: "SwiftShop | Premium E-Commerce",
    description: "Curated premium goods delivered with speed.",
    url: "https://swiftshop.com",
    siteName: "SwiftShop",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SwiftShop",
    description: "Curated premium goods delivered with speed.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <MaintenanceWrapper>
            <Navigation />
            <CartDrawer />
            <PageWrapper>{children}</PageWrapper>
            <Footer />
          </MaintenanceWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
