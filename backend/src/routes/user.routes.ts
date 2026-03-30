import { Router } from "express";
import { catchAsync } from "../controllers/base.controller";
import { userController } from "../controllers/user.controller";
import {
	authenticate,
	authorize,
	validate,
} from "../middlewares/auth.middleware";
import { uploadImage } from "../middlewares/upload.middleware";
import {
	assignRoleSchema,
	toggleUserStatusSchema,
	updateProfileSchema,
	updateStudentProfileSchema,
	updateTeacherProfileSchema,
	requestPhoneChangeSchema,
	verifyPhoneChangeSchema,
} from "../validators/validations";

const router = Router();

router.get("/profile", authenticate, catchAsync(userController.getProfile));
router.get(
	"/",
	authenticate,
	authorize(["ADMIN"]),
	catchAsync(userController.getAllUsers),
);
router.get(
	"/teachers",
	authenticate,
	authorize(["ADMIN"]),
	catchAsync(userController.getAllTeachers),
);
router.get(
	"/students",
	authenticate,
	authorize(["ADMIN"]),
	catchAsync(userController.getAllStudents),
);

router.post(
	"/profile/image",
	authenticate,
	uploadImage.single("image"),
	catchAsync(userController.uploadImage),
);

router.patch(
	"/profile",
	authenticate,
	validate(updateProfileSchema),
	catchAsync(userController.updateProfile),
);

router.patch(
	"/role",
	authenticate,
	authorize(["ADMIN"]),
	validate(assignRoleSchema),
	catchAsync(userController.assignRole),
);

router.patch(
	"/status",
	authenticate,
	authorize(["ADMIN"]),
	validate(toggleUserStatusSchema),
	catchAsync(userController.toggleUserStatus),
);

router.patch(
	"/profile/teacher",
	authenticate,
	validate(updateTeacherProfileSchema),
	catchAsync(userController.updateTeacherProfile),
);

router.patch(
	"/profile/student",
	authenticate,
	validate(updateStudentProfileSchema),
	catchAsync(userController.updateStudentProfile),
);

router.post(
	"/profile/phone-change",
	authenticate,
	validate(requestPhoneChangeSchema),
	catchAsync(userController.requestPhoneChange),
);

router.post(
	"/profile/verify-phone-change",
	authenticate,
	validate(verifyPhoneChangeSchema),
	catchAsync(userController.verifyPhoneChange),
);

export default router;
