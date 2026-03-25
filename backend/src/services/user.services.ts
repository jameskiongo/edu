import { eq } from "drizzle-orm";
import { db } from "../db/db";
import { users } from "../db/schema.js";

export class UserService {
	static async updateProfile(
		userId: number,
		data: { name?: string; image?: string },
	) {
		const existingUser = await db
			.select()
			.from(users)
			.where(eq(users.id, userId))
			.limit(1)
			.then((rows) => rows[0]);

		if (!existingUser) {
			throw new Error("User not found");
		}

		if (!existingUser.isActive) {
			throw new Error("Account is deactivated");
		}

		const updateData: Partial<typeof users.$inferInsert> = {
			updatedAt: new Date(),
		};

		if (data.name !== undefined) {
			updateData.name = data.name.trim();
		}

		if (data.image !== undefined) {
			updateData.image = data.image === "" ? null : data.image;
		}

		const [updatedUser] = await db
			.update(users)
			.set(updateData)
			.where(eq(users.id, userId))
			.returning({
				id: users.id,
				name: users.name,
				email: users.email,
				image: users.image,
				phoneNumber: users.phoneNumber,
				isVerified: users.isVerified,
				updatedAt: users.updatedAt,
			});

		return updatedUser;
	}

	static async getProfile(userId: number) {
		const user = await db
			.select({
				id: users.id,
				name: users.name,
				email: users.email,
				image: users.image,
				phoneNumber: users.phoneNumber,
				isVerified: users.isVerified,
				isActive: users.isActive,
				createdAt: users.createdAt,
				updatedAt: users.updatedAt,
			})
			.from(users)
			.where(eq(users.id, userId))
			.limit(1)
			.then((rows) => rows[0]);

		if (!user) {
			throw new Error("User not found");
		}
		return user;
	}
}
