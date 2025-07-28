import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSEO, generatePageTitle, generatePageDescription, generateKeywords, generateCanonicalUrl } from "@/lib/seo";

export default function TermsAndConditions() {
  // SEO Configuration
  useSEO({
    title: generatePageTitle("Terms and Conditions - MyNeedfully"),
    description: generatePageDescription("Read MyNeedfully's terms and conditions governing the use of our crisis support and donation platform."),
    keywords: generateKeywords([
      "terms and conditions",
      "user agreement",
      "platform rules",
      "donation platform terms",
      "legal agreement"
    ]),
    canonical: generateCanonicalUrl("/terms-and-conditions"),
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Terms and Conditions",
      "description": "Legal terms and conditions for MyNeedfully platform",
      "url": "https://myneedfully.app/terms-and-conditions"
    }
  });

  return (
    <div className="min-h-screen bg-warm-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-navy mb-4" style={{fontFamily: 'JUST Sans, sans-serif'}}>
            Terms and Conditions
          </h1>
          <p className="text-gray-600" style={{fontFamily: 'JUST Sans, sans-serif'}}>
            Last updated: July 10, 2025
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                By accessing and using MyNeedfully ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Platform Description</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                MyNeedfully is a donation platform that connects people in need with supporters. Users can create needs lists for specific items 
                they require, while supporters can browse and fulfill these needs through direct purchases from third-party retailers.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. User Responsibilities</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <ul className="list-disc pl-6 space-y-2">
                <li>You must be at least 18 years old to use this platform</li>
                <li>You are responsible for maintaining the accuracy of your account information</li>
                <li>You must not use the platform for fraudulent or illegal purposes</li>
                <li>You agree to provide truthful information in needs lists and communications</li>
                <li>You must not abuse the platform's messaging or donation systems</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Needs Lists and Donations</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <ul className="list-disc pl-6 space-y-2">
                <li>Needs lists must be for legitimate personal or family needs</li>
                <li>Users creating needs lists must provide accurate shipping information</li>
                <li>MyNeedfully does not guarantee that needs will be fulfilled</li>
                <li>Supporters make purchases directly from third-party retailers</li>
                <li>MyNeedfully is not responsible for product quality, delivery, or returns</li>
                <li>All donations are voluntary and non-refundable through our platform</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Affiliate Marketing Disclosure</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="font-semibold mb-3">Important Disclosure:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>MyNeedfully participates in affiliate marketing programs with Amazon, Walmart, Target, and other retailers</li>
                <li>We may earn commissions from purchases made through links on our platform</li>
                <li>These commissions help support the operation and maintenance of our platform</li>
                <li>Affiliate earnings do not affect the price you pay for products</li>
                <li>Product recommendations are based on user needs, not commission rates</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Content and Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <ul className="list-disc pl-6 space-y-2">
                <li>Users retain ownership of content they upload (photos, stories, etc.)</li>
                <li>By uploading content, you grant MyNeedfully a license to display and distribute it on the platform</li>
                <li>You must not upload copyrighted material without permission</li>
                <li>MyNeedfully reserves the right to remove inappropriate content</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Privacy and Data Protection</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                Your privacy is important to us. Please review our Privacy Policy to understand how we collect, 
                use, and protect your personal information. By using our platform, you consent to our data practices 
                as described in our Privacy Policy.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Platform Availability and Modifications</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <ul className="list-disc pl-6 space-y-2">
                <li>We strive to maintain platform availability but cannot guarantee uninterrupted service</li>
                <li>We reserve the right to modify, suspend, or discontinue the platform at any time</li>
                <li>We may update these terms and conditions with advance notice</li>
                <li>Continued use after changes constitutes acceptance of new terms</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                MyNeedfully acts as a platform connecting users and supporters. We are not responsible for the actions of users, 
                the fulfillment of needs lists, product quality, delivery issues, or disputes between users. Use of the platform 
                is at your own risk.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Account Termination</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                We reserve the right to terminate or suspend accounts that violate these terms, engage in fraudulent activity, 
                or abuse the platform. Users may also delete their accounts at any time through their profile settings.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                If you have questions about these Terms and Conditions, please contact us at:
                <br />
                Email: legal@MyNeedfully.com
                <br />
                Website: myneedfully.app
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}