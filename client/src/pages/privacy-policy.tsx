
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
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="prose max-w-none pt-6">
              <p className="mb-6">
                MyNeedfully, LLC ("We", "Us", or "Our") understands and respects your need for privacy. This Privacy Policy describes the type of personal information We may collect, how We use it, who We share it with, how long We keep it, and your rights and choices with respect to your personal information. By using Our platform, you agree to this Privacy Policy.
              </p>
              
              <p className="mb-6">
                This Privacy Policy applies to Our website and any mobile applications. The Privacy Policy is intended to be read together with our Terms of Use, both of which together with the website constitutes the entire agreement by and between you and MyNeedfully, LLC. You are encouraged to read this Privacy Policy in full to understand Our privacy practices before you decide to use Our services.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Personal Information You Provide</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="mb-4">
                Personal information is any information that relates to you or that can be used to identify you. We may collect different information depending on how you use our services, i.e., as a Patron or as a Donor. We collect personal information when you register for an account, create a Needs List, submit photos/videos or other content to Our platform. If you provide Us with information about another person, you affirmatively represent that you obtained the person's permission or, in the case of a minor, that you are the parent or legal guardian of the minor. We will never collect financial information from you including, but not limited to, banking information, credit card information, etc. However, if you use Our services as a Donor, you may be required to disclose that information to Our Third-Party Vendors in order to fulfill someone's needs.
              </p>
              
              <p className="mb-4 font-semibold">The personal information We may collect directly from you includes:</p>
              <ul className="list-disc pl-6 space-y-1 mb-6">
                <li>your name, address, phone number, and email address</li>
                <li>account information - user name and password</li>
                <li>information about the hardship or crisis leading to your use of Our platform</li>
                <li>visual and audio information such as photographs and videos, as well as social media postings shared</li>
                <li>identities of persons in addition to or other than you in need of assistance</li>
                <li>demographic information you voluntarily provide to assist with fulfillment of your Needs List</li>
                <li>your preferences as to Third-Party Vendors to fulfill your needs</li>
              </ul>

              <p className="mb-4">
                In addition to the information which you voluntarily share, when you use Our services and visit Our website, We automatically collect certain information about you for advertising as well as to analyze and evaluate use of Our website. This is done through third-party tools, such as cookies.
              </p>

              <p className="mb-4 font-semibold">This type of information obtained includes:</p>
              <ul className="list-disc pl-6 space-y-1 mb-6">
                <li>online identifiers including your IP address, cookie IDs, mobile ad identifiers, device IDs and similar identifying information</li>
                <li>information regarding your browser, device and operating system</li>
                <li>web pages you view and links you click on Our website</li>
                <li>access of emails We send you and whether they are forwarded</li>
                <li>search terms to connect to Our website as well as searched within Our website</li>
                <li>dates and times of visits to Our website</li>
                <li>geolocation data</li>
                <li>links and URLs that refer visitors to Our website</li>
              </ul>

              <p className="mb-4 font-semibold">We may also obtain information about you through third-parties, including:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>social media and other account credentials you provide or use to access Our service through a third-party website or service</li>
                <li>Third-Party Vendors who require your personal information</li>
                <li>other unaffiliated third-parties who received your personal information from advertising networks, media monitoring companies and publicly available sources</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="mb-4">We use your information for the following purposes:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>to communicate with you, maintain and manage your account, complete transactions, respond to your inquiries, comments and suggestions</li>
                <li>to resolve support issues that may arise while you are using Our services</li>
                <li>to enforce Our Terms of Use</li>
                <li>to analyze your use of Our services to improve the functionality and quality of Our services</li>
                <li>to comply with legal and contractual obligations</li>
                <li>to personalize your use of Our services by incorporating your Needs List specifications with recommendations for potential Donors and expanding our Third-Party Vendors to accommodate your needs</li>
                <li>to market and advertise Our services to you and others and to personalize Our ads to you</li>
                <li>to track industry standard performance metrics including email opens and clicks</li>
                <li>to prevent fraud and unauthorized transactions and identify potential hackers and other unauthorized users</li>
                <li>to maintain a record of the services you use and monitor and analyze trends, usage and activity on Our platform</li>
                <li>to provide Our services to you on a continuing basis</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How We May Share Your Information</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="mb-4">
                Whenever We share your personal information, We limit what We share to only the information which is needed by the third-party. We may share your personal information with:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>Third-Party Vendors (1) to fulfill Needs List items by Donors, (2) technical service providers to allow Our website to operate securely, (3) analytic service providers to ensure functionality, (4) payment processors to complete transactions between Donors and Patrons</li>
                <li>Social Media Platforms and other applications you may use to access Our platform</li>
                <li>Public Authorities as may be required by law and to enforce Our Terms of Use and to protect Our rights and the rights of others</li>
                <li>Other Entities for due diligence in the event We reorganize, sell, merge, transfer, assign or otherwise dispose of Our business assets</li>
              </ul>

              <p className="mb-4">
                We may also share your personal information with third-parties for advertising purposes. These companies collect information from you through cookies on Our website as well as when We share your email address, and other information with them directly, including
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>Social Media Platforms to support Our advertising and marketing efforts</li>
                <li>Marketing and Advertising Vendors to tailor ads to your interests and the interests of others similarly situated</li>
                <li>Other Vendors may be provided with your name and mailing address for marketing Our website or other services which may be of interest to you and others in similar situations</li>
              </ul>

              <p>
                You should be aware that any information which you include on the public portion of Our website is publicly available unless you password protect it. Any information which you include on social media is also available to Us and third-parties.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How Long We Keep Your Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                We will retain your personal information for as long as we consider it necessary to achieve your use of Our services, as long as required to comply with the Privacy Policy, or as long as We are required and/or permitted to retain such information by law for such things as complying with Our legal, accounting and reporting requirements. Once your account is no longer active, We will identify your information as "private" which will hide your information from search engines.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Rights Regarding Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="mb-4">You have choices when it comes to collecting, using and sharing your personal information.</p>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>You may choose not to receive marketing emails or other communications from Us by clicking on the "unsubscribe" link in Our marketing emails or by updating your preferences in the account settings</li>
                <li>If you do not want Google analytics to gather information about you while you are on Our website, you can install the Google analytics opt-out browser which must be accessed at the start of each session on Our portal</li>
                <li>You may elect not to receive text messages from Us by responding STOP to any text message you receive from Us</li>
                <li>You have the right to request that we correct or delete your personal information</li>
              </ul>

              <p className="mb-4">
                In order to exercise any of this rights, please contact Us at info@myneedfully.com. We shall provide you with a response within 45 days of any request.
              </p>

              <p className="mb-4">
                We are not required to authenticate any opt-out request. Same may be denied if We have a good faith, reasonable, and documented belief that the opt-out request is fraudulent. The person making the opt-out request believed to be fraudulent will receive a notice from Us advising as to why the request is denied together with the reason why the request is believed to be fraudulent.
              </p>

              <p>
                If you disagree with Our response to any request, you may contact the New Jersey Division of Consumer Affairs in the Department of Law and Public Safety to submit a complaint.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Changes To Our Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                We may make changes to Our Privacy Policy to further ensure protection for you. When a change is made, it will appear on the Privacy Policy page as to when an update was made. We may also email you if there are material changes made to these policies. You always retain your right to opt out of Our use of your personal information.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Policies of Third-Party Vendors</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                We work through Third-Party Vendors who have their own privacy policies. You should review the Third-Party Vendor's privacy policies. We are not responsible for the terms of their policies and the inclusion of any link to the website of a Third-Party Vendor is not an endorsement of their site or service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dispute Resolution and Governing Law</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                We are a New Jersey limited liability company and the laws of the State of New Jersey shall control any and all disputes which may arise. By using Our platform, you consent to the use and transfer of information as set forth herein. You also consent to binding arbitration to resolve any dispute. For more information regarding the binding arbitration provision, see Our Terms of Use.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                We do not knowingly collect any personal information from children under the age of 18 and no one under the age of 18 may use Our platform without the direct supervision and approval of a parent or legal guardian. We utilize parental controls on the portal and parents/legal guardians may use these controls to prevent your child from submitting information without your consent. If we are notified that We collected information from a child under the age of 18 without consent, We will delete the information as quickly as possible. If you believe anyone under the age of 18 provided us with personal information, please contact Us at info@myneedfully.com.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Non-Discrimination</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                We do not process any personal information which violates the laws of the State of New Jersey and/or federal laws which prohibit unlawful discrimination against consumers. With respect to Patrons, Donors, and any other potential users of Our platform, We do not discriminate based upon race, religion, sex (including pregnancy, sexual orientation and gender identity), national origin, nationality, ancestry, color, age, marital status, civil union status, domestic partnership status, and/or any other potential discriminatory basis. Our goal is to assist those in need and provide a platform for such needs to be fulfilled by Donors.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                If you have any questions about this Privacy Policy, please email Us at info@myneedfully.com.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
