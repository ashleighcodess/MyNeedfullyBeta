import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSEO, generatePageTitle, generatePageDescription, generateKeywords, generateCanonicalUrl } from "@/lib/seo";

export default function PrivacyPolicy() {
  // SEO Configuration
  useSEO({
    title: generatePageTitle("Privacy Policy - MyNeedfully"),
    description: generatePageDescription("Learn how MyNeedfully protects your privacy and handles your personal information on our crisis support platform."),
    keywords: generateKeywords([
      "privacy policy",
      "data protection",
      "personal information",
      "privacy rights",
      "data security"
    ]),
    canonical: generateCanonicalUrl("/privacy-policy"),
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Privacy Policy",
      "description": "Privacy policy and data protection practices for MyNeedfully platform",
      "url": "https://myneedfully.app/privacy-policy"
    }
  });

  return (
    <div className="min-h-screen bg-warm-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-navy mb-4" style={{fontFamily: 'JUST Sans, sans-serif'}}>
            Privacy Policy
          </h1>
          <p className="text-gray-600" style={{fontFamily: 'JUST Sans, sans-serif'}}>
            Last updated: July 10, 2025
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <h4 className="font-semibold mb-2">Personal Information:</h4>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Name, email address, and profile information</li>
                <li>Shipping addresses for needs lists</li>
                <li>Profile photos and needs list images</li>
                <li>Communication preferences</li>
              </ul>
              
              <h4 className="font-semibold mb-2">Platform Activity:</h4>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Needs lists created and supported</li>
                <li>Messages and thank you notes</li>
                <li>Platform usage analytics</li>
                <li>Search queries and product interactions</li>
              </ul>

              <h4 className="font-semibold mb-2">Technical Information:</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>IP address and device information</li>
                <li>Browser type and version</li>
                <li>Cookies and session data</li>
                <li>Log files and error reports</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Platform Operation:</strong> To provide core platform functionality, user authentication, and account management</li>
                <li><strong>Communication:</strong> To send notifications about donations, thank you notes, and platform updates</li>
                <li><strong>Improvement:</strong> To analyze platform usage and improve user experience</li>
                <li><strong>Safety:</strong> To prevent fraud, abuse, and ensure platform security</li>
                <li><strong>Legal Compliance:</strong> To comply with applicable laws and regulations</li>
                <li><strong>Marketing:</strong> To send promotional emails (with your consent, which you can withdraw)</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Information Sharing</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <h4 className="font-semibold mb-2">We share information in the following situations:</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Public Information:</strong> Needs lists, stories, and first names are publicly visible on the platform</li>
                <li><strong>With Supporters:</strong> Shipping addresses are shared with supporters who fulfill needs</li>
                <li><strong>Service Providers:</strong> With trusted third parties who help operate our platform (hosting, email, analytics)</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect platform safety</li>
                <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets</li>
              </ul>
              
              <p className="mt-4 font-semibold">
                We never sell your personal information to third parties for marketing purposes.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Third-Party Services</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <h4 className="font-semibold mb-2">Authentication Providers:</h4>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Replit OAuth for secure authentication</li>
                <li>Google OAuth (optional login method)</li>
                <li>Facebook OAuth (optional login method)</li>
              </ul>

              <h4 className="font-semibold mb-2">Affiliate Partners:</h4>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Amazon Associates Program</li>
                <li>Walmart Affiliate Program</li>
                <li>Target Affiliate Program</li>
              </ul>

              <h4 className="font-semibold mb-2">Other Services:</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>SendGrid for email delivery</li>
                <li>Neon Database for data storage</li>
                <li>Google Analytics for usage insights</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Data Security</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <ul className="list-disc pl-6 space-y-2">
                <li>All data is transmitted using SSL/TLS encryption</li>
                <li>Passwords are securely hashed and never stored in plain text</li>
                <li>Database access is restricted and monitored</li>
                <li>Regular security audits and updates</li>
                <li>Session management with secure cookies</li>
                <li>Rate limiting to prevent abuse</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Your Privacy Rights</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <h4 className="font-semibold mb-2">You have the right to:</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct your personal information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                <li><strong>Portability:</strong> Export your data in a readable format</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing emails</li>
                <li><strong>Restrict Processing:</strong> Limit how we use your data</li>
              </ul>
              
              <p className="mt-4">
                To exercise these rights, contact us at privacy@MyNeedfully.com or through your account settings.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                MyNeedfully is not intended for children under 18. We do not knowingly collect personal information from 
                children under 18. If you believe a child has provided us with personal information, please contact us 
                immediately so we can remove the information.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. International Users</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                MyNeedfully is based in the United States. If you are accessing our platform from outside the US, 
                please be aware that your information may be transferred to, stored, and processed in the United States 
                where our servers are located and our central database is operated.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Policy Updates</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any material changes by 
                posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you 
                to review this Privacy Policy periodically.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                If you have any questions about this Privacy Policy or our data practices, please contact us at:
                <br />
                Email: privacy@MyNeedfully.com
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