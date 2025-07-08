import React from "react";
import { Link } from "wouter";
import { Heart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import logoPath from "@assets/Logo_1_1751586675899.png";

export default function Footer() {
  const { isAuthenticated } = useAuth();
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { href: "/", label: "Home" },
    { href: "/about-us", label: "About Us" },
    { href: "/resources", label: "Resources" },
    { href: "/contact", label: "Contact Us" },
  ];

  const products = [
    { href: "/browse", label: "Cart" },
    { href: "/products", label: "Items" },
    { href: "/gift-card", label: "Gift Card" },
    { href: "/browse", label: "View All", external: true },
  ];

  const getHelp = [
    { href: isAuthenticated ? "/create" : "/signup", label: "Create A Needslist" },
    { href: "/resources", label: "Find Resources" },
    { href: "/community", label: "Community Impact" },
    { href: "/support", label: "Support" },
    { href: "/faq", label: "FAQ" },
  ];

  return (
    <footer className="bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <img src={logoPath} alt="MyNeedfully" className="h-12 w-auto" />
            </div>
            <p className="text-gray-600 mb-4 text-sm">
              Helping people in crisis by connecting them with the community support they need.
            </p>
            <div className="flex items-center text-sm text-gray-600">
              <Heart className="h-4 w-4 mr-2 text-coral" />
              <span>Made With Care For Those In Need</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-coral transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Products</h3>
            <ul className="space-y-3">
              {products.map((link, index) => (
                <li key={index} className="flex items-center">
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-coral transition-colors"
                  >
                    {link.label}
                  </Link>
                  {link.external && (
                    <svg className="h-3 w-3 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Get Help */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Get Help</h3>
            <ul className="space-y-3">
              {getHelp.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-coral transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer - Full Width */}
      <div className="border-t border-gray-200 py-6 bg-coral">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm">
            <div className="text-white mb-4 md:mb-0">
              © {currentYear} MyFullyNeedfully.Com All Rights Reserved.
            </div>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-white hover:text-white/80 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-white hover:text-white/80 transition-colors">
                Terms Of Service
              </Link>
              <Link href="/cookies" className="text-white hover:text-white/80 transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}