"use client";

import { useEffect, useState } from "react";
import { CustomButton } from "../custom/Button";

interface ResendOtpButtonProps {
  onResend: () => Promise<void>;
  initialCountdown?: number; // seconds, default 60
  className?: string;
}

export function ResendOtpButton({
  onResend,
  initialCountdown = 60,
  className = "",
}: ResendOtpButtonProps) {
  const [countdown, setCountdown] = useState(initialCountdown);
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleClick = async () => {
    setIsResending(true);
    try {
      await onResend();
      setCountdown(initialCountdown);
      setCanResend(false);
    } catch (error) {
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className={`text-center ${className}`}>
      {canResend ? (
        <CustomButton
          onClick={handleClick}
          isLoading={isResending}
          className="bg-white text-primary/70"
        >
          Resend code
        </CustomButton>
      ) : (
        <p className="text-sm text-gray-600">
          Resend code in{" "}
          <span className="font-medium text-gray-900">
            {formatTime(countdown)}
          </span>
        </p>
      )}
    </div>
  );
}
