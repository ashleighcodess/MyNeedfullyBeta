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

  const features = [
    { href: "/browse", label: "Browse Needs Lists" },
    { href: "/products", label: "Search Products" },
    { href: "/create", label: "Create Needs List" },
    { href: "/dashboard", label: "My Dashboard" },
  ];

  const getHelp = [
    { href: "/resources", label: "Find Resources" },
    { href: "/community", label: "Community Impact" },
    { href: "/browse", label: "Support a Needs List" },
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
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Features</h3>
            <ul className="space-y-3">
              {features.map((link, index) => (
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