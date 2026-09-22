import smtplib
from email.message import EmailMessage
from email.utils import formataddr, formatdate, make_msgid
from typing import Optional
import re
from datetime import datetime
import app.config as config
from app.db import SessionLocal
from app.models.email_log import EmailLog
from app.models.user import User


class EmailService:
    @staticmethod
    def _get_sender_name() -> str:
        return getattr(config, "SMTP_FROM_NAME", None) or "BayanihanHub"

    @staticmethod
    def _html_to_plain(html: str) -> str:
        """Strip HTML tags and convert formatting into a clean plain-text fallback."""
        text = re.sub(r'<br\s*/?>', '\n', html, flags=re.IGNORECASE)
        text = re.sub(r'</(p|div|h[1-6]|li|tr)>', '\n', text, flags=re.IGNORECASE)
        text = re.sub(r'<a\s+[^>]*href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', r'\2 (\1)', text, flags=re.IGNORECASE | re.DOTALL)
        text = re.sub(r'<style[^>]*>.*?</style>', '', text, flags=re.IGNORECASE | re.DOTALL)
        text = re.sub(r'<[^>]+>', '', text)
        text = re.sub(r'&nbsp;', ' ', text)
        text = re.sub(r'&amp;', '&', text)
        text = re.sub(r'&lt;', '<', text)
        text = re.sub(r'&gt;', '>', text)
        text = re.sub(r'&zwnj;', '', text)
        text = re.sub(r'\n{3,}', '\n\n', text)
        return text.strip()

    @staticmethod
    def _wrap_email_html(title: str, content_html: str, preheader: str = "") -> str:
        """
        Wraps content into a modern, responsive HTML email template with valid structure
        and headers to minimize spam classification.
        """
        preview = preheader or title
        return f"""<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>{title}</title>
    <!--[if mso]>
    <style>table,td,th,div,p,span {{font-family: Arial, sans-serif !important;}}</style>
    <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; color: #1e293b;">
    <div style="display: none; max-height: 0px; overflow: hidden; mso-hide: all; font-size: 1px; line-height: 1px; color: #fff; opacity: 0;">
        {preview} &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
    </div>
    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 24px 12px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
                    <!-- Brand Header -->
                    <tr>
                        <td style="background-color: #0f766e; padding: 22px 32px; text-align: left;">
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td>
                                        <span style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.3px; text-decoration: none;">BayanihanHub</span>
                                    </td>
                                    <td align="right" style="color: #99f6e4; font-size: 13px; font-weight: 500;">
                                        Community Network
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <!-- Main Body -->
                    <tr>
                        <td style="padding: 32px 32px 24px 32px; color: #334155; font-size: 15px; line-height: 1.6;">
                            {content_html}
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 12px; line-height: 1.5;">
                            <p style="margin: 0 0 6px 0;">This email was sent by <strong>BayanihanHub</strong>.</p>
                            <p style="margin: 0 0 4px 0;">Please do not reply directly to this automated email if you have specific support inquiries.</p>
                            <p style="margin: 0; color: #94a3b8;">&copy; {datetime.now().year} BayanihanHub. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>"""

    @staticmethod
    def send_email(to_email: str, subject: str, html_content: str, email_type: str = "GENERAL", user_id: Optional[int] = None) -> bool:
        """
        Sends an HTML email using the configured SMTP server and logs to DB.
        Includes complete anti-spam headers and compliant multi-part payload.
        """
        success = False
        error_msg = None
        sender_name = EmailService._get_sender_name()

        if not config.SMTP_HOST:
            # Mock mode
            print(f"[{datetime.now().isoformat()}] [MOCK EMAIL] To: {to_email} | Subject: {subject}")
            print(f"Content:\n{html_content}\n")
            success = True
        else:
            try:
                msg = EmailMessage()
                msg["Subject"] = subject
                msg["From"] = formataddr((sender_name, config.SMTP_FROM_EMAIL))
                msg["To"] = to_email
                msg["Reply-To"] = formataddr((sender_name, config.SMTP_FROM_EMAIL))
                msg["Date"] = formatdate(localtime=True)
                domain = "gmail.com" if "gmail" in config.SMTP_HOST.lower() else "bayanihanhub.com"
                msg["Message-ID"] = make_msgid(domain=domain)
                msg["Auto-Submitted"] = "auto-generated"
                msg["X-Auto-Response-Suppress"] = "All"
                msg["X-Mailer"] = "BayanihanHub-Mailer/1.0"

                # Wrap html content in valid template if not already a full document
                if "<html" not in html_content.lower():
                    full_html = EmailService._wrap_email_html(subject, html_content)
                else:
                    full_html = html_content

                # Create meaningful plain-text fallback
                plain_text = EmailService._html_to_plain(full_html)
                msg.set_content(plain_text, charset="utf-8")
                msg.add_alternative(full_html, subtype="html", charset="utf-8")

                # SMTP transport
                if config.SMTP_USE_SSL:
                    server_class = smtplib.SMTP_SSL
                else:
                    server_class = smtplib.SMTP

                with server_class(config.SMTP_HOST, config.SMTP_PORT, timeout=30) as server:
                    if config.SMTP_USE_TLS and not config.SMTP_USE_SSL:
                        server.starttls()
                    if config.SMTP_USER and config.SMTP_PASSWORD:
                        server.login(config.SMTP_USER, config.SMTP_PASSWORD)
                    server.send_message(msg)
                success = True
            except Exception as e:
                error_msg = str(e)
                print(f"[ERROR] Failed to send email to {to_email}: {e}")

        # Log to Database
        try:
            with SessionLocal() as db:
                if not user_id:
                    user = db.query(User).filter(User.email == to_email).first()
                    user_id = user.user_id if user else None

                log = EmailLog(
                    recipient_user_id=user_id,
                    recipient_email=to_email,
                    email_type=email_type,
                    subject=subject,
                    status="SENT" if success else "FAILED",
                    error_message=error_msg,
                    sent_at=datetime.now() if success else None,
                )
                db.add(log)
                db.commit()
        except Exception as e:
            print(f"[ERROR] Failed to save EmailLog: {e}")

        return success

    @staticmethod
    def send_password_reset_email(to_email: str, reset_token: str, username: str) -> bool:
        subject = "Password Reset Request - Bayanihan Hub"
        reset_link = f"{config.FRONTEND_URL}/reset-password?token={reset_token}"

        content = f"""
        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Password Reset Request</h2>
        <p>Hello <strong>{username}</strong>,</p>
        <p>We received a request to reset the password for your Bayanihan Hub account. If you submitted this request, please use the secure button below to set a new password:</p>
        <div style="text-align: center; margin: 32px 0;">
            <a href="{reset_link}" style="background-color: #0f766e; color: #ffffff; padding: 13px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; box-shadow: 0 2px 4px rgba(15, 118, 110, 0.2);">Reset Your Password</a>
        </div>
        <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
            Or copy and paste this link into your browser:<br>
            <a href="{reset_link}" style="color: #0f766e; word-break: break-all;">{reset_link}</a>
        </p>
        <p style="font-size: 13px; color: #64748b; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
            <strong>Security Notice:</strong> This reset link will expire in 1 hour. If you did not request a password reset, you can safely ignore this email; your password will remain unchanged.
        </p>
        """
        return EmailService.send_email(to_email, subject, content, email_type="PASSWORD_RESET")

    @staticmethod
    def send_password_reset_success_email(to_email: str, username: str) -> bool:
        subject = "Password Changed - Bayanihan Hub"
        content = f"""
        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Password Changed Successfully</h2>
        <p>Hello <strong>{username}</strong>,</p>
        <p>Your Bayanihan Hub account password has been successfully updated.</p>
        <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 14px 18px; margin: 20px 0; border-radius: 0 6px 6px 0; color: #065f46; font-size: 14px;">
            Your account is now protected with your new password.
        </div>
        <p style="font-size: 13px; color: #64748b; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
            <strong>Security Warning:</strong> If you did not authorize this change, please immediately contact Bayanihan Hub moderation support to secure your account.
        </p>
        """
        return EmailService.send_email(to_email, subject, content, email_type="PASSWORD_RESET_SUCCESS")

    @staticmethod
    def send_registration_email(to_email: str, username: str) -> bool:
        subject = "Welcome to Bayanihan Hub!"
        content = f"""
        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Welcome to Bayanihan Hub!</h2>
        <p>Hello <strong>{username}</strong>,</p>
        <p>Thank you for signing up to join the Bayanihan Hub community platform.</p>
        <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 14px 18px; margin: 20px 0; border-radius: 0 6px 6px 0; color: #166534; font-size: 14px;">
            Your registration has been received and is currently undergoing verification by our community administrators.
        </div>
        <p>You will receive another email notification as soon as your account is reviewed and approved.</p>
        <p>We are excited to have you as part of our mutual aid and sharing network!</p>
        """
        return EmailService.send_email(to_email, subject, content, email_type="REGISTRATION")

    @staticmethod
    def send_approval_email(to_email: str, username: str) -> bool:
        subject = "Your Bayanihan Hub Account is Approved!"
        login_link = f"{config.FRONTEND_URL}/login"
        content = f"""
        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Account Approved!</h2>
        <p>Hello <strong>{username}</strong>,</p>
        <p>Great news! Your account verification has been reviewed and <strong>approved</strong> by our moderation team.</p>
        <p>You now have full access to share items, request assistance, and connect with neighbors on Bayanihan Hub.</p>
        <div style="text-align: center; margin: 32px 0;">
            <a href="{login_link}" style="background-color: #0f766e; color: #ffffff; padding: 13px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; box-shadow: 0 2px 4px rgba(15, 118, 110, 0.2);">Log In to Your Account</a>
        </div>
        """
        return EmailService.send_email(to_email, subject, content, email_type="ACCOUNT_APPROVED")

    @staticmethod
    def send_rejection_email(to_email: str, username: str, reason: str = "") -> bool:
        subject = "Account Registration Update - Bayanihan Hub"
        reason_html = (
            f'<div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 14px 18px; margin: 20px 0; border-radius: 0 6px 6px 0; color: #991b1b; font-size: 14px;">'
            f'<strong>Reason provided:</strong><br>{reason}</div>'
            if reason
            else ""
        )
        content = f"""
        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Account Registration Update</h2>
        <p>Hello <strong>{username}</strong>,</p>
        <p>We are writing to inform you that your registration for Bayanihan Hub could not be approved at this time.</p>
        {reason_html}
        <p>If you believe this was in error or you have updated documentation to provide, please contact our support team.</p>
        """
        return EmailService.send_email(to_email, subject, content, email_type="ACCOUNT_REJECTED")

    @staticmethod
    def send_suspension_email(to_email: str, username: str, reason: str, duration: str) -> bool:
        subject = "Account Suspension Notice - Bayanihan Hub"
        content = f"""
        <h2 style="color: #b91c1c; margin-top: 0; font-size: 20px;">Account Suspension Notice</h2>
        <p>Hello <strong>{username}</strong>,</p>
        <p>Your Bayanihan Hub account has been temporarily suspended due to a violation of community guidelines:</p>
        <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 14px 18px; margin: 20px 0; border-radius: 0 6px 6px 0; color: #991b1b; font-size: 14px;">
            <strong>Reason:</strong> {reason}<br>
            <strong>Duration:</strong> {duration}
        </div>
        <p>During this suspension period, you will be unable to post items or interact with other members.</p>
        """
        return EmailService.send_email(to_email, subject, content, email_type="ACCOUNT_SUSPENDED")

    @staticmethod
    def send_deletion_email(to_email: str, username: str) -> bool:
        subject = "Account Deletion Confirmation - Bayanihan Hub"
        content = f"""
        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Account Deletion Confirmation</h2>
        <p>Hello <strong>{username}</strong>,</p>
        <p>This email confirms that your Bayanihan Hub account and associated personal data have been deleted per your request.</p>
        <p>We are grateful for your time with our community. If you ever wish to return, you are always welcome to create a new account.</p>
        """
        return EmailService.send_email(to_email, subject, content, email_type="ACCOUNT_DELETED")

    @staticmethod
    def send_message_notification_email(to_email: str, username: str, sender_name: str) -> bool:
        subject = f"New message from {sender_name} - Bayanihan Hub"
        msg_link = f"{config.FRONTEND_URL}/messages"
        content = f"""
        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">New Message Received</h2>
        <p>Hello <strong>{username}</strong>,</p>
        <p><strong>{sender_name}</strong> sent you a message on Bayanihan Hub.</p>
        <div style="text-align: center; margin: 32px 0;">
            <a href="{msg_link}" style="background-color: #0f766e; color: #ffffff; padding: 13px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; box-shadow: 0 2px 4px rgba(15, 118, 110, 0.2);">Open Conversation</a>
        </div>
        <p style="font-size: 13px; color: #64748b;">
            To preserve conversation privacy, message contents are only visible inside your Bayanihan Hub inbox.
        </p>
        """
        return EmailService.send_email(to_email, subject, content, email_type="NEW_MESSAGE")

    @staticmethod
    def send_unread_messages_summary(to_email: str, username: str, count: int) -> bool:
        subject = f"You have {count} unread messages on Bayanihan Hub"
        msg_link = f"{config.FRONTEND_URL}/messages"
        content = f"""
        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Unread Messages Digest</h2>
        <p>Hello <strong>{username}</strong>,</p>
        <p>You have <strong>{count} unread message{'s' if count != 1 else ''}</strong> waiting for your reply on Bayanihan Hub.</p>
        <div style="text-align: center; margin: 32px 0;">
            <a href="{msg_link}" style="background-color: #0f766e; color: #ffffff; padding: 13px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; box-shadow: 0 2px 4px rgba(15, 118, 110, 0.2);">View Your Messages</a>
        </div>
        """
        return EmailService.send_email(to_email, subject, content, email_type="UNREAD_MESSAGE")
