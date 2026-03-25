import { Router } from "express";
import { UserController } from "../contollers/user.controllers";
import { authenticate, validate } from "../middlewares/auth.middleware";
import { updateProfileSchema } from "../validators/validations";

const router = Router();

router.use(authenticate);

router.get("/profile", UserController.getProfile);

router.patch(
	"/profile",
	validate(updateProfileSchema),
	UserController.updateProfile,
);

export default router;
