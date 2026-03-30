export type Level = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type CourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export type Course = {
  id: number;
  title: string | null;
  description: string | null;
  categoryId: number | null;
  category?: Category;
  level: Level | null;
  teacherId: number;
  teacher?: {
    firstName: string;
    lastName: string;
    image: string | null;
  };
  sections?: {
    id: number;
    title: string;
    lessons?: {
      id: number;
      title: string;
    }[];
  }[];
  price: string | number;
  durationHours?: number;
  averageRating: string | number;
  totalReviews?: number;
  enrollmentCount: number;
  thumbnailUrl: string | null;
  status: CourseStatus;
  isEnrolled?: boolean;
  enrollment?: any;
  createdAt: string;
  updatedAt: string;
};
