import sgMail from '@sendgrid/mail';

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private isInitialized = false;

  constructor() {
    if (process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      this.isInitialized = true;
    } else {
      console.warn('SendGrid API key not found. Email notifications will be disabled.');
    }
  }

  async sendEmail(params: EmailParams): Promise<boolean> {
    if (!this.isInitialized) {
      console.log('Email service not initialized. Would send:', params.subject);
      return false;
    }

    try {
      await sgMail.send({
        to: params.to,
        from: params.from,
        subject: params.subject,
        html: params.html,
        text: params.text,
      });

      console.log(`Email sent successfully to ${params.to}: ${params.subject}`);
      return true;
    } catch (error: any) {
      console.error('Failed to send email:', error);
      if (error.response && error.response.body && error.response.body.errors) {
        console.error('SendGrid error details:', JSON.stringify(error.response.body.errors, null, 2));
      }
      return false;
    }
  }

  async sendPurchaseConfirmation(
    supporterEmail: string,
    supporterName: string,
    itemTitle: string,
    wishlistTitle: string,
    recipientName: string
  ): Promise<boolean> {
    const subject = `Thank you for your generous support on MyNeedfully!`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #FF6B6B; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Thank You for Your Kindness!</h1>
        </div>
        
        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2 style="color: #333;">Dear ${supporterName},</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Thank you for your generous purchase through MyNeedfully! Your kindness makes a real difference in someone's life.
          </p>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #FF6B6B; margin-top: 0;">Purchase Details:</h3>
            <p><strong>Item:</strong> ${itemTitle}</p>
            <p><strong>Needs List:</strong> ${wishlistTitle}</p>
            <p><strong>Recipient:</strong> ${recipientName}</p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            The recipient has been notified of your generous support and may send you a thank you note soon. 
            You can view all your contributions in your MyNeedfully dashboard.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.REPLIT_DOMAIN || 'https://myneedfully.com'}/profile" 
               style="background-color: #FF6B6B; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View My Dashboard
            </a>
          </div>
          
          <p style="font-size: 14px; color: #888; text-align: center;">
            Thank you for being part of the MyNeedfully community.<br>
            Together, we're making the world a more caring place.
          </p>
        </div>
        
        <div style="background-color: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">© 2025 MyNeedfully. Connecting hearts through acts of kindness.</p>
        </div>
      </div>
    `;

    const text = `Thank you for your generous support on MyNeedfully! You purchased "${itemTitle}" from "${wishlistTitle}" for ${recipientName}. The recipient has been notified and may send you a thank you note soon.`;

    return this.sendEmail({
      to: supporterEmail,
      from: 'data@myneedfully.app',
      subject,
      html,
      text,
    });
  }

  async sendThankYouNoteNotification(
    supporterEmail: string,
    supporterName: string,
    senderName: string,
    noteSubject: string,
    noteMessage: string
  ): Promise<boolean> {
    const subject = `You received a thank you note on MyNeedfully!`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #FF6B6B; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">💙 You Have a Thank You Note!</h1>
        </div>
        
        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2 style="color: #333;">Dear ${supporterName},</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            ${senderName} has sent you a heartfelt thank you note for your generous support!
          </p>
          
          <div style="background-color: white; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #FF6B6B;">
            <h3 style="color: #FF6B6B; margin-top: 0;">${noteSubject}</h3>
            <p style="font-size: 16px; line-height: 1.6; color: #333; font-style: italic;">
              "${noteMessage}"
            </p>
            <p style="text-align: right; color: #888; margin-bottom: 0;">
              — ${senderName}
            </p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Messages like these show the real impact of your kindness. Thank you for making a difference!
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.REPLIT_DOMAIN || 'https://myneedfully.com'}/profile" 
               style="background-color: #FF6B6B; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View All Thank You Notes
            </a>
          </div>
          
          <p style="font-size: 14px; color: #888; text-align: center;">
            Your generosity creates ripples of gratitude.<br>
            Keep spreading kindness with MyNeedfully.
          </p>
        </div>
        
        <div style="background-color: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">© 2025 MyNeedfully. Connecting hearts through acts of kindness.</p>
        </div>
      </div>
    `;

    const text = `You received a thank you note from ${senderName}: "${noteSubject}" - "${noteMessage}". View all your thank you notes at MyNeedfully.com`;

    return this.sendEmail({
      to: supporterEmail,
      from: 'data@myneedfully.app',
      subject,
      html,
      text,
    });
  }
}

export const emailService = new EmailService();