import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSEO, generatePageTitle, generatePageDescription, generateKeywords, generateCanonicalUrl } from "@/lib/seo";

export default function CookiesPolicy() {
  // SEO Configuration
  useSEO({
    title: generatePageTitle("Cookies Policy - MyNeedfully"),
    description: generatePageDescription("Learn about how MyNeedfully uses cookies and similar technologies to improve your experience on our platform."),
    keywords: generateKeywords([
      "cookies policy",
      "tracking technologies",
      "browser storage",
      "user preferences",
      "website analytics"
    ]),
    canonical: generateCanonicalUrl("/cookies-policy"),
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Cookies Policy",
      "description": "Cookie usage and tracking technology policy for MyNeedfully platform",
      "url": "https://myneedfully.app/cookies-policy"
    }
  });

  return (
    <div className="min-h-screen bg-warm-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-navy mb-4" style={{fontFamily: 'JUST Sans, sans-serif'}}>
            Cookies Policy
          </h1>
          <p className="text-gray-600" style={{fontFamily: 'JUST Sans, sans-serif'}}>
            Last updated: July 10, 2025
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. What Are Cookies?</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                Cookies are small text files that are placed on your computer or mobile device when you visit a website. 
                They are widely used to make websites work more efficiently and provide information to website owners. 
                Cookies allow websites to remember your preferences, login status, and other information that makes your 
                browsing experience more convenient.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. How We Use Cookies</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                MyNeedfully uses cookies and similar technologies for several purposes:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li><strong>Essential functionality:</strong> To keep you logged in and maintain your session</li>
                <li><strong>User preferences:</strong> To remember your settings and preferences</li>
                <li><strong>Security:</strong> To protect against fraud and unauthorized access</li>
                <li><strong>Analytics:</strong> To understand how our platform is used and improve it</li>
                <li><strong>Performance:</strong> To optimize page loading and user experience</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Types of Cookies We Use</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Essential Cookies (Always Active)</h4>
                  <p className="text-sm text-gray-600 mb-2">These cookies are necessary for the platform to function:</p>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li><strong>Session cookies:</strong> Keep you logged in during your visit</li>
                    <li><strong>Authentication cookies:</strong> Verify your identity and permissions</li>
                    <li><strong>Security cookies:</strong> Protect against cross-site request forgery</li>
                    <li><strong>Load balancing cookies:</strong> Ensure consistent performance</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Preference Cookies</h4>
                  <p className="text-sm text-gray-600 mb-2">These cookies remember your choices and settings:</p>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li><strong>Theme preferences:</strong> Remember your display settings</li>
                    <li><strong>Language settings:</strong> Store your preferred language</li>
                    <li><strong>Notification preferences:</strong> Remember your communication choices</li>
                    <li><strong>Search filters:</strong> Save your browsing preferences</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Analytics Cookies</h4>
                  <p className="text-sm text-gray-600 mb-2">These cookies help us understand platform usage:</p>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li><strong>Google Analytics:</strong> Track page views and user interactions</li>
                    <li><strong>Performance monitoring:</strong> Identify slow-loading pages</li>
                    <li><strong>Error tracking:</strong> Help us fix technical issues</li>
                    <li><strong>Feature usage:</strong> Understand which features are most helpful</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Marketing Cookies</h4>
                  <p className="text-sm text-gray-600 mb-2">These cookies support our affiliate partnerships:</p>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li><strong>Affiliate tracking:</strong> Track purchases through our affiliate links</li>
                    <li><strong>Conversion tracking:</strong> Measure the effectiveness of our platform</li>
                    <li><strong>Partner cookies:</strong> Support integrations with Amazon, Walmart, and Target</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Third-Party Cookies</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="mb-3">
                Some cookies on our platform are set by third-party services we use:
              </p>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold">Authentication Providers:</h4>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li><strong>Replit:</strong> Secure login and account management</li>
                    <li><strong>Google:</strong> OAuth authentication (if you choose Google login)</li>
                    <li><strong>Facebook:</strong> OAuth authentication (if you choose Facebook login)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold">Analytics Services:</h4>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li><strong>Google Analytics:</strong> Platform usage statistics</li>
                    <li><strong>Performance monitoring:</strong> Error tracking and speed optimization</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold">Affiliate Partners:</h4>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li><strong>Amazon:</strong> Affiliate link tracking and conversion measurement</li>
                    <li><strong>Walmart:</strong> Partner integration cookies</li>
                    <li><strong>Target:</strong> Affiliate program cookies</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Managing Your Cookie Preferences</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Browser Settings:</h4>
                  <p className="text-sm mb-2">You can control cookies through your browser settings:</p>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>Block all cookies (may break platform functionality)</li>
                    <li>Block third-party cookies only</li>
                    <li>Delete existing cookies</li>
                    <li>Receive notifications when cookies are set</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Platform Settings:</h4>
                  <p className="text-sm mb-2">Control marketing and analytics cookies through your account:</p>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>Visit your account settings page</li>
                    <li>Adjust email marketing preferences</li>
                    <li>Opt out of non-essential analytics</li>
                    <li>Manage notification preferences</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Opt-Out Links:</h4>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li><strong>Google Analytics:</strong> <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-coral hover:underline">Browser opt-out add-on</a></li>
                    <li><strong>Interest-based ads:</strong> <a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer" className="text-coral hover:underline">Digital Advertising Alliance opt-out</a></li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Cookie Retention</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold">Session Cookies:</h4>
                  <p className="text-sm">Deleted automatically when you close your browser</p>
                </div>
                
                <div>
                  <h4 className="font-semibold">Persistent Cookies:</h4>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li><strong>Authentication cookies:</strong> 7 days (for "remember me" functionality)</li>
                    <li><strong>Preference cookies:</strong> 1 year (to remember your settings)</li>
                    <li><strong>Analytics cookies:</strong> 2 years (for long-term usage patterns)</li>
                    <li><strong>Marketing cookies:</strong> 30 days (for affiliate tracking)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Updates to This Policy</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                We may update this Cookies Policy from time to time to reflect changes in our practices or applicable laws. 
                When we make changes, we will update the "Last updated" date at the top of this page. We encourage you to 
                review this policy periodically to stay informed about our use of cookies.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                If you have any questions about our use of cookies or this Cookies Policy, please contact us at:
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