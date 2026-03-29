"use client";
import {
  Award,
  Globe,
  History,
  IdCard,
  Image as ImageIcon,
  Loader2,
  Mail,
  MessageSquare,
  ShieldCheck,
  Star,
  Upload,
  User,
} from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/hooks/auth/useAuth";
import { useProfileForm } from "@/hooks/auth/useProfileForm";

export function ProfileForm() {
  const { user, isLoading } = useUser();
  const formik = useProfileForm(user);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      formik.setFieldValue("imageFile", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6">
          <div className="rounded-xl border border-border bg-card p-6 space-y-8">
            <div className="flex flex-col items-center gap-4 py-4">
              <Skeleton className="size-32 rounded-full" />
              <div className="space-y-2 flex flex-col items-center">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-lg border bg-secondary/10">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-full" />
                </div>
              ))}
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    );
  }

  const initials = `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your personal information and account preferences
        </p>
      </div>

      <div className="grid gap-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium">Personal Information</h3>
            <p className="text-sm text-muted-foreground">
              Update your personal details and profile picture.
            </p>
          </div>

          <form
            onSubmit={formik.handleSubmit}
            className="space-y-8 max-w-2xl mx-auto"
          >
            {/* Profile Photo Upload */}
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="relative group">
                <Avatar className="size-32 border-4 border-background shadow-xl overflow-hidden">
                  {preview || formik.values.image ? (
                    <Image
                      src={preview || formik.values.image || ""}
                      alt="Profile"
                      width={128}
                      height={128}
                      className="aspect-square h-full w-full object-cover"
                      unoptimized={!!preview}
                    />
                  ) : (
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {initials}
                    </AvatarFallback>
                  )}
                </Avatar>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Upload className="size-8" />
                </button>
              </div>
              <div className="text-center">
                <Label className="text-sm font-medium">Profile Photo</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Click the avatar to upload a new image
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>

            {/* Read-only Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-lg bg-secondary/20">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Email Address
                </Label>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Mail className="size-4 text-muted-foreground" />
                  {user?.email}
                  {user?.isVerified && (
                    <ShieldCheck className="size-3 text-green-500" />
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Account Role
                </Label>
                <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider">
                  <ShieldCheck className="size-4 text-muted-foreground" />
                  {user?.role}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formik.values.firstName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="pl-10"
                    />
                  </div>
                  {formik.touched.firstName && formik.errors.firstName && (
                    <p className="mt-1 text-xs text-red-600">
                      {formik.errors.firstName as string}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formik.values.lastName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="pl-10"
                    />
                  </div>
                  {formik.touched.lastName && formik.errors.lastName && (
                    <p className="mt-1 text-xs text-red-600">
                      {formik.errors.lastName as string}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Profile Image URL (Optional)</Label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="image"
                    name="image"
                    placeholder="https://example.com/image.jpg"
                    value={formik.values.image}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="pl-10"
                  />
                </div>
                {formik.touched.image && formik.errors.image && (
                  <p className="mt-1 text-xs text-red-600">
                    {formik.errors.image as string}
                  </p>
                )}
              </div>

              {/* Teacher Specific Fields */}
              {user?.role === "TEACHER" && (
                <div className="space-y-6 pt-6 border-t">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Award className="size-5 text-primary" />
                    Teacher Profile
                  </h4>

                  {/* Teacher Metrics */}
                  <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-primary/5">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        Rating
                      </Label>
                      <div className="flex items-center gap-1">
                        <Star className="size-4 text-yellow-500 fill-yellow-500" />
                        <p className="text-lg font-bold">
                          {user?.teacherProfile?.rating || "0.00"}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1 text-center">
                      <Label className="text-xs text-muted-foreground">
                        Total Reviews
                      </Label>
                      <p className="text-lg font-bold">
                        {user?.teacherProfile?.totalReviews || 0}
                      </p>
                    </div>
                    <div className="space-y-1 text-right">
                      <Label className="text-xs text-muted-foreground">
                        Total Students
                      </Label>
                      <p className="text-lg font-bold">
                        {user?.teacherProfile?.totalStudents || 0}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="specialization">Specialization</Label>
                      <div className="relative">
                        <Award className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          id="specialization"
                          name="specialization"
                          placeholder="e.g. Mathematics, Science"
                          value={formik.values.specialization}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className="pl-10"
                        />
                      </div>
                      {formik.touched.specialization &&
                        formik.errors.specialization && (
                          <p className="mt-1 text-xs text-red-600">
                            {formik.errors.specialization as string}
                          </p>
                        )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="yearsOfExperience">
                        Years of Experience
                      </Label>
                      <div className="relative">
                        <History className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          id="yearsOfExperience"
                          name="yearsOfExperience"
                          type="number"
                          value={formik.values.yearsOfExperience}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className="pl-10"
                        />
                      </div>
                      {formik.touched.yearsOfExperience &&
                        formik.errors.yearsOfExperience && (
                          <p className="mt-1 text-xs text-red-600">
                            {formik.errors.yearsOfExperience as string}
                          </p>
                        )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Biography</Label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 size-4 text-muted-foreground" />
                      <Textarea
                        id="bio"
                        name="bio"
                        placeholder="Tell us about your teaching experience..."
                        value={formik.values.bio}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="pl-10 min-h-[120px]"
                      />
                    </div>
                    {formik.touched.bio && formik.errors.bio && (
                      <p className="mt-1 text-xs text-red-600">
                        {formik.errors.bio as string}
                      </p>
                    )}
                  </div>

                  {/* Social Links Section */}
                  <div className="space-y-4 pt-4">
                    <h5 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                      <Globe className="size-4" />
                      Social Links
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                          <Input
                            id="website"
                            name="website"
                            placeholder="https://yourwebsite.com"
                            value={formik.values.website}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="pl-10"
                          />
                        </div>
                        {formik.touched.website && formik.errors.website && (
                          <p className="mt-1 text-xs text-red-600">
                            {formik.errors.website as string}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="twitter">Twitter (X)</Label>
                        <div className="relative">
                          <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                            role="img"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <title>X</title>
                            <path d="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z" />
                          </svg>
                          <Input
                            id="twitter"
                            name="twitter"
                            placeholder="https://twitter.com/username"
                            value={formik.values.twitter}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="pl-10"
                          />
                        </div>
                        {formik.touched.twitter && formik.errors.twitter && (
                          <p className="mt-1 text-xs text-red-600">
                            {formik.errors.twitter as string}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="linkedin">LinkedIn</Label>
                        <div className="relative">
                          <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                            role="img"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                          >
                            <title>LinkedIn</title>
                            <path
                              fill="currentColor"
                              d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93zM6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37z"
                            ></path>
                          </svg>
                          <Input
                            id="linkedin"
                            name="linkedin"
                            placeholder="https://linkedin.com/in/username"
                            value={formik.values.linkedin}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="pl-10"
                          />
                        </div>
                        {formik.touched.linkedin && formik.errors.linkedin && (
                          <p className="mt-1 text-xs text-red-600">
                            {formik.errors.linkedin as string}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="github">GitHub</Label>
                        <div className="relative">
                          <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                            role="img"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <title>GitHub</title>
                            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                          </svg>
                          <Input
                            id="github"
                            name="github"
                            placeholder="https://github.com/username"
                            value={formik.values.github}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="pl-10"
                          />
                        </div>
                        {formik.touched.github && formik.errors.github && (
                          <p className="mt-1 text-xs text-red-600">
                            {formik.errors.github as string}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Student Specific Fields */}
              {user?.role === "STUDENT" && (
                <div className="space-y-6 pt-6 border-t">
                  <h4 className="font-semibold flex items-center gap-2">
                    <IdCard className="size-5 text-primary" />
                    Student Profile
                  </h4>

                  {/* Student Metrics */}
                  <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-primary/5">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        Enrolled Courses
                      </Label>
                      <p className="text-lg font-bold">
                        {user?.studentProfile?.enrolledCoursesCount || 0}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        Completed Courses
                      </Label>
                      <p className="text-lg font-bold">
                        {user?.studentProfile?.completedCourses || 0}
                      </p>
                    </div>
                  </div>

                  {/* Student Badges */}
                  <div className="space-y-4">
                    <h5 className="text-sm font-medium flex items-center gap-2">
                      <Award className="size-4 text-muted-foreground" />
                      Badges & Achievements
                    </h5>
                    {user?.studentProfile?.badges &&
                    user.studentProfile.badges.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {user.studentProfile.badges.map((badge) => (
                          <div
                            key={badge.id}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium"
                          >
                            <Award className="size-3 text-primary" />
                            {badge.badgeType.replace(/_/g, " ")}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-lg border border-dashed text-center">
                        <p className="text-xs text-muted-foreground">
                          No badges earned yet. Complete courses to earn
                          achievements!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <Button
              type="submit"
              className="w-full md:w-auto px-8"
              disabled={formik.isSubmitting || !formik.dirty}
            >
              {formik.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
