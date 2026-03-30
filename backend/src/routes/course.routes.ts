import { Router } from "express";
import { courseController } from "../controllers/course.controller";
import { teacherCourseController } from "../controllers/teacher-course.controller";
import { curriculumController } from "../controllers/curriculum.controller";
import { authenticate, authorize, validate, optionalAuthenticate } from "../middlewares/auth.middleware";
import { uploadImage, uploadContent } from "../middlewares/upload.middleware";
import { z } from "zod";

const router = Router();

const createCourseSchema = z.object({
	title: z.string().min(3).max(255),
	description: z.string().min(10).max(2000),
	categoryId: z.number().optional(),
	price: z.string().optional(),
	level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
	thumbnailUrl: z.string().optional(),
});

const updateCourseSchema = createCourseSchema.partial().extend({
	status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
	thumbnailUrl: z.string().optional(),
});

const createReviewSchema = z.object({
	rating: z.number().min(1).max(5),
	comment: z.string().max(1000).optional(),
});

// Public routes
router.get("/", optionalAuthenticate, courseController.getAllCourses);
router.get("/:id", courseController.getCourseById);
router.get("/:id/enrollment-status", authenticate, courseController.checkEnrollmentStatus);
router.get("/:id/progress", authenticate, courseController.getCourseProgress);
router.get("/:id/reviews", courseController.getCourseReviews);
router.post("/lessons/:lessonId/progress", authenticate, courseController.updateLessonProgress);

// Instructor/Admin routes
// ...

router.post(
	"/:id/enroll",
	authenticate,
	courseController.enroll,
);

router.post(
	"/:id/reviews",
	authenticate,
	validate(createReviewSchema),
	courseController.createReview,
);
router.get(
	"/teacher/my-courses",
	authenticate,
	authorize(["TEACHER", "ADMIN"]),
	teacherCourseController.getMyCourses,
);

router.post(
	"/",
	authenticate,
	authorize(["TEACHER", "ADMIN"]),
	validate(createCourseSchema),
	courseController.createCourse,
);

router.patch(
	"/:id",
	authenticate,
	authorize(["TEACHER", "ADMIN"]),
	validate(updateCourseSchema),
	courseController.updateCourse,
);

router.post(
	"/upload-thumbnail",
	authenticate,
	authorize(["TEACHER", "ADMIN"]),
	uploadImage.single("thumbnail"),
	courseController.uploadThumbnail,
);

// --- CURRICULUM ROUTES ---

// Sections
router.post(
	"/:courseId/sections",
	authenticate,
	authorize(["TEACHER", "ADMIN"]),
	curriculumController.createSection,
);

router.patch(
	"/sections/:sectionId",
	authenticate,
	authorize(["TEACHER", "ADMIN"]),
	curriculumController.updateSection,
);

router.delete(
	"/sections/:sectionId",
	authenticate,
	authorize(["TEACHER", "ADMIN"]),
	curriculumController.deleteSection,
);

router.post(
	"/:courseId/sections/reorder",
	authenticate,
	authorize(["TEACHER", "ADMIN"]),
	curriculumController.reorderSections,
);

// Lessons
router.post(
	"/sections/:sectionId/lessons",
	authenticate,
	authorize(["TEACHER", "ADMIN"]),
	curriculumController.createLesson,
);

router.patch(
	"/lessons/:lessonId",
	authenticate,
	authorize(["TEACHER", "ADMIN"]),
	curriculumController.updateLesson,
);

router.delete(
	"/lessons/:lessonId",
	authenticate,
	authorize(["TEACHER", "ADMIN"]),
	curriculumController.deleteLesson,
);

router.post(
	"/sections/:sectionId/lessons/reorder",
	authenticate,
	authorize(["TEACHER", "ADMIN"]),
	curriculumController.reorderLessons,
);

router.post(
	"/lessons/upload-content",
	authenticate,
	authorize(["TEACHER", "ADMIN"]),
	uploadContent.single("content"),
	curriculumController.uploadContent,
);

export default router;
