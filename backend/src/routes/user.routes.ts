import { Router } from "express";
import { catchAsync } from "../controllers/base.controller";
import { userController } from "../controllers/user.controller";
import { authenticate, validate } from "../middlewares/auth.middleware";
import { updateProfileSchema } from "../validators/validations";

const router = Router();

router.get("/profile", authenticate, catchAsync(userController.getProfile));
router.patch(
	"/profile",
	authenticate,
	validate(updateProfileSchema),
	catchAsync(userController.updateProfile),
);

export default router;
