import smtplib
from email.message import EmailMessage
from typing import Optional
import app.config as config
from datetime import datetime

class EmailService:
    @staticmethod
    def send_email(to_email: str, subject: str, html_content: str) -> bool:
        """
        Sends an HTML email using the configured SMTP server.
        If SMTP is not configured, logs the email content to stdout (mock mode).
        """
        if not config.SMTP_HOST:
            # Mock mode
            print(f"[{datetime.now().isoformat()}] [MOCK EMAIL] To: {to_email} | Subject: {subject}")
            print(f"Content:\n{html_content}\n")
            return True
            
        try:
            msg = EmailMessage()
            msg["Subject"] = subject
            msg["From"] = config.SMTP_FROM_EMAIL
            msg["To"] = to_email
            msg.set_content("Please enable HTML to view this email.")
            msg.add_alternative(html_content, subtype="html")
            
            with smtplib.SMTP(config.SMTP_HOST, config.SMTP_PORT) as server:
                server.starttls()
                if config.SMTP_USER and config.SMTP_PASSWORD:
                    server.login(config.SMTP_USER, config.SMTP_PASSWORD)
                server.send_message(msg)
            return True
        except Exception as e:
            print(f"[ERROR] Failed to send email to {to_email}: {e}")
            return False
            
    @staticmethod
    def send_password_reset_email(to_email: str, reset_token: str, username: str) -> bool:
        subject = "Password Reset Request - Bayanihan Hub"
        
        # Using a frontend URL for the reset link
        # Should ideally be in config but we'll hardcode to the common frontend port for now
        # Actually in production this is configured via frontend host env var, but 5173 or 5174 is typical for vite
        reset_link = f"http://localhost:5174/reset-password?token={reset_token}"
        
        html = f"""
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #0f172a;">Password Reset</h2>
            <p>Hi {username},</p>
            <p>We received a request to reset your password for your Bayanihan Hub account. If you didn't make this request, you can safely ignore this email.</p>
            <p>To reset your password, click the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{reset_link}" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
            </div>
            <p style="font-size: 12px; color: #64748b; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                This link will expire in 1 hour.<br>
                Bayanihan Hub Team
            </p>
        </div>
        """
        return EmailService.send_email(to_email, subject, html)
        
    @staticmethod
    def send_welcome_email(to_email: str, username: str) -> bool:
        subject = "Welcome to Bayanihan Hub!"
        html = f"""
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #0f172a;">Welcome to Bayanihan Hub!</h2>
            <p>Hi {username},</p>
            <p>We are thrilled to have you in our community. Start exploring items for exchange or donation today.</p>
            <p>Together, we build a stronger community through Bayanihan.</p>
            <p style="font-size: 12px; color: #64748b; margin-top: 40px;">
                Bayanihan Hub Team
            </p>
        </div>
        """
        return EmailService.send_email(to_email, subject, html)

    @staticmethod
    def send_approval_email(to_email: str, username: str) -> bool:
        subject = "Your Bayanihan Hub Account is Approved!"
        html = f"""
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #0f172a;">Account Approved!</h2>
            <p>Hi {username},</p>
            <p>Great news! Your account has been reviewed and approved by our moderation team.</p>
            <p>You now have full access to exchange items, message other members, and participate in the community.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:5174/login" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Log In Now</a>
            </div>
            <p style="font-size: 12px; color: #64748b; margin-top: 40px;">
                Bayanihan Hub Team
            </p>
        </div>
        """
        return EmailService.send_email(to_email, subject, html)

    @staticmethod
    def send_suspension_email(to_email: str, username: str, reason: str, duration: str) -> bool:
        subject = "Account Suspension Notice - Bayanihan Hub"
        html = f"""
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ef4444; border-radius: 8px;">
            <h2 style="color: #b91c1c;">Account Suspension</h2>
            <p>Hi {username},</p>
            <p>Your account has been suspended for the following reason:</p>
            <blockquote style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 10px; color: #991b1b;">
                {reason}
            </blockquote>
            <p><strong>Duration:</strong> {duration}</p>
            <p>During this time, you will not be able to log in or participate in the community. If you believe this was an error, please contact support.</p>
            <p style="font-size: 12px; color: #64748b; margin-top: 40px;">
                Bayanihan Hub Moderation Team
            </p>
        </div>
        """
        return EmailService.send_email(to_email, subject, html)

    @staticmethod
    def send_deletion_email(to_email: str, username: str) -> bool:
        subject = "Account Deletion Confirmation - Bayanihan Hub"
        html = f"""
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #0f172a;">Account Deleted</h2>
            <p>Hi {username},</p>
            <p>This email is to confirm that your Bayanihan Hub account has been successfully deleted.</p>
            <p>We're sorry to see you go! All your personal data, posts, and messages have been removed from our system according to our data retention policy.</p>
            <p>If you ever wish to return, you are always welcome to create a new account.</p>
            <p style="font-size: 12px; color: #64748b; margin-top: 40px;">
                Bayanihan Hub Team
            </p>
        </div>
        """
        return EmailService.send_email(to_email, subject, html)

    @staticmethod
    def send_message_notification_email(to_email: str, username: str, sender_name: str, message_preview: str) -> bool:
        subject = f"New message from {sender_name} - Bayanihan Hub"
        html = f"""
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #0f172a;">You have a new message!</h2>
            <p>Hi {username},</p>
            <p><strong>{sender_name}</strong> sent you a message on Bayanihan Hub:</p>
            <blockquote style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 10px; color: #334155; font-style: italic;">
                "{message_preview}"
            </blockquote>
            <div style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:5174/messages" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reply to Message</a>
            </div>
            <p style="font-size: 12px; color: #64748b; margin-top: 40px;">
                You are receiving this email because you have unread messages. To change your notification settings, visit your profile.
            </p>
        </div>
        """
        return EmailService.send_email(to_email, subject, html)
