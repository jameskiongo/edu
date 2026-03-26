import { eq } from "drizzle-orm";
import { db } from "../db/db";
import { users } from "../db/schema";
import { BadRequestError, NotFoundError } from "../utils/errors";

export class UserService {
	async updateProfile(
		userId: number,
		data: {
			firstName?: string;
			lastName?: string;
			image?: string;
			defaultSmsDelivery?: boolean;
		},
	) {
		const existingUser = await db
			.select()
			.from(users)
			.where(eq(users.id, userId))
			.limit(1)
			.then((rows) => rows[0]);

		if (!existingUser) {
			throw new NotFoundError("User not found");
		}

		if (!existingUser.isActive) {
			throw new BadRequestError("Account is deactivated");
		}

		const updateData: Partial<typeof users.$inferInsert> = {
			updatedAt: new Date(),
		};

		if (data.firstName !== undefined) {
			updateData.firstName = data.firstName.trim();
		}
		if (data.lastName !== undefined) {
			updateData.lastName = data.lastName.trim();
		}

		if (data.image !== undefined) {
			updateData.image = data.image === "" ? null : data.image;
		}

		if (data.defaultSmsDelivery !== undefined) {
			updateData.defaultSmsDelivery = data.defaultSmsDelivery;
		}

		const [updatedUser] = await db
			.update(users)
			.set(updateData)
			.where(eq(users.id, userId))
			.returning({
				id: users.id,
				firstName: users.firstName,
				lastName: users.lastName,
				email: users.email,
				image: users.image,
				phoneNumber: users.phoneNumber,
				isVerified: users.isVerified,
				defaultSmsDelivery: users.defaultSmsDelivery,
				isBlacklisted: users.isBlacklisted,
				updatedAt: users.updatedAt,
			});

		return updatedUser;
	}

	async getProfile(userId: number) {
		const user = await db
			.select({
				id: users.id,
				firstName: users.firstName,
				lastName: users.lastName,
				email: users.email,
				image: users.image,
				phoneNumber: users.phoneNumber,
				isVerified: users.isVerified,
				isActive: users.isActive,
				defaultSmsDelivery: users.defaultSmsDelivery,
				isBlacklisted: users.isBlacklisted,
				createdAt: users.createdAt,
				updatedAt: users.updatedAt,
			})
			.from(users)
			.where(eq(users.id, userId))
			.limit(1)
			.then((rows) => rows[0]);

		if (!user) {
			throw new NotFoundError("User not found");
		}
		return user;
	}
}

export const userService = new UserService();
