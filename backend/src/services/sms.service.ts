import dotenv from "dotenv";
import type { ATSMSResponse } from "../types/types.js";

dotenv.config();

export interface SMSResult {
	success: boolean;
	isBlacklisted: boolean;
	message: string;
	statusCode?: number;
	status?: string;
}

export class SMSService {
	async sendOTPFetch(
		phoneNumber: string,
		code: string,
		purpose: "login" | "verification" | "password_reset" | "password_change" | "phone_change" = "login",
	): Promise<SMSResult> {
		try {
			const formattedNumber = this.formatPhoneNumber(phoneNumber);
			const username = process.env.AT_USERNAME!;
			const apiKey = process.env.AT_API_KEY!;

			let message = `Your verification code is: ${code}. Valid for 10 minutes.`;

			if (purpose === "login") {
				message = `Your login verification code is: ${code}. Valid for 10 minutes.`;
			} else if (purpose === "verification") {
				message = `Your account verification code is: ${code}. Valid for 10 minutes.`;
			} else if (purpose === "password_change") {
				message = `Your password change verification code is: ${code}. Valid for 10 minutes.`;
			} else if (purpose === "password_reset") {
				message = `Your password reset verification code is: ${code}. Valid for 10 minutes.`;
			} else if (purpose === "phone_change") {
				message = `Your phone number change verification code is: ${code}. Valid for 10 minutes.`;
			}

			const params = new URLSearchParams({
				username: username,
				to: formattedNumber,
				message: message,
			});

			const response = await fetch(
				"https://api.africastalking.com/version1/messaging",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/x-www-form-urlencoded",
						Accept: "application/json",
						apiKey: apiKey,
					},
					body: params,
				},
			);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data: ATSMSResponse = await response.json();

			if (data.SMSMessageData && data.SMSMessageData.Recipients.length > 0) {
				const recipient = data.SMSMessageData.Recipients[0];
				const statusCode = recipient.statusCode;
				const status = recipient.status;

				if (statusCode === 406 || status === "UserInBlacklist") {
					return {
						success: false,
						isBlacklisted: true,
						message: "Phone number is blacklisted",
						statusCode,
						status,
					};
				}

				if (status !== "Success") {
					return {
						success: false,
						isBlacklisted: false,
						message: `SMS failed: ${status}`,
						statusCode,
						status,
					};
				}

				return {
					success: true,
					isBlacklisted: false,
					message: "SMS sent successfully",
					statusCode,
					status,
				};
			}

			return {
				success: false,
				isBlacklisted: false,
				message: "No recipients in response",
			};
		} catch (error: unknown) {
			console.error("SMS fetch error:", error);
			const message = error instanceof Error ? error.message : "Unknown error";

			if (message.includes("406") || message.includes("blacklist")) {
				return {
					success: false,
					isBlacklisted: true,
					message: "Phone number is blacklisted",
				};
			}

			return {
				success: false,
				isBlacklisted: false,
				message: `SMS error: ${message}`,
			};
		}
	}

	private formatPhoneNumber(phoneNumber: string): string {
		let cleaned = phoneNumber.replace(/[\s\-()]/g, "");
		if (cleaned.startsWith("00")) {
			cleaned = "+" + cleaned.substring(2);
		}
		if (!cleaned.startsWith("+")) {
			if (cleaned.startsWith("0")) {
				cleaned = "+254" + cleaned.substring(1);
			} else {
				cleaned = "+" + cleaned;
			}
		}

		return cleaned;
	}
}

export const smsService = new SMSService();
