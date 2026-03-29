import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: parseInt(process.env.SMTP_PORT || "587", 10),
	secure: false,
	requireTLS: true,
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS,
	},
	greetingTimeout: 10000,
	connectionTimeout: 10000,
	socketTimeout: 10000,
});

function emailTemplate(title: string, message: string, code: string) {
	return `
  <div style="font-family: Arial, Helvetica, sans-serif; background:#f9fafb; padding:40px 0;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;padding:40px;border:1px solid #eee;">
      
      <h2 style="margin-top:0;color:#111;font-size:24px;">${title}</h2>

      <p style="color:#555;font-size:16px;line-height:1.6;">
        ${message}
      </p>

      <div style="text-align:center;margin:30px 0;">
        <span style="
          display:inline-block;
          background:#fff;
          color:#000;
          padding:14px 26px;
          font-size:28px;
          letter-spacing:6px;
          border-radius:8px;
          font-weight:bold;
        ">
          ${code}
        </span>
      </div>

      <p style="color:#666;font-size:14px;">
        This code will expire in <strong>10 minutes</strong>.
      </p>

      <hr style="border:none;border-top:1px solid #eee;margin:30px 0;" />

      <p style="color:#999;font-size:12px;text-align:center;">
        If you didn’t request this email, you can safely ignore it.
      </p>

    </div>
  </div>
  `;
}

export class EmailService {
	async sendVerificationEmail(email: string, code: string): Promise<void> {
		await transporter.sendMail({
			from: `"MyApp" <${process.env.SMTP_USER}>`,
			to: email,
			subject: "Verify Your Email",
			html: emailTemplate(
				"Verify Your Email",
				"Welcome! Please use the verification code below to activate your account.",
				code,
			),
		});
	}

	async sendPasswordResetEmail(email: string, code: string): Promise<void> {
		await transporter.sendMail({
			from: `"MyApp" <${process.env.SMTP_USER}>`,
			to: email,
			subject: "Password Reset Request",
			html: emailTemplate(
				"Password Reset",
				"You requested to reset your password. Use the code below to continue.",
				code,
			),
		});
	}

	async sendEmailOtp(
		email: string,
		code: string,
		purpose: "login" | "verification" | "password_reset" | "password_change" = "login",
	): Promise<boolean> {
		let subject = "Login Verification Code";
		let title = "Login Verification";
		let message = "Use the code below to complete your login.";

		if (purpose === "verification") {
			subject = "Verify Your Email";
			title = "Verify Your Email";
			message =
				"Welcome! Please use the verification code below to activate your account.";
		} else if (purpose === "password_reset") {
			subject = "Password Reset Request";
			title = "Password Reset";
			message =
				"You requested to reset your password. Use the code below to continue.";
		} else if (purpose === "password_change") {
			subject = "Password Change Verification";
			title = "Password Change Request";
			message =
				"Use the code below to verify your password change request. If you didn't request this, please secure your account.";
		}

		try {
			await transporter.sendMail({
				from: `"MyApp" <${process.env.SMTP_USER}>`,
				to: email,
				subject,
				html: emailTemplate(title, message, code),
			});

			return true;
		} catch (error) {
			console.error("Email OTP error:", error);
			return false;
		}
	}
}

export const emailService = new EmailService();
