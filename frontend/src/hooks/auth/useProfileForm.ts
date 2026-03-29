import { toast } from "sonner";
import { userApi } from "@/lib/auth";
import { profileSchema } from "@/lib/validators";
import type { User } from "@/types/auth/auth";
import { useAppForm } from "./useAppForm";
import { useUser } from "./useAuth";

export function useProfileForm(user?: User) {
  const { mutate } = useUser();

  return useAppForm({
    initialValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phoneNumber: user?.phoneNumber || "",
      image: user?.image || "",
      imageFile: null as File | null,
      defaultSmsDelivery: user?.defaultSmsDelivery ?? true,
      bio: user?.teacherProfile?.bio || "",
      specialization: user?.teacherProfile?.specialization || "",
      yearsOfExperience: user?.teacherProfile?.yearsOfExperience || 0,
      totalReviews: user?.teacherProfile?.totalReviews || 0,
      website: user?.teacherProfile?.website || "",
      twitter: user?.teacherProfile?.twitter || "",
      linkedin: user?.teacherProfile?.linkedin || "",
      github: user?.teacherProfile?.github || "",
    },
    schema: profileSchema,
    onSubmit: async (values, { setSubmitting, setFieldValue }) => {
      try {
        let imageUrl = values.image;

        // Upload image if a new file is selected
        if (values.imageFile) {
          const uploadResponse = await userApi.uploadImage(values.imageFile);
          imageUrl = uploadResponse.data.data.image || uploadResponse.data.data;
          // Clear the image file after successful upload
          setFieldValue("imageFile", null);
        }

        const updatePromises = [];

        // Base profile update
        updatePromises.push(
          userApi.updateProfile({
            firstName: values.firstName,
            lastName: values.lastName,
            image: imageUrl,
            defaultSmsDelivery: values.defaultSmsDelivery,
          }),
        );

        // Role-specific updates
        if (user?.role === "TEACHER") {
          updatePromises.push(
            userApi.updateTeacherProfile({
              bio: values.bio,
              specialization: values.specialization,
              yearsOfExperience: values.yearsOfExperience,
              totalReviews: values.totalReviews,
              website: values.website,
              twitter: values.twitter,
              linkedin: values.linkedin,
              github: values.github,
            }),
          );
        }

        const responses = await Promise.all(updatePromises);
        // The last response or a fresh fetch should give us the full updated user
        const lastResponse = responses[responses.length - 1];
        const updatedUser =
          lastResponse.data.data || lastResponse.data.user || lastResponse.data;

        await mutate(updatedUser, false);
        toast.success("Profile updated successfully!");
      } catch (error: any) {
        toast.error(
          error.response?.data?.message ||
            error.response?.data?.error ||
            "Failed to update profile",
        );
      } finally {
        setSubmitting(false);
      }
    },
  });
}
