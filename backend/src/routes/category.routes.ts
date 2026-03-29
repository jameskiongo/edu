import { Router } from "express";
import { categoryController } from "../controllers/category.controller";
import { catchAsync } from "../controllers/base.controller";
import { authenticate, authorize, validate } from "../middlewares/auth.middleware";
import { createCategorySchema, updateCategorySchema } from "../validators/validations";

const router = Router();

// Public routes
router.get("/", catchAsync(categoryController.getAllCategories));
router.get("/:slug", catchAsync(categoryController.getCategoryBySlug));

// Admin only routes
router.use(authenticate, authorize(["ADMIN"]));

router.post("/", validate(createCategorySchema), catchAsync(categoryController.createCategory));
router.put("/:id", validate(updateCategorySchema), catchAsync(categoryController.updateCategory));
router.delete("/:id", catchAsync(categoryController.deleteCategory));

export default router;
