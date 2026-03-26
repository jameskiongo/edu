import { Router } from "express";
import { catchAsync } from "../controllers/base.controller";
import { userController } from "../controllers/user.controller";
import { authenticate, validate } from "../middlewares/auth.middleware";
import {
	assignRoleSchema,
	updateProfileSchema,
	updateStudentProfileSchema,
	updateTeacherProfileSchema,
} from "../validators/validations";

const router = Router();

router.get("/profile", authenticate, catchAsync(userController.getProfile));
router.patch(
	"/profile",
	authenticate,
	validate(updateProfileSchema),
	catchAsync(userController.updateProfile),
);

router.patch(
	"/role",
	authenticate,
	validate(assignRoleSchema),
	catchAsync(userController.assignRole),
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

export default router;
