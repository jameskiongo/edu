import { eq } from "drizzle-orm";
import { db } from "../db/db";
import { refreshTokens, studentProfiles, teacherProfiles, users } from "../db/schema";
import { BadRequestError, NotFoundError } from "../utils/errors";
import { otpService } from "./otp.service";

export class UserService {
	async updateProfile(
		userId: number,
		data: {
			firstName?: string;
			lastName?: string;
			phoneNumber?: string;
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

		if (data.phoneNumber !== undefined) {
			updateData.phoneNumber = data.phoneNumber.trim();
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

	async getAllUsers() {
		return db.query.users.findMany({
			with: {
				teacherProfile: true,
				studentProfile: true,
			},
			columns: {
				password: false,
				failedLoginAttempts: false,
				lockUntil: false,
			},
			orderBy: (users, { desc }) => [desc(users.createdAt)],
		});
	}

	async toggleUserStatus(userId: number, isActive: boolean) {
		const user = await db.query.users.findFirst({
			where: eq(users.id, userId),
		});

		if (!user) {
			throw new NotFoundError("User not found");
		}

		const [updatedUser] = await db
			.update(users)
			.set({ isActive, updatedAt: new Date() })
			.where(eq(users.id, userId))
			.returning({
				id: users.id,
				isActive: users.isActive,
				updatedAt: users.updatedAt,
			});

		return updatedUser;
	}

	async assignRole(userId: number, role: "ADMIN" | "TEACHER" | "STUDENT") {
		const user = await db.query.users.findFirst({
			where: eq(users.id, userId),
		});

		if (!user) {
			throw new NotFoundError("User not found");
		}

		await db.transaction(async (tx) => {
			// Update the role
			await tx.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, userId));

			// Revoke all existing refresh tokens to force re-login
			await tx
				.update(refreshTokens)
				.set({ revoked: true })
				.where(eq(refreshTokens.userId, userId));

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

	async requestPhoneChange(userId: number, newPhoneNumber: string) {
		const user = await db.query.users.findFirst({
			where: eq(users.id, userId),
		});

		if (!user) {
			throw new NotFoundError("User not found");
		}

		// Check if the new phone number is already in use
		const existingUser = await db.query.users.findFirst({
			where: eq(users.phoneNumber, newPhoneNumber),
		});

		if (existingUser && existingUser.id !== userId) {
			throw new BadRequestError("Phone number already in use by another account");
		}

		return otpService.sendOTP(userId, newPhoneNumber, user.email, "phone_change");
	}

	async verifyPhoneChange(userId: number, newPhoneNumber: string, code: string) {
		const user = await db.query.users.findFirst({
			where: eq(users.id, userId),
		});

		if (!user) {
			throw new NotFoundError("User not found");
		}

		await otpService.verifyOTP(userId, code, "phone_change");

		await db
			.update(users)
			.set({
				phoneNumber: newPhoneNumber,
				isBlacklisted: false,
				defaultSmsDelivery: true,
				updatedAt: new Date(),
			})
			.where(eq(users.id, userId));

		return this.getProfile(userId);
	}
}

export const userService = new UserService();
