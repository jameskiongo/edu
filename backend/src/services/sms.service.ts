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
	static async sendOTPFetch(
		phoneNumber: string,
		code: string,
	): Promise<SMSResult> {
		try {
			const formattedNumber = SMSService.formatPhoneNumber(phoneNumber);
			const username = process.env.AT_USERNAME!;
			const apiKey = process.env.AT_API_KEY!;

			const message = `Your verification code is: ${code}. Valid for 10 minutes.`;

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

				console.log("SMS Status Code:", statusCode);
				console.log("SMS Status:", status);

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

	private static formatPhoneNumber(phoneNumber: string): string {
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
