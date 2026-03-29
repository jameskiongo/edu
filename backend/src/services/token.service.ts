import { and, eq, gt } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { db } from "../db/db";
import { refreshTokens } from "../db/schema";
import { UnauthorizedError } from "../utils/errors";

export interface Tokens {
	accessToken: string;
	refreshToken: string;
}

export class TokenService {
	generateOTP(): string {
		return Math.floor(100000 + Math.random() * 900000).toString();
	}

	generateTokens(userId: number): Tokens {
		const accessToken = jwt.sign(
			{ userId, type: "access" },
			process.env.JWT_SECRET!,
			{ expiresIn: "15m" },
		);

		const refreshToken = jwt.sign(
			{ userId, type: "refresh" },
			process.env.JWT_REFRESH_SECRET!,
			{ expiresIn: "7d" },
		);

		return { accessToken, refreshToken };
	}

	verifyAccessToken(token: string): { userId: number } {
		try {
			const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
				userId: number;
				type: string;
			};
			if (decoded.type !== "access")
				throw new UnauthorizedError("Invalid token type");
			return { userId: decoded.userId };
		} catch (error) {
			throw new UnauthorizedError("Invalid or expired access token");
		}
	}

	verifyRefreshToken(token: string): { userId: number } {
		try {
			const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as {
				userId: number;
				type: string;
			};
			if (decoded.type !== "refresh")
				throw new UnauthorizedError("Invalid token type");
			return { userId: decoded.userId };
		} catch (error) {
			throw new UnauthorizedError("Invalid or expired refresh token");
		}
	}

	async refreshTokens(refreshToken: string): Promise<Tokens> {
		const { userId } = this.verifyRefreshToken(refreshToken);

		const storedToken = await db
			.select()
			.from(refreshTokens)
			.where(
				and(
					eq(refreshTokens.token, refreshToken),
					eq(refreshTokens.revoked, false),
					gt(refreshTokens.expiresAt, new Date()),
				),
			)
			.limit(1)
			.then((row) => row[0]);

		if (!storedToken) {
			throw new UnauthorizedError("Refresh token not found or revoked");
		}

		// Revoke the old refresh token
		await db
			.update(refreshTokens)
			.set({ revoked: true })
			.where(eq(refreshTokens.id, storedToken.id));

		const tokens = this.generateTokens(userId);
		const decoded = jwt.decode(tokens.refreshToken) as { exp: number };

		// Save new refresh token
		await db.insert(refreshTokens).values({
			userId,
			token: tokens.refreshToken,
			expiresAt: new Date(decoded.exp * 1000),
		});

		return tokens;
	}
}

export const tokenService = new TokenService();
