interface Recipient {
	cost: string;
	messageId: string;
	messageParts: number;
	number: string;
	status: string;
	statusCode: number;
}

interface SMSMessageData {
	Message: string;
	Recipients: Recipient[];
}

export interface ATSMSResponse {
	SMSMessageData: SMSMessageData;
}
