import { eq } from "drizzle-orm";
import { db } from "../db/db";
import { studentProfiles, teacherProfiles, users } from "../db/schema";
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
				role: users.role,
				defaultSmsDelivery: users.defaultSmsDelivery,
				isBlacklisted: users.isBlacklisted,
				updatedAt: users.updatedAt,
			});

		return updatedUser;
	}

	async getProfile(userId: number) {
		const user = await db.query.users.findFirst({
			where: eq(users.id, userId),
			with: {
				teacherProfile: true,
				studentProfile: {
					with: {
						badges: true,
					},
				},
			},
		});

		if (!user) {
			throw new NotFoundError("User not found");
		}

		// biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
		const { password, failedLoginAttempts, lockUntil, ...safeUser } = user;

		// Clean up profile based on role
		if (safeUser.role === "TEACHER") {
			const { studentProfile, ...teacherOnly } = safeUser;
			return teacherOnly;
		}
		if (safeUser.role === "STUDENT") {
			const { teacherProfile, ...studentOnly } = safeUser;
			return studentOnly;
		}

		return safeUser;
	}

	async getAllTeachers() {
		return db.query.users.findMany({
			where: eq(users.role, "TEACHER"),
			with: {
				teacherProfile: true,
			},
			columns: {
				password: false,
				failedLoginAttempts: false,
				lockUntil: false,
			},
		});
	}

	async getAllStudents() {
		return db.query.users.findMany({
			where: eq(users.role, "STUDENT"),
			with: {
				studentProfile: true,
			},
			columns: {
				password: false,
				failedLoginAttempts: false,
				lockUntil: false,
			},
		});
	}

	async assignRole(userId: number, role: "ADMIN" | "TEACHER" | "STUDENT") {
		const user = await db.query.users.findFirst({
			where: eq(users.id, userId),
		});

		if (!user) {
			throw new NotFoundError("User not found");
		}

		await db.transaction(async (tx) => {
			await tx.update(users).set({ role }).where(eq(users.id, userId));

			if (role === "TEACHER") {
				const existingProfile = await tx.query.teacherProfiles.findFirst({
					where: eq(teacherProfiles.userId, userId),
				});
				if (!existingProfile) {
					await tx.insert(teacherProfiles).values({ userId });
				}
			} else if (role === "STUDENT") {
				const existingProfile = await tx.query.studentProfiles.findFirst({
					where: eq(studentProfiles.userId, userId),
				});
				if (!existingProfile) {
					await tx.insert(studentProfiles).values({ userId });
				}
			}
		});

		return this.getProfile(userId);
	}

	async updateTeacherProfile(
		userId: number,
		data: {
			bio?: string;
			specialization?: string;
			yearsOfExperience?: number;
		},
	) {
		const user = await db.query.users.findFirst({
			where: eq(users.id, userId),
		});

		if (!user || user.role !== "TEACHER") {
			throw new BadRequestError("User is not a teacher");
		}

		await db
			.update(teacherProfiles)
			.set(data)
			.where(eq(teacherProfiles.userId, userId));

		return this.getProfile(userId);
	}

	async updateStudentProfile(
		userId: number,
		data: Record<string, any>,
	) {
		const user = await db.query.users.findFirst({
			where: eq(users.id, userId),
		});

		if (!user || user.role !== "STUDENT") {
			throw new BadRequestError("User is not a student");
		}

		if (Object.keys(data).length > 0) {
			await db
				.update(studentProfiles)
				.set(data)
				.where(eq(studentProfiles.userId, userId));
		}

		return this.getProfile(userId);
	}
}

export const userService = new UserService();
