import { and, eq, gt } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { db } from "../db/db";
import { refreshTokens } from "../db/schema";
export interface Tokens {
	accessToken: string;
	refreshToken: string;
}
export class TokenService {
	static generateOTP(): string {
		return Math.floor(100000 + Math.random() * 900000).toString();
	}
	static generateTokens(userId: number): Tokens {
		const accessToken = jwt.sign(
			{ userId, type: "access" },
			process.env.JWT_SECRET!,
			{ expiresIn: "1m" },
		);

		const refreshToken = jwt.sign(
			{ userId, type: "refresh" },
			process.env.JWT_REFRESH_SECRET!,
			{ expiresIn: "7d" },
		);

		return { accessToken, refreshToken };
	}

	static verifyAccessToken(token: string): { userId: number } {
		const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
			userId: number;
			type: string;
		};
		if (decoded.type !== "access") throw new Error("Invalid token type");
		return { userId: decoded.userId };
	}

	static verifyRefreshToken(token: string): { userId: number } {
		const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as {
			userId: number;
			type: string;
		};
		if (decoded.type !== "refresh") throw new Error("Invalid token type");
		return { userId: decoded.userId };
	}

	static async refreshTokens(refreshToken: string): Promise<Tokens> {
		const { userId } = TokenService.verifyRefreshToken(refreshToken);

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
			throw new Error("Invalid refresh token");
		}

		await db
			.update(refreshTokens)
			.set({ revoked: true })
			.where(eq(refreshTokens.id, storedToken.id));

		const tokens = TokenService.generateTokens(userId);
		const decoded = jwt.decode(tokens.refreshToken) as { exp: number };
		await db.insert(refreshTokens).values({
			userId,
			token: tokens.refreshToken,
			expiresAt: new Date(decoded.exp * 1000),
		});

		return tokens;
	}
}
