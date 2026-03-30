import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/auth";
import { courseSchema } from "@/lib/validators";
import { useAppForm } from "../auth/useAppForm";

interface UseCourseFormOptions {
  thumbnail: File | null;
}

export function useCourseForm({ thumbnail }: UseCourseFormOptions) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useAppForm({
    initialValues: {
      title: "",
      description: "",
      categoryId: "",
      level: "BEGINNER" as const,
      price: "0.00",
    },
    schema: courseSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        let thumbnailUrl = "";

        // 1. Upload thumbnail if exists
        if (thumbnail) {
          const formData = new FormData();
          formData.append("thumbnail", thumbnail);
          const uploadRes = await api.post("/courses/upload-thumbnail", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          thumbnailUrl = uploadRes.data.data.thumbnailUrl || uploadRes.data.thumbnailUrl;
        }

        // 2. Create course
        const res = await api.post("/courses", {
          ...values,
          categoryId: Number(values.categoryId),
          thumbnailUrl,
        });

        toast.success("Course created successfully as draft!");
        router.push(`/dashboard/teacher/courses/${res.data.data.id}`);
      } catch (error: any) {
        toast.error(error.response?.data?.message || error.message || "Failed to create course");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return {
    formik,
    isSubmitting,
  };
}
