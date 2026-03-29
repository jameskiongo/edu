export type Level = "Beginner" | "Intermediate" | "Advanced";

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
  category: string | null;
  level: Level | null;
  teacherId: number;
  price: number;
  durationHours: number;
  rating: number;
  enrollmentCount: number;
  thumbnailUrl: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};
