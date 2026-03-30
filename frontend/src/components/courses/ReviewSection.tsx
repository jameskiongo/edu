"use client";

import { useState } from "react";
import useSWR from "swr";
import { Star, Loader2, MessageSquare, Send } from "lucide-react";
import { api } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface ReviewSectionProps {
  courseId: number;
  isEnrolled: boolean;
  userId?: number;
}

export function ReviewSection({ courseId, isEnrolled, userId }: ReviewSectionProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: reviewsRes, error, isLoading, mutate } = useSWR(
    courseId ? `/courses/${courseId}/reviews` : null,
    async (url) => {
      const res = await api.get(url);
      return res.data.data || res.data;
    }
  );

  const reviews = reviewsRes || [];
  const hasReviewed = reviews.some((r: any) => r.studentId === userId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/courses/${courseId}/reviews`, { rating, comment });
      toast.success("Review submitted successfully!");
      setRating(0);
      setComment("");
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Student Reviews</h2>
        <div className="flex items-center gap-2">
            <Star className="size-5 fill-amber-500 text-amber-500" />
            <span className="text-xl font-bold">
                {reviews.length > 0 
                    ? (reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length).toFixed(1) 
                    : "0.0"}
            </span>
            <span className="text-muted-foreground font-medium text-sm">({reviews.length} reviews)</span>
        </div>
      </div>

      {isEnrolled && !hasReviewed && (
        <div className="bg-card border rounded-xl p-6 md:p-8 space-y-6 shadow-sm">
          <div className="space-y-2">
            <h3 className="text-lg font-bold">Rate this course</h3>
            <p className="text-sm text-muted-foreground">Share your experience with other students.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      "size-8 transition-colors",
                      (hoverRating || rating) >= star
                        ? "fill-amber-500 text-amber-500"
                        : "text-muted-foreground/30"
                    )}
                  />
                </button>
              ))}
              <span className="ml-3 text-sm font-bold text-muted-foreground capitalize">
                {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][hoverRating || rating]}
              </span>
            </div>

            <div className="space-y-2">
              <Textarea
                placeholder="What did you like or dislike about this course?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[120px] resize-none bg-muted/30 focus:bg-background transition-colors"
              />
            </div>

            <Button 
              type="submit" 
              disabled={submitting || rating === 0}
              className="px-8 font-bold"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="size-4 mr-2" />
                  Submit Review
                </>
              )}
            </Button>
          </form>
        </div>
      )}

      <div className="space-y-8">
        {reviews.length > 0 ? (
          reviews.map((review: any) => (
            <div key={review.id} className="group">
              <div className="flex gap-6 items-start">
                <Avatar className="size-12 border-2 border-background shadow-sm shrink-0">
                  <AvatarImage src={review.student?.image} />
                  <AvatarFallback className="bg-secondary text-secondary-foreground font-bold">
                    {review.student?.firstName?.[0]}{review.student?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div className="space-y-3 flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-base">
                        {review.student?.firstName} {review.student?.lastName}
                        {review.studentId === userId && (
                            <span className="ml-2 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full uppercase tracking-tighter">You</span>
                        )}
                      </h4>
                      <div className="flex items-center gap-1 mt-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "size-3",
                              i < review.rating
                                ? "fill-amber-500 text-amber-500"
                                : "text-muted-foreground/20"
                            )}
                          />
                        ))}
                        <span className="ml-2 text-xs text-muted-foreground font-medium">
                            {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {review.comment && (
                    <p className="text-muted-foreground leading-relaxed text-sm max-w-2xl">
                      {review.comment}
                    </p>
                  )}
                </div>
              </div>
              <Separator className="mt-8 group-last:hidden" />
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-muted/10 rounded-2xl border border-dashed text-center space-y-4">
            <div className="size-16 rounded-full bg-background flex items-center justify-center shadow-sm">
                <MessageSquare className="size-8 text-muted-foreground/30" />
            </div>
            <div className="space-y-1">
                <h3 className="font-bold text-lg">No reviews yet</h3>
                <p className="text-sm text-muted-foreground max-w-[280px]">
                    Be the first to share your thoughts about this course!
                </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
