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
            Last updated: July 28, 2025
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Legal Disclosures</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                MyNeedfully, LLC ("We") is a for profit limited liability company which works with Third-Party Vendors to assist persons in need through assistance provided by others. You agree to be bound by the Terms of Use, including any future updates, so it is important to review them each time you use the service provided. These terms apply irrespective of the medium used to access the site, i.e., website, mobile app, etc.
              </p>
              <p className="mt-4 font-semibold text-red-600">
                PLEASE BE SURE TO REVIEW THE DISPUTE RESOLUTION PROVISION FURTHER BELOW AS IT WILL IMPACT YOUR RIGHTS IN THE EVENT OF A DISPUTE BETWEEN US. IT PROVIDES THAT ANY DISPUTE SHALL BE RESOLVED THROUGH BINDING ARBITRATION AND THAT YOU WAIVE A RIGHT TO A TRIAL.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Definitions</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>As used throughout this Disclosure, the following terms mean as stated herein:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li><strong>"Account"</strong> refers to a unique account established by a Patron who creates a Needs List which will include some personal information.</li>
                <li><strong>"Donor"</strong> refers to any individual or entity which contributes funds to fulfill the needs of a Patron through Our services.</li>
                <li><strong>"Needs List"</strong> refers to the list of items needed by a Patron after suffering a loss through some crisis, disaster, or other situation.</li>
                <li><strong>"Patron"</strong> refers to an individual who creates a Needs List and establishes an Account for use of Our services.</li>
                <li><strong>"Services"</strong> refers to those services provided by MyNeedfully including establishing a platform for Patrons to identify their needs and Donors to assist with fulfilling those needs.</li>
                <li><strong>"Third-Party Vendors"</strong> refers to external companies whom MyNeedfully users may purchase products through links provided on our platform. MyNeedfully is not affiliated with, endorsed by, or in a partnership with these Third-Party Vendors. Any purchases made are subject to the terms and conditions of the respective Third-Party Vendor.</li>
                <li><strong>"We", or "Our"</strong> refers to MyNeedfully, LLC.</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Services and Limitations</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                We provide a platform for those in need to create an account identifying what is needed after suffering a loss and for Donors to elect if they want to assist a Patron and how they can provide assistance. Our Third-Party Vendors then provide the Donor's items directly to the Patron. Our service is limited to bringing Patrons, Donors and Third-Party Vendors together to assist those in need. We never handle funds but rather use Third-Party Vendors to properly handle the financial aspects of any donations.
              </p>
              <p className="mt-4">
                Nothing provided herein should be construed as providing any recommendations as to those in need or any advise including financial, legal, or tax advice. Patrons and Donors should consult their own professionals for advice as to how use of Our services may impact them.
              </p>
              <p className="mt-4">
                We reserve the right to suspend or terminate any Patron's account if it appears to be created for an improper purpose including, but not limited to fraud, misrepresentation or misuse of the platform. We shall not be responsible for any delay in fulfillment of needs by our Third-Party Vendors. Nor shall we be responsible for any inability to access the website through no fault of our own.
              </p>
              <p className="mt-4">
                When using Our services, Patrons and Donors will be required to provide complete information in order to properly fulfill a needs list. Donors will be required to work with Our Third-Party Vendors to provide their donation to the needs list which may require Donors to agree to terms provided by the Third-Party Vendors.
              </p>
              <p className="mt-4">
                Only persons age eighteen (18) and older may use this site. All Patrons and Donors who use this site affirmatively represent that they are at least eighteen (18) years of age. Those persons under the age of eighteen (18) may benefit from a Patron's request for assistance and a Donor's gift and such beneficiary status does not violate these Terms of Use.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                As noted, We use Third-Party Vendors to collect and process all payments. We do not receive or hold any funds from any Donors. Donors may be required to provide their bank account information to Third-Party Vendors for the processing of payment. Such information is not shared with Us. By agreeing to be a Donor, you agree to comply with the Third-Party Vendor's terms for processing of payment.
              </p>
              <p className="mt-4">
                This is not a site for Donors to use to advertise their own services or businesses. If a Donor wants to work with Us, you are to contact Us for vetting of your service or business for possible addition as a Third-Party Vendor to be added to the site.
              </p>
              <p className="mt-4">
                If, for any reason, a donation is returned by a Patron, the payment Third-Party Vendor will follow its separately disclosed terms for the processing of a refund. Whether an item donated is permitted to be returned for a refund is for the Third-Party Vendor to determine in their sole discretion.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fees</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                While We are a for profit company, neither a Patron nor a Donor will be charged a fee for use of Our services. Our fees are paid exclusively by our Third-Party Vendors. Any and all fees paid by Donors are determined and assessed by the Third-Party Vendor for payment.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content Ownership and Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                The content on Our site is owned exclusively by Us and any third-parties who permit use of their information. By use of Our services, you acknowledge such ownership and protections under any and all applicable laws including copyright, trademark, and other proprietary rights. You are prohibited from using, copying, altering, any and all protected information or creating any derivative works based on Our services and site content.
              </p>
              <p className="mt-4">
                When a Patron or Donor shares information on Our site, you affirmatively represent and warranty that you either own the content or have permission to use or share it. Once a Patron or Donor shares information on Our site, you grant Us and Our Third-Party Vendors a royalty free revocable license to use such information for the limited purposes of providing a means for Patrons to explain their needs and for Donors to assist in fulfilling those needs.
              </p>
              <p className="mt-4">
                You agree to hold Us and Our Third-Party Vendors harmless for any information which you share on Our site. Such claims for which you hold Us harmless include, but are not limited to, claims for invasion of privacy, defamation; any liability from use of your name, image, likeness as well as alterations to same.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Privacy</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                By using Our service, you acknowledge that We collect, use and share personal information as set forth in the separate Privacy Notice. Please refer to the Privacy Notice for more detailed information.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Third-Party Services</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                As noted, We rely upon and use Third-Party Vendors and may include affiliate links to their resources for ease of access. As an Amazon Associate, we earn from qualifying purchases. We have no control over the Third-Party Vendors and We assume no liability or responsibility for their services. Your interaction with third-party services is solely between you and the Third-Party Vendors and governed by their terms of services. We are not responsible or liable for third-party content or services.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Disclaimers and Limitations of Liability</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="font-semibold text-red-600 uppercase">
                TO THE FULLEST EXTENT POSSIBLE, WE MAKE NO REPRESENTATIONS OR WARRANTIES OF ANY KIND WHATSOEVER, WHETHER EXPRESS, IMPLIED, OR STATUTORY. NEITHER WE NOR OUR THIRD-PARTY VENDORS MAKE ANY WARRANTY THAT THE SERVICES WILL MEET YOUR EXPECTATIONS, THAT ANY SERVICES WILL BE UNINTERRUPTED, TIMELY, SECURE OR FREE OF ERROR, AND/OR THAT THE QUALITY OF ANY SERVICE OR PRODUCT WILL MEET YOUR EXPECTATIONS.
              </p>
              <p className="mt-4 font-semibold">
                YOUR DECISION TO BE A PATRON OF OUR SERVICES DOES NOT GUARANTY THAT YOUR NEEDS LIST WILL BE FULFILLED. WE DO NOT WARRANT OR GUARANTY THE ACCURACY OF ANY INFORMATION PROVIDED BY A PATRON AND DONORS MUST DETERMINE THE APPROPRIATENESS OF PATRON INFORMATION PRIOR TO FULFILLING ANY NEED OF A PATRON.
              </p>
              <p className="mt-4 font-semibold">
                YOU ACKNOWLEDGE AND AGREE THAT, TO THE FULLEST EXTENT OF THE LAW, THE ENTIRE RISK OF USE OF OUR SERVICES REMAINS WITH YOU AND IN NO EVENT SHALL WE BE LIABLE FOR ANY DAMAGES WHATSOEVER, INCLUDING BUT NOT LIMITED TO, DIRECT, INDIRECT, SPECIAL, INCIDENTAL AND/OR CONSEQUENTIAL DAMAGES, LOST PROFITS, OR DAMAGES RESULTING FROM LOST DATA, BUSINESS INTERRUPTION, OR FOR ANY DAMAGES TO PROPERTY OF ANY KIND OR FOR PERSONAL OR BODILY INJURY OR EMOTIONAL DISTRESS.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Indemnification and General Release</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                To the fullest extent permitted by applicable law, you agree to release and indemnify and hold Us harmless, together with Our Third-Party Vendors, and the applicable officers, directors, employees, and agents harmless from any and all losses, damages, expenses (including reasonable attorney's fees), costs, awards, fines, claims and actions of any kind which arise from or otherwise relate to Our services, any of Our content or that of a Patron or Donor, your violation of these Terms of Use, your violation of any rights of another, or your use of the site.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Dispute Resolution</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="font-semibold text-red-600 mb-4">
                IMPORTANT: THIS SECTION AFFECTS YOUR LEGAL RIGHTS
              </p>
              <p>
                While We welcome the opportunity to amicably resolve any legitimate dispute, if an amicable resolution of the dispute is not possible, you agree to resolve the dispute through binding arbitration.
              </p>
              <p className="mt-4 font-semibold text-red-600 uppercase">
                YOU AGREE THAT ANY DISPUTE, CLAIM OR CONTROVERSY ARISING OUT OF OR RELATED TO THIS AGREEMENT OR FROM OUR SERVICES SHALL BE RESOLVED THROUGH BINDING ARBITRATION. AS SUCH, YOU EXPRESSLY WAIVE ANY AND ALL RIGHTS TO COMMENCE AN ACTION IN COURT AND WAIVE A TRIAL BY JUDGE OR JURY.
              </p>
              <p className="mt-4">
                ARBITRATION SHALL BE CONDUCTED THROUGH THE AMERICAN ARBITRATION ASSOCIATION WITH A SINGLE ARBITRATOR AND ALL OF THEIR RULES AND REGULATIONS SHALL APPLY. YOU SHALL BE SOLELY RESPONSIBLE FOR ANY AND ALL FILING FEES, CASE MANAGEMENT FEES AND ARBITRATOR COMPENSATION.
              </p>
              <p className="mt-4">
                Unless the arbitration is conducted virtually, the arbitration hearing shall be conducted in Somerset County, New Jersey.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Changes to the Terms of Use</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                We reserve the right to update, modify and/or change these Terms at any time in Our sole discretion. If We intend to make any changes or updates, you will be advised of same at least twenty (20) days prior to implementation of the change and/or update. If We are required to make any changes as required by law and same must be made on short notice, We will make the required change and then provide notice of the change as soon thereafter as possible. If you do not accept the new or modified Terms, you should withdraw from Our services.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Miscellaneous</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                The Terms of Use, together with the Privacy Notice and website, constitutes the entire agreement between you and MyNeedfully, LLC and same supersedes any prior agreements by and between Us with respect to Our services.
              </p>
              <p className="mt-4">
                This Agreement shall be governed by the laws of the State of New Jersey exclusive of choice of law principles. Any and all disputes which remain unresolved shall be governed by the binding arbitration provision and any required in-person arbitration hearing shall be conducted in Somerset County, New Jersey.
              </p>
              <p className="mt-4">
                The failure of MyNeedfully, LLC to enforce any right or provision set forth in these Terms shall not constitute a waiver of such right. If any provision of these Terms is determined by a court of competent jurisdiction to be unenforceable or ineffective as a matter of law, those provisions, terms, or clauses shall be deemed severable such that all other provisions of this Agreement shall remain valid and binding upon the parties.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                Please contact Us with any questions you have regarding Our services and/or the Terms of Use at info@myneedfully.com.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}