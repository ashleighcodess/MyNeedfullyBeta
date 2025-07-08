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
      console.log('✓ Email service initialized successfully');
    } else {
      console.warn('⚠️ SendGrid API key not found. Email notifications will be disabled.');
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
        trackingSettings: {
          clickTracking: {
            enable: false,
          },
          openTracking: {
            enable: false,
          },
        },
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

  async sendWelcomeEmail(
    userEmail: string,
    userName: string
  ): Promise<boolean> {
    const subject = `Welcome to MyNeedfully - Let's Make a Difference Together!`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #FF6B6B; color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Welcome to MyNeedfully!</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px;">Where kindness meets need</p>
        </div>
        
        <div style="padding: 40px 30px; background-color: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">Dear ${userName},</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555; margin-bottom: 25px;">
            Thank you for joining MyNeedfully! You're now part of a caring community that believes in the power of helping one another.
          </p>
          
          <div style="background-color: white; padding: 25px; border-radius: 8px; margin: 25px 0;">
            <h3 style="color: #FF6B6B; margin-top: 0; margin-bottom: 20px;">Getting Started is Easy:</h3>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #333;">🎯 Browse Needs Lists:</strong> Find families and individuals who need your support
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #333;">💝 Make a Difference:</strong> Purchase items directly from their wishlists
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #333;">📝 Share Your Story:</strong> Create your own needs list if you're going through tough times
            </div>
            
            <div>
              <strong style="color: #333;">💌 Stay Connected:</strong> Exchange thank you notes and build meaningful connections
            </div>
          </div>
          
          <div style="text-align: center; margin: 35px 0;">
            <a href="${process.env.REPLIT_DOMAIN || 'https://myneedfully.com'}/browse" 
               style="background-color: #FF6B6B; color: white; padding: 15px 35px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 16px; font-weight: bold;">
              Start Exploring
            </a>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555; margin-bottom: 20px;">
            Every act of kindness, no matter how small, creates ripples of positive change. We're excited to see the impact you'll make!
          </p>
          
          <p style="font-size: 14px; color: #888; text-align: center; margin-top: 30px;">
            Questions? Reply to this email - we're here to help!<br>
            Welcome to the family. ❤️
          </p>
        </div>
        
        <div style="background-color: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">© 2025 MyNeedfully. Connecting hearts through acts of kindness.</p>
        </div>
      </div>
    `;

    const text = `Welcome to MyNeedfully, ${userName}! You're now part of a caring community. Browse needs lists to help others, or create your own if you need support. Start exploring at ${process.env.REPLIT_DOMAIN || 'https://myneedfully.com'}/browse`;

    return this.sendEmail({
      to: userEmail,
      from: 'data@myneedfully.app',
      subject,
      html,
      text,
    });
  }

  async sendPasswordResetEmail(
    userEmail: string,
    userName: string,
    resetToken: string
  ): Promise<boolean> {
    // Use localhost for development, production domain for production
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5000' 
      : (process.env.REPLIT_DOMAIN || 'https://myneedfully.com');
    const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;
    const subject = `Reset Your MyNeedfully Password`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #FF6B6B; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Password Reset Request</h1>
        </div>
        
        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2 style="color: #333;">Hello ${userName},</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            We received a request to reset your MyNeedfully password. If you didn't make this request, you can safely ignore this email.
          </p>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              <strong>🔒 Security Notice:</strong> This link will expire in 1 hour for your security.
            </p>
          </div>
          
          <div style="text-align: center; margin: 35px 0;">
            <a href="${resetLink}" 
               style="background-color: #FF6B6B; color: white; padding: 15px 35px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 16px; font-weight: bold;">
              Reset My Password
            </a>
          </div>
          
          <p style="font-size: 14px; color: #888; line-height: 1.6;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${resetLink}" style="color: #FF6B6B; word-break: break-all;">${resetLink}</a>
          </p>
          
          <p style="font-size: 14px; color: #888; text-align: center; margin-top: 30px;">
            Need help? Contact our support team by replying to this email.
          </p>
        </div>
        
        <div style="background-color: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">© 2025 MyNeedfully. Keeping your account secure.</p>
        </div>
      </div>
    `;

    const text = `Hello ${userName}, we received a request to reset your MyNeedfully password. Click this link to reset it: ${resetLink} (expires in 1 hour). If you didn't request this, ignore this email.`;

    return this.sendEmail({
      to: userEmail,
      from: 'data@myneedfully.app',
      subject,
      html,
      text,
    });
  }

  async sendEmailVerificationEmail(
    userEmail: string,
    userName: string,
    verificationToken: string
  ): Promise<boolean> {
    const baseUrl = process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : 'https://myneedfully.com';
    const verificationLink = `${baseUrl}/verify-email?token=${verificationToken}`;
    const subject = `Verify Your Email Address - MyNeedfully`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #FF6B6B; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Verify Your Email Address</h1>
        </div>
        
        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2 style="color: #333;">Hi ${userName},</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Thank you for signing up for MyNeedfully! To complete your registration and start making a difference, please verify your email address.
          </p>
          
          <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <p style="margin: 0; color: #0c5460; font-size: 14px;">
              <strong>📧 Almost there!</strong> Click the button below to verify your email and unlock all features.
            </p>
          </div>
          
          <div style="text-align: center; margin: 35px 0;">
            <a href="${verificationLink}" 
               style="background-color: #FF6B6B; color: white; padding: 15px 35px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 16px; font-weight: bold;">
              Verify My Email
            </a>
          </div>
          
          <p style="font-size: 14px; color: #888; line-height: 1.6;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${verificationLink}" style="color: #FF6B6B; word-break: break-all;">${verificationLink}</a>
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555; margin-top: 25px;">
            Once verified, you'll be able to browse needs lists, create your own, and join our caring community!
          </p>
          
          <p style="font-size: 14px; color: #888; text-align: center; margin-top: 30px;">
            Didn't sign up for MyNeedfully? You can safely ignore this email.
          </p>
        </div>
        
        <div style="background-color: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">© 2025 MyNeedfully. Connecting hearts through acts of kindness.</p>
        </div>
      </div>
    `;

    const text = `Hi ${userName}, please verify your email address to complete your MyNeedfully registration. Click: ${verificationLink}`;

    return this.sendEmail({
      to: userEmail,
      from: 'data@myneedfully.app',
      subject,
      html,
      text,
    });
  }

  async sendUserRemovalNotification(
    userEmail: string,
    userName: string,
    reason: string
  ): Promise<boolean> {
    const subject = 'Account Removal Notification - MyNeedfully';
    
    const html = `
      <div style="font-family: 'JUST Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: white;">
        <!-- Header with Logo -->
        <div style="background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%); color: white; padding: 30px 20px; text-align: center;">
          <div style="margin-bottom: 15px;">
            <svg width="50" height="50" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="45" fill="white" opacity="0.2"/>
              <path d="M50 20 L65 40 L50 35 L35 40 Z" fill="white"/>
              <circle cx="50" cy="60" r="15" fill="white"/>
              <path d="M35 75 Q50 85 65 75" stroke="white" stroke-width="3" fill="none"/>
            </svg>
          </div>
          <h1 style="margin: 0; font-size: 28px; font-weight: 600;">⚠️ Account Removal Notice</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">MyNeedfully Security Team</p>
        </div>
        
        <div style="padding: 40px 30px; background-color: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px; font-size: 24px;">Hello ${userName},</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555; margin-bottom: 25px;">
            ${reason}
          </p>
          
          <div style="background-color: white; padding: 25px; border-radius: 12px; margin: 30px 0; border-left: 5px solid #FF6B6B; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h3 style="color: #FF6B6B; margin-top: 0; margin-bottom: 20px; font-size: 20px;">Activity Details:</h3>
            <div style="color: #555; line-height: 1.6;">
              <p style="margin: 8px 0;"><strong style="color: #333;">Date:</strong> ${new Date().toLocaleString()}</p>
              <p style="margin: 8px 0;"><strong style="color: #333;">Action:</strong> User account has been successfully removed from the platform</p>
              <p style="margin: 8px 0;"><strong style="color: #333;">Status:</strong> All associated data including wishlists, donations, and activity has been permanently deleted</p>
            </div>
          </div>
          
          <div style="background: linear-gradient(135deg, #FFF4E6 0%, #FFE8CC 100%); border: 1px solid #FFD93D; padding: 20px; border-radius: 12px; margin: 30px 0;">
            <p style="margin: 0; color: #B8860B; font-size: 14px; line-height: 1.5;">
              <strong>Not you?</strong> If you didn't authorize this change, please contact our support team immediately by replying to this email.
            </p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555; margin: 25px 0;">
            We take your account security seriously. If you believe this action was taken in error, please don't hesitate to reach out to our support team.
          </p>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.REPLIT_DOMAIN || 'https://myneedfully.com'}/contact" 
               style="background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 25px; display: inline-block; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3); transition: all 0.3s ease;">
              Contact Support
            </a>
          </div>
          
          <p style="font-size: 14px; color: #888; text-align: center; margin-top: 30px;">
            Thank you for being part of the MyNeedfully community.
          </p>
        </div>
        
        <div style="background: linear-gradient(135deg, #2C3E50 0%, #34495E 100%); color: white; padding: 25px; text-align: center;">
          <div style="margin-bottom: 10px;">
            <svg width="30" height="30" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="45" fill="white" opacity="0.1"/>
              <path d="M50 20 L65 40 L50 35 L35 40 Z" fill="white"/>
              <circle cx="50" cy="60" r="15" fill="white"/>
              <path d="M35 75 Q50 85 65 75" stroke="white" stroke-width="3" fill="none"/>
            </svg>
          </div>
          <p style="margin: 0; font-size: 14px; opacity: 0.9;">© 2025 MyNeedfully. Protecting your account and community.</p>
        </div>
      </div>
    `;

    const text = `Account Removal Notice: ${reason} on ${new Date().toLocaleString()}. If this wasn't authorized, please contact support immediately.`;

    return this.sendEmail({
      to: userEmail,
      from: 'data@myneedfully.app',
      subject,
      html,
      text,
    });
  }

  async sendAccountSecurityAlert(
    userEmail: string,
    userName: string,
    alertType: 'login' | 'password_change' | 'email_change',
    ipAddress?: string,
    userAgent?: string
  ): Promise<boolean> {
    const alertMessages = {
      login: 'We detected a new sign-in to your MyNeedfully account.',
      password_change: 'Your MyNeedfully password was recently changed.',
      email_change: 'Your MyNeedfully email address was recently updated.'
    };

    const subject = `Security Alert - ${alertType === 'login' ? 'New Sign-in' : alertType === 'password_change' ? 'Password Changed' : 'Email Changed'} - MyNeedfully`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #856404; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">🔐 Security Alert</h1>
        </div>
        
        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2 style="color: #333;">Hello ${userName},</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            ${alertMessages[alertType]}
          </p>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #856404;">
            <h3 style="color: #856404; margin-top: 0;">Activity Details:</h3>
            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            ${ipAddress ? `<p><strong>IP Address:</strong> ${ipAddress}</p>` : ''}
            ${userAgent ? `<p><strong>Device:</strong> ${userAgent}</p>` : ''}
          </div>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              <strong>Not you?</strong> If you didn't make this change, please contact our support team immediately by replying to this email.
            </p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            We take your account security seriously. If this activity looks suspicious, please review your account settings and consider updating your password.
          </p>
          
          <div style="text-align: center; margin: 35px 0;">
            <a href="${process.env.REPLIT_DOMAIN || 'https://myneedfully.com'}/profile/privacy" 
               style="background-color: #856404; color: white; padding: 15px 35px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 16px;">
              Review Account Settings
            </a>
          </div>
          
          <p style="font-size: 14px; color: #888; text-align: center;">
            Keep your account secure by using a strong, unique password.
          </p>
        </div>
        
        <div style="background-color: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">© 2025 MyNeedfully. Protecting your account.</p>
        </div>
      </div>
    `;

    const text = `Security Alert: ${alertMessages[alertType]} on ${new Date().toLocaleString()}. If this wasn't you, please contact support immediately.`;

    return this.sendEmail({
      to: userEmail,
      from: 'data@myneedfully.app',
      subject,
      html,
      text,
    });
  }

  async sendNeedsListApprovalNotification(
    userEmail: string,
    userName: string,
    needsListTitle: string,
    isApproved: boolean,
    adminNote?: string
  ): Promise<boolean> {
    const subject = isApproved 
      ? `Your needs list "${needsListTitle}" has been approved!`
      : `Your needs list "${needsListTitle}" needs updates`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: ${isApproved ? '#28a745' : '#FF6B6B'}; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">${isApproved ? '✅ List Approved!' : '📝 Updates Needed'}</h1>
        </div>
        
        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2 style="color: #333;">Dear ${userName},</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            ${isApproved 
              ? `Great news! Your needs list "${needsListTitle}" has been approved and is now live on MyNeedfully.`
              : `Your needs list "${needsListTitle}" requires some updates before it can go live.`
            }
          </p>
          
          ${adminNote ? `
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid ${isApproved ? '#28a745' : '#FF6B6B'};">
              <h3 style="color: ${isApproved ? '#28a745' : '#FF6B6B'}; margin-top: 0;">Message from our team:</h3>
              <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0;">
                ${adminNote}
              </p>
            </div>
          ` : ''}
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            ${isApproved 
              ? 'Supporters can now discover your list and help fulfill your needs. We\'ll notify you when items are purchased!'
              : 'Please review the feedback above and update your list accordingly. Once updated, it will be reviewed again promptly.'
            }
          </p>
          
          <div style="text-align: center; margin: 35px 0;">
            <a href="${process.env.REPLIT_DOMAIN || 'https://myneedfully.com'}/profile#my-lists" 
               style="background-color: ${isApproved ? '#28a745' : '#FF6B6B'}; color: white; padding: 15px 35px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 16px;">
              ${isApproved ? 'View My Live List' : 'Update My List'}
            </a>
          </div>
          
          <p style="font-size: 14px; color: #888; text-align: center;">
            ${isApproved 
              ? 'Thank you for sharing your story with our community.'
              : 'We\'re here to help you create the best needs list possible.'
            }
          </p>
        </div>
        
        <div style="background-color: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">© 2025 MyNeedfully. Supporting you every step of the way.</p>
        </div>
      </div>
    `;

    const text = isApproved 
      ? `Good news! Your needs list "${needsListTitle}" has been approved and is now live. Supporters can now help fulfill your needs.`
      : `Your needs list "${needsListTitle}" needs updates before going live. ${adminNote || 'Please check your dashboard for details.'}`;

    return this.sendEmail({
      to: userEmail,
      from: 'data@myneedfully.app',
      subject,
      html,
      text,
    });
  }

  async sendAccountDeletionConfirmation(
    userEmail: string,
    userName: string
  ): Promise<boolean> {
    const subject = `Account Deletion Confirmation - MyNeedfully`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #dc3545; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Account Deleted</h1>
        </div>
        
        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2 style="color: #333;">Goodbye ${userName},</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Your MyNeedfully account has been permanently deleted at your request. All your personal data, needs lists, and account information have been removed from our systems.
          </p>
          
          <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <p style="margin: 0; color: #721c24; font-size: 14px;">
              <strong>⚠️ Important:</strong> This action is permanent and cannot be undone. If you wish to use MyNeedfully again in the future, you'll need to create a new account.
            </p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Thank you for being part of the MyNeedfully community. We hope the connections and support you found here made a positive difference in your life.
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            If you have any questions about the data deletion process or if you believe this was done in error, please contact our support team immediately.
          </p>
          
          <div style="text-align: center; margin: 35px 0;">
            <a href="mailto:support@myneedfully.app" 
               style="background-color: #6c757d; color: white; padding: 15px 35px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 16px;">
              Contact Support
            </a>
          </div>
          
          <p style="font-size: 14px; color: #888; text-align: center;">
            We wish you all the best in your future endeavors.
          </p>
        </div>
        
        <div style="background-color: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">© 2025 MyNeedfully. Thank you for being part of our community.</p>
        </div>
      </div>
    `;

    const text = `Hello ${userName}, your MyNeedfully account has been permanently deleted at your request. All your data has been removed from our systems. If you have questions, contact support@myneedfully.app.`;

    return this.sendEmail({
      to: userEmail,
      from: 'data@myneedfully.app',
      subject,
      html,
      text,
    });
  }

  async sendWeeklyImpactSummary(
    userEmail: string,
    userName: string,
    emailMarketingEnabled: boolean,
    weeklyStats: {
      donationsReceived: number;
      itemsFulfilled: number;
      thankYouNotes: number;
      totalValue: number;
    }
  ): Promise<boolean> {
    // Respect user's email marketing preferences
    if (!emailMarketingEnabled) {
      console.log(`Skipping weekly impact email for ${userEmail} - email marketing disabled`);
      return true; // Return true to indicate successful "non-send"
    }
    const subject = `Your Weekly Impact Summary - MyNeedfully`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #FF6B6B; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Your Weekly Impact</h1>
        </div>
        
        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2 style="color: #333;">Hello ${userName},</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Here's a summary of the amazing impact you've made this week on MyNeedfully!
          </p>
          
          <div style="background-color: white; padding: 25px; border-radius: 12px; margin: 25px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h3 style="color: #FF6B6B; margin-top: 0; text-align: center;">This Week's Highlights</h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
              <div style="text-align: center; padding: 15px; background-color: #f8f9fa; border-radius: 8px;">
                <div style="font-size: 24px; font-weight: bold; color: #FF6B6B;">${weeklyStats.donationsReceived}</div>
                <div style="font-size: 14px; color: #666;">Donations Received</div>
              </div>
              
              <div style="text-align: center; padding: 15px; background-color: #f8f9fa; border-radius: 8px;">
                <div style="font-size: 24px; font-weight: bold; color: #FF6B6B;">${weeklyStats.itemsFulfilled}</div>
                <div style="font-size: 14px; color: #666;">Items Fulfilled</div>
              </div>
              
              <div style="text-align: center; padding: 15px; background-color: #f8f9fa; border-radius: 8px;">
                <div style="font-size: 24px; font-weight: bold; color: #FF6B6B;">${weeklyStats.thankYouNotes}</div>
                <div style="font-size: 14px; color: #666;">Thank You Notes</div>
              </div>
              
              <div style="text-align: center; padding: 15px; background-color: #f8f9fa; border-radius: 8px;">
                <div style="font-size: 24px; font-weight: bold; color: #FF6B6B;">$${weeklyStats.totalValue.toFixed(0)}</div>
                <div style="font-size: 14px; color: #666;">Total Value</div>
              </div>
            </div>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            ${weeklyStats.donationsReceived > 0 
              ? `You've touched ${weeklyStats.donationsReceived} ${weeklyStats.donationsReceived === 1 ? 'life' : 'lives'} this week! Each act of kindness creates ripples of hope and positivity.`
              : 'Remember, every small act of kindness matters. Your presence in our community makes a difference!'
            }
          </p>
          
          <div style="text-align: center; margin: 35px 0;">
            <a href="${process.env.REPLIT_DOMAIN || 'https://myneedfully.com'}/profile" 
               style="background-color: #FF6B6B; color: white; padding: 15px 35px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 16px;">
              View Your Impact Dashboard
            </a>
          </div>
          
          <p style="font-size: 14px; color: #888; text-align: center;">
            Keep making a difference, one need at a time! 💝
          </p>
        </div>
        
        <div style="background-color: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">© 2025 MyNeedfully. Connecting hearts, fulfilling needs.</p>
          <p style="margin: 5px 0 0 0;">
            <a href="${process.env.REPLIT_DOMAIN || 'https://myneedfully.com'}/settings" style="color: #FF6B6B;">Manage email preferences</a>
          </p>
        </div>
      </div>
    `;

    const text = `Hello ${userName}, here's your weekly impact summary: ${weeklyStats.donationsReceived} donations received, ${weeklyStats.itemsFulfilled} items fulfilled, ${weeklyStats.thankYouNotes} thank you notes, $${weeklyStats.totalValue.toFixed(0)} total value. Keep making a difference!`;

    return this.sendEmail({
      to: userEmail,
      from: 'data@myneedfully.app',
      subject,
      html,
      text,
    });
  }
}

export const emailService = new EmailService();