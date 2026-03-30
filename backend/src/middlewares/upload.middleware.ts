import type { Request } from "express";
import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { BadRequestError } from "../utils/errors";

const uploadDir = path.join(__dirname, "../../uploads");

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
	destination: (_req, _file, cb) => {
		cb(null, uploadDir);
	},
	filename: (_req, file, cb) => {
		const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
		cb(
			null,
			`${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`,
		);
	},
});

const imageFilter = (
	_req: Request,
	file: Express.Multer.File,
	cb: multer.FileFilterCallback,
) => {
	const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
	if (allowedTypes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(
			new Error("Invalid file type. Only JPEG, PNG, WEBP and GIF are allowed."),
		);
	}
};

const contentFilter = (
	_req: Request,
	file: Express.Multer.File,
	cb: multer.FileFilterCallback,
) => {
	const allowedTypes = [
		"video/mp4",
		"video/webm",
		"video/ogg",
		"application/pdf",
		"application/zip",
		"application/msword",
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	];
	if (allowedTypes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(new Error("Invalid file type. Only MP4, WEBM, PDF, ZIP and Word docs are allowed."));
	}
};

export const uploadImage = multer({
	storage,
	fileFilter: imageFilter,
	limits: {
		fileSize: 5 * 1024 * 1024, // 5MB limit
	},
});

export const uploadContent = multer({
	storage,
	fileFilter: contentFilter,
	limits: {
		fileSize: 100 * 1024 * 1024, // 100MB limit
	},
});
